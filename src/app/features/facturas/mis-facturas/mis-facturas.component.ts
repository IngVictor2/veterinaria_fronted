import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FacturasApiService } from '../../../core/services/facturas-api.service';
import { PagosApiService } from '../../../core/services/pagos-api.service';
import { MetodosPagoApiService, MetodoPago } from '../../../core/services/metodos-pago-api.service';
import { Factura } from '../../../core/models/factura';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-mis-facturas',
  imports: [FormsModule],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Mis Facturas</h1>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (error()) {
        <div class="card bg-base-100 shadow-md">
          <div class="card-body text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-error/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 class="text-lg font-medium mt-4">Algo salió mal</h3>
            <p class="text-base-content/50 mt-2">{{ error() }}</p>
          </div>
        </div>
      } @else if (facturas().length === 0) {
        <div class="card bg-base-100 shadow-md">
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
          @for (factura of facturasOrdenadas(); track factura.idFactura) {
            <div class="card bg-base-100 shadow-md">
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
        </div>
      }

      <!-- Modal de Pago -->
      @if (showPayModal()) {
        <dialog class="modal modal-open">
          <div class="modal-box bg-[#1a1a2e] max-w-sm p-0">
            <!-- Exito -->
            @if (exitoPago()) {
              <div class="px-5 py-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-base font-bold mt-3 text-[#FFFFE3]">Pago exitoso</h3>
                <p class="text-xs text-base-content/50 mt-1">Tu pago ha sido registrado correctamente</p>
              </div>
            } @else {
              <div class="px-5 pt-5 pb-4">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-bold text-lg text-[#FFFFE3]">Pagar Factura</h3>
                  <button class="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-[#FFFFE3]" (click)="closePayModal()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                @if (errorPago()) {
                  <div class="alert alert-error mb-3 py-2 text-sm">
                    <span>{{ errorPago() }}</span>
                  </div>
                }

                @if (facturaSeleccionada(); as facturaSel) {
                  <div class="bg-white/5 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between">
                    <span class="text-xs text-base-content/50 uppercase tracking-wider">Total</span>
                    <span class="text-lg font-extrabold text-primary">{{ formatPrecio(facturaSel.total) }}</span>
                  </div>
                }

                <form (ngSubmit)="handlePago()">
                  <div class="form-control mb-4">
                    <label class="label pb-1">
                      <span class="label-text text-xs uppercase tracking-wider text-base-content/50">Método de pago</span>
                    </label>
                    <div class="grid grid-cols-1 gap-1.5">
                      @for (metodo of metodosPago(); track metodo.idMetodoPago) {
                        <label
                          class="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all"
                          [class]="idMetodoPago() === metodo.idMetodoPago ? 'bg-primary/10 border border-primary/30' : 'bg-white/5 border border-transparent hover:bg-white/10'"
                          (click)="seleccionarMetodo(metodo)"
                        >
                          <input
                            type="radio"
                            name="metodoPagoCliente"
                            class="radio radio-xs radio-primary"
                            [value]="metodo.idMetodoPago"
                            [checked]="idMetodoPago() === metodo.idMetodoPago"
                          />
                          <span class="text-sm text-[#FFFFE3]">{{ metodo.descripcion || metodo.nombre }}</span>
                        </label>
                      }
                    </div>
                  </div>

                  <div class="px-0 py-3 flex justify-end gap-2">
                    <button type="button" class="btn btn-ghost btn-sm" (click)="closePayModal()">Cancelar</button>
                    <button
                      type="submit"
                      class="btn btn-success btn-sm gap-1"
                      [disabled]="saving() || idMetodoPago() === 0 || monto() <= 0"
                    >
                      @if (saving()) {
                        <span class="loading loading-spinner loading-xs"></span>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      }
                      Confirmar Pago
                    </button>
                  </div>
                </form>
              </div>
            }
          </div>
          <form method="dialog" class="modal-backdrop" (click)="closePayModal()">
            <button>close</button>
          </form>
        </dialog>
      }
    </div>
  `,
})
export class MisFacturasComponent implements OnInit {
  private readonly facturasApi = inject(FacturasApiService);
  private readonly pagosApi = inject(PagosApiService);
  private readonly metodosPagoApi = inject(MetodosPagoApiService);

  readonly facturas = signal<Factura[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly showPayModal = signal(false);
  readonly facturaSeleccionada = signal<Factura | null>(null);
  readonly metodosPago = signal<MetodoPago[]>([]);
  readonly saving = signal(false);
  readonly errorPago = signal('');
  readonly exitoPago = signal(false);

  readonly idMetodoPago = signal(0);
  readonly monto = signal(0);
  readonly referenciaPago = signal('');

  readonly metodoPagoLabel = computed(() => {
    const m = this.metodosPago().find((x) => x.idMetodoPago === this.idMetodoPago());
    return m ? m.descripcion || m.nombre : 'Seleccionar método de pago';
  });

  readonly facturasOrdenadas = computed(() => {
    return [...this.facturas()].sort((a, b) => b.idFactura - a.idFactura);
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
  }

  esPagoConTarjeta(metodo: MetodoPago): boolean {
    return ['TARJETA_DEBITO', 'TARJETA_CREDITO'].includes(metodo.nombre);
  }

  seleccionarMetodo(metodo: MetodoPago): void {
    this.idMetodoPago.set(metodo.idMetodoPago);
    const el = document.activeElement as HTMLElement | null;
    el?.blur();
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

  async openPayModal(factura: Factura): Promise<void> {
    this.facturaSeleccionada.set(factura);
    this.idMetodoPago.set(0);
    this.monto.set(factura.total || 0);
    this.referenciaPago.set('');
    this.errorPago.set('');
    this.exitoPago.set(false);
    this.showPayModal.set(true);

    if (this.metodosPago().length === 0) {
      try {
        const res = await firstValueFrom(this.metodosPagoApi.getAll());
        this.metodosPago.set((res || []).filter((m) => m.estado === true && this.esPagoConTarjeta(m)));
      } catch (e: unknown) {
        console.error('Error loading metodos de pago', e);
      }
    }
  }

  closePayModal(): void {
    this.showPayModal.set(false);
    this.facturaSeleccionada.set(null);
    this.errorPago.set('');
    this.exitoPago.set(false);
  }

  async handlePago(): Promise<void> {
    const factura = this.facturaSeleccionada();
    if (!factura) return;
    this.saving.set(true);
    this.errorPago.set('');
    try {
      await firstValueFrom(
        this.pagosApi.create({
          idFactura: factura.idFactura,
          idMetodoPago: this.idMetodoPago(),
          monto: this.monto(),
          referenciaPago: this.referenciaPago() || undefined,
        }),
      );

      this.exitoPago.set(true);

      this.facturas.set(await firstValueFrom(this.facturasApi.getMisFacturas()));

      setTimeout(() => {
        this.closePayModal();
      }, 2000);
    } catch (e: unknown) {
      this.errorPago.set(getApiErrorMessage(e, 'Error al procesar el pago'));
    } finally {
      this.saving.set(false);
    }
  }
}
