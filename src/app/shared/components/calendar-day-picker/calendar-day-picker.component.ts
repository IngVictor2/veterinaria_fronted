import { Component, ElementRef, computed, effect, inject, input, model, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { Cita, formatHora, getDuracionServicio } from '../../../core/models/cita';

type EstadoDia = 'free' | 'partial' | 'full' | 'past';

@Component({
  selector: 'app-calendar-day-picker',
  template: `
    <div class="calendar-container relative" #container>
      <!-- Header del calendario -->
      <div class="flex items-center justify-between mb-3">
        <button type="button" class="btn btn-ghost btn-sm btn-circle" (click)="prevMonth()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm">{{ monthNames[currentMonth()] }} {{ currentYear() }}</span>
          <button type="button" class="btn btn-ghost btn-xs" (click)="goToToday()">Hoy</button>
        </div>
        <button type="button" class="btn btn-ghost btn-sm btn-circle" (click)="nextMonth()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
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
                class="w-full aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all duration-150 relative"
                [class]="clasesDia(day)"
                [disabled]="isDisabled(day)"
                (click)="selectDay(day)"
                (mouseenter)="onDayHover($event, day)"
                (mouseleave)="onDayLeave()"
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
            } @else {
              <div class="w-full aspect-square"></div>
            }
          </div>
        }

        <!-- Tooltip de disponibilidad -->
        @if (hoveredDay(); as dia) {
          <div
            class="calendar-tooltip absolute z-50 bg-base-100 border border-base-300 rounded-xl shadow-2xl p-3 min-w-[280px] max-w-[360px] pointer-events-none"
            [style.left.px]="tooltipPosition().x"
            [style.top.px]="tooltipPosition().y"
            style="transform: translate(-50%, -100%);"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-sm">
                {{ tooltipFecha(dia) }}
              </span>
              <span
                class="badge badge-xs"
                [class]="getDayStatus(dia) === 'free' ? 'badge-success' : getDayStatus(dia) === 'partial' ? 'badge-warning' : 'badge-error'"
              >
                {{ getDayStatus(dia) === 'free' ? 'Disponible' : getDayStatus(dia) === 'partial' ? 'Parcial' : 'Lleno' }}
              </span>
            </div>

            @if (getHorasOcupadas(dia).length === 0) {
              <div class="text-xs text-base-content/50">
                No hay citas agendadas para este día
              </div>
            } @else {
              <div class="space-y-1 max-h-40 overflow-y-auto">
                <div class="text-xs font-semibold text-base-content/60 mb-1">Horas ocupadas:</div>
                @for (hora of getHorasOcupadas(dia); track $index) {
                  <div class="text-xs bg-base-200 rounded px-2 py-1 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-base-content/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ hora }}</span>
                  </div>
                }
              </div>
            }

            @if (esHoySeleccionadoEnFeed(dia)) {
              <div class="text-xs text-primary font-semibold mt-2 pt-2 border-t border-base-300">
                Hoy
              </div>
            }

            <!-- Flecha del tooltip -->
            <div class="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-base-100 border-r border-b border-base-300 rotate-45"></div>
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
    .calendar-tooltip {
      animation: tooltipFadeIn 0.15s ease-out;
    }

    @keyframes tooltipFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -100%) translateY(4px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -100%) translateY(0);
      }
    }
  `,
})
export class CalendarDayPickerComponent {
  private readonly citasApi = inject(CitasApiService);
  private readonly container = inject(ElementRef<HTMLElement>);

  /** Fecha seleccionada en formato yyyy-MM-dd */
  readonly value = model<string>('');
  readonly idEmpleado = input<number | undefined>(undefined);
  readonly tipoServicio = input<string | undefined>(undefined);
  readonly minDate = input<string | undefined>(undefined);

  readonly monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  readonly dayNames = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

  private readonly today = new Date();

  readonly currentMonth = signal(this.today.getMonth());
  readonly currentYear = signal(this.today.getFullYear());
  readonly hoveredDay = signal<number | null>(null);
  readonly tooltipPosition = signal({ x: 0, y: 0 });
  readonly citasPorDia = signal(new Map<string, Cita[]>());
  readonly loadingCitas = signal(false);

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
        if (d.getMonth() !== this.currentMonth() || d.getFullYear() !== this.currentYear()) {
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
    const todayStart = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
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
    if (selected) return 'bg-primary text-primary-content font-bold shadow-md';
    if (!disabled) return 'hover:bg-base-200 cursor-pointer text-base-content';
    return 'text-base-content/30 cursor-not-allowed';
  }

  tooltipFecha(day: number): string {
    return new Date(this.currentYear(), this.currentMonth(), day).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  esHoySeleccionadoEnFeed(day: number): boolean {
    return this.isToday(day);
  }

  selectDay(day: number): void {
    if (this.isDisabled(day)) return;
    const dateStr = this.formatDateKey(this.currentYear(), this.currentMonth(), day);
    this.value.set(dateStr);
  }

  prevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((m) => m - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((m) => m + 1);
    }
  }

  goToToday(): void {
    this.currentMonth.set(this.today.getMonth());
    this.currentYear.set(this.today.getFullYear());
  }

  onDayHover(event: MouseEvent, day: number): void {
    if (this.isDisabled(day)) {
      this.hoveredDay.set(null);
      return;
    }
    this.hoveredDay.set(day);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const containerRect = (this.container.nativeElement as HTMLElement).getBoundingClientRect();
    this.tooltipPosition.set({
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top - 8,
    });
  }

  onDayLeave(): void {
    this.hoveredDay.set(null);
  }

  async loadCitasDelMes(mes: number, anio: number): Promise<void> {
    this.loadingCitas.set(true);
    try {
      const diasEnMes = new Date(anio, mes + 1, 0).getDate();
      const promesas: Promise<void>[] = [];

      for (let dia = 1; dia <= diasEnMes; dia++) {
        const key = this.formatDateKey(anio, mes, dia);
        const date = new Date(anio, mes, dia);
        if (date < new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate())) continue;

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
