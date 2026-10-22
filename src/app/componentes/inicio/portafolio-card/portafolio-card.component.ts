import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ServicioPortafolio } from '../../../modelos/servicio-portafolio';

@Component({
  selector: 'app-portafolio-card',
  imports: [CurrencyPipe],
  template: `
    <article
      class="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#7FE7E9]/30 hover:bg-white/[0.06]"
    >
      <div class="flex items-start justify-between gap-3">
        <span
          class="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7FE7E9]/20 bg-[#0D7377]/20 text-[#7FE7E9]"
          aria-hidden="true"
        >
          @switch (servicio().icono) {
            @case ('consulta') {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.5 5.5v6a4 4 0 0 0 4 4h2m9-10v6a4 4 0 0 1-4 4h-2m-2 0v3m-3 0h6M6 3.5v2m12-2v2" />
              </svg>
            }
            @case ('seguimiento') {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 19V5m0 14h16M8 15l3-4 3 2 4-6" />
              </svg>
            }
            @case ('bano') {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 10h14v4a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-4Zm2-4a2 2 0 0 1 4 0v4m-4 9-1 2m10-2 1 2" />
              </svg>
            }
            @case ('estetica') {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m14 6 4 4m-8 8 4-4m-7 3 2.5-.5L19 7a2.1 2.1 0 0 0-3-3l-9.5 9.5L6 17h1Zm10-14 2 2" />
              </svg>
            }
            @case ('preventiva') {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4" />
              </svg>
            }
            @case ('mantenimiento') {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 4h10v3a5 5 0 0 1-10 0V4Zm-2 0h14M12 12v6m-3 0h6" />
              </svg>
            }
            @case ('unas') {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 4c0 5 1 8 5 8s5-3 5-8M5 20l2-4m12 4-2-4M8 20h8" />
              </svg>
            }
            @default {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z" />
              </svg>
            }
          }
        </span>

        <span
          class="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
          [class]="etiquetaTipo()"
        >
          {{ tipoVisible() }}
        </span>
      </div>

      <h3 class="mt-5 text-lg font-bold text-[#FFFFE3]">{{ servicio().nombre }}</h3>
      <p class="mt-2 flex-1 text-sm leading-relaxed text-[#CBCBCB]/65">{{ servicio().descripcion }}</p>

      <div class="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-[#CBCBCB]/40">Desde</p>
          <p class="text-lg font-extrabold text-[#FFFFE3]">
            {{ servicio().precioDesde | currency: 'COP' : 'symbol' : '1.0-0' : 'es-CO' }}
          </p>
          <p class="text-[11px] text-[#CBCBCB]/45">{{ servicio().duracion }}</p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-[#7FE7E9]/25 bg-[#0D7377]/15 px-3 py-2 text-xs font-bold text-[#7FE7E9] transition hover:bg-[#0D7377]/30"
          (click)="verDetalle.emit(servicio())"
        >
          Ver detalle
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  `,
})
export class PortafolioCardComponent {
  readonly servicio = input.required<ServicioPortafolio>();
  readonly verDetalle = output<ServicioPortafolio>();

  tipoVisible(): string {
    const tipo = this.servicio().tipo;

    return tipo.charAt(0) + tipo.slice(1).toLowerCase();
  }

  etiquetaTipo(): string {
    switch (this.servicio().tipo) {
      case 'CONSULTA':
        return 'border-[#7FE7E9]/25 bg-[#7FE7E9]/10 text-[#7FE7E9]';
      default:
        return 'border-[#E8650A]/25 bg-[#E8650A]/10 text-[#FFB27A]';
    }
  }
}
