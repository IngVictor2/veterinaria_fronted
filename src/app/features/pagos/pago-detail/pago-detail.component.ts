import { Component, OnInit, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PagosApiService } from '../../../core/services/pagos-api.service';
import { Pago } from '../../../core/models/pago';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-pago-detail',
  template: `
    <div class="max-w-5xl mx-auto">
      @if (error()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
        </div>
      }

      @if (loading()) {
        <div class="flex justify-center py-20">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (pago(); as pago) {
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-xl sm:text-2xl font-extrabold text-[#FFFFE3]">Pago #{{ pago.idPago }}</h1>
            <p class="text-sm text-base-content/50">Detalle del pago</p>
          </div>
          <span class="badge badge-lg badge-success">Completado</span>
        </div>

        <!-- Info Card -->
        <div class="bg-base-100 rounded-2xl overflow-hidden mb-6">
          <div class="bg-gradient-to-r from-[#0D7377]/20 to-transparent px-6 py-5 flex items-center gap-5">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-success/30 to-success/10 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-bold text-[#FFFFE3]">Pago #{{ pago.idPago }}</h2>
              <p class="text-sm text-base-content/50">{{ pago.nombreMetodoPago }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-base-content/40 uppercase tracking-wider">Monto</p>
              <p class="text-2xl font-extrabold text-success">{{ formatCurrency(pago.monto) }}</p>
            </div>
          </div>
          <div class="px-6 py-5 grid grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Fecha de pago</p>
              <p class="text-sm font-medium">{{ formatFecha(pago.fechaPago) }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Método de pago</p>
              <p class="text-sm font-medium">{{ pago.nombreMetodoPago }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Monto</p>
              <p class="text-sm font-bold text-success">{{ formatCurrency(pago.monto) }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Factura #</p>
              <p
                class="text-sm font-medium text-primary cursor-pointer hover:underline"
                (click)="router.navigate(['/facturas', pago.idFactura])"
              >
                {{ pago.idFactura }}
              </p>
            </div>
            @if (pago.referenciaPago) {
              <div>
                <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Referencia</p>
                <p class="text-sm font-medium">{{ pago.referenciaPago }}</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class PagoDetailComponent implements OnInit {
  readonly router = inject(Router);
  readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly pagosApi = inject(PagosApiService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly pago = signal<Pago | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  async ngOnInit(): Promise<void> {
    try {
      const pagos = await firstValueFrom(this.pagosApi.getAll());
      const pago = pagos.find((p) => p.idPago === this.id) || null;
      this.pago.set(pago);
      if (!pago) {
        this.error.set('Pago no encontrado');
      }
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo cargar el pago'));
    } finally {
      this.loading.set(false);
    }
  }

  formatFecha(fecha: string | null): string {
    if (!fecha) return '—';
    const d = new Date(fecha.includes('T') ? fecha : fecha.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatCurrency(valor: number): string {
    return '$' + (valor?.toLocaleString('es-CO') || '0');
  }
}
