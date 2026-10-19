import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { EmpleadosApiService } from '../../../core/services/empleados-api.service';
import { MascotasApiService } from '../../../core/services/mascotas-api.service';
import { ServiciosApiService } from '../../../core/services/servicios-api.service';
import {
  Cita,
  formatHora as formatHoraFn,
  getDuracionServicio,
  getHorarioLaboral,
} from '../../../core/models/cita';
import { Empleado } from '../../../core/models/empleado';
import { Mascota } from '../../../core/models/mascota';
import { Servicio } from '../../../core/models/servicio';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import {
  SearchSelectComponent,
  SearchSelectOption,
} from '../../../shared/components/search-select/search-select.component';
import { CalendarDayPickerComponent } from '../../../shared/components/calendar-day-picker/calendar-day-picker.component';

@Component({
  selector: 'app-cita-form',
  imports: [FormsModule, SearchSelectComponent, CalendarDayPickerComponent],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">{{ isEdit ? 'Editar Cita' : 'Nueva Cita' }}</h1>
          <p class="text-sm text-base-content/60">{{ isEdit ? 'Actualiza los datos de la cita' : 'Agenda una nueva cita para una mascota' }}</p>
        </div>
      </div>

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
              placeholder="Buscar mascota por nombre o dueño..."
              [required]="true"
            />
            @if (submitted() && !idMascota()) {
              <label class="label py-0">
                <span class="label-text-alt text-error text-xs">Debes seleccionar una mascota</span>
              </label>
            }
          </div>
        </div>

        <!-- Empleado y Servicio -->
        <div class="bg-base-100 rounded-xl p-5 space-y-3">
          <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Profesional y servicio
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div class="form-control">
              <label class="label py-0">
                <span class="label-text font-medium text-sm">
                  {{ etiquetaEmpleado() }} *
                </span>
              </label>
              <app-search-select
                [(value)]="idEmpleado"
                [options]="empleadoOptions()"
                [placeholder]="placeholderEmpleado()"
                [required]="true"
              />
              @if (submitted() && !idEmpleado()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes seleccionar un profesional</span>
                </label>
              }
            </div>
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

          <!-- Calendario -->
          <div class="form-control">
            <label class="label py-0"><span class="label-text font-medium text-sm">Fecha *</span></label>
            <div class="rounded-xl p-4 bg-base-50">
              <app-calendar-day-picker
                [(value)]="fechaCita"
                [idEmpleado]="idEmpleado() || undefined"
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

          <!-- Hora -->
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

        <!-- Detalles -->
        <div class="bg-base-100 rounded-xl p-5 space-y-3">
          <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Detalles
          </h4>
          <div class="form-control">
            <label class="label py-0"><span class="label-text font-medium text-sm">Motivo *</span></label>
            <textarea
              class="textarea textarea-bordered textarea-sm w-full"
              rows="2"
              placeholder="Motivo de la consulta..."
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
          <div class="form-control">
            <label class="label py-0"><span class="label-text font-medium text-sm">Observaciones</span></label>
            <textarea
              class="textarea textarea-bordered textarea-sm w-full"
              rows="2"
              placeholder="Notas adicionales..."
              name="observaciones"
              [ngModel]="observaciones()"
              (ngModelChange)="observaciones.set($event)"
            ></textarea>
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
            {{ isEdit ? 'Actualizar' : 'Crear Cita' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CitaFormComponent implements OnInit {
  readonly router = inject(Router);
  readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly citasApi = inject(CitasApiService);
  private readonly mascotasApi = inject(MascotasApiService);
  private readonly empleadosApi = inject(EmpleadosApiService);
  private readonly serviciosApi = inject(ServiciosApiService);

  protected readonly formatHora = formatHoraFn;

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  private readonly citaId = Number(this.idParam);
  readonly isEdit = !!this.idParam && !Number.isNaN(this.citaId);

  readonly fechaCita = signal('');
  readonly horaCita = signal('');
  readonly motivo = signal('');
  readonly observaciones = signal('');
  readonly idMascota = signal(0);
  readonly tipoServicio = signal('');
  readonly idEmpleado = signal(0);
  readonly idServicio = signal(0);

  readonly mascotas = signal<Mascota[]>([]);
  readonly empleados = signal<Empleado[]>([]);
  readonly servicios = signal<Servicio[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly citasDelDia = signal<Cita[]>([]);
  readonly submitted = signal(false);

  /** Equivalente al flag `inicializando` de Vue: evita que los watchers reaccionen al precargar la cita. */
  private inicializando = false;

  readonly puedeVerEmpleados = computed(() =>
    this.auth.hasAnyRole('ADMIN', 'RECEPCIONISTA', 'VETERINARIO', 'ESTILISTA'),
  );

  readonly formValid = computed(
    () =>
      this.idMascota() !== 0 &&
      this.tipoServicio() !== '' &&
      this.idServicio() !== 0 &&
      this.idEmpleado() !== 0 &&
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

  readonly empleadosFiltrados = computed(() => {
    const activos = this.empleados().filter((e) => e.estado === true);
    const servicio = this.servicioSeleccionado();
    if (!servicio) {
      return activos.filter((e) => {
        const roles = e.roles || [];
        return roles.some((r: string) => r === 'VETERINARIO' || r === 'ESTILISTA');
      });
    }

    const tipoServicio = servicio.tipoServicio;
    const rolRequerido = tipoServicio === 'ESTETICA' ? 'ESTILISTA' : 'VETERINARIO';

    return activos.filter((e) => {
      const roles = e.roles || [];
      return roles.some((r: string) => r === rolRequerido);
    });
  });

  readonly empleadoOptions = computed<SearchSelectOption[]>(() =>
    this.empleadosFiltrados().map((e) => ({
      value: e.idEmpleado,
      label: `${e.primerNombre} ${e.primerApellido}`,
      sublabel: e.nombreCargo,
    })),
  );

  readonly etiquetaEmpleado = computed(() =>
    this.servicioSeleccionado()?.tipoServicio === 'ESTETICA' ? 'Estilista' : 'Veterinario',
  );

  readonly placeholderEmpleado = computed(() =>
    this.servicioSeleccionado()?.tipoServicio === 'ESTETICA' ? 'Buscar estilista...' : 'Buscar veterinario...',
  );

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
          if (this.isEdit && c.idCita === this.citaId) return false;
          if (c.tipoServicio !== this.tipoServicio()) return false;
          if (this.idEmpleado() && c.idEmpleado !== this.idEmpleado()) return false;
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
      if (this.inicializando) return;
      this.horaCita.set('');
      if (!fecha) {
        this.citasDelDia.set([]);
        return;
      }
      void this.loadCitasDelDia();
    });

    effect(() => {
      this.idServicio();
      if (this.inicializando) return;
      this.horaCita.set('');
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const mascotasPromise = firstValueFrom(this.mascotasApi.getAll());
      const serviciosPromise = firstValueFrom(this.serviciosApi.getAll());
      const verEmpleados = this.puedeVerEmpleados();
      const empleadosPromise = verEmpleados ? firstValueFrom(this.empleadosApi.getAll()) : Promise.resolve(null);

      const [mascotasRes, serviciosRes, empleadosRes] = await Promise.allSettled([
        mascotasPromise,
        serviciosPromise,
        empleadosPromise,
      ]);
      if (mascotasRes.status === 'fulfilled') this.mascotas.set(mascotasRes.value);
      if (serviciosRes.status === 'fulfilled') this.servicios.set(serviciosRes.value);
      if (verEmpleados && empleadosRes.status === 'fulfilled' && empleadosRes.value) {
        this.empleados.set(empleadosRes.value);
      }

      if (this.isEdit) {
        const cita = await firstValueFrom(this.citasApi.getById(this.citaId));
        this.inicializando = true;
        this.fechaCita.set(cita.fechaCita);
        this.horaCita.set(this.normalizarHora(cita.horaCita));
        this.motivo.set(cita.motivo || '');
        this.observaciones.set(cita.observaciones || '');
        this.idMascota.set(cita.idMascota || 0);
        this.tipoServicio.set(
          this.servicios().find((s) => s.idServicio === cita.idServicio)?.tipoServicio || '',
        );
        this.idEmpleado.set(cita.idEmpleado || 0);
        this.idServicio.set(cita.idServicio || 0);
        await this.loadCitasDelDia();
        this.horaCita.set(this.normalizarHora(cita.horaCita));
        this.inicializando = false;
      }
    } catch (e: unknown) {
      console.error('Error loading form data', e);
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
    if (this.inicializando) return;
    this.idServicio.set(0);
    this.idEmpleado.set(0);
    this.horaCita.set('');
  }

  async handleSubmit(): Promise<void> {
    this.submitted.set(true);

    if (!this.formValid()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const payload = {
      fechaCita: this.fechaCita(),
      horaCita: this.horaCita(),
      motivo: this.motivo(),
      observaciones: this.observaciones(),
      idMascota: this.idMascota(),
      tipoServicio: this.tipoServicio(),
      idEmpleado: this.idEmpleado(),
      idServicio: this.idServicio(),
    };

    try {
      if (this.isEdit) {
        await firstValueFrom(this.citasApi.confirmar(this.citaId, payload));
      } else {
        await firstValueFrom(this.citasApi.create(payload));
      }
      void this.router.navigate(['/citas']);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al guardar la cita'));
    } finally {
      this.loading.set(false);
    }
  }

  formatPrecio(precio: number | null | undefined): string {
    return precio?.toLocaleString() ?? '';
  }

  private normalizarHora(hora: string): string {
    if (!hora) return hora;
    const parts = hora.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return hora;
  }
}
