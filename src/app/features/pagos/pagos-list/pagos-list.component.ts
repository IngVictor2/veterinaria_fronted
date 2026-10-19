import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PagosApiService } from '../../../core/services/pagos-api.service';
import { Pago } from '../../../core/models/pago';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';
import { CellTemplateDirective, ActionsTemplateDirective } from '../../../shared/components/data-table/cell-template.directive';
import { PaginationBarComponent } from '../../../shared/components/pagination-bar/pagination-bar.component';

@Component({
  selector: 'app-pagos-list',
  imports: [DataTableComponent, CellTemplateDirective, ActionsTemplateDirective, PaginationBarComponent],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Pagos</h1>
      </div>

      @if (error()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
        </div>
      }

      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <app-data-table
            [columns]="columns"
            [data]="data()"
            [loading]="loading()"
            emptyMessage="No se encontraron pagos"
          >
            <ng-template appCell="fechaPago" let-value="value">
              {{ formatFecha(value) }}
            </ng-template>
            <ng-template appCell="monto" let-value="value">
              {{ formatMonto(value) }}
            </ng-template>
            <ng-template appActions let-item>
              <div class="flex gap-1">
                <button class="btn btn-ghost btn-xs text-info" (click)="router.navigate(['/pagos', item.idPago])">
                  Ver
                </button>
              </div>
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
export class PagosListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly pagosApi = inject(PagosApiService);

  readonly allData = signal<Pago[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(0);
  readonly size = signal(10);

  readonly columns: DataTableColumn[] = [
    { key: 'idPago', label: '#', sortable: true },
    { key: 'fechaPago', label: 'Fecha', sortable: true },
    { key: 'monto', label: 'Monto', sortable: true },
    { key: 'nombreMetodoPago', label: 'Método de pago' },
    { key: 'idFactura', label: 'Factura #' },
    { key: 'referenciaPago', label: 'Referencia' },
  ];

  readonly sortedData = computed(() =>
    [...this.allData()].sort((a, b) => (b.fechaPago || '').localeCompare(a.fechaPago || '')),
  );

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sortedData().length / this.size())));
  readonly totalElements = computed(() => this.sortedData().length);
  readonly data = computed(() => {
    const start = this.page() * this.size();
    return this.sortedData().slice(start, start + this.size());
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.allData.set(await firstValueFrom(this.pagosApi.getAll()));
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudieron cargar los pagos'));
    } finally {
      this.loading.set(false);
    }
  }

  formatFecha(fecha: string | null): string {
    if (!fecha) return '—';
    const d = new Date(fecha.includes('T') ? fecha : fecha.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-CO');
  }

  formatMonto(value: number | null): string {
    return '$' + (value?.toLocaleString() ?? '');
  }
}
