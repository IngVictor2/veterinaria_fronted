import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FacturasApiService } from '../../../core/services/facturas-api.service';
import { WompiWidgetService } from '../../../core/services/wompi-widget.service';
import { Factura } from '../../../core/models/factura';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { PaginationBarComponent } from '../../../shared/components/pagination-bar/pagination-bar.component';
import { WompiPaymentModalComponent } from '../../../shared/components/wompi-payment-modal/wompi-payment-modal.component';

@Component({
  selector: 'app-mis-facturas',
  imports: [PaginationBarComponent, WompiPaymentModalComponent],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#374151]">Mis Facturas</h1>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (error()) {
        <div class="management-card card  shadow-md">
          <div class="card-body text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-error/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 class="text-lg font-medium mt-4">Algo salió mal</h3>
            <p class="text-base-content/50 mt-2">{{ error() }}</p>
          </div>
        </div>
      } @else if (facturas().length === 0) {
        <div class="management-card card  shadow-md">
          <div class="card-body text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
            <h3 class="text-lg font-medium mt-4">No tienes facturas</h3>
            <p class="text-base-content/50 mt-2">Tus facturas aparecerán aquí después de tus citas</p>
          </div>
        </div>
      } @else {
        <div class="space-y-4">
          @for (factura of paginatedFacturas(); track factura.idFactura) {
            <div class="management-card card  shadow-md">
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold">
                        Factura #{{ numerosFacturas()[factura.idFactura] ?? factura.idFactura }}
                        <span class="text-sm font-medium text-base-content/40">de {{ facturas().length }}</span>
                      </h3>
                      <span class="badge badge-sm" [class]="estadoColor(factura.estadoFactura)">
                        {{ estadoLabel(factura.estadoFactura) }}
                      </span>
                    </div>
                    <p class="text-sm text-base-content/60 mt-1">
                      {{ formatFecha(factura.fechaFactura) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-primary">
                      {{ formatPrecio(factura.total) }}
                    </p>
                    @if (factura.estadoFactura === 'PENDIENTE') {
                      <button class="btn btn-primary btn-sm mt-2 gap-2" (click)="openPayModal(factura)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Pagar
                      </button>
                    }
                  </div>
                </div>

                @if (factura.items && factura.items.length > 0) {
                  <div class="mt-4">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Servicio</th>
                          <th class="text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (detalle of factura.items; track detalle.idDetalle) {
                          <tr>
                            <td>{{ detalle.nombreServicio }}</td>
                            <td class="text-right">{{ formatPrecio(detalle.subtotal) }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            </div>
          }
          <app-pagination-bar
            [(page)]="page"
            [totalPages]="totalPages()"
            [totalElements]="facturasOrdenadas().length"
            [size]="size()"
          />
        </div>
      }

      <app-wompi-payment-modal
        [show]="showPayModal()"
        [factura]="facturaSeleccionada()"
        [permitirPagoManual]="false"
        (cerrado)="closePayModal()"
        (pagado)="onPagoRegistrado()"
      />
    </div>
  `,
})
export class MisFacturasComponent implements OnInit {
  private readonly facturasApi = inject(FacturasApiService);
  private readonly wompi = inject(WompiWidgetService);

  readonly facturas = signal<Factura[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(0);
  readonly size = signal(3);

  readonly showPayModal = signal(false);
  readonly facturaSeleccionada = signal<Factura | null>(null);

  readonly facturasOrdenadas = computed(() => {
    return [...this.facturas()].sort((a, b) => b.idFactura - a.idFactura);
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.facturasOrdenadas().length / this.size())));

  readonly paginatedFacturas = computed(() => {
    const start = this.page() * this.size();
    return this.facturasOrdenadas().slice(start, start + this.size());
  });

  readonly numerosFacturas = computed(() => {
    const mapa: Record<number, number> = {};
    const ordenadas = [...this.facturas()].sort((a, b) => a.idFactura - b.idFactura);
    ordenadas.forEach((f, i) => {
      mapa[f.idFactura] = i + 1;
    });
    return mapa;
  });

  async ngOnInit(): Promise<void> {
    try {
      this.facturas.set(await firstValueFrom(this.facturasApi.getMisFacturas()));
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudieron cargar las facturas'));
    } finally {
      this.loading.set(false);
    }
    void this.verificarPendientesWompi();
  }

  private async verificarPendientesWompi(): Promise<void> {
    const actualizada = await this.wompi.verificarPendientes();
    if (!actualizada) return;

    try {
      this.facturas.set(await firstValueFrom(this.facturasApi.getMisFacturas()));
    } catch {
      // El próximo inicio de sesión volverá a intentar la verificación.
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

  estadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente de pago',
      PAGADA: 'Pagada',
      ANULADA: 'Anulada',
    };
    return labels[estado] || estado;
  }

  formatFecha(fecha: string): string {
    const parts = fecha.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatPrecio(valor: number | null): string {
    return '$' + (valor?.toLocaleString() ?? '');
  }

  openPayModal(factura: Factura): void {
    this.facturaSeleccionada.set(factura);
    this.showPayModal.set(true);
  }

  closePayModal(): void {
    this.showPayModal.set(false);
    this.facturaSeleccionada.set(null);
  }

  async onPagoRegistrado(): Promise<void> {
    try {
      this.facturas.set(await firstValueFrom(this.facturasApi.getMisFacturas()));
    } catch {
      // La factura se actualizará en el próximo intento de carga.
    }
  }
}
