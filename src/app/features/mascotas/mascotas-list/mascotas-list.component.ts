import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MascotasApiService } from '../../../core/services/mascotas-api.service';
import { Mascota } from '../../../core/models/mascota';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';
import { ActionsTemplateDirective, CellTemplateDirective } from '../../../shared/components/data-table/cell-template.directive';
import { PaginationBarComponent } from '../../../shared/components/pagination-bar/pagination-bar.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-mascotas-list',
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
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Mascotas</h1>
        <button class="btn btn-primary gap-2" (click)="router.navigate(['/mascotas/nueva'])">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Mascota
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
              <app-search-filter [(value)]="search" (search)="handleSearch()" placeholder="Buscar por nombre, especie..." />
            </div>
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
            [data]="data()"
            [loading]="loading()"
            emptyMessage="No se encontraron mascotas"
            [dimInactive]="true"
          >
            <ng-template appCell="nombre" let-item>
              <span [class]="!item.estado ? 'opacity-50 line-through' : ''">
                {{ item.nombre }}
              </span>
            </ng-template>
            <ng-template appActions let-item>
              <button class="btn btn-ghost btn-xs text-info" (click)="router.navigate(['/mascotas', item.idMascota])">
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

      <app-confirm-dialog
        [show]="showDeleteDialog()"
        title="Eliminar mascota"
        [message]="mensajeEliminar()"
        confirmText="Eliminar"
        variant="error"
        (confirm)="handleDelete()"
        (cancel)="showDeleteDialog.set(false)"
      />
    </div>
  `,
})
export class MascotasListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly mascotasApi = inject(MascotasApiService);

  readonly allData = signal<Mascota[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(0);
  readonly size = signal(10);
  readonly search = signal('');
  readonly showDeleteDialog = signal(false);
  readonly selectedMascota = signal<Mascota | null>(null);
  readonly showInactive = signal(false);

  readonly columns: DataTableColumn[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'especie', label: 'Especie' },
    { key: 'raza', label: 'Raza' },
    { key: 'sexo', label: 'Sexo' },
    { key: 'nombreCliente', label: 'Dueño' },
  ];

  readonly filteredData = computed(() => {
    let result = this.allData();
    result = result.filter((m) => (this.showInactive() ? !m.estado : m.estado));
    const search = this.search();
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.nombre?.toLowerCase().includes(q) ||
          m.especie?.toLowerCase().includes(q) ||
          m.raza?.toLowerCase().includes(q) ||
          m.nombreCliente?.toLowerCase().includes(q),
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

  readonly mensajeEliminar = computed(
    () => `¿Estás seguro de eliminar a ${this.selectedMascota()?.nombre}?`,
  );

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.allData.set(await firstValueFrom(this.mascotasApi.getAll(this.showInactive())));
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudieron cargar las mascotas'));
    } finally {
      this.loading.set(false);
    }
  }

  onShowInactiveChange(value: boolean): void {
    this.showInactive.set(value);
    void this.loadData();
  }

  confirmDelete(mascota: Mascota): void {
    this.selectedMascota.set(mascota);
    this.showDeleteDialog.set(true);
  }

  async handleDelete(): Promise<void> {
    const mascota = this.selectedMascota();
    if (!mascota) return;
    try {
      await firstValueFrom(this.mascotasApi.delete(mascota.idMascota));
      this.showDeleteDialog.set(false);
      void this.loadData();
    } catch (e: unknown) {
      console.error('Error deleting mascota', e);
    }
  }

  handleSearch(): void {
    this.page.set(0);
  }
}
