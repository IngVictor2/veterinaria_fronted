import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EmpleadosApiService } from '../../../core/services/empleados-api.service';
import { Empleado } from '../../../core/models/empleado';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';
import { CellTemplateDirective, ActionsTemplateDirective } from '../../../shared/components/data-table/cell-template.directive';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-empleados-list',
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
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Empleados</h1>
        <button class="btn btn-primary" (click)="router.navigate(['/empleados/nueva'])">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Empleado
        </button>
      </div>

      @if (error()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
        </div>
      }

      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex items-center gap-4 mb-4">
            <div class="flex-1">
              <app-search-filter
                [(value)]="search"
                (search)="handleSearch()"
                placeholder="Buscar por nombre, cargo, correo..."
              />
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
            emptyMessage="No hay empleados"
            [dimInactive]="true"
          >
            <ng-template appCell="primerNombre" let-item>
              <span [class]="!item.estado ? 'opacity-50 line-through' : ''">
                {{ fullName(item) }}
              </span>
            </ng-template>
            <ng-template appCell="fechaIngreso" let-value="value">
              {{ formatFecha(value) }}
            </ng-template>
            <ng-template appActions let-item>
              <button class="btn btn-ghost btn-xs text-info" (click)="router.navigate(['/empleados', item.idEmpleado])">
                Ver
              </button>
            </ng-template>
          </app-data-table>
        </div>
      </div>

      <app-confirm-dialog
        [show]="showDeleteDialog()"
        title="Eliminar empleado"
        [message]="mensajeEliminar()"
        confirmText="Eliminar"
        variant="error"
        (confirm)="handleDelete()"
        (cancel)="showDeleteDialog.set(false)"
      />
    </div>
  `,
})
export class EmpleadosListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly empleadosApi = inject(EmpleadosApiService);

  readonly data = signal<Empleado[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly showInactive = signal(false);
  readonly search = signal('');
  readonly selected = signal<Empleado | null>(null);
  readonly showDeleteDialog = signal(false);

  readonly columns: DataTableColumn[] = [
    { key: 'primerNombre', label: 'Nombre', sortable: true },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'correo', label: 'Correo' },
    { key: 'nombreCargo', label: 'Cargo' },
    { key: 'fechaIngreso', label: 'Fecha ingreso' },
  ];

  readonly visibleData = computed(() => {
    let result = [...this.data()];
    result = result.filter((e) => (this.showInactive() ? !e.estado : e.estado));
    const search = this.search();
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          this.fullName(e).toLowerCase().includes(q) ||
          e.nombreCargo?.toLowerCase().includes(q) ||
          e.correo?.toLowerCase().includes(q),
      );
    }
    return result.sort((a, b) => {
      if (a.estado !== b.estado) return a.estado ? -1 : 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  });

  readonly mensajeEliminar = computed(() => {
    const empleado = this.selected();
    return `¿Estás seguro de eliminar a ${empleado?.primerNombre} ${empleado?.primerApellido}?`;
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  fullName(empleado: Empleado): string {
    const parts = [empleado.primerNombre, empleado.segundoNombre, empleado.primerApellido, empleado.segundoApellido].filter(
      Boolean,
    );
    return parts.join(' ');
  }

  formatFecha(value: string | null): string {
    if (!value) return '';
    return new Date(value).toLocaleDateString('es-CO');
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const empleados = await firstValueFrom(this.empleadosApi.getAll(this.showInactive()));
      this.data.set([...empleados].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudieron cargar los empleados'));
    } finally {
      this.loading.set(false);
    }
  }

  onShowInactiveChange(value: boolean): void {
    this.showInactive.set(value);
    void this.loadData();
  }

  confirmDelete(empleado: Empleado): void {
    this.selected.set(empleado);
    this.showDeleteDialog.set(true);
  }

  async handleDelete(): Promise<void> {
    const empleado = this.selected();
    if (!empleado) return;
    try {
      await firstValueFrom(this.empleadosApi.cambiarEstado(empleado.idEmpleado, false));
      this.showDeleteDialog.set(false);
      await this.loadData();
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al eliminar el empleado'));
    }
  }

  async reactivar(empleado: Empleado): Promise<void> {
    try {
      await firstValueFrom(this.empleadosApi.cambiarEstado(empleado.idEmpleado, true));
      await this.loadData();
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al reactivar'));
    }
  }

  handleSearch(): void {
    // El filtrado es reactivo (computed); no se requiere acción adicional.
  }
}
