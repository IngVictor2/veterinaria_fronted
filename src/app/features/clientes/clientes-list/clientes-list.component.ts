import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClientesApiService } from '../../../core/services/clientes-api.service';
import { Cliente } from '../../../core/models/cliente';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';
import { CellTemplateDirective, ActionsTemplateDirective } from '../../../shared/components/data-table/cell-template.directive';
import { PaginationBarComponent } from '../../../shared/components/pagination-bar/pagination-bar.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-clientes-list',
  imports: [
    FormsModule,
    DataTableComponent,
    CellTemplateDirective,
    ActionsTemplateDirective,
    PaginationBarComponent,
    SearchFilterComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Clientes</h1>
        <button class="btn btn-primary" (click)="router.navigate(['/clientes/nueva'])">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      @if (error()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
          <button class="btn btn-ghost btn-xs" (click)="error.set('')">X</button>
        </div>
      }

      @if (success()) {
        <div class="alert mb-4 bg-[#7a9e7e]/15 border border-[#7a9e7e]/30 text-[#7a9e7e]">
          <span>{{ success() }}</span>
        </div>
      }

      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div class="flex-1 w-full">
              <app-search-filter [(value)]="search" (search)="handleSearch()" placeholder="Buscar por nombre, documento..." />
            </div>
            <label class="label cursor-pointer gap-2">
              <input
                type="checkbox"
                class="toggle toggle-sm toggle-warning"
                [ngModel]="showInactive()"
                (ngModelChange)="onShowInactiveChange($event)"
              />
              <span class="label-text text-sm">Mostrar Inactivos</span>
            </label>
          </div>

          <app-data-table
            [columns]="columns"
            [data]="data()"
            [loading]="loading()"
            emptyMessage="No se encontraron clientes"
            [dimInactive]="true"
            (sort)="handleSort($event)"
          >
            <ng-template appCell="primerNombre" let-item>
              <span [class]="!item.estado ? 'opacity-50 line-through' : ''">
                {{ nombreCompleto(item) }}
              </span>
            </ng-template>
            <ng-template appCell="createdAt" let-value="value">
              {{ formatFecha(value) }}
            </ng-template>
            <ng-template appActions let-item>
              <button class="btn btn-ghost btn-xs text-info" (click)="router.navigate(['/clientes', item.idCliente])">
                Ver
              </button>
            </ng-template>
          </app-data-table>

          <app-pagination-bar
            [(page)]="page"
            [totalPages]="totalPages()"
            [totalElements]="totalElements()"
            [size]="size()"
          />
        </div>
      </div>

      <!-- Dialog Eliminar -->
      <app-confirm-dialog
        [show]="showDeleteDialog()"
        title="Eliminar cliente"
        [message]="mensajeEliminar()"
        confirmText="Eliminar"
        variant="error"
        (confirm)="handleDelete()"
        (cancel)="showDeleteDialog.set(false)"
      />
    </div>
  `,
})
export class ClientesListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly clientesApi = inject(ClientesApiService);

  readonly allData = signal<Cliente[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly page = signal(0);
  readonly size = signal(10);
  readonly search = signal('');
  readonly showDeleteDialog = signal(false);
  readonly selectedCliente = signal<Cliente | null>(null);
  readonly showInactive = signal(false);

  readonly columns: DataTableColumn[] = [
    { key: 'primerNombre', label: 'Nombre', sortable: true },
    { key: 'numeroDocumento', label: 'Documento' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'correo', label: 'Correo' },
    { key: 'createdAt', label: 'Fecha registro', sortable: true },
  ];

  readonly filteredData = computed(() => {
    let result = this.allData();
    result = result.filter((c) => (this.showInactive() ? !c.estado : c.estado));
    const search = this.search();
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          this.nombreCompleto(c).toLowerCase().includes(q) ||
          c.numeroDocumento?.toLowerCase().includes(q) ||
          c.correo?.toLowerCase().includes(q),
      );
    }
    return [...result].sort((a, b) => {
      if (a.estado !== b.estado) return a.estado ? -1 : 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredData().length / this.size())));
  readonly totalElements = computed(() => this.filteredData().length);
  readonly data = computed(() => {
    const start = this.page() * this.size();
    return this.filteredData().slice(start, start + this.size());
  });

  readonly mensajeEliminar = computed(() => {
    const cliente = this.selectedCliente();
    return `¿Estás seguro de eliminar a ${cliente ? this.nombreCompleto(cliente) : ''}?`;
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  nombreCompleto(cliente: Cliente): string {
    return [cliente.primerNombre, cliente.segundoNombre, cliente.primerApellido, cliente.segundoApellido]
      .filter(Boolean)
      .join(' ');
  }

  formatFecha(value: string | null): string {
    if (!value) return '';
    return new Date(value).toLocaleDateString('es-CO');
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.allData.set(await firstValueFrom(this.clientesApi.getAll(this.showInactive())));
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudieron cargar los clientes'));
    } finally {
      this.loading.set(false);
    }
  }

  onShowInactiveChange(value: boolean): void {
    this.showInactive.set(value);
    this.page.set(0);
    void this.loadData();
  }

  confirmDelete(cliente: Cliente): void {
    this.selectedCliente.set(cliente);
    this.showDeleteDialog.set(true);
  }

  async handleDelete(): Promise<void> {
    const cliente = this.selectedCliente();
    if (!cliente) return;
    try {
      await firstValueFrom(this.clientesApi.cambiarEstado(cliente.idCliente, false));
      this.showDeleteDialog.set(false);
      await this.loadData();
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo eliminar el cliente'));
      this.showDeleteDialog.set(false);
    }
  }

  async reactivar(cliente: Cliente): Promise<void> {
    try {
      await firstValueFrom(this.clientesApi.cambiarEstado(cliente.idCliente, true));
      await this.loadData();
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al reactivar'));
    }
  }

  handleSearch(): void {
    this.page.set(0);
  }

  handleSort(field: string): void {
    console.log('Sort by', field);
  }
}
