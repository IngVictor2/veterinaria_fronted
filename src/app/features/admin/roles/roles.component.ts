import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { Rol } from '../../../core/models/admin';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';
import { CellTemplateDirective, ActionsTemplateDirective } from '../../../shared/components/data-table/cell-template.directive';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-roles',
  imports: [FormsModule, DataTableComponent, CellTemplateDirective, ActionsTemplateDirective, ConfirmDialogComponent],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Roles</h1>
        <button class="btn btn-primary" (click)="openForm()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Rol
        </button>
      </div>

      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex items-center gap-4 mb-4">
            <div class="flex items-center gap-2">
              <label class="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  class="toggle toggle-sm toggle-warning"
                  [ngModel]="showInactive()"
                  (ngModelChange)="onShowInactiveChange($event)"
                />
                <span class="label-text text-sm">Mostrar inactivos</span>
              </label>
            </div>
          </div>
          <app-data-table
            [columns]="columns"
            [data]="visibleData()"
            [loading]="loading()"
            emptyMessage="No hay roles"
            [dimInactive]="true"
          >
            <ng-template appCell="nombre" let-item>
              <span [class]="!item.estado ? 'opacity-50 line-through' : ''">
                {{ item.nombre }}
              </span>
            </ng-template>
            <ng-template appActions let-item>
              <div class="flex gap-1">
                <button class="btn btn-ghost btn-xs" (click)="openForm(item)">Editar</button>
                @if (item.estado) {
                  <button class="btn btn-ghost btn-xs text-error" (click)="confirmDelete(item)">Eliminar</button>
                }
              </div>
            </ng-template>
          </app-data-table>
        </div>
      </div>

      <!-- Form Modal -->
      <dialog class="modal" [class.modal-open]="showForm()">
        <div class="modal-box max-w-lg">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 class="font-bold text-xl">{{ editMode() ? 'Editar Rol' : 'Nuevo Rol' }}</h3>
            <button class="btn btn-ghost btn-sm btn-circle" (click)="showForm.set(false)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form (ngSubmit)="handleSubmit()" class="space-y-3">
            <div class="bg-base-200/50 rounded-lg p-4 space-y-3">
              <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Información del rol
              </h4>
              <div class="form-control">
                <label class="label py-0"><span class="label-text font-medium text-sm">Nombre *</span></label>
                <input
                  name="nombre"
                  type="text"
                  class="input input-bordered input-sm w-full"
                  placeholder="Ej: ADMIN, VETERINARIO..."
                  [ngModel]="nombre()"
                  (ngModelChange)="nombre.set($event)"
                />
                @if (submitted() && !nombre().trim()) {
                  <label class="label py-0">
                    <span class="label-text-alt text-error text-xs">Debes ingresar el nombre del rol</span>
                  </label>
                }
              </div>
              <div class="form-control">
                <label class="label py-0"><span class="label-text font-medium text-sm">Descripción</span></label>
                <textarea
                  name="descripcion"
                  class="textarea textarea-bordered textarea-sm w-full"
                  rows="3"
                  placeholder="Descripción del rol y sus funciones..."
                  [ngModel]="descripcion()"
                  (ngModelChange)="descripcion.set($event)"
                ></textarea>
              </div>
            </div>

            <div class="modal-action">
              <button type="button" class="btn btn-ghost" (click)="showForm.set(false)">Cancelar</button>
              <button type="submit" class="btn btn-primary gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ editMode() ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button (click)="showForm.set(false)">close</button>
        </form>
      </dialog>

      <app-confirm-dialog
        [show]="showDeleteDialog()"
        title="Eliminar rol"
        [message]="mensajeEliminar()"
        confirmText="Eliminar"
        variant="error"
        (confirm)="handleDelete()"
        (cancel)="showDeleteDialog.set(false)"
      />
    </div>
  `,
})
export class RolesComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly data = signal<Rol[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly selected = signal<Rol | null>(null);
  readonly editMode = signal(false);
  readonly showInactive = signal(false);
  readonly submitted = signal(false);

  readonly nombre = signal('');
  readonly descripcion = signal('');

  readonly formValid = computed(() => this.nombre().trim() !== '');

  readonly columns: DataTableColumn[] = [
    { key: 'idRol', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'descripcion', label: 'Descripción' },
  ];

  readonly visibleData = computed(() => {
    let result = [...this.data()];
    result = result.filter((r) => (this.showInactive() ? !r.estado : r.estado));
    return result.sort((a, b) => {
      if (a.estado !== b.estado) return a.estado ? -1 : 1;
      return a.idRol - b.idRol;
    });
  });

  readonly mensajeEliminar = computed(() => {
    const rol = this.selected();
    return `¿Estás seguro de eliminar el rol ${rol?.nombre}?`;
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      this.data.set(await firstValueFrom(this.adminApi.getRoles(this.showInactive())));
    } catch (e: unknown) {
      console.error('Error loading roles', e);
    } finally {
      this.loading.set(false);
    }
  }

  onShowInactiveChange(value: boolean): void {
    this.showInactive.set(value);
    void this.loadData();
  }

  openForm(rol?: Rol): void {
    this.submitted.set(false);
    if (rol) {
      this.editMode.set(true);
      this.selected.set(rol);
      this.nombre.set(rol.nombre);
      this.descripcion.set(rol.descripcion);
    } else {
      this.editMode.set(false);
      this.selected.set(null);
      this.nombre.set('');
      this.descripcion.set('');
    }
    this.showForm.set(true);
  }

  async handleSubmit(): Promise<void> {
    this.submitted.set(true);

    if (!this.formValid()) {
      return;
    }

    try {
      const selected = this.selected();
      if (this.editMode() && selected) {
        await firstValueFrom(
          this.adminApi.updateRol(selected.idRol, { nombre: this.nombre(), descripcion: this.descripcion() }),
        );
      } else {
        await firstValueFrom(this.adminApi.createRol({ nombre: this.nombre(), descripcion: this.descripcion() }));
      }
      this.showForm.set(false);
      await this.loadData();
    } catch (e: unknown) {
      console.error('Error saving rol', e);
    }
  }

  confirmDelete(rol: Rol): void {
    this.selected.set(rol);
    this.showDeleteDialog.set(true);
  }

  async handleDelete(): Promise<void> {
    const rol = this.selected();
    if (!rol) return;
    try {
      await firstValueFrom(this.adminApi.deleteRol(rol.idRol));
      this.showDeleteDialog.set(false);
      await this.loadData();
    } catch (e: unknown) {
      console.error('Error deleting rol', e);
    }
  }
}
