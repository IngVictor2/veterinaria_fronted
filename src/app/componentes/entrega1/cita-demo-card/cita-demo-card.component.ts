import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { CitaDemo } from '../../../modelos/cita-demo';
import { EstadoCitaPipe } from '../../../pipes/estado-cita.pipe';

@Component({
  selector: 'app-cita-demo-card',
  imports: [CurrencyPipe, DatePipe, EstadoCitaPipe],
  template: `
    <article
      class="flex flex-col gap-4 rounded-xl border border-white/10 bg-base-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="flex min-w-0 items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0D7377]/25 text-base font-bold text-[#7FE7E9]"
          aria-hidden="true"
        >
          {{ cita().mascota.charAt(0) }}
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="truncate font-semibold text-[#FFFFE3]">{{ cita().mascota }}</h3>
            <span
              class="badge badge-sm font-medium"
              [class.badge-warning]="cita().estado === 'PENDIENTE'"
              [class.badge-info]="cita().estado === 'CONFIRMADA'"
              [class.badge-success]="cita().estado === 'ATENDIDA'"
              [class.badge-error]="cita().estado === 'CANCELADA'"
            >
              {{ cita().estado | estadoCita }}
            </span>
          </div>

          <p class="mt-0.5 truncate text-sm text-base-content/60">
            {{ cita().especie }} · {{ cita().propietario }}
          </p>

          <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-base-content/50">
            <span>{{ cita().servicio }}</span>
            <span aria-hidden="true">·</span>
            <time [attr.datetime]="cita().fechaHora">
              {{ cita().fechaHora | date: 'EEE d MMM, h:mm a' : undefined : 'es-CO' }}
            </time>
          </p>
        </div>
      </div>

      <div
        class="flex shrink-0 items-center justify-end gap-4 border-t border-white/5 pt-3 lg:border-0 lg:pt-0"
      >
        <span class="font-bold text-[#FFFFE3]">
          {{ cita().precio | currency: 'COP' : 'symbol' : '1.0-0' : 'es-CO' }}
        </span>

        @if (cita().estado === 'PENDIENTE') {
          <button type="button" class="btn btn-primary btn-sm" (click)="confirmar.emit(cita().id)">
            Confirmar
          </button>
        }
      </div>
    </article>
  `,
})
export class CitaDemoCardComponent {
  readonly cita = input.required<CitaDemo>();
  readonly confirmar = output<number>();
}
