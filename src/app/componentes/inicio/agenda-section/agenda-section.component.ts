import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { EstadoCitaDemo } from '../../../modelos/cita-demo';
import { CitasDemoService } from '../../../servicios/citas-demo.service';
import { CitaDemoCardComponent } from '../../entrega1/cita-demo-card/cita-demo-card.component';

type FiltroAgenda = 'TODAS' | EstadoCitaDemo;

@Component({
  selector: 'app-agenda-section',
  imports: [CitaDemoCardComponent, CurrencyPipe, DecimalPipe],
  template: `
    <section id="agenda" class="scroll-mt-24 border-b border-white/5 px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#7FE7E9]">
              Agenda en vivo
            </p>
            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-[#FFFFE3] sm:text-4xl">
              Una agenda compartida para toda la clínica
            </h2>
            <p class="mt-4 text-sm leading-relaxed text-[#CBCBCB]/65 sm:text-base">
              Consulta las citas de ejemplo, filtra por estado y confirma una cita pendiente. El
              encabezado, el hero y los indicadores leen el mismo estado y cambian al instante.
            </p>
          </div>

          <button type="button" class="btn btn-ghost btn-sm w-fit rounded-full text-xs" (click)="reiniciarAgenda()">
            Restablecer agenda
          </button>
        </div>

        <div class="mt-9 grid gap-4 sm:grid-cols-3">
          <article class="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CBCBCB]/45">
              Citas registradas
            </p>
            <p class="mt-2 text-3xl font-extrabold text-[#FFFFE3]">{{ citas.totalCitas() }}</p>
            <p class="mt-1 text-xs text-[#CBCBCB]/45">Total de la agenda local</p>
          </article>

          <article class="rounded-2xl border border-[#7FE7E9]/20 bg-[#0D7377]/10 p-5">
            <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7FE7E9]/70">
              Pendientes por confirmar
            </p>
            <p class="mt-2 text-3xl font-extrabold text-[#7FE7E9]">{{ citas.totalPendientes() }}</p>
            <p class="mt-1 text-xs text-[#CBCBCB]/45">Cambian al confirmar una cita</p>
          </article>

          <article class="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CBCBCB]/45">
              Ingresos confirmados
            </p>
            <p class="mt-2 text-2xl font-extrabold text-[#FFFFE3]">
              {{ citas.ingresosConfirmados() | currency: 'COP' : 'symbol' : '1.0-0' : 'es-CO' }}
            </p>
            <p class="mt-1 text-xs text-[#CBCBCB]/45">Citas confirmadas y atendidas</p>
          </article>
        </div>

        @if (ultimaConfirmada(); as mascota) {
          <div
            class="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200"
            role="status"
          >
            <span class="text-lg" aria-hidden="true">✓</span>
            <div>
              <p class="font-semibold">Cita de {{ mascota }} confirmada</p>
              <p class="text-emerald-200/70">
                La agenda y los indicadores del encabezado se actualizaron automáticamente.
              </p>
            </div>
          </div>
        }

        <div class="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0a1a1a]">
          <div
            class="flex flex-col gap-3 border-b border-white/10 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <div class="flex flex-wrap gap-1.5">
              @for (opcion of filtros; track opcion.valor) {
                <button
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                  [class]="
                    filtro() === opcion.valor
                      ? 'border-[#0D7377] bg-[#0D7377] text-[#FFFFE3]'
                      : 'border-transparent text-[#CBCBCB] hover:bg-white/5 hover:text-[#FFFFE3]'
                  "
                  [attr.aria-pressed]="filtro() === opcion.valor"
                  (click)="filtro.set(opcion.valor)"
                >
                  {{ opcion.etiqueta }}
                </button>
              }
            </div>

            <label class="input input-sm flex w-full items-center gap-2 rounded-full border-white/10 bg-[#071313] lg:w-72">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5Z" />
              </svg>
              <input
                type="search"
                class="grow bg-transparent text-xs"
                placeholder="Buscar mascota, dueño o servicio"
                aria-label="Buscar citas"
                [value]="busqueda()"
                (input)="busqueda.set($any($event.target).value)"
              />
            </label>
          </div>

          <div class="space-y-3 p-4 sm:p-5">
            @for (cita of citasFiltradas(); track cita.id) {
              <app-cita-demo-card [cita]="cita" (confirmar)="confirmarCita($event)" />
            } @empty {
              <div class="px-4 py-14 text-center">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xl" aria-hidden="true">
                  🐾
                </div>
                <p class="mt-4 text-lg font-bold text-[#FFFFE3]">Sin citas para mostrar</p>

                @switch (filtro()) {
                  @case ('PENDIENTE') {
                    <p class="mt-1 text-sm text-[#CBCBCB]/55">
                      No hay citas pendientes: la agenda está al día.
                    </p>
                  }
                  @case ('CONFIRMADA') {
                    <p class="mt-1 text-sm text-[#CBCBCB]/55">
                      No hay citas confirmadas con este filtro.
                    </p>
                  }
                  @case ('ATENDIDA') {
                    <p class="mt-1 text-sm text-[#CBCBCB]/55">
                      Todavía no hay citas atendidas.
                    </p>
                  }
                  @case ('CANCELADA') {
                    <p class="mt-1 text-sm text-[#CBCBCB]/55">
                      No hay citas canceladas en la agenda.
                    </p>
                  }
                  @default {
                    @if (busqueda()) {
                      <p class="mt-1 text-sm text-[#CBCBCB]/55">
                        No se encontraron coincidencias para “{{ busqueda() }}”.
                      </p>
                    } @else {
                      <p class="mt-1 text-sm text-[#CBCBCB]/55">
                        No hay citas registradas en la agenda.
                      </p>
                    }
                  }
                }
              </div>
            }
          </div>

          <div
            class="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-xs text-[#CBCBCB]/40 sm:px-5"
          >
            <span>Filtro: {{ etiquetaFiltro() }}</span>
            <span>Valor total: {{ valorAgenda() | number: '1.0-0' : 'es-CO' }} COP</span>
            <span>{{ citasFiltradas().length }} de {{ citas.totalCitas() }} citas</span>
          </div>
        </div>

        <p class="mt-5 text-xs text-[#CBCBCB]/40">
          Demostración con datos locales. Confirmar una cita no modifica la base de datos; al
          recargar la página se vuelve al estado inicial.
        </p>
      </div>
    </section>
  `,
})
export class AgendaSectionComponent {
  readonly citas = inject(CitasDemoService);

