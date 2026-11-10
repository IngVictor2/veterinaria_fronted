import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { Cita, formatHora, getDuracionServicio } from '../../../core/models/cita';

type EstadoDia = 'free' | 'partial' | 'full' | 'past';

@Component({
  selector: 'app-calendar-day-picker',
  template: `
    <div class="calendar-container">
      <!-- Header del calendario -->
      <div class="flex items-center justify-between mb-3">
        <button
          type="button"
          class="btn btn-ghost btn-sm btn-circle"
          aria-label="Mes anterior"
          (click)="prevMonth()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div class="flex items-center">
          <span class="font-bold text-sm"
            >{{ monthNames[currentMonth()] }} {{ currentYear() }}</span
          >
        </div>
        <button
          type="button"
          class="btn btn-ghost btn-sm btn-circle"
          aria-label="Mes siguiente"
          (click)="nextMonth()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- Días de la semana -->
      <div class="grid grid-cols-7 gap-1 mb-1">
        @for (dayName of dayNames; track dayName) {
          <div class="text-center text-xs font-semibold text-base-content/50 py-1">
            {{ dayName }}
          </div>
        }
      </div>

      <!-- Días del mes -->
      <div class="grid grid-cols-7 gap-1 relative">
        @for (day of calendarDays(); track $index) {
          <div class="relative">
            @if (day !== 0) {
              <button
                type="button"
                class="calendar-day w-full aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors duration-300 ease-out motion-reduce:transition-none relative"
                [class]="clasesDia(day)"
                [class.day-selecting]="animatedDay() === day && selectionAnimation() === 'select'"
                [class.day-deselecting]="animatedDay() === day && selectionAnimation() === 'deselect'"
                (animationend)="clearDayAnimation(day)"
                [disabled]="isDisabled(day) && !isSelected(day)"
                [attr.aria-pressed]="isSelected(day)"
                [attr.aria-label]="selectedDateLabel(day)"
                (click)="selectDay(day)"
              >
                <span>{{ day }}</span>
                <!-- Indicador de estado del día -->
                @if (!isDisabled(day)) {
                  <div class="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    @if (getDayStatus(day) === 'free') {
                      <span class="w-1 h-1 rounded-full bg-success"></span>
                    } @else if (getDayStatus(day) === 'partial') {
                      <span class="w-1 h-1 rounded-full bg-warning"></span>
                    } @else if (getDayStatus(day) === 'full') {
                      <span class="w-1 h-1 rounded-full bg-error"></span>
                    }
                  </div>
                }
              </button>
              <!-- Información encima del día seleccionado -->
              @if (isSelected(day)) {
                <div
                  class="absolute bottom-full left-0 z-50 mb-3 w-full pointer-events-none"
                  aria-live="polite"
                >
                  <div
                    class="day-information relative bg-white border border-base-300 rounded-xl shadow-xl p-3"
                    [class]="informationAlignment(day)"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-bold text-sm">
                        {{ selectedDateLabel(day) }}
                      </span>
                      <span
                        class="badge badge-xs"
                        [class]="
                          getDayStatus(day) === 'free'
                            ? 'badge-success'
                            : getDayStatus(day) === 'partial'
                              ? 'badge-warning'
                              : 'badge-error'
                        "
                      >
                        {{
                          getDayStatus(day) === 'free'
                            ? 'Disponible'
                            : getDayStatus(day) === 'partial'
                              ? 'Parcial'
                              : 'Lleno'
                        }}
                      </span>
                    </div>

                    @if (getHorasOcupadas(day).length === 0) {
                      <div class="text-xs text-base-content/50">
                        No hay citas agendadas para este día
                      </div>
                    } @else {
                      <div class="space-y-1 max-h-40 overflow-y-auto">
                        <div class="text-xs font-semibold text-base-content/60 mb-1">
                          Horas ocupadas:
                        </div>
                        @for (hora of getHorasOcupadas(day); track $index) {
                          <div
                            class="text-xs bg-base-200 rounded px-2 py-1 flex items-center gap-1.5"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-3 w-3 text-base-content/40 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>{{ hora }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  <div
                    class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-base-300 rotate-45"
                  ></div>
                </div>
              }
            } @else {
              <div class="w-full aspect-square"></div>
            }
          </div>
        }
      </div>

      <!-- Loading indicator -->
      @if (loadingCitas()) {
        <div class="flex justify-center py-1">
          <span class="loading loading-spinner loading-xs text-primary"></span>
        </div>
      }

      <!-- Leyenda -->
      <div class="flex items-center justify-center gap-4 mt-2 text-xs text-base-content/50">
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-success"></span>
          Disponible
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-warning"></span>
          Parcial
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-error"></span>
          Lleno
        </div>
      </div>
    </div>
  `,
  styles: `
    .calendar-day {
      transition: background-color 300ms ease, color 300ms ease, box-shadow 300ms ease;
    }
    .day-selecting { animation: select-day 300ms ease-out; }
    .day-deselecting { animation: deselect-day 300ms ease-out; }
    @keyframes select-day {
      0% { transform: scale(1); background-color: #4B5563; color: #FFFFFF; }
      45% { transform: scale(0.94); }
      100% { transform: scale(1); background-color: #9D343C; }
    }
    @keyframes deselect-day {
      0% { transform: scale(1); background-color: #9D343C; color: #FFFFFF; }
      45% { transform: scale(0.96); }
      100% { transform: scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      .calendar-day { transition: none; animation: none; }
    }
    .day-information {
      width: min(280px, calc(100vw - 64px));
    }
  `,
})
export class CalendarDayPickerComponent {
  private readonly citasApi = inject(CitasApiService);

