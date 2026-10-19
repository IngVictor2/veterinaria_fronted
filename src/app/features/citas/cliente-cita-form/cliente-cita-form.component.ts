import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { MascotasApiService } from '../../../core/services/mascotas-api.service';
import { ServiciosApiService } from '../../../core/services/servicios-api.service';
import {
  Cita,
  formatHora as formatHoraFn,
  getDuracionServicio,
  getHorarioLaboral,
} from '../../../core/models/cita';
import { Mascota } from '../../../core/models/mascota';
import { Servicio } from '../../../core/models/servicio';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import {
  SearchSelectComponent,
  SearchSelectOption,
} from '../../../shared/components/search-select/search-select.component';
import { CalendarDayPickerComponent } from '../../../shared/components/calendar-day-picker/calendar-day-picker.component';

@Component({
  selector: 'app-cliente-cita-form',
  imports: [FormsModule, SearchSelectComponent, CalendarDayPickerComponent],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Agendar Cita</h1>
          <p class="text-sm text-base-content/60">Selecciona una mascota, servicio y horario</p>
        </div>
      </div>

      @if (loadingData()) {
        <div class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else {
        @if (mascotas().length === 0) {
          <div class="card bg-base-100 shadow-md">
            <div class="card-body text-center py-12">
              <h3 class="text-lg font-medium">No tienes mascotas registradas</h3>
              <p class="text-base-content/50 text-sm mt-1">Registra una mascota para agendar citas</p>
              <button class="btn btn-primary btn-sm mt-3" (click)="router.navigate(['/mis-mascotas'])">Ir a Mis Mascotas</button>
            </div>
          </div>
        } @else {
          @if (error()) {
            <div class="alert alert-error mb-4">
              <span>{{ error() }}</span>
            </div>
          }

          <form (ngSubmit)="handleSubmit()" class="space-y-3">
            <!-- Mascota -->
            <div class="bg-base-100 rounded-xl p-5 space-y-3">
              <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                Mascota
              </h4>
              <div class="form-control">
                <label class="label py-0"><span class="label-text font-medium text-sm">Mascota *</span></label>
                <app-search-select
                  [(value)]="idMascota"
                  [options]="mascotaOptions()"
                  placeholder="Seleccionar mascota..."
                  [required]="true"
                />
                @if (submitted() && !idMascota()) {
                  <label class="label py-0">
                    <span class="label-text-alt text-error text-xs">Debes seleccionar una mascota</span>
                  </label>
                }
              </div>
            </div>

            <!-- Servicio y Empleado -->
            <div class="bg-base-100 rounded-xl p-5 space-y-3">
              <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Servicio
              </h4>
              <div class="form-control">
                <label class="label py-0"><span class="label-text font-medium text-sm">Tipo de servicio *</span></label>
                <select
                  class="select select-bordered select-sm w-full"
                  name="tipoServicio"
                  [ngModel]="tipoServicio()"
                  (ngModelChange)="onTipoServicioChange($event)"
                >
                  <option value="" disabled>Seleccionar tipo</option>
                  <option value="CONSULTA">Consulta</option>
                  <option value="ESTETICA">Estética</option>
                </select>
                @if (submitted() && !tipoServicio()) {
                  <label class="label py-0">
                    <span class="label-text-alt text-error text-xs">Debes seleccionar un tipo de servicio</span>
                  </label>
                }
              </div>
              <div class="form-control">
                <label class="label py-0"><span class="label-text font-medium text-sm">Servicio *</span></label>
                <app-search-select
                  [(value)]="idServicio"
                  [options]="servicioOptions()"
                  [placeholder]="tipoServicio() ? 'Buscar servicio...' : 'Selecciona un tipo primero'"
                  [disabled]="!tipoServicio()"
                  [required]="true"
                />
                @if (submitted() && !idServicio()) {
                  <label class="label py-0">
                    <span class="label-text-alt text-error text-xs">Debes seleccionar un servicio</span>
                  </label>
                }
              </div>
              @if (servicioSeleccionado(); as servicio) {
                <div class="bg-base-200/50 rounded-lg p-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-base-content/60">{{ servicio.nombre }} ({{ tipoServicioLabel() }})</span>
                    <span class="font-bold text-primary">\${{ formatPrecio(servicio.precio) }}</span>
                  </div>
                  <div class="text-xs text-base-content/50 mt-1">
                    Duración: {{ duracionServicio() }} minutos
                  </div>
                </div>
              }
            </div>

            <!-- Fecha y Hora -->
            <div class="bg-base-100 rounded-xl p-5 space-y-3">
              <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Fecha y hora
              </h4>

              <div class="form-control">
                <label class="label py-0"><span class="label-text font-medium text-sm">Fecha *</span></label>
                <div class="rounded-xl p-4 bg-base-50">
                  <app-calendar-day-picker
                    [(value)]="fechaCita"
                    [tipoServicio]="tipoServicio() || undefined"
                    [minDate]="minDate()"
                  />
                </div>
                @if (submitted() && !fechaCita()) {
                  <label class="label py-0">
                    <span class="label-text-alt text-error text-xs">Debes seleccionar una fecha</span>
                  </label>
                }
              </div>

              <div class="form-control">
                <label class="label py-0">
                  <span class="label-text font-medium text-sm">
                    Hora * <span class="font-normal text-base-content/50">(horario: {{ horarioLaboral().inicio }}:00 - {{ horarioLaboral().fin }}:00)</span>
                  </span>
                </label>
                <select
                  class="select select-bordered select-sm w-full"
                  name="horaCita"
                  [disabled]="!fechaCita() || horasDisponibles().length === 0"
                  [ngModel]="horaCita()"
                  (ngModelChange)="horaCita.set($event)"
                >
                  <option value="" disabled>
                    {{ !fechaCita() ? 'Selecciona una fecha primero' : horasDisponibles().length === 0 ? 'No hay horas disponibles' : 'Seleccionar hora' }}
                  </option>
                  @for (hora of horasDisponibles(); track hora) {
                    <option [value]="hora">{{ formatHora(hora) }}</option>
                  }
                </select>
                @if (submitted() && !horaCita()) {
                  <label class="label py-0">
                    <span class="label-text-alt text-error text-xs">Debes seleccionar una hora</span>
                  </label>
                }
              </div>

              @if (horaCita() && servicioSeleccionado()) {
                <p class="text-xs text-base-content/50">
                  La cita finalizará aproximadamente a las {{ horaFinEstimada() }}
                </p>
              }
            </div>

            <!-- Motivo -->
            <div class="bg-base-100 rounded-xl p-5 space-y-3">
              <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Motivo de la consulta
              </h4>
              <div class="form-control">
                <textarea
                  class="textarea textarea-bordered textarea-sm w-full"
                  rows="2"
                  placeholder="Describe el motivo de la visita..."
                  name="motivo"
                  [ngModel]="motivo()"
                  (ngModelChange)="motivo.set($event)"
                ></textarea>
                @if (submitted() && !motivo().trim()) {
                  <label class="label py-0">
                    <span class="label-text-alt text-error text-xs">Debes escribir el motivo de la consulta</span>
                  </label>
                }
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" class="btn btn-ghost" (click)="location.back()">Cancelar</button>
              <button type="submit" class="btn btn-primary gap-2" [disabled]="loading()">
                @if (loading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                }
                Agendar Cita
              </button>
            </div>
          </form>
        }
      }
    </div>
  `,
})
export class ClienteCitaFormComponent implements OnInit {
  readonly router = inject(Router);
  readonly location = inject(Location);
  private readonly citasApi = inject(CitasApiService);
  private readonly mascotasApi = inject(MascotasApiService);
  private readonly serviciosApi = inject(ServiciosApiService);

  protected readonly formatHora = formatHoraFn;

  readonly fechaCita = signal('');
  readonly horaCita = signal('');
  readonly motivo = signal('');
  readonly idMascota = signal(0);
  readonly tipoServicio = signal('');
  readonly idServicio = signal(0);

  readonly mascotas = signal<Mascota[]>([]);
  readonly servicios = signal<Servicio[]>([]);
  readonly loading = signal(false);
  readonly loadingData = signal(true);
  readonly error = signal('');
  readonly citasDelDia = signal<Cita[]>([]);
  readonly submitted = signal(false);

  readonly formValid = computed(
    () =>
      this.idMascota() !== 0 &&
      this.tipoServicio() !== '' &&
      this.idServicio() !== 0 &&
      this.fechaCita() !== '' &&
      this.horaCita() !== '' &&
      this.motivo().trim() !== '',
  );

  readonly mascotaOptions = computed<SearchSelectOption[]>(() =>
    [...this.mascotas()]
      .filter((m) => m.estado === true)
      .sort(
        (a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || '') || b.idMascota - a.idMascota,
      )
      .map((m) => ({
        value: m.idMascota,
        label: m.nombre,
        sublabel: m.nombreCliente,
      })),
  );

  readonly servicioOptions = computed<SearchSelectOption[]>(() =>
    this.servicios()
      .filter((s) => s.estado === true && s.tipoServicio === this.tipoServicio())
      .map((s) => ({
        value: s.idServicio,
        label: s.nombre,
        sublabel: `$${s.precio?.toLocaleString()} - ${s.tipoServicio}`,
      })),
  );

  readonly servicioSeleccionado = computed(() =>
    this.servicios().find((s) => s.idServicio === this.idServicio()),
  );

  readonly duracionServicio = computed(() => {
    const servicio = this.servicioSeleccionado();
    if (!servicio) return 60;
    return getDuracionServicio(servicio.tipoServicio);
  });

  readonly tipoServicioLabel = computed(() => {
    const servicio = this.servicioSeleccionado();
    if (!servicio) return '';
    const labels: Record<string, string> = {
      CONSULTA: 'Consulta',
      ESTETICA: 'Estética',
      OTRO: 'Otro',
    };
    return labels[servicio.tipoServicio] || '';
  });

  readonly horarioLaboral = computed<{ inicio: number; fin: number }>(() => {
    if (!this.fechaCita()) return { inicio: 7, fin: 18 };
    const fecha = new Date(this.fechaCita() + 'T00:00:00');
    return getHorarioLaboral(fecha);
  });

  readonly horasDisponibles = computed(() => {
    const { inicio, fin } = this.horarioLaboral();
    const horas: string[] = [];

    const esHoy = this.fechaCita() === this.minDate();
    const ahora = new Date();
    const minutosAhora = esHoy ? ahora.getHours() * 60 + ahora.getMinutes() : -1;

    for (let h = inicio; h < fin; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slotInicio = h * 60 + m;
        const horaFin = slotInicio + this.duracionServicio();
        if (horaFin > fin * 60) break;

        if (esHoy && slotInicio <= minutosAhora) continue;

        const horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const ocupada = this.citasDelDia().some((c) => {
          if (c.estadoCita === 'CANCELADA' || c.estadoCita === 'ATENDIDA') return false;
          if (c.tipoServicio !== this.tipoServicio()) return false;
          const parts = c.horaCita.split(':');
          const cH = parseInt(parts[0] || '0');
          const cM = parseInt(parts[1] || '0');
          const cInicio = cH * 60 + cM;
          const cFin = cInicio + getDuracionServicio(c.tipoServicio);
          return slotInicio < cFin && horaFin > cInicio;
        });

        if (!ocupada) {
          horas.push(horaStr);
        }
      }
    }

    return horas;
  });

  readonly horaFinEstimada = computed(() => {
    if (!this.horaCita()) return '';
    const parts = this.horaCita().split(':');
    const h = parseInt(parts[0] || '0');
    const m = parseInt(parts[1] || '0');
    const totalMin = h * 60 + m + this.duracionServicio();
    const finH = Math.floor(totalMin / 60);
    const finM = totalMin % 60;
    return formatHoraFn(`${String(finH).padStart(2, '0')}:${String(finM).padStart(2, '0')}`);
  });

  readonly minDate = computed(() => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  constructor() {
    // Equivalente a los watch() de Vue: al cambiar la fecha se limpia la hora y se
    // recargan las citas del día; al cambiar el servicio también se limpia la hora.
    effect(() => {
      const fecha = this.fechaCita();
      this.horaCita.set('');
      if (!fecha) {
        this.citasDelDia.set([]);
        return;
      }
      void this.loadCitasDelDia();
    });

    effect(() => {
      this.idServicio();
      this.horaCita.set('');
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const [mascotas, servicios] = await Promise.all([
        firstValueFrom(this.mascotasApi.getMisMascotas()),
        firstValueFrom(this.serviciosApi.getAll()),
      ]);
      this.mascotas.set(mascotas);
      this.servicios.set(servicios);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al cargar datos'));
    } finally {
      this.loadingData.set(false);
    }
  }

  async loadCitasDelDia(): Promise<void> {
    if (!this.fechaCita()) {
      this.citasDelDia.set([]);
      return;
    }
    try {
      this.citasDelDia.set(await firstValueFrom(this.citasApi.getDisponibilidad(this.fechaCita())));
    } catch {
      this.citasDelDia.set([]);
    }
  }

  onTipoServicioChange(value: string): void {
    this.tipoServicio.set(value);
    this.idServicio.set(0);
    this.horaCita.set('');
  }

  async handleSubmit(): Promise<void> {
    this.submitted.set(true);

    if (!this.formValid()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await firstValueFrom(
        this.citasApi.create({
          idMascota: this.idMascota(),
          idServicio: this.idServicio(),
          fechaCita: this.fechaCita(),
          horaCita: this.horaCita(),
          motivo: this.motivo(),
        }),
      );
      void this.router.navigate(['/mis-citas']);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al agendar la cita'));
    } finally {
      this.loading.set(false);
    }
  }

  formatPrecio(precio: number | null | undefined): string {
    return precio?.toLocaleString() ?? '';
  }
}
