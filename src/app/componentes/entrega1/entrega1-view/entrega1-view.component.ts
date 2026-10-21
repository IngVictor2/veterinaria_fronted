import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { EstadoCitaDemo } from '../../../modelos/cita-demo';
import { CitasDemoService } from '../../../servicios/citas-demo.service';
import { CitaDemoCardComponent } from '../cita-demo-card/cita-demo-card.component';

type FiltroCitas = 'TODAS' | EstadoCitaDemo;

@Component({
  selector: 'app-entrega1-view',
  imports: [CurrencyPipe, DecimalPipe, CitaDemoCardComponent],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7FE7E9]">
            Resumen de la agenda
          </p>
          <h1 class="mt-2 text-2xl font-extrabold text-[#FFFFE3] sm:text-3xl">
            Agenda de citas veterinarias
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-base-content/60">
            Consulta las citas de la clínica, filtra por estado y confirma las pendientes. Los
            cambios se reflejan de inmediato en la agenda y en los indicadores.
          </p>
        </div>

        <button type="button" class="btn btn-ghost btn-sm self-start sm:self-auto" (click)="reiniciarDemo()">
          Restablecer agenda
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article class="rounded-xl border border-white/10 bg-base-100 p-5">
          <p class="text-[11px] font-medium uppercase tracking-wide text-base-content/50">
            Total de citas
          </p>
          <p class="mt-1 text-3xl font-extrabold text-[#FFFFE3]">{{ citasDemo.totalCitas() }}</p>
          <p class="mt-1 text-xs text-base-content/40">Citas registradas en la agenda</p>
        </article>

        <article class="rounded-xl border border-white/10 bg-base-100 p-5">
          <p class="text-[11px] font-medium uppercase tracking-wide text-base-content/50">
            Citas pendientes
          </p>
          <p class="mt-1 text-3xl font-extrabold text-[#FFFFE3]">
            {{ citasDemo.totalPendientes() }}
          </p>
          <p class="mt-1 text-xs text-base-content/40">Requieren confirmación</p>
        </article>

        <article class="rounded-xl border border-white/10 bg-base-100 p-5">
          <p class="text-[11px] font-medium uppercase tracking-wide text-base-content/50">
            Ingresos confirmados
          </p>
          <p class="mt-1 text-3xl font-extrabold text-[#7FE7E9]">
            {{ citasDemo.ingresosConfirmados() | currency: 'COP' : 'symbol' : '1.0-0' : 'es-CO' }}
          </p>
          <p class="mt-1 text-xs text-base-content/40">Citas confirmadas y atendidas</p>
        </article>
      </div>

      @if (ultimaConfirmada(); as mascota) {
        <div
          class="flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200"
          role="status"
        >
          <span class="text-lg" aria-hidden="true">✓</span>
          <div>
            <p class="font-semibold">Cita de {{ mascota }} confirmada</p>
            <p class="text-emerald-200/70">
              La agenda y los indicadores se actualizaron.
            </p>
          </div>
        </div>
      }

      <div class="overflow-hidden rounded-xl border border-white/10 bg-base-100">
        <div
          class="flex flex-col gap-3 border-b border-white/10 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="flex flex-wrap gap-1.5">
            @for (opcion of filtros; track opcion.valor) {
              <button
                type="button"
                class="btn btn-sm"
                [class.btn-primary]="filtro() === opcion.valor"
                [class.btn-ghost]="filtro() !== opcion.valor"
                (click)="filtro.set(opcion.valor)"
              >
                {{ opcion.etiqueta }}
              </button>
            }
          </div>

          <label class="input input-bordered input-sm flex w-full items-center gap-2 lg:w-80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5Z"
              />
            </svg>
            <input
              type="search"
              class="grow"
              placeholder="Buscar mascota, dueño o servicio"
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)"
            />
          </label>
        </div>

        <div class="space-y-3 p-4 sm:p-5">
          @for (cita of citasFiltradas(); track cita.id) {
            <app-cita-demo-card [cita]="cita" (confirmar)="confirmarCita($event)" />
          } @empty {
            <div class="px-4 py-12 text-center">
              <div
                class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xl"
                aria-hidden="true"
              >
                🐾
              </div>
              <p class="mt-3 font-semibold text-[#FFFFE3]">Sin citas para mostrar</p>

              @switch (filtro()) {
                @case ('PENDIENTE') {
                  <p class="mt-1 text-sm text-base-content/50">
                    No hay citas pendientes: la agenda está al día.
                  </p>
                }
                @case ('CONFIRMADA') {
                  <p class="mt-1 text-sm text-base-content/50">
                    No hay citas confirmadas con este filtro.
                  </p>
                }
                @case ('ATENDIDA') {
                  <p class="mt-1 text-sm text-base-content/50">
                    Todavía no hay citas atendidas.
                  </p>
                }
                @case ('CANCELADA') {
                  <p class="mt-1 text-sm text-base-content/50">
                    No hay citas canceladas en la agenda.
                  </p>
                }
                @default {
                  @if (busqueda()) {
                    <p class="mt-1 text-sm text-base-content/50">
                      No se encontraron coincidencias para “{{ busqueda() }}”.
                    </p>
                  } @else {
                    <p class="mt-1 text-sm text-base-content/50">
                      No hay citas registradas en la agenda.
                    </p>
                  }
                }
              }
            </div>
          }
        </div>

        <div
          class="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-xs text-base-content/40 sm:px-5"
        >
          <span>Filtro: {{ etiquetaFiltro() }}</span>
          <span>Valor total: {{ valorAgenda() | number: '1.0-0' : 'es-CO' }} COP</span>
          <span>{{ citasFiltradas().length }} de {{ citasDemo.totalCitas() }} citas</span>
        </div>
      </div>
    </section>
  `,
})
export class Entrega1ViewComponent {
  readonly citasDemo = inject(CitasDemoService);

  readonly filtro = signal<FiltroCitas>('TODAS');
  readonly busqueda = signal('');
  readonly ultimaConfirmada = signal<string | null>(null);

  readonly filtros: ReadonlyArray<{ valor: FiltroCitas; etiqueta: string }> = [
    { valor: 'TODAS', etiqueta: 'Todas' },
    { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
    { valor: 'CONFIRMADA', etiqueta: 'Confirmadas' },
    { valor: 'ATENDIDA', etiqueta: 'Atendidas' },
    { valor: 'CANCELADA', etiqueta: 'Canceladas' },
  ];

  readonly citasFiltradas = computed(() => {
    const filtro = this.filtro();
    const termino = this.busqueda().trim().toLowerCase();

    return this.citasDemo.citas().filter((cita) => {
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
    this.citasDemo.citas().reduce((total, cita) => total + cita.precio, 0),
  );

  confirmarCita(id: number): void {
    const cita = this.citasDemo.citas().find((item) => item.id === id);

    if (!cita || cita.estado !== 'PENDIENTE') {
      return;
    }

    this.citasDemo.confirmarCita(id);
    this.ultimaConfirmada.set(cita.mascota);
  }

  reiniciarDemo(): void {
    this.citasDemo.reiniciarDemo();
    this.filtro.set('TODAS');
    this.busqueda.set('');
    this.ultimaConfirmada.set(null);
  }
}