  readonly filtro = signal<FiltroAgenda>('TODAS');
  readonly busqueda = signal('');
  readonly ultimaConfirmada = signal<string | null>(null);

  readonly filtros: ReadonlyArray<{ valor: FiltroAgenda; etiqueta: string }> = [
    { valor: 'TODAS', etiqueta: 'Todas' },
    { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
    { valor: 'CONFIRMADA', etiqueta: 'Confirmadas' },
    { valor: 'ATENDIDA', etiqueta: 'Atendidas' },
    { valor: 'CANCELADA', etiqueta: 'Canceladas' },
  ];

  readonly citasFiltradas = computed(() => {
    const filtro = this.filtro();
    const termino = this.busqueda().trim().toLowerCase();

    return this.citas.citas().filter((cita) => {
      if (filtro !== 'TODAS' && cita.estado !== filtro) {
        return false;
      }

      if (!termino) {
        return true;
      }

      return [cita.mascota, cita.propietario, cita.servicio].some((valor) =>
        valor.toLowerCase().includes(termino),
      );
    });
  });

  readonly etiquetaFiltro = computed(
    () => this.filtros.find((opcion) => opcion.valor === this.filtro())?.etiqueta ?? 'Todas',
  );

  readonly valorAgenda = computed(() =>
    this.citas.citas().reduce((total, cita) => total + cita.precio, 0),
  );

  confirmarCita(id: number): void {
    const cita = this.citas.citas().find((item) => item.id === id);

    if (!cita || cita.estado !== 'PENDIENTE') {
      return;
    }

    this.citas.confirmarCita(id);
    this.ultimaConfirmada.set(cita.mascota);
  }

  reiniciarAgenda(): void {
    this.citas.reiniciarDemo();
    this.filtro.set('TODAS');
    this.busqueda.set('');
    this.ultimaConfirmada.set(null);
  }
}
