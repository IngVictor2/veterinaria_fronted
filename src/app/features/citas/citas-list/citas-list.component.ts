import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { EmpleadosApiService } from '../../../core/services/empleados-api.service';
import { ServiciosApiService } from '../../../core/services/servicios-api.service';
import { Cita, formatHora as formatHoraFn, getDuracionServicio, getHorarioLaboral } from '../../../core/models/cita';
import { Empleado } from '../../../core/models/empleado';
import { Servicio } from '../../../core/models/servicio';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { DataTableComponent, DataTableColumn } from '../../../shared/components/data-table/data-table.component';
import {
  ActionsTemplateDirective,
  CellTemplateDirective,
} from '../../../shared/components/data-table/cell-template.directive';
import { PaginationBarComponent } from '../../../shared/components/pagination-bar/pagination-bar.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import {
  SearchSelectComponent,
  SearchSelectOption,
} from '../../../shared/components/search-select/search-select.component';
import { CalendarDayPickerComponent } from '../../../shared/components/calendar-day-picker/calendar-day-picker.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-citas-list',
  imports: [
    FormsModule,
    DataTableComponent,
    CellTemplateDirective,
    ActionsTemplateDirective,
    PaginationBarComponent,
    SearchFilterComponent,
    SearchSelectComponent,
    CalendarDayPickerComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Citas</h1>
        @if (!esEmpleado()) {
          <button class="btn btn-primary" (click)="router.navigate(['/citas/nueva'])">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cita
          </button>
        }
      </div>

      @if (error()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
        </div>
      }

      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex items-center gap-4 mb-4">
            <div class="flex-1">
              <app-search-filter
                [(value)]="search"
                (search)="handleSearch()"
                placeholder="Buscar por mascota, profesional..."
              />
            </div>
            <select
              class="select select-bordered"
              name="filtroEstado"
              [ngModel]="filtroEstado()"
              (ngModelChange)="onFiltroEstadoChange($event)"
            >
              <option value="">Todos los estados</option>
              @for (e of estados; track e) {
                <option [value]="e">{{ e }}</option>
              }
            </select>
          </div>

          <app-data-table
            [columns]="columns"
            [data]="data()"
            [loading]="loading()"
            emptyMessage="No se encontraron citas"
          >
            <ng-template appCell="fechaCita" let-value="value">
              {{ formatFechaCita(value) }}
            </ng-template>
            <ng-template appCell="horaCita" let-value="value">
              {{ formatHora(value) }}
            </ng-template>
            <ng-template appCell="nombreEmpleado" let-value="value">
              {{ value || 'Sin Asignar' }}
            </ng-template>
            <ng-template appCell="estadoCita" let-value="value">
              <span class="badge" [class]="estadoColor(value)">{{ value }}</span>
            </ng-template>
            <ng-template appActions let-item>
              <button class="btn btn-ghost btn-xs text-info" (click)="router.navigate(['/citas', item.idCita])">
                Ver
              </button>
            </ng-template>
          </app-data-table>

          <app-pagination-bar
            [(page)]="page"
            [totalPages]="totalPages()"
            [totalElements]="totalElements()"
            [size]="size()"
          />
        </div>
      </div>

      <app-confirm-dialog
        [show]="showCancelDialog()"
        title="Cancelar cita"
        message="¿Estás seguro de cancelar esta cita?"
        confirmText="Cancelar cita"
        variant="error"
        (confirm)="confirmCancel()"
        (cancel)="showCancelDialog.set(false)"
      />

      @if (showConfirmDialog()) {
        <dialog class="modal modal-open">
          <div class="modal-box max-w-2xl bg-base-100">
            <h3 class="font-bold text-lg mb-4">
              {{ citaAConfirmar()?.estadoCita === 'PENDIENTE' ? 'Asignar cita' : 'Reasignar cita' }}
            </h3>

            @if (citaAConfirmar(); as cita) {
              <div class="space-y-4">
                <div class="bg-base-200/50 rounded-lg p-3 text-sm">
                  <p><span class="font-medium">Mascota:</span> {{ cita.nombreMascota }}</p>
                  <p><span class="font-medium">Cliente:</span> {{ cita.nombreCliente }}</p>
                  @if (cita.motivo) {
                    <p><span class="font-medium">Motivo:</span> {{ cita.motivo }}</p>
                  }
                </div>

                @if (confirmError()) {
                  <div class="alert alert-error">
                    <span>{{ confirmError() }}</span>
                  </div>
                }

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="form-control">
                    <label class="label py-0"><span class="label-text font-medium text-sm">Servicio *</span></label>
                    <app-search-select
                      [(value)]="confirmIdServicio"
                      [options]="servicioOptions()"
                      placeholder="Buscar servicio..."
                      [required]="true"
                    />
                  </div>
                  <div class="form-control">
                    <label class="label py-0">
                      <span class="label-text font-medium text-sm">
                        {{ etiquetaEmpleado() }} *
                      </span>
                    </label>
                    <app-search-select
                      [(value)]="confirmIdEmpleado"
                      [options]="empleadoOptions()"
                      [placeholder]="placeholderEmpleado()"
                      [required]="true"
                    />
                  </div>
                </div>

                @if (servicioSeleccionado(); as servicio) {
                  <div class="bg-base-200/50 rounded-lg p-3 text-sm">
                    <div class="flex items-center justify-between">
                      <span class="text-base-content/60">{{ servicio.nombre }}</span>
                      <span class="font-bold text-primary">\${{ formatPrecio(servicio.precio) }}</span>
                    </div>
                    <div class="text-xs text-base-content/50 mt-1">
                      Duración: {{ duracionServicio() }} minutos
                    </div>
                  </div>
                }

                <div class="form-control">
                  <label class="label py-0"><span class="label-text font-medium text-sm">Fecha *</span></label>
                  <div class="rounded-xl p-4 bg-base-50">
                    <app-calendar-day-picker [(value)]="confirmFechaCita" [minDate]="minDate()" />
                  </div>
                </div>

                <div class="form-control">
                  <label class="label py-0">
                    <span class="label-text font-medium text-sm">
                      Hora *
                      <span class="font-normal text-base-content/50">
                        (horario: {{ horarioLaboral().inicio }}:00 - {{ horarioLaboral().fin }}:00)
                      </span>
                    </span>
                  </label>
                  <select
                    class="select select-bordered select-sm w-full"
                    name="confirmHoraCita"
                    [disabled]="!confirmFechaCita() || horasDisponibles().length === 0"
                    [ngModel]="confirmHoraCita()"
                    (ngModelChange)="confirmHoraCita.set($event)"
                    required
                  >
                    <option value="" disabled>
                      {{
                        !confirmFechaCita()
                          ? 'Selecciona una fecha primero'
                          : horasDisponibles().length === 0
                            ? 'No hay horas disponibles'
                            : 'Seleccionar hora'
                      }}
                    </option>
                    @for (hora of horasDisponibles(); track hora) {
                      <option [value]="hora">{{ formatHora(hora) }}</option>
                    }
                  </select>
                </div>

                <div class="form-control">
                  <label class="label py-0"><span class="label-text font-medium text-sm">Observaciones</span></label>
                  <textarea
                    class="textarea textarea-bordered textarea-sm w-full"
                    rows="2"
                    placeholder="Notas adicionales..."
                    name="confirmObservaciones"
                    [ngModel]="confirmObservaciones()"
                    (ngModelChange)="confirmObservaciones.set($event)"
                  ></textarea>
                </div>
              </div>
            }

            <div class="modal-action">
              <button class="btn btn-ghost" (click)="cerrarConfirmar()">Cancelar</button>
              <button
                class="btn btn-primary"
                [disabled]="
                  confirmLoading() ||
                  !confirmIdEmpleado() ||
                  !confirmIdServicio() ||
                  !confirmFechaCita() ||
                  !confirmHoraCita()
                "
                (click)="ejecutarConfirmar()"
              >
                @if (confirmLoading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                }
                {{ citaAConfirmar()?.estadoCita === 'PENDIENTE' ? 'Confirmar y asignar' : 'Reconfirmar' }}
              </button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop" (click)="cerrarConfirmar()">
            <button>close</button>
          </form>
        </dialog>
      }
    </div>
  `,
})
export class CitasListComponent implements OnInit {
  readonly router = inject(Router);
  readonly auth = inject(AuthService);
  private readonly citasApi = inject(CitasApiService);
  private readonly empleadosApi = inject(EmpleadosApiService);
  private readonly serviciosApi = inject(ServiciosApiService);

  protected readonly formatHora = formatHoraFn;

  readonly allData = signal<Cita[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(0);
  readonly size = signal(10);
  readonly search = signal('');
  readonly filtroEstado = signal('');
  readonly showCancelDialog = signal(false);
  readonly selectedCita = signal<Cita | null>(null);

  readonly empleados = signal<Empleado[]>([]);
  readonly servicios = signal<Servicio[]>([]);

  readonly showConfirmDialog = signal(false);
  readonly citaAConfirmar = signal<Cita | null>(null);
  readonly confirmIdServicio = signal(0);
  readonly confirmIdEmpleado = signal(0);
  readonly confirmFechaCita = signal('');
  readonly confirmHoraCita = signal('');
  readonly confirmMotivo = signal('');
  readonly confirmObservaciones = signal('');
  readonly confirmLoading = signal(false);
  readonly confirmError = signal('');
  readonly citasDelDia = signal<Cita[]>([]);

  readonly estados = ['PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'];

  readonly columns: DataTableColumn[] = [
    { key: 'fechaCita', label: 'Fecha', sortable: true },
    { key: 'horaCita', label: 'Hora' },
    { key: 'nombreMascota', label: 'Mascota' },
    { key: 'nombreEmpleado', label: 'Profesional' },
    { key: 'nombreServicio', label: 'Servicio' },
    { key: 'estadoCita', label: 'Estado', sortable: true },
  ];

  readonly esEmpleado = computed(() => this.auth.hasAnyRole('VETERINARIO', 'ESTILISTA'));
  readonly puedeVerEmpleados = computed(() =>
    this.auth.hasAnyRole('ADMIN', 'RECEPCIONISTA', 'VETERINARIO', 'ESTILISTA'),
  );

  readonly filteredData = computed(() => {
    let result = this.allData();
    if (this.filtroEstado()) {
      result = result.filter((c) => c.estadoCita === this.filtroEstado());
    }
    const search = this.search();
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.nombreMascota?.toLowerCase().includes(q) ||
          c.nombreEmpleado?.toLowerCase().includes(q) ||
          c.nombreServicio?.toLowerCase().includes(q),
      );
    }
    const orden: Record<string, number> = { PENDIENTE: 0, CONFIRMADA: 1, ATENDIDA: 2, CANCELADA: 3 };
    return [...result].sort((a, b) => {
      const estadoDiff = (orden[a.estadoCita] ?? 4) - (orden[b.estadoCita] ?? 4);
      if (estadoDiff !== 0) return estadoDiff;
      const dateDiff = b.fechaCita.localeCompare(a.fechaCita) || b.horaCita.localeCompare(a.horaCita);
      if (dateDiff !== 0) return dateDiff;
      return b.idCita - a.idCita;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredData().length / this.size())));
  readonly totalElements = computed(() => this.filteredData().length);
  readonly data = computed(() => {
    const start = this.page() * this.size();
    return this.filteredData().slice(start, start + this.size());
  });

  readonly servicioSeleccionado = computed(() =>
    this.servicios().find((s) => s.idServicio === this.confirmIdServicio()),
  );

  readonly duracionServicio = computed(() => {
    const servicio = this.servicioSeleccionado();
    if (!servicio) return 60;
    return getDuracionServicio(servicio.tipoServicio);
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

  readonly servicioOptions = computed<SearchSelectOption[]>(() =>
    this.servicios()
      .filter((s) => s.estado === true)
      .map((s) => ({
        value: s.idServicio,
        label: s.nombre,
        sublabel: `$${s.precio?.toLocaleString()} - ${s.tipoServicio}`,
      })),
  );

  readonly etiquetaEmpleado = computed(() =>
    this.servicioSeleccionado()?.tipoServicio === 'ESTETICA' ? 'Estilista' : 'Veterinario',
  );

  readonly placeholderEmpleado = computed(() =>
    this.servicioSeleccionado()?.tipoServicio === 'ESTETICA' ? 'Buscar estilista...' : 'Buscar veterinario...',
  );

  readonly horarioLaboral = computed<{ inicio: number; fin: number }>(() => {
    if (!this.confirmFechaCita()) return { inicio: 7, fin: 18 };
    const fecha = new Date(this.confirmFechaCita() + 'T00:00:00');
    return getHorarioLaboral(fecha);
  });

  readonly horasDisponibles = computed(() => {
    const { inicio, fin } = this.horarioLaboral();
    const horas: string[] = [];

    const esHoy = this.confirmFechaCita() === this.minDate();
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
          if (this.confirmIdEmpleado() && c.idEmpleado !== this.confirmIdEmpleado()) return false;
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

  readonly minDate = computed(() => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  constructor() {
    // Equivalente a los watch() de Vue sobre confirmForm: al cambiar la fecha se
    // limpia la hora y se recargan las citas del día; al cambiar el servicio o el
    // profesional seleccionado también se limpia la hora escogida.
    effect(() => {
      const fecha = this.confirmFechaCita();
      this.confirmHoraCita.set('');
      if (fecha) {
        void this.loadCitasDelDiaConfirm(fecha);
      }
    });

    effect(() => {
      this.confirmIdServicio();
      this.confirmHoraCita.set('');
    });

    effect(() => {
      this.confirmIdEmpleado();
      this.confirmHoraCita.set('');
    });
  }

  async ngOnInit(): Promise<void> {
    const load = this.loadData();
    void this.loadEmpleadosYServicios();
    await load;
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      if (this.auth.esProfesional()) {
        await this.auth.cargarEmpleadoActual();
        const idEmpleado = this.auth.idEmpleadoActual();
        if (idEmpleado) {
          this.allData.set(await firstValueFrom(this.citasApi.getByEmpleado(idEmpleado)));
        } else {
          this.allData.set([]);
        }
      } else {
        this.allData.set(await firstValueFrom(this.citasApi.getAll()));
      }
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudieron cargar las citas'));
    } finally {
      this.loading.set(false);
    }
  }

  async loadEmpleadosYServicios(): Promise<void> {
    try {
      const empleadosPromise = this.puedeVerEmpleados()
        ? firstValueFrom(this.empleadosApi.getAll())
        : Promise.resolve(null);
      const serviciosPromise = firstValueFrom(this.serviciosApi.getAll());
      const [empleadosRes, serviciosRes] = await Promise.allSettled([empleadosPromise, serviciosPromise]);
      if (empleadosRes.status === 'fulfilled' && empleadosRes.value) {
        this.empleados.set(empleadosRes.value);
      }
      if (serviciosRes.status === 'fulfilled') {
        this.servicios.set(serviciosRes.value);
      }
    } catch {
      // ignore
    }
  }

  abrirConfirmar(cita: Cita): void {
    this.citaAConfirmar.set(cita);
    this.confirmIdServicio.set(cita.idServicio);
    this.confirmIdEmpleado.set(cita.idEmpleado || 0);
    this.confirmFechaCita.set(cita.fechaCita);
    this.confirmHoraCita.set(cita.horaCita);
    this.confirmMotivo.set(cita.motivo || '');
    this.confirmObservaciones.set(cita.observaciones || '');
    this.confirmError.set('');
    this.showConfirmDialog.set(true);
    void this.loadCitasDelDiaConfirm(cita.fechaCita);
  }

  async loadCitasDelDiaConfirm(fecha: string): Promise<void> {
    if (!fecha) {
      this.citasDelDia.set([]);
      return;
    }
    try {
      this.citasDelDia.set(await firstValueFrom(this.citasApi.getDisponibilidad(fecha)));
    } catch {
      this.citasDelDia.set([]);
    }
  }

  async ejecutarConfirmar(): Promise<void> {
    const cita = this.citaAConfirmar();
    if (!cita) return;
    if (!this.confirmIdEmpleado() || !this.confirmIdServicio() || !this.confirmFechaCita() || !this.confirmHoraCita()) {
      this.confirmError.set('Completa todos los campos obligatorios');
      return;
    }

    this.confirmLoading.set(true);
    this.confirmError.set('');

    try {
      await firstValueFrom(
        this.citasApi.confirmar(cita.idCita, {
          idMascota: cita.idMascota,
          idEmpleado: this.confirmIdEmpleado(),
          idServicio: this.confirmIdServicio(),
          fechaCita: this.confirmFechaCita(),
          horaCita: this.confirmHoraCita(),
          motivo: this.confirmMotivo(),
          observaciones: this.confirmObservaciones(),
        }),
      );
      this.showConfirmDialog.set(false);
      this.citaAConfirmar.set(null);
      void this.loadData();
    } catch (e: unknown) {
      this.confirmError.set(getApiErrorMessage(e, 'Error al confirmar la cita'));
    } finally {
      this.confirmLoading.set(false);
    }
  }

  cerrarConfirmar(): void {
    this.showConfirmDialog.set(false);
    this.citaAConfirmar.set(null);
    this.confirmError.set('');
  }

  async cambiarEstado(cita: Cita, nuevoEstado: string): Promise<void> {
    try {
      if (nuevoEstado === 'CANCELADA') {
        this.selectedCita.set(cita);
        this.showCancelDialog.set(true);
        return;
      }
      if (nuevoEstado === 'ATENDIDA') {
        if (cita.tipoServicio === 'CONSULTA') {
          this.router.navigate(['/citas', cita.idCita, 'consulta']);
        } else if (cita.tipoServicio === 'ESTETICA') {
          this.router.navigate(['/citas', cita.idCita, 'estetica']);
        } else {
          await firstValueFrom(this.citasApi.cambiarEstado(cita.idCita, nuevoEstado));
          void this.loadData();
        }
        return;
      }
      await firstValueFrom(this.citasApi.cambiarEstado(cita.idCita, nuevoEstado));
      void this.loadData();
    } catch (e: unknown) {
      console.error('Error changing estado', e);
    }
  }

  async confirmCancel(): Promise<void> {
    const cita = this.selectedCita();
    if (!cita) return;
    try {
      await firstValueFrom(this.citasApi.cancelar(cita.idCita));
      this.showCancelDialog.set(false);
      void this.loadData();
    } catch (e: unknown) {
      console.error('Error canceling cita', e);
    }
  }

  estadoColor(estado: string): string {
    const colors: Record<string, string> = {
      PENDIENTE: 'badge-warning',
      CONFIRMADA: 'badge-info',
      ATENDIDA: 'badge-success',
      CANCELADA: 'badge-error',
    };
    return colors[estado] || 'badge-ghost';
  }

  formatFechaCita(fecha: string): string {
    const parts = fecha.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    return new Date(y, m - 1, d).toLocaleDateString('es-CO');
  }

  formatPrecio(precio: number | null | undefined): string {
    return precio?.toLocaleString() ?? '';
  }

  handleSearch(): void {
    this.page.set(0);
  }

  onFiltroEstadoChange(value: string): void {
    this.filtroEstado.set(value);
    this.page.set(0);
  }
}
