import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ServiciosApiService } from '../../../core/services/servicios-api.service';
import { CrearServicioRequest, Servicio } from '../../../core/models/servicio';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';
import { CellTemplateDirective, ActionsTemplateDirective } from '../../../shared/components/data-table/cell-template.directive';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-servicios-list',
  imports: [
    FormsModule,
    DataTableComponent,
    CellTemplateDirective,
    ActionsTemplateDirective,
    SearchFilterComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Servicios</h1>
        <button class="btn btn-primary" (click)="openForm()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Servicio
        </button>
      </div>

      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div class="flex-1">
              <app-search-filter [(value)]="search" (search)="handleSearch()" placeholder="Buscar por nombre, tipo..." />
            </div>
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
          <app-data-table
            [columns]="columns"
            [data]="visibleData()"
            [loading]="loading()"
            emptyMessage="No hay servicios"
            [dimInactive]="true"
          >
            <ng-template appCell="nombre" let-item>
              <span [class]="!item.estado ? 'opacity-50 line-through' : ''">
                {{ item.nombre }}
              </span>
            </ng-template>
            <ng-template appCell="precio" let-value="value">
              {{ formatPrecio(value) }}
            </ng-template>
            <ng-template appCell="estado" let-value="value">
              <span [class]="value ? 'badge badge-success badge-sm' : 'badge badge-error badge-sm'">
                {{ value ? 'Activo' : 'Inactivo' }}
              </span>
            </ng-template>
            <ng-template appActions let-item>
              <div class="flex gap-1">
                <button class="btn btn-ghost btn-xs" (click)="openForm(item)">Editar</button>
                @if (item.estado) {
                  <button class="btn btn-ghost btn-xs text-error" (click)="confirmDelete(item)">
                    Eliminar
                  </button>
                }
              </div>
            </ng-template>
          </app-data-table>
        </div>
      </div>

      <!-- Form Modal -->
      <dialog class="modal" [class.modal-open]="showForm()">
        <div class="modal-box max-w-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-xl">{{ editMode() ? 'Editar Servicio' : 'Nuevo Servicio' }}</h3>
            <button class="btn btn-ghost btn-sm btn-circle" (click)="showForm.set(false)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form (ngSubmit)="handleSubmit()" class="space-y-3">
            <!-- Info basica -->
            <div class="bg-base-200/50 rounded-lg p-4 space-y-3">
              <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Información del servicio
              </h4>
              <div class="form-control">
                <label class="label py-0"><span class="label-text font-medium text-sm">Nombre *</span></label>
                <input
                  name="nombre"
                  type="text"
                  class="input input-bordered input-sm w-full"
                  placeholder="Nombre del servicio"
                  [ngModel]="nombre()"
                  (ngModelChange)="nombre.set($event)"
                />
                @if (submitted() && !nombre().trim()) {
                  <label class="label py-0">
                    <span class="label-text-alt text-error text-xs">Debes ingresar el nombre del servicio</span>
                  </label>
                }
              </div>
              <div class="form-control">
                <label class="label py-0"><span class="label-text font-medium text-sm">Descripción</span></label>
                <textarea
                  name="descripcion"
                  class="textarea textarea-bordered textarea-sm w-full"
                  rows="2"
                  placeholder="Descripción del servicio..."
                  [ngModel]="descripcion()"
                  (ngModelChange)="descripcion.set($event)"
                ></textarea>
              </div>
            </div>

            <!-- Tipo y Precio -->
            <div class="bg-base-200/50 rounded-lg p-4 space-y-3">
              <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tipo y precio
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="form-control">
                  <label class="label py-0"><span class="label-text font-medium text-sm">Tipo *</span></label>
                  <select
                    name="tipoServicio"
                    class="select select-bordered select-sm w-full"
                    [ngModel]="tipoServicio()"
                    (ngModelChange)="tipoServicio.set($event)"
                  >
                    <option value="CONSULTA">Consulta</option>
                    <option value="ESTETICA">Estética</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div class="form-control">
                  <label class="label py-0"><span class="label-text font-medium text-sm">Precio ($) *</span></label>
                  <input
                    name="precio"
                    type="number"
                    class="input input-bordered input-sm w-full"
                    min="0"
                    step="100"
                    [ngModel]="precio()"
                    (ngModelChange)="precio.set($event)"
                  />
                  @if (submitted() && precio() <= 0) {
                    <label class="label py-0">
                      <span class="label-text-alt text-error text-xs">Debes ingresar un precio mayor a 0</span>
                    </label>
                  }
                </div>
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
        title="Eliminar servicio"
        [message]="mensajeEliminar()"
        confirmText="Eliminar"
        variant="error"
        (confirm)="handleDelete()"
        (cancel)="showDeleteDialog.set(false)"
      />
    </div>
  `,
})
export class ServiciosListComponent implements OnInit {
  private readonly serviciosApi = inject(ServiciosApiService);

  readonly data = signal<Servicio[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly selectedServicio = signal<Servicio | null>(null);
  readonly editMode = signal(false);
  readonly showInactive = signal(false);
  readonly search = signal('');
  readonly submitted = signal(false);

  readonly idServicio = signal(0);
  readonly nombre = signal('');
  readonly descripcion = signal('');
  readonly tipoServicio = signal('CONSULTA');
  readonly precio = signal(0);

  readonly formValid = computed(() => this.nombre().trim() !== '' && this.precio() > 0);

  readonly columns: DataTableColumn[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'tipoServicio', label: 'Tipo' },
    { key: 'precio', label: 'Precio', sortable: true },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'estado', label: 'Estado' },
  ];

  readonly visibleData = computed(() => {
    let result = [...this.data()];
    result = result.filter((s) => (this.showInactive() ? !s.estado : s.estado));
    const search = this.search();
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.nombre?.toLowerCase().includes(q) || s.tipoServicio?.toLowerCase().includes(q),
      );
    }
    return result.sort((a, b) => {
      if (a.estado !== b.estado) return a.estado ? -1 : 1;
      if (a.idServicio === b.idServicio) return 0;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  });

  readonly mensajeEliminar = computed(() => {
    return `¿Estás seguro de eliminar ${this.selectedServicio()?.nombre}?`;
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  handleSearch(): void {}

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      this.data.set(await firstValueFrom(this.serviciosApi.getAll(this.showInactive())));
    } catch (e: unknown) {
      console.error('Error loading servicios', e);
    } finally {
      this.loading.set(false);
    }
  }

  onShowInactiveChange(value: boolean): void {
    this.showInactive.set(value);
    void this.loadData();
  }

  openForm(servicio?: Servicio): void {
    this.submitted.set(false);
    if (servicio) {
      this.editMode.set(true);
      this.idServicio.set(servicio.idServicio);
      this.nombre.set(servicio.nombre);
      this.descripcion.set(servicio.descripcion || '');
      this.tipoServicio.set(servicio.tipoServicio);
      this.precio.set(servicio.precio);
    } else {
      this.editMode.set(false);
      this.idServicio.set(0);
      this.nombre.set('');
      this.descripcion.set('');
      this.tipoServicio.set('CONSULTA');
      this.precio.set(0);
    }
    this.showForm.set(true);
  }

  async handleSubmit(): Promise<void> {
    this.submitted.set(true);

    if (!this.formValid()) {
      return;
    }

    try {
      const payload: CrearServicioRequest = {
        nombre: this.nombre(),
        descripcion: this.descripcion(),
        tipoServicio: this.tipoServicio(),
        precio: this.precio(),
      };
      if (this.editMode() && this.idServicio()) {
        await firstValueFrom(this.serviciosApi.update(this.idServicio(), payload));
      } else {
        await firstValueFrom(this.serviciosApi.create(payload));
      }
      this.showForm.set(false);
      await this.loadData();
    } catch (e: unknown) {
      console.error('Error saving servicio', e);
    }
  }

  confirmDelete(servicio: Servicio): void {
    this.selectedServicio.set(servicio);
    this.showDeleteDialog.set(true);
  }

  async handleDelete(): Promise<void> {
    const servicio = this.selectedServicio();
    if (!servicio) return;
    try {
      await firstValueFrom(this.serviciosApi.delete(servicio.idServicio));
      this.showDeleteDialog.set(false);
      await this.loadData();
    } catch (e: unknown) {
      console.error('Error deleting servicio', e);
    }
  }

  formatPrecio(value: number | null): string {
    return '$' + (value?.toLocaleString() ?? '');
  }
}
