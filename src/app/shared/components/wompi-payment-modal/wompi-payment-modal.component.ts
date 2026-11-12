import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Factura } from '../../../core/models/factura';
import { PagosApiService } from '../../../core/services/pagos-api.service';
import { MetodoPago, MetodosPagoApiService } from '../../../core/services/metodos-pago-api.service';
import { WompiWidgetService } from '../../../core/services/wompi-widget.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Component({
  selector: 'app-wompi-payment-modal',
  template: `
    @if (show()) {
      <dialog class="modal modal-open">
        <div class="modal-box bg-[#FFFFFF] max-w-md p-0">
          @if (exito()) {
            <div class="px-5 py-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-base font-bold mt-3 text-[#374151]">Pago exitoso</h3>
              <p class="text-xs text-base-content/50 mt-1">{{ exito() }}</p>
              <button class="btn btn-primary btn-sm mt-5" (click)="cerrar()">Cerrar</button>
            </div>
          } @else {
            <div class="px-5 pt-5 pb-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-lg text-[#374151]">
                  @if (factura(); as f) {
                    Pagar factura #{{ f.idFactura }}
                  } @else {
                    Pagar factura
                  }
                </h3>
                <button class="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-[#374151]" (click)="cerrar()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              @if (error()) {
                <div class="alert alert-error mb-3 py-2 text-sm">
                  <span>{{ error() }}</span>
                </div>
              }

              @if (factura(); as f) {
                <div class="bg-gray-50 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between">
                  <span class="text-xs text-base-content/50 uppercase tracking-wider">Total</span>
                  <span class="text-lg font-extrabold text-primary">{{ formatPrecio(f.total) }}</span>
                </div>
              }

              @if (verificando()) {
                <div class="rounded-lg bg-gray-50 px-4 py-5 text-center">
                  <span class="loading loading-spinner loading-md text-primary"></span>
                  <p class="text-sm text-[#374151] mt-3">Confirmando el pago con Wompi...</p>
                  <p class="text-xs text-base-content/50 mt-1">
                    Esto puede tardar unos segundos mientras Wompi confirma la transacción.
                  </p>
                  <button
                    class="btn btn-ghost btn-sm mt-3"
                    (click)="verificarPago(referencia(), true, 3, idTransaccionWompi() ?? undefined)"
                  >
                    Verificar de nuevo
                  </button>
                </div>
              } @else {
                <button
                  class="btn btn-primary btn-md w-full gap-2"
                  [disabled]="procesando()"
                  (click)="pagarConWompi()"
                >
                  @if (procesando()) {
                    <span class="loading loading-spinner loading-xs"></span>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  }
                  Pagar en línea con Wompi
                </button>
                <p class="text-[11px] text-base-content/40 text-center mt-2">
                  Pago seguro procesado por Wompi en modo de pruebas (sandbox).
                </p>

                @if (permitirPagoManual()) {
                  <div class="divider text-[10px] uppercase tracking-wider text-base-content/40 my-4">
                    o registrar pago manual
                  </div>

                  @if (cargandoMetodos()) {
                    <div class="flex justify-center py-4">
                      <span class="loading loading-spinner loading-sm text-primary"></span>
                    </div>
                  } @else {
                    @if (metodosManuales().length === 0) {
                      <p class="text-xs text-base-content/50 text-center">
                        No hay métodos de pago manual disponibles.
                      </p>
                    } @else {
                      <div class="grid grid-cols-1 gap-1.5 mb-3">
                        @for (metodo of metodosManuales(); track metodo.idMetodoPago) {
                          <label
                            class="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all"
                            [class]="idMetodoManual() === metodo.idMetodoPago ? 'bg-primary/10 border border-primary/30' : 'bg-gray-50 border border-transparent hover:bg-gray-100'"
                          >
                            <input
                              type="radio"
                              name="metodoPagoManual"
                              class="radio radio-xs radio-primary"
                              [value]="metodo.idMetodoPago"
                              [checked]="idMetodoManual() === metodo.idMetodoPago"
                              (change)="idMetodoManual.set(metodo.idMetodoPago)"
                            />
                            <span class="text-sm text-[#374151]">{{ metodo.descripcion || metodo.nombre }}</span>
                          </label>
                        }
                      </div>

                      <button
                        class="btn btn-outline btn-sm w-full"
                        [disabled]="procesando() || !idMetodoManual()"
                        (click)="pagarManual()"
                      >
                        @if (procesando()) {
                          <span class="loading loading-spinner loading-xs"></span>
                        }
                        Registrar pago manual
                      </button>
                    }
                  }
                }
              }
            </div>

            <div class="px-5 py-3 flex justify-end">
              <button class="btn btn-ghost btn-sm" [disabled]="procesando()" (click)="cerrar()">Cancelar</button>
            </div>
          }
        </div>
        <form method="dialog" class="modal-backdrop" (click)="cerrar()">
          <button>close</button>
        </form>
      </dialog>
    }
  `,
})
export class WompiPaymentModalComponent {
  private readonly pagosApi = inject(PagosApiService);
  private readonly metodosPagoApi = inject(MetodosPagoApiService);
  private readonly wompi = inject(WompiWidgetService);

  readonly show = input(false);
  readonly factura = input<Factura | null>(null);
  readonly permitirPagoManual = input(false);

  readonly cerrado = output<void>();
  readonly pagado = output<void>();

  readonly metodosManuales = signal<MetodoPago[]>([]);
  readonly idMetodoManual = signal<number | null>(null);
  readonly cargandoMetodos = signal(false);
  readonly procesando = signal(false);
  readonly verificando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  readonly referencia = signal('');
  readonly idTransaccionWompi = signal<string | null>(null);
  readonly estadoWompi = signal('');

