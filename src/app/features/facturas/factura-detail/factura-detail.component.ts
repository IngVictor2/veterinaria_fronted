import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FacturasApiService } from '../../../core/services/facturas-api.service';
import { PagosApiService } from '../../../core/services/pagos-api.service';
import { MetodosPagoApiService, MetodoPago } from '../../../core/services/metodos-pago-api.service';
import { Factura } from '../../../core/models/factura';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-factura-detail',
  imports: [FormsModule, ConfirmDialogComponent],
  template: `
    <div class="max-w-5xl mx-auto">
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

      @if (loading()) {
        <div class="flex justify-center py-20">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (factura(); as factura) {
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-xl sm:text-2xl font-extrabold text-[#FFFFE3]">Factura #{{ factura.idFactura }}</h1>
            <p class="text-sm text-base-content/50">Detalle de la factura</p>
          </div>
          @if (factura.estadoFactura === 'PENDIENTE') {
            <button class="btn btn-success btn-md gap-1" (click)="abrirPago()">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pagar
            </button>
          }
          <span class="badge badge-lg" [class]="estadoColor(factura.estadoFactura)">{{ factura.estadoFactura }}</span>
          <!-- 3-dot menu -->
          @if (factura.estadoFactura === 'PENDIENTE') {
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                </svg>
              </div>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-[#2A2A2A] rounded-xl w-52 z-50">
                <li>
                  <a (click)="showAnulDialog.set(true)" class="text-red-400 hover:bg-red-500/20">Anular</a>
                </li>
              </ul>
            </div>
          }
        </div>

        <!-- Info Card -->
        <div class="bg-base-100 rounded-2xl overflow-hidden mb-6">
          <div class="bg-gradient-to-r from-[#0D7377]/20 to-transparent px-6 py-5 flex items-center gap-5">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-bold text-[#FFFFE3]">Factura #{{ factura.idFactura }}</h2>
              <p class="text-sm text-base-content/50">{{ factura.nombreCliente }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-base-content/40 uppercase tracking-wider">Total</p>
              <p class="text-2xl font-extrabold text-primary">{{ formatCurrency(factura.total) }}</p>
            </div>
          </div>
          <div class="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Fecha</p>
              <p class="text-sm font-medium">{{ formatFecha(factura.fechaFactura) }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Cliente</p>
              <p class="text-sm font-medium">{{ factura.nombreCliente }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Estado</p>
              <span class="badge badge-sm" [class]="estadoColor(factura.estadoFactura)">{{ factura.estadoFactura }}</span>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Descuento</p>
              <p class="text-sm font-medium">{{ formatCurrency(factura.descuento) }}</p>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="bg-base-100 rounded-2xl overflow-hidden">
          @if (!factura.items || factura.items.length === 0) {
            <div class="px-6 py-12 text-center text-base-content/40">
              No hay items en esta factura
            </div>
          } @else {
            <table class="table w-full">
              <thead>
                <tr class="border-b border-base-300">
                  <th class="text-xs text-base-content/40 uppercase tracking-wider">Servicio</th>
                  <th class="text-xs text-base-content/40 uppercase tracking-wider text-center">Cantidad</th>
                  <th class="text-xs text-base-content/40 uppercase tracking-wider text-right">Precio</th>
                  <th class="text-xs text-base-content/40 uppercase tracking-wider text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (item of factura.items; track item.idDetalle) {
                  <tr class="border-b border-base-300/50">
                    <td class="font-medium">{{ item.nombreServicio }}</td>
                    <td class="text-center">{{ item.cantidad }}</td>
                    <td class="text-right">{{ formatCurrency(item.precio) }}</td>
                    <td class="text-right font-medium">{{ formatCurrency(item.subtotal) }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="border-t border-base-300">
                  <td colspan="3" class="text-right font-medium text-base-content/60">Subtotal</td>
                  <td class="text-right font-medium">{{ formatCurrency(factura.subtotal) }}</td>
                </tr>
                @if (factura.descuento > 0) {
                  <tr>
                    <td colspan="3" class="text-right font-medium text-base-content/60">Descuento</td>
                    <td class="text-right font-medium text-error">-{{ formatCurrency(factura.descuento) }}</td>
                  </tr>
                }
                <tr class="border-t border-base-300">
                  <td colspan="3" class="text-right font-bold text-[#FFFFE3]">Total</td>
                  <td class="text-right font-extrabold text-primary text-lg">{{ formatCurrency(factura.total) }}</td>
                </tr>
              </tfoot>
            </table>
          }
        </div>
      }

      <!-- Modal de pago -->
      @if (showPagoModal()) {
        <dialog class="modal modal-open">
          <div class="modal-box bg-[#1a1a2e] max-w-sm p-0">
            <div class="px-5 pt-5 pb-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-lg text-[#FFFFE3]">Pagar factura #{{ factura()?.idFactura }}</h3>
                <button class="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-[#FFFFE3]" (click)="cerrarPago()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              @if (pagoError()) {
                <div class="alert alert-error mb-3 py-2 text-sm">
                  <span>{{ pagoError() }}</span>
                </div>
              }

              <div class="bg-white/5 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between">
                <span class="text-xs text-base-content/50 uppercase tracking-wider">Total</span>
                <span class="text-lg font-extrabold text-primary">{{ formatCurrency(factura()?.total ?? 0) }}</span>
              </div>

              <div class="form-control mb-4">
                <label class="label pb-1">
                  <span class="label-text text-xs uppercase tracking-wider text-base-content/50">Método de pago</span>
                </label>
                <div class="grid grid-cols-1 gap-1.5">
                  @for (m of metodosPago(); track m.idMetodoPago) {
                    <label
                      class="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all"
                      [class]="metodoPagoSeleccionado() === m.idMetodoPago ? 'bg-primary/10 border border-primary/30' : 'bg-white/5 border border-transparent hover:bg-white/10'"
                      (click)="metodoPagoSeleccionado.set(m.idMetodoPago)"
                    >
                      <input
                        type="radio"
                        name="metodoPagoEmpleado"
                        class="radio radio-xs radio-primary"
                        [value]="m.idMetodoPago"
                        [ngModel]="metodoPagoSeleccionado()"
                        (ngModelChange)="metodoPagoSeleccionado.set($event)"
                      />
                      <span class="text-sm text-[#FFFFE3]">{{ m.descripcion || m.nombre }}</span>
                    </label>
                  }
                </div>
              </div>
            </div>

            <div class="px-5 py-3 flex justify-end gap-2">
              <button class="btn btn-ghost btn-sm" [disabled]="pagando()" (click)="cerrarPago()">Cancelar</button>
              <button
                class="btn btn-success btn-sm gap-1"
                [disabled]="pagando() || !metodoPagoSeleccionado()"
                (click)="ejecutarPago()"
              >
                @if (pagando()) {
                  <span class="loading loading-spinner loading-xs"></span>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                }
                Pagar
              </button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop" (click)="cerrarPago()">
            <button>close</button>
          </form>
        </dialog>
      }

      <app-confirm-dialog
        [show]="showAnulDialog()"
        title="Anular factura"
        message="¿Estás seguro de anular esta factura? Esta acción no se puede deshacer."
        confirmText="Anular"
        variant="error"
        (confirm)="handleAnular()"
        (cancel)="showAnulDialog.set(false)"
      />
    </div>
  `,
})
export class FacturaDetailComponent implements OnInit {
  readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly facturasApi = inject(FacturasApiService);
  private readonly pagosApi = inject(PagosApiService);
  private readonly metodosPagoApi = inject(MetodosPagoApiService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly factura = signal<Factura | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly showPagoModal = signal(false);
  readonly metodosPago = signal<MetodoPago[]>([]);
  readonly metodoPagoSeleccionado = signal<number | null>(null);
  readonly pagando = signal(false);
  readonly pagoError = signal('');
  readonly showAnulDialog = signal(false);

  readonly initials = computed(() => {
    const factura = this.factura();
    if (!factura) return '?';
    return factura.nombreCliente?.[0]?.toUpperCase() || '?';
  });

  async ngOnInit(): Promise<void> {
    try {
      this.factura.set(await firstValueFrom(this.facturasApi.getById(this.id)));
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo cargar la factura'));
    } finally {
      this.loading.set(false);
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

  formatFecha(fecha: string | null): string {
    if (!fecha) return '—';
    const parts = fecha.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatCurrency(valor: number): string {
    return '$' + (valor?.toLocaleString('es-CO') || '0');
  }

  async abrirPago(): Promise<void> {
    this.metodoPagoSeleccionado.set(null);
    this.pagoError.set('');
    this.showPagoModal.set(true);
    if (this.metodosPago().length === 0) {
      try {
        const res = await firstValueFrom(this.metodosPagoApi.getAll());
        this.metodosPago.set((res || []).filter((m) => m.estado === true));
      } catch (e: unknown) {
        this.pagoError.set('No se pudieron cargar los métodos de pago');
      }
    }
  }

  cerrarPago(): void {
    if (this.pagando()) return;
    this.showPagoModal.set(false);
    this.pagoError.set('');
  }

  async ejecutarPago(): Promise<void> {
    const factura = this.factura();
    const metodoPago = this.metodoPagoSeleccionado();
    if (!factura || !metodoPago) return;
    this.pagando.set(true);
    this.pagoError.set('');
    try {
      await firstValueFrom(
        this.pagosApi.create({
          idFactura: factura.idFactura,
          idMetodoPago: metodoPago,
          monto: factura.total || 0,
        }),
      );
      this.factura.set(await firstValueFrom(this.facturasApi.getById(this.id)));
      this.showPagoModal.set(false);
      this.success.set('Factura pagada correctamente');
      setTimeout(() => this.success.set(''), 3000);
    } catch (e: unknown) {
      this.pagoError.set(getApiErrorMessage(e, 'Error al procesar el pago'));
    } finally {
      this.pagando.set(false);
    }
  }

  async handleAnular(): Promise<void> {
    try {
      await firstValueFrom(this.facturasApi.cambiarEstado(this.id, 'ANULADA'));
      this.factura.set(await firstValueFrom(this.facturasApi.getById(this.id)));
      this.showAnulDialog.set(false);
      this.success.set('Factura anulada');
      setTimeout(() => this.success.set(''), 3000);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo anular'));
      this.showAnulDialog.set(false);
    }
  }
}