  /** Fecha seleccionada en formato yyyy-MM-dd */
  readonly value = model<string>('');
  readonly idEmpleado = input<number | undefined>(undefined);
  readonly tipoServicio = input<string | undefined>(undefined);
  readonly minDate = input<string | undefined>(undefined);

  readonly monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  readonly dayNames = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

  private readonly today = new Date();

  readonly currentMonth = signal(this.today.getMonth());
  readonly currentYear = signal(this.today.getFullYear());
  readonly citasPorDia = signal(new Map<string, Cita[]>());
  readonly loadingCitas = signal(false);
  readonly animatedDay = signal<number | null>(null);
  readonly selectionAnimation = signal<'select' | 'deselect' | null>(null);

  readonly daysInMonth = computed(() =>
    new Date(this.currentYear(), this.currentMonth() + 1, 0).getDate(),
  );

  readonly firstDayOfWeek = computed(() => {
    const day = new Date(this.currentYear(), this.currentMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  });

  readonly calendarDays = computed<number[]>(() => {
    const days: number[] = [];
    for (let i = 0; i < this.firstDayOfWeek(); i++) {
      days.push(0);
    }
    for (let i = 1; i <= this.daysInMonth(); i++) {
      days.push(i);
    }
    return days;
  });

  constructor() {
    // Sincroniza el mes visible cuando cambia la fecha seleccionada desde afuera.
    effect(() => {
      const val = this.value();
      if (val) {
        const d = new Date(val + 'T00:00:00');
        if (
          d.getMonth() !== untracked(this.currentMonth) ||
          d.getFullYear() !== untracked(this.currentYear)
        ) {
          this.currentMonth.set(d.getMonth());
          this.currentYear.set(d.getFullYear());
        }
      }
    });

    // Recarga la disponibilidad cuando cambia el mes/año visible.
    effect(() => {
      const mes = this.currentMonth();
      const anio = this.currentYear();
      void this.loadCitasDelMes(mes, anio);
    });
  }

  formatDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  isSelected(day: number): boolean {
    const val = this.value();
    if (!val) return false;
    const selected = new Date(val + 'T00:00:00');
    return (
      selected.getFullYear() === this.currentYear() &&
      selected.getMonth() === this.currentMonth() &&
      selected.getDate() === day
    );
  }

  isToday(day: number): boolean {
    return (
      this.today.getFullYear() === this.currentYear() &&
      this.today.getMonth() === this.currentMonth() &&
      this.today.getDate() === day
    );
  }

  isPastDay(day: number): boolean {
    const date = new Date(this.currentYear(), this.currentMonth(), day);
    const todayStart = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate(),
    );
    return date < todayStart;
  }

  isBeforeMinDate(day: number): boolean {
    const minDate = this.minDate();
    if (!minDate) return false;
    const min = new Date(minDate + 'T00:00:00');
    const date = new Date(this.currentYear(), this.currentMonth(), day);
    return date < min;
  }

  isDisabled(day: number): boolean {
    if (this.isPastDay(day) || this.isBeforeMinDate(day)) return true;
    return this.getDayStatus(day) === 'full';
  }

  getDayStatus(day: number): EstadoDia {
    if (this.isPastDay(day) || this.isBeforeMinDate(day)) return 'past';
    const key = this.formatDateKey(this.currentYear(), this.currentMonth(), day);
    const citas = this.citasPorDia().get(key);
    if (!citas || citas.length === 0) return 'free';

    const date = new Date(this.currentYear(), this.currentMonth(), day);
    const esDomingo = date.getDay() === 0;
    const maxMinutes = esDomingo ? 6 * 60 : 11 * 60;
    let totalOcupado = 0;

    for (const cita of citas) {
      if (cita.estadoCita === 'CANCELADA' || cita.estadoCita === 'ATENDIDA') continue;
      const idEmpleado = this.idEmpleado();
      if (idEmpleado && cita.idEmpleado !== idEmpleado) continue;
      const tipoServicio = this.tipoServicio();
      if (tipoServicio && cita.tipoServicio !== tipoServicio) continue;
      totalOcupado += getDuracionServicio(cita.tipoServicio);
    }

    const esHoy =
      this.today.getFullYear() === this.currentYear() &&
      this.today.getMonth() === this.currentMonth() &&
      this.today.getDate() === day;
    if (esHoy) {
      const minutosPasados = this.today.getHours() * 60 + this.today.getMinutes();
      const horasRestantes = maxMinutes - Math.max(minutosPasados, 7 * 60);
      if (totalOcupado >= horasRestantes) return 'full';
    } else {
      if (totalOcupado >= maxMinutes) return 'full';
    }

    if (totalOcupado > 0) return 'partial';
    return 'free';
  }