  constructor() {
    effect(() => {
      if (!this.show()) return;
      untracked(() => void this.alAbrir());
    });
  }

  private async alAbrir(): Promise<void> {
    this.error.set('');
    this.exito.set('');
    this.estadoWompi.set('');
    this.referencia.set('');
    this.idTransaccionWompi.set(null);
    this.idMetodoManual.set(null);
    this.procesando.set(false);
    this.verificando.set(false);

    const factura = this.factura();
    if (!factura) return;

    if (this.permitirPagoManual() && this.metodosManuales().length === 0) {
      this.cargandoMetodos.set(true);
      try {
        const metodos = await firstValueFrom(this.metodosPagoApi.getAll());
        this.metodosManuales.set((metodos || []).filter((m) => m.estado === true && m.nombre !== 'Wompi'));
      } catch {
        this.error.set('No se pudieron cargar los métodos de pago manuales');
      } finally {
        this.cargandoMetodos.set(false);
      }
    }

    const pendiente = this.wompi.obtenerReferenciaPendiente(factura.idFactura);
    if (pendiente) {
      const idWompi =
        pendiente.idTransaccionWompi ?? this.wompi.obtenerIdTransaccionDeUrl() ?? null;
      this.referencia.set(pendiente.referencia);
      this.idTransaccionWompi.set(idWompi);
      await this.verificarPago(pendiente.referencia, false, 1, idWompi ?? undefined);
    }
  }

  async pagarConWompi(): Promise<void> {
    const factura = this.factura();
    if (!factura) return;

    this.procesando.set(true);
    this.error.set('');
    this.estadoWompi.set('');

    try {
      const checkout = await firstValueFrom(this.pagosApi.crearCheckoutWompi({ idFactura: factura.idFactura }));
      this.referencia.set(checkout.referencia);
      this.wompi.guardarReferenciaPendiente(factura.idFactura, checkout.referencia);

      try {
        await this.wompi.cargarWidget();
      } catch (e: unknown) {
        this.wompi.limpiarReferenciaPendiente(checkout.referencia);
        throw e;
      }
      this.procesando.set(false);

      try {
        this.wompi.abrirWidget(
          {
            currency: checkout.moneda,
            amountInCents: checkout.montoCentavos,
            reference: checkout.referencia,
            publicKey: checkout.llavePublica,
            signature: { integrity: checkout.firmaIntegridad },
            customerData: {
              email: checkout.correoCliente,
              fullName: checkout.nombreCliente,
            },
            redirectUrl: window.location.href,
          },
          (result) => {
            const idWompi = result.transaction?.id ?? null;
            if (idWompi) {
              this.idTransaccionWompi.set(idWompi);
              this.wompi.actualizarIdTransaccion(checkout.referencia, idWompi);
              void this.verificarPago(checkout.referencia, true, 6, idWompi);
            } else if (result.transaction) {
              void this.verificarPago(checkout.referencia, true, 3);
            }
          },
        );
      } catch (e: unknown) {
        this.wompi.limpiarReferenciaPendiente(checkout.referencia);
        throw e;
      }
    } catch (e: unknown) {
      this.procesando.set(false);
      this.error.set(getApiErrorMessage(e, 'No se pudo iniciar el pago con Wompi'));
    }
  }

  async verificarPago(
    referencia: string,
    mostrarCargando = true,
    intentos = 6,
    idTransaccionWompi?: string,
  ): Promise<void> {
    if (!referencia) return;

    if (mostrarCargando) this.verificando.set(true);
    this.error.set('');

    try {
      for (let intento = 0; intento < intentos; intento++) {
        const resultado = await firstValueFrom(
          this.pagosApi.verificarPagoWompi({
            referencia,
            idTransaccionWompi:
              idTransaccionWompi ?? this.idTransaccionWompi() ?? undefined,
          }),
        );
        if (resultado.idTransaccionWompi) {
          this.idTransaccionWompi.set(resultado.idTransaccionWompi);
        }
        this.estadoWompi.set(resultado.estado);

        if (resultado.estado === 'APROBADA') {
          this.wompi.limpiarReferenciaPendiente(resultado.referencia);
          this.exito.set('Pago aprobado. La factura quedó registrada como pagada.');
          this.pagado.emit();
          return;
        }

        if (['RECHAZADA', 'ANULADA', 'ERROR'].includes(resultado.estado)) {
          this.wompi.limpiarReferenciaPendiente(resultado.referencia);
          this.error.set(resultado.mensaje || 'El pago no fue aprobado por Wompi');
          return;
        }

        if (intento < intentos - 1) {
          await esperar(2000);
        }
      }

      this.error.set('El pago aún está pendiente de confirmación. Intenta verificar de nuevo en unos segundos.');
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo verificar el pago con Wompi'));
    } finally {
      if (mostrarCargando) this.verificando.set(false);
    }
  }

  async pagarManual(): Promise<void> {
    const factura = this.factura();
    const idMetodo = this.idMetodoManual();
    if (!factura || !idMetodo) return;

    this.procesando.set(true);
    this.error.set('');

    try {
      await firstValueFrom(
        this.pagosApi.create({
          idFactura: factura.idFactura,
          idMetodoPago: idMetodo,
          monto: factura.total,
        }),
      );
      this.exito.set('Pago manual registrado correctamente.');
      this.pagado.emit();
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo registrar el pago manual'));
    } finally {
      this.procesando.set(false);
    }
  }

  cerrar(): void {
    if (this.procesando()) return;
    this.cerrado.emit();
  }

  formatPrecio(valor: number | null): string {
    return '$' + (valor?.toLocaleString('es-CO') ?? '');
  }
}
