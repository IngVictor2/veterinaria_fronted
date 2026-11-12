import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PagosApiService } from './pagos-api.service';
import { WompiWidgetConfig, WompiWidgetResult } from '../models/pago';

interface WidgetCheckoutInstance {
  open(callback: (result: WompiWidgetResult) => void): void;
}

type WidgetCheckoutConstructor = new (config: WompiWidgetConfig) => WidgetCheckoutInstance;

export interface WompiPendiente {
  referencia: string;
  idTransaccionWompi: string | null;
}

interface ReferenciaPendiente extends WompiPendiente {
  idFactura: number;
}

@Injectable({ providedIn: 'root' })
export class WompiWidgetService {
  private readonly pagosApi = inject(PagosApiService);

  private loadPromise: Promise<void> | null = null;

  private static readonly SCRIPT_ID = 'wompi-widget-script';
  private static readonly PENDING_PREFIX = 'wompi_pending_';

  cargarWidget(): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve();

    const existente = (window as unknown as { WidgetCheckout?: WidgetCheckoutConstructor }).WidgetCheckout;
    if (existente) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const scriptExistente = document.getElementById(WompiWidgetService.SCRIPT_ID) as HTMLScriptElement | null;
      if (scriptExistente) {
        if (scriptExistente.dataset['loaded'] === 'true') {
          resolve();
          return;
        }
        scriptExistente.addEventListener('load', () => resolve(), { once: true });
        scriptExistente.addEventListener(
          'error',
          () => {
            scriptExistente.remove();
            this.loadPromise = null;
            reject(new Error('No se pudo cargar Wompi'));
          },
          { once: true },
        );
        return;
      }

      const script = document.createElement('script');
      script.id = WompiWidgetService.SCRIPT_ID;
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      script.onload = () => {
        script.dataset['loaded'] = 'true';
        resolve();
      };
      script.onerror = () => {
        script.remove();
        this.loadPromise = null;
        reject(new Error('No se pudo cargar Wompi'));
      };
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  abrirWidget(config: WompiWidgetConfig, alFinalizar: (result: WompiWidgetResult) => void): void {
    const WidgetCheckout = (window as unknown as { WidgetCheckout?: WidgetCheckoutConstructor }).WidgetCheckout;
    if (!WidgetCheckout) {
      throw new Error('Wompi Widget no está disponible');
    }
    const checkout = new WidgetCheckout(config);
    checkout.open((result) => alFinalizar(result));
  }

  guardarReferenciaPendiente(
    idFactura: number,
    referencia: string,
    idTransaccionWompi: string | null = null,
  ): void {
    const pendiente: WompiPendiente = { referencia, idTransaccionWompi };
    localStorage.setItem(`${WompiWidgetService.PENDING_PREFIX}${idFactura}`, JSON.stringify(pendiente));
  }

  obtenerReferenciaPendiente(idFactura: number): WompiPendiente | null {
    const raw = localStorage.getItem(`${WompiWidgetService.PENDING_PREFIX}${idFactura}`);
    return raw ? this.parsePendiente(raw) : null;
  }

  actualizarIdTransaccion(referencia: string, idTransaccionWompi: string): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(WompiWidgetService.PENDING_PREFIX)) continue;

      const pendiente = this.parsePendiente(localStorage.getItem(key) ?? '');
      if (pendiente?.referencia === referencia) {
        localStorage.setItem(key, JSON.stringify({ ...pendiente, idTransaccionWompi }));
      }
    }
  }

  limpiarReferenciaPendiente(referencia: string): void {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key?.startsWith(WompiWidgetService.PENDING_PREFIX)) continue;

      const pendiente = this.parsePendiente(localStorage.getItem(key) ?? '');
      if (pendiente?.referencia === referencia) {
        localStorage.removeItem(key);
      }
    }
  }

  listarReferenciasPendientes(): ReferenciaPendiente[] {
    const pendientes: ReferenciaPendiente[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(WompiWidgetService.PENDING_PREFIX)) continue;

      const idFactura = Number(key.slice(WompiWidgetService.PENDING_PREFIX.length));
      const pendiente = this.parsePendiente(localStorage.getItem(key) ?? '');
      if (pendiente && Number.isFinite(idFactura)) {
        pendientes.push({ idFactura, ...pendiente });
      }
    }
    return pendientes;
  }

  obtenerIdTransaccionDeUrl(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return new URL(window.location.href).searchParams.get('id');
    } catch {
      return null;
    }
  }

  /**
   * Fallback para webhooks retrasados o arranques en frío de Render.
   * Usa el ID de Wompi que entrega el widget o el parámetro ?id= del redirect.
   * Devuelve true si alguna factura pendiente quedó aprobada.
   */
  async verificarPendientes(): Promise<boolean> {
    let facturaActualizada = false;
    const idDesdeUrl = this.obtenerIdTransaccionDeUrl();

    for (const pendiente of this.listarReferenciasPendientes()) {
      try {
        const resultado = await firstValueFrom(
          this.pagosApi.verificarPagoWompi({
            referencia: pendiente.referencia,
            idTransaccionWompi: pendiente.idTransaccionWompi ?? idDesdeUrl ?? undefined,
          }),
        );

        if (resultado.estado === 'APROBADA') {
          this.limpiarReferenciaPendiente(pendiente.referencia);
          facturaActualizada = true;
        } else if (['RECHAZADA', 'ANULADA', 'ERROR'].includes(resultado.estado)) {
          this.limpiarReferenciaPendiente(pendiente.referencia);
        }
      } catch {
        // Se conserva la referencia para reintentar más tarde.
      }
    }

    return facturaActualizada;
  }

  private parsePendiente(raw: string): WompiPendiente | null {
    try {
      const parsed = JSON.parse(raw) as Partial<WompiPendiente>;
      if (typeof parsed.referencia === 'string' && parsed.referencia.trim()) {
        return {
          referencia: parsed.referencia,
          idTransaccionWompi:
            typeof parsed.idTransaccionWompi === 'string' && parsed.idTransaccionWompi.trim()
              ? parsed.idTransaccionWompi
              : null,
        };
      }
    } catch {
      // Compatibilidad con el formato anterior, que guardaba solo la referencia.
      if (raw.trim()) {
        return { referencia: raw.trim(), idTransaccionWompi: null };
      }
    }
    return null;
  }
}