  getCitasDelDia(day: number): Cita[] {
    const key = this.formatDateKey(this.currentYear(), this.currentMonth(), day);
    const todas = this.citasPorDia().get(key) || [];
    return todas.filter((c) => {
      if (c.estadoCita === 'CANCELADA' || c.estadoCita === 'ATENDIDA') return false;
      const idEmpleado = this.idEmpleado();
      if (idEmpleado && c.idEmpleado !== idEmpleado) return false;
      const tipoServicio = this.tipoServicio();
      if (tipoServicio && c.tipoServicio !== tipoServicio) return false;
      return true;
    });
  }

  getHorasOcupadas(day: number): string[] {
    const citas = this.getCitasDelDia(day);
    const esHoy = this.isToday(day);
    const minutosAhora = esHoy ? this.today.getHours() * 60 + this.today.getMinutes() : -1;
    return citas
      .filter((c) => {
        if (!esHoy) return true;
        const parts = c.horaCita.split(':');
        const cH = parseInt(parts[0] || '0');
        const cM = parseInt(parts[1] || '0');
        const cInicio = cH * 60 + cM;
        return cInicio >= minutosAhora;
      })
      .sort((a, b) => a.horaCita.localeCompare(b.horaCita))
      .map((c) => {
        const duracion = getDuracionServicio(c.tipoServicio);
        const inicio = formatHora(c.horaCita);
        const parts = c.horaCita.split(':');
        const h = parseInt(parts[0] || '0');
        const m = parseInt(parts[1] || '0');
        const finMinutes = h * 60 + m + duracion;
        const finH = Math.floor(finMinutes / 60);
        const finM = finMinutes % 60;
        const finStr = `${String(finH).padStart(2, '0')}:${String(finM).padStart(2, '0')}`;
        return `${inicio} - ${formatHora(finStr)}`;
      });
  }

  clasesDia(day: number): string {
    const selected = this.isSelected(day);
    const disabled = this.isDisabled(day);
    if (selected) return 'bg-primary hover:bg-[#4B5563] text-primary-content font-bold shadow-md cursor-pointer';
    if (!disabled) return 'bg-transparent hover:bg-[#4B5563] hover:text-white cursor-pointer text-base-content';
    return 'text-base-content/30 cursor-not-allowed';
  }

  informationAlignment(day: number): string {
    const column = (this.firstDayOfWeek() + day - 1) % 7;
    if (column < 2) return 'left-0';
    if (column > 4) return 'left-full -translate-x-full';
    return 'left-1/2 -translate-x-1/2';
  }

  selectedDateLabel(day: number): string {
    return new Date(this.currentYear(), this.currentMonth(), day).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  selectDay(day: number): void {
    if (this.isSelected(day)) {
      this.animatedDay.set(day);
      this.selectionAnimation.set('deselect');
      this.value.set('');
      return;
    }
    if (this.isDisabled(day)) return;
    this.animatedDay.set(day);
    this.selectionAnimation.set('select');
    const dateStr = this.formatDateKey(this.currentYear(), this.currentMonth(), day);
    this.value.set(dateStr);
  }

  clearDayAnimation(day: number): void {
    if (this.animatedDay() !== day) return;
    this.animatedDay.set(null);
    this.selectionAnimation.set(null);
  }

  prevMonth(): void {
    this.animatedDay.set(null);
    this.selectionAnimation.set(null);
    this.value.set('');
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((m) => m - 1);
    }
  }

  nextMonth(): void {
    this.animatedDay.set(null);
    this.selectionAnimation.set(null);
    this.value.set('');
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((m) => m + 1);
    }
  }

  async loadCitasDelMes(mes: number, anio: number): Promise<void> {
    this.loadingCitas.set(true);
    try {
      const diasEnMes = new Date(anio, mes + 1, 0).getDate();
      const promesas: Promise<void>[] = [];

      for (let dia = 1; dia <= diasEnMes; dia++) {
        const key = this.formatDateKey(anio, mes, dia);
        const date = new Date(anio, mes, dia);
        if (date < new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()))
          continue;

        const promesa = firstValueFrom(this.citasApi.getDisponibilidad(key))
          .then((citas) => {
            this.citasPorDia.update((mapa) => {
              const nuevo = new Map(mapa);
              nuevo.set(key, citas);
              return nuevo;
            });
          })
          .catch(() => {
            this.citasPorDia.update((mapa) => {
              const nuevo = new Map(mapa);
              nuevo.set(key, []);
              return nuevo;
            });
          });
        promesas.push(promesa);
      }

      await Promise.all(promesas);
    } catch {
      // ignore
    } finally {
      this.loadingCitas.set(false);
    }
  }
}
