import { CurrencyPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { PORTAFOLIO_SERVICIOS } from '../../../datos/servicios-portafolio';
import {
  ServicioPortafolio,
  TIPOS_PORTAFOLIO,
  TipoServicioPortafolio,
} from '../../../modelos/servicio-portafolio';
import { PortafolioCardComponent } from '../portafolio-card/portafolio-card.component';

type FiltroPortafolio = TipoServicioPortafolio | 'TODOS';

@Component({
  selector: 'app-servicios-section',
  imports: [PortafolioCardComponent, CurrencyPipe],
  template: `
    <section id="servicios" class="scroll-mt-24 border-b border-white/5 px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#7FE7E9]">
              Portafolio de servicios
            </p>
            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-[#FFFFE3] sm:text-4xl">
              Todo lo que tu mascota necesita, en un mismo lugar
            </h2>
            <p class="mt-4 text-sm leading-relaxed text-[#CBCBCB]/65 sm:text-base">
              Consulta, estética y prevención con una agenda compartida. Estos son los servicios que
              forman parte del alcance del proyecto VetClinic.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            @for (tipo of tipos; track tipo.valor) {
              <button
                type="button"
                class="rounded-full border px-3.5 py-2 text-xs font-semibold transition"
                [class]="
                  filtro() === tipo.valor
                    ? 'border-[#0D7377] bg-[#0D7377] text-[#FFFFE3]'
                    : 'border-white/10 bg-white/[0.03] text-[#CBCBCB] hover:border-[#7FE7E9]/30 hover:text-[#FFFFE3]'
                "
                (click)="filtro.set(tipo.valor)"
              >
                {{ tipo.etiqueta }}
              </button>
            }
          </div>
        </div>

        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          @for (servicio of serviciosFiltrados(); track servicio.id) {
            <app-portafolio-card [servicio]="servicio" (verDetalle)="abrirDetalle($event)" />
          } @empty {
            <div class="col-span-full rounded-3xl border border-dashed border-white/15 p-12 text-center">
              <p class="text-lg font-bold text-[#FFFFE3]">No hay servicios en esta categoría</p>
              <p class="mt-1 text-sm text-[#CBCBCB]/55">
                Selecciona otro filtro para ver el portafolio completo.
              </p>
            </div>
          }
        </div>

        <p class="mt-6 text-xs text-[#CBCBCB]/40">
          Los valores son tarifas base de demostración y pueden variar según la valoración clínica.
        </p>
      </div>

      @if (seleccionado(); as servicio) {
        <div
          class="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          (click)="cerrarDetalle()"
        >
          <div
            class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0c2020] p-6 shadow-2xl sm:rounded-3xl sm:p-8"
            role="dialog"
            aria-modal="true"
            [attr.aria-label]="'Detalle de ' + servicio.nombre"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7FE7E9]">
                  Servicio VetClinic
                </p>
                <h3 class="mt-2 text-2xl font-extrabold text-[#FFFFE3]">{{ servicio.nombre }}</h3>
              </div>
              <button
                type="button"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#CBCBCB] transition hover:bg-white/10 hover:text-[#FFFFE3]"
                aria-label="Cerrar detalle"
                (click)="cerrarDetalle()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p class="mt-4 text-sm leading-relaxed text-[#CBCBCB]/70">{{ servicio.descripcion }}</p>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-[#CBCBCB]/45">Tarifa base</p>
                <p class="mt-1 text-lg font-extrabold text-[#FFFFE3]">
                  {{ servicio.precioDesde | currency: 'COP' : 'symbol' : '1.0-0' : 'es-CO' }}
                </p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-[#CBCBCB]/45">Duración</p>
                <p class="mt-1 text-sm font-bold text-[#FFFFE3]">{{ servicio.duracion }}</p>
              </div>
            </div>

            <h4 class="mt-6 text-sm font-bold text-[#FFFFE3]">Qué incluye</h4>
            <ul class="mt-3 space-y-2">
              @for (item of servicio.incluye; track $index) {
                <li class="flex items-start gap-2 text-sm text-[#CBCBCB]/70">
                  <span class="mt-0.5 text-[#7FE7E9]" aria-hidden="true">✓</span>
                  {{ item }}
                </li>
              }
            </ul>

            <a
              href="#agenda"
              class="btn btn-primary mt-7 h-11 w-full rounded-full text-sm font-bold"
              (click)="cerrarDetalle()"
            >
              Ver agenda y confirmar una cita
            </a>
          </div>
        </div>
      }
    </section>
  `,
})
export class ServiciosSectionComponent {
  readonly tipos = TIPOS_PORTAFOLIO;
  readonly filtro = signal<FiltroPortafolio>('TODOS');
  readonly seleccionado = signal<ServicioPortafolio | null>(null);

  readonly serviciosFiltrados = computed(() => {
    const filtro = this.filtro();

    return filtro === 'TODOS'
      ? PORTAFOLIO_SERVICIOS
      : PORTAFOLIO_SERVICIOS.filter((servicio) => servicio.tipo === filtro);
  });

  abrirDetalle(servicio: ServicioPortafolio): void {
    this.seleccionado.set(servicio);
  }

  cerrarDetalle(): void {
    this.seleccionado.set(null);
  }
}
