import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FacturasApiService } from '../../../core/services/facturas-api.service';
import { Factura } from '../../../core/models/factura';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';
import { CellTemplateDirective, ActionsTemplateDirective } from '../../../shared/components/data-table/cell-template.directive';
import { PaginationBarComponent } from '../../../shared/components/pagination-bar/pagination-bar.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';

@Component({
  selector: 'app-facturas-list',
  imports: [
    FormsModule,
    DataTableComponent,
    CellTemplateDirective,
    ActionsTemplateDirective,
    PaginationBarComponent,
    SearchFilterComponent,
  ],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Facturas</h1>
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
              <app-search-filter [(value)]="search" (search)="handleSearch()" placeholder="Buscar por cliente..." />
            </div>
            <select
              name="filtroEstado"
              class="select select-bordered"
              [ngModel]="filtroEstado()"
              (ngModelChange)="onFiltroEstadoChange($event)"
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADA">Pagada</option>
              <option value="ANULADA">Anulada</option>
            </select>
          </div>

          <app-data-table
            [columns]="columns"
            [data]="data()"
            [loading]="loading()"
            emptyMessage="No se encontraron facturas"
          >
            <ng-template appCell="fechaFactura" let-value="value">
              {{ formatFecha(value) }}
            </ng-template>
            <ng-template appCell="total" let-value="value">
              {{ formatMonto(value) }}
            </ng-template>
            <ng-template appCell="estadoFactura" let-value="value">
              <span class="badge" [class]="estadoColor(value)">{{ value }}</span>
            </ng-template>
            <ng-template appActions let-item>
              <button class="btn btn-ghost btn-xs text-info" (click)="router.navigate(['/facturas', item.idFactura])">
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
    </div>
  `,
})
export class FacturasListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly facturasApi = inject(FacturasApiService);

  readonly allData = signal<Factura[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(0);
  readonly size = signal(10);
  readonly search = signal('');
  readonly filtroEstado = signal('');

  readonly columns: DataTableColumn[] = [
    { key: 'idFactura', label: '#', sortable: true },
    { key: 'fechaFactura', label: 'Fecha', sortable: true },
    { key: 'nombreCliente', label: 'Cliente' },
    { key: 'total', label: 'Total', sortable: true },
    { key: 'estadoFactura', label: 'Estado', sortable: true },
  ];

  readonly filteredData = computed(() => {
    let result = this.allData();
    if (this.filtroEstado()) {
      result = result.filter((f) => f.estadoFactura === this.filtroEstado());
    }
    const search = this.search();
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((f) => f.nombreCliente?.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      const estadoOrder: Record<string, number> = { PENDIENTE: 0, PAGADA: 1, ANULADA: 2 };
      const orderA = estadoOrder[a.estadoFactura] ?? 3;
      const orderB = estadoOrder[b.estadoFactura] ?? 3;
      if (orderA !== orderB) return orderA - orderB;
      return b.idFactura - a.idFactura;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredData().length / this.size())));
  readonly totalElements = computed(() => this.filteredData().length);
  readonly data = computed(() => {
    const start = this.page() * this.size();
    return this.filteredData().slice(start, start + this.size());
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.allData.set(await firstValueFrom(this.facturasApi.getAll()));
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudieron cargar las facturas'));
    } finally {
      this.loading.set(false);
    }
  }

  async cambiarEstado(factura: Factura, nuevoEstado: string): Promise<void> {
    try {
      await firstValueFrom(this.facturasApi.cambiarEstado(factura.idFactura, nuevoEstado));
      await this.loadData();
    } catch (e: unknown) {
      console.error('Error changing estado', e);
    }
  }

  estadoColor(estado: string): string {
    const colors: Record<string, string> = {
      PENDIENTE: 'badge-warning',
      PAGADA: 'badge-success',
      ANULADA: 'badge-error',
    };
    return colors[estado] || 'badge-ghost';
  }

  formatFecha(value: string | null): string {
    if (!value) return '';
    return new Date(value).toLocaleDateString('es-CO');
  }

  formatMonto(value: number | null): string {
    return '$' + (value?.toLocaleString() ?? '');
  }

  onFiltroEstadoChange(value: string): void {
    this.filtroEstado.set(value);
    this.page.set(0);
  }

  handleSearch(): void {
    this.page.set(0);
  }
}
