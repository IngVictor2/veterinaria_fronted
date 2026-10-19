import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { ServiciosApiService } from '../../../core/services/servicios-api.service';
import { EmpleadosApiService } from '../../../core/services/empleados-api.service';
import { HistorialApiService } from '../../../core/services/historial-api.service';
import { FacturasApiService } from '../../../core/services/facturas-api.service';
import { PagosApiService } from '../../../core/services/pagos-api.service';
import { MetodoPago, MetodosPagoApiService } from '../../../core/services/metodos-pago-api.service';
import { FacturaCitaService } from '../../../core/services/factura-cita.service';
import { Cita, mapaNumerosCitasPorCliente } from '../../../core/models/cita';
import { Empleado } from '../../../core/models/empleado';
import { Factura } from '../../../core/models/factura';
import { Servicio } from '../../../core/models/servicio';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  SearchSelectComponent,
  SearchSelectOption,
} from '../../../shared/components/search-select/search-select.component';

interface HistorialDetalle {
  tipoHistorial: string;
  resumen: string;
  fechaRegistro: string;
}

@Component({
  selector: 'app-cita-detail',
  imports: [FormsModule, ConfirmDialogComponent, SearchSelectComponent],
  template: `
    <div class="max-w-5xl mx-auto">
      @if (error()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
          <button class="btn btn-ghost btn-xs" (click)="error.set('')">X</button>
        </div>
      }

      @if (success()) {
        <div class="alert mb-4 bg-[#7a9e7e]/15 border border-[#7a9e7e]/30 text-[#7a9e7e]">
          <span>{{ success() }}</span>
        </div>
      }

      @if (loading()) {
        <div class="flex justify-center py-20">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (cita(); as cita) {
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-xl sm:text-2xl font-extrabold text-[#FFFFE3]">
              Cita #{{ numeroCita() ?? cita.idCita }}
              @if (totalCitasCliente() !== null) {
                <span class="text-sm font-medium text-base-content/40">de {{ totalCitasCliente() }}</span>
              }
            </h1>
            <p class="text-sm text-base-content/50">Detalle de la cita</p>
          </div>
          <div class="flex items-center gap-2">
            @if (canConfirmar && cita.estadoCita === 'PENDIENTE') {
              <button class="btn btn-success btn-sm gap-1" (click)="handleConfirmar()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Confirmar
              </button>
            }
            @if (puedeAtender()) {
              <button
                class="btn btn-success btn-sm gap-1"
                (click)="router.navigate(['/citas', cita.idCita, cita.tipoServicio === 'ESTETICA' ? 'estetica' : 'consulta'])"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Atender
              </button>
            }
            @if (puedeVerHistorial()) {
              <button class="btn btn-primary btn-sm gap-1" (click)="showHistorialModal.set(true)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ver {{ cita.tipoServicio === 'ESTETICA' ? 'estética' : 'consulta' }}
              </button>
            }
            <span class="badge badge-lg" [class]="estadoColor(cita.estadoCita)">{{ cita.estadoCita }}</span>
            @if (canConfirmar && (cita.estadoCita === 'PENDIENTE' || cita.estadoCita === 'CONFIRMADA')) {
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle btn-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                  </svg>
                </div>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-[#2A2A2A] rounded-xl w-52 z-50">
                  <li>
                    <a (click)="router.navigate(['/citas', cita.idCita, 'editar'])" class="text-[#CBCBCB] hover:bg-white/10 hover:text-[#FFFFE3]">
                      Editar
                    </a>
                  </li>
                  <li>
                    <a (click)="showCancelDialog.set(true)" class="text-red-400 hover:bg-red-500/20">Cancelar</a>
                  </li>
                </ul>
              </div>
            }
          </div>
        </div>

        <!-- Info Card -->
        <div class="bg-base-100 rounded-2xl overflow-hidden mb-6">
          <div class="bg-gradient-to-r from-[#0D7377]/20 to-transparent px-6 py-5 flex items-center gap-5">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg">
              <span class="text-primary font-bold text-xl">{{ initials() }}</span>
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-bold text-[#FFFFE3]">{{ cita.nombreMascota }}</h2>
              <p class="text-sm text-base-content/50">{{ cita.nombreServicio }} · {{ cita.tipoServicio }}</p>
            </div>
          </div>
          <div class="px-6 py-5 grid grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Fecha</p>
              <p class="text-sm font-medium">{{ formatFecha(cita.fechaCita) }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Hora</p>
              <p class="text-sm font-medium">{{ formatHora(cita.horaCita) }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Duración</p>
              <p class="text-sm font-medium">{{ cita.duracionMinutos }} min</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Mascota</p>
              <p
                class="text-sm font-medium text-primary cursor-pointer hover:underline"
                (click)="router.navigate(['/mascotas', cita.idMascota])"
              >
                {{ cita.nombreMascota }}
              </p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Cliente</p>
              <p
                class="text-sm font-medium text-primary cursor-pointer hover:underline"
                (click)="router.navigate(['/clientes', cita.idCliente])"
              >
                {{ cita.nombreCliente }}
              </p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Profesional</p>
              <p class="text-sm font-medium">{{ cita.nombreEmpleado || 'Sin asignar' }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Servicio</p>
              <p class="text-sm font-medium">{{ cita.nombreServicio }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Tipo</p>
              <p class="text-sm font-medium">{{ cita.tipoServicio }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Estado</p>
              <span class="badge badge-sm" [class]="estadoColor(cita.estadoCita)">{{ cita.estadoCita }}</span>
            </div>
          </div>
        </div>

        <!-- Detalles adicionales -->
        @if (cita.motivo || cita.observaciones) {
          <div class="bg-base-100 rounded-2xl overflow-hidden">
            <div class="px-6 py-4 border-b border-base-300">
              <h3 class="font-bold text-[#FFFFE3]">Detalles</h3>
            </div>
            <div class="px-6 py-5 space-y-4">
              @if (cita.motivo) {
                <div>
                  <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Motivo</p>
                  <p class="text-sm">{{ cita.motivo }}</p>
                </div>
              }
              @if (cita.observaciones) {
                <div>
                  <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Observaciones</p>
                  <p class="text-sm">{{ cita.observaciones }}</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- Assign Modal -->
        @if (showAssignModal()) {
          <dialog class="modal modal-open">
            <div class="modal-box bg-[#1a1a2e]">
              <h3 class="font-bold text-lg text-[#FFFFE3] mb-4">
                {{ cita.estadoCita === 'PENDIENTE' ? 'Asignar Cita' : 'Reasignar Cita' }}
              </h3>
              <div class="space-y-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">Servicio</span></label>
                  <select
                    class="select select-bordered bg-[#2A2A2A] border-white/10"
                    name="formServicio"
                    [ngModel]="formServicio()"
                    (ngModelChange)="onServicioChange($event)"
                  >
                    <option [ngValue]="null" disabled>Seleccionar servicio</option>
                    @for (s of serviciosActivos(); track s.idServicio) {
                      <option [ngValue]="s.idServicio">{{ s.nombre }} - {{ s.tipoServicio }}</option>
                    }
                  </select>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Fecha</span></label>
                  <input
                    type="date"
                    class="input input-bordered bg-[#2A2A2A] border-white/10"
                    name="formFecha"
                    [ngModel]="formFecha()"
                    (ngModelChange)="formFecha.set($event)"
                  />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Hora</span></label>
                  <input
                    type="time"
                    class="input input-bordered bg-[#2A2A2A] border-white/10"
                    name="formHora"
                    [ngModel]="formHora()"
                    (ngModelChange)="formHora.set($event)"
                  />
                </div>
                <div class="form-control">
                  <label class="label py-0">
                    <span class="label-text font-medium text-sm">{{ etiquetaEmpleado() }} *</span>
                  </label>
                  <app-search-select
                    [(value)]="formEmpleado"
                    [options]="empleadoOptions()"
                    [placeholder]="placeholderEmpleado()"
                    [required]="true"
                  />
                </div>
              </div>
              <div class="modal-action">
                <button class="btn btn-ghost" (click)="showAssignModal.set(false)">Cancelar</button>
                <button
                  class="btn btn-primary"
                  [disabled]="!formServicio() || !formEmpleado() || !formFecha() || !formHora() || submitting()"
                  (click)="handleAssign()"
                >
                  {{ submitting() ? 'Confirmando...' : (cita.idEmpleado ? 'Confirmar' : 'Confirmar y asignar') }}
                </button>
              </div>
            </div>
            <form method="dialog" class="modal-backdrop" (click)="showAssignModal.set(false)">
              <button>close</button>
            </form>
          </dialog>
        }

        <app-confirm-dialog
          [show]="showCancelDialog()"
          title="Cancelar Cita"
          message="¿Estás seguro de cancelar esta cita? Esta acción no se puede deshacer."
          confirmText="Cancelar cita"
          variant="error"
          (confirm)="handleCancel()"
          (cancel)="showCancelDialog.set(false)"
        />

        <!-- Historial / Detalle de la atención -->
        @if (showHistorialModal()) {
          @if (historialCita(); as historialCita) {
            <dialog class="modal modal-open">
              <div class="modal-box bg-[#1a1a2e]">
                <h3 class="font-bold text-lg text-[#FFFFE3] mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {{ historialCita.tipoHistorial === 'MEDICO' ? 'Consulta Médica' : 'Servicio Estético' }} - Cita #{{ numeroCita() ?? cita.idCita }}
                </h3>
                <div class="space-y-4">
                  <div class="bg-base-200/50 rounded-lg p-3 text-sm">
                    <p><span class="font-medium text-base-content/60">Mascota:</span> <span class="text-[#FFFFE3]">{{ cita.nombreMascota }}</span></p>
                    <p><span class="font-medium text-base-content/60">Cliente:</span> <span class="text-[#FFFFE3]">{{ cita.nombreCliente }}</span></p>
                    <p><span class="font-medium text-base-content/60">Profesional:</span> <span class="text-[#FFFFE3]">{{ cita.nombreEmpleado || 'Sin asignar' }}</span></p>
                    <p><span class="font-medium text-base-content/60">Registrado:</span> <span class="text-[#FFFFE3]">{{ formatFechaHora(historialCita.fechaRegistro) }}</span></p>
                  </div>
                  <div>
                    <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Descripción completa</p>
                    <div class="bg-base-200/50 rounded-lg p-4 text-sm whitespace-pre-wrap">{{ historialCita.resumen }}</div>
                  </div>
                </div>
                <div class="modal-action">
                  <button class="btn btn-ghost" (click)="showHistorialModal.set(false)">Cerrar</button>
                </div>
              </div>
              <form method="dialog" class="modal-backdrop" (click)="showHistorialModal.set(false)">
                <button>close</button>
              </form>
            </dialog>
          }
        }

        <!-- Pago de factura -->
        @if (showPagoModal()) {
          @if (facturaCita(); as facturaCita) {
            <dialog class="modal modal-open">
              <div class="modal-box bg-[#1a1a2e]">
                <h3 class="font-bold text-lg text-[#FFFFE3] mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h2m4 0h2m-9-5l2-4m9 4l-2-4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                  </svg>
                  Pagar factura #{{ facturaCita.idFactura }}
                </h3>
                <p class="text-sm text-base-content/60 mb-4">La cita ya fue atendida. Selecciona el método de pago.</p>

                @if (pagoError()) {
                  <div class="alert alert-error mb-4">
                    <span>{{ pagoError() }}</span>
                  </div>
                }

                <div class="bg-base-200/50 rounded-lg p-3 mb-4 flex items-center justify-between">
                  <span class="text-sm text-base-content/60">Total a pagar</span>
                  <span class="text-xl font-extrabold text-warning">\${{ formatCurrency(facturaCita.total) }}</span>
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text">Método de pago *</span></label>
                  <div class="grid grid-cols-1 gap-2">
                    @for (m of metodosPago(); track m.idMetodoPago) {
                      <label
                        class="card bg-[#2A2A2A] border cursor-pointer transition-colors px-4 py-3 flex items-center gap-3"
                        [class]="metodoPagoSeleccionado() === m.idMetodoPago ? 'border-primary shadow-lg shadow-primary/10' : 'border-white/10 hover:border-white/25'"
                      >
                        <input
                          type="radio"
                          name="metodoPagoCaja"
                          class="radio radio-sm radio-primary"
                          [value]="m.idMetodoPago"
                          [ngModel]="metodoPagoSeleccionado()"
                          (ngModelChange)="metodoPagoSeleccionado.set($event)"
                        />
                        <span class="text-sm font-medium text-[#FFFFE3]">{{ m.descripcion || m.nombre }}</span>
                      </label>
                    }
                  </div>
                </div>

                <div class="modal-action">
                  <button class="btn btn-ghost" [disabled]="pagando()" (click)="showPagoModal.set(false)">Cancelar</button>
                  <button
                    class="btn btn-success gap-1"
                    [disabled]="pagando() || !metodoPagoSeleccionado()"
                    (click)="ejecutarPago()"
                  >
                    @if (pagando()) {
                      <span class="loading loading-spinner loading-sm"></span>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                    Pagar
                  </button>
                </div>
              </div>
              <form method="dialog" class="modal-backdrop" (click)="showPagoModal.set(false)">
                <button>close</button>
              </form>
            </dialog>
          }
        }
      }
    </div>
  `,
})
export class CitaDetailComponent implements OnInit {
  readonly router = inject(Router);
  readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly citasApi = inject(CitasApiService);
  private readonly serviciosApi = inject(ServiciosApiService);
  private readonly empleadosApi = inject(EmpleadosApiService);
  private readonly historialApi = inject(HistorialApiService);
  private readonly facturasApi = inject(FacturasApiService);
  private readonly pagosApi = inject(PagosApiService);
  private readonly metodosPagoApi = inject(MetodosPagoApiService);
  private readonly facturaCitaService = inject(FacturaCitaService);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly canConfirmar = this.auth.hasAnyRole('ADMIN', 'RECEPCIONISTA');

  readonly cita = signal<Cita | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly numeroCita = signal<number | null>(null);
  readonly totalCitasCliente = signal<number | null>(null);

  // 3-dot menu actions
  readonly showAssignModal = signal(false);
  readonly showCancelDialog = signal(false);

  // Assign modal data
  readonly servicios = signal<Servicio[]>([]);
  readonly empleados = signal<Empleado[]>([]);
  readonly formServicio = signal<number | null>(null);
  readonly formEmpleado = signal(0);
  readonly formFecha = signal('');
  readonly formHora = signal('');
  readonly submitting = signal(false);

  // Historia clínica / estética (modal de detalle)
  readonly historialCita = signal<HistorialDetalle | null>(null);
  readonly showHistorialModal = signal(false);

  // Factura y pago
  readonly facturaCita = signal<Factura | null>(null);
  readonly showPagoModal = signal(false);
  readonly metodosPago = signal<MetodoPago[]>([]);
  readonly metodoPagoSeleccionado = signal<number | null>(null);
  readonly pagando = signal(false);
  readonly pagoError = signal('');

  readonly initials = computed(() => {
    const cita = this.cita();
    if (!cita) return '?';
    return cita.nombreMascota?.[0]?.toUpperCase() || '?';
  });

  readonly serviciosActivos = computed(() => this.servicios().filter((s) => s.estado === true));

  readonly empleadosFiltrados = computed(() => {
    const activos = this.empleados().filter((e) => e.estado === true);
    const servicio = this.servicios().find((s) => s.idServicio === this.formServicio());
    if (!servicio) {
      return activos.filter((e) => {
        const roles = e.roles || [];
        return roles.some((r) => r === 'VETERINARIO' || r === 'ESTILISTA');
      });
    }
    const rolRequerido = servicio.tipoServicio === 'ESTETICA' ? 'ESTILISTA' : 'VETERINARIO';
    return activos.filter((e) => {
      const roles = e.roles || [];
      return roles.some((r) => r === rolRequerido);
    });
  });

  readonly empleadoOptions = computed<SearchSelectOption[]>(() =>
    this.empleadosFiltrados().map((e) => ({
      value: e.idEmpleado,
      label: `${e.primerNombre} ${e.primerApellido}`,
      sublabel: e.nombreCargo,
    })),
  );

  readonly etiquetaEmpleado = computed(() => {
    const servicio = this.servicios().find((s) => s.idServicio === this.formServicio());
    return servicio?.tipoServicio === 'ESTETICA' ? 'Estilista' : 'Veterinario';
  });

  readonly placeholderEmpleado = computed(() => {
    const servicio = this.servicios().find((s) => s.idServicio === this.formServicio());
    return servicio?.tipoServicio === 'ESTETICA' ? 'Buscar estilista...' : 'Buscar veterinario...';
  });

  readonly puedeAtender = computed(() => {
    const cita = this.cita();
    if (!cita) return false;
    if (this.auth.hasAnyRole('ADMIN')) return cita.estadoCita === 'CONFIRMADA';
    if (this.auth.esProfesional()) {
      return cita.estadoCita === 'CONFIRMADA' && this.auth.idEmpleadoActual() === cita.idEmpleado;
    }
    return false;
  });

  readonly citaAtendida = computed(() => {
    const cita = this.cita();
    return !!cita && cita.estadoCita === 'ATENDIDA';
  });

  readonly puedeVerHistorial = computed(() => !!this.citaAtendida() && !!this.historialCita());

  readonly puedePagar = computed(() => {
    if (!this.citaAtendida()) return false;
    const factura = this.facturaCita();
    if (!factura) return false;
    return factura.estadoFactura === 'PENDIENTE';
  });

  async ngOnInit(): Promise<void> {
    if (this.auth.esProfesional()) {
      await this.auth.cargarEmpleadoActual();
    }
    try {
      const cita = await firstValueFrom(this.citasApi.getById(this.id));
      this.cita.set(cita);
      await this.cargarNumeroCita(cita);
      if (this.canConfirmar) {
        const [serviciosRes, empleadosRes] = await Promise.allSettled([
          firstValueFrom(this.serviciosApi.getAll()),
          firstValueFrom(this.empleadosApi.getAll()),
        ]);
        if (serviciosRes.status === 'fulfilled') this.servicios.set(serviciosRes.value);
        if (empleadosRes.status === 'fulfilled') this.empleados.set(empleadosRes.value);
      }
      await this.cargarHistorialYFactura();
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo cargar la cita'));
    } finally {
      this.loading.set(false);
    }
  }

  async cargarNumeroCita(c: Cita): Promise<void> {
    if (!c.idCliente) return;
    try {
      const citas = (await firstValueFrom(this.citasApi.getByCliente(c.idCliente))) || [];
      const mapa = mapaNumerosCitasPorCliente(citas);
      this.numeroCita.set(mapa[c.idCita] ?? null);
      this.totalCitasCliente.set(citas.length);
    } catch {
      this.numeroCita.set(null);
      this.totalCitasCliente.set(null);
    }
  }

  async cargarHistorialYFactura(): Promise<void> {
    const c = this.cita();
    if (!c) return;
    if (c.estadoCita !== 'ATENDIDA') return;

    try {
      const registros = (await firstValueFrom(this.historialApi.getByMascota(c.idMascota))) || [];
      const registro = registros.find((h) => h.idCita === c.idCita);
      if (registro) {
        this.historialCita.set({
          tipoHistorial: registro.tipoHistorial,
          resumen: registro.resumen,
          fechaRegistro: registro.fechaRegistro,
        });
      }
    } catch {
      // sin historial
    }

    let idFactura = this.facturaCitaService.getFacturaIdDeCita(c.idCita);
    if (!idFactura) {
      const vinc = await this.facturaCitaService.vincularFacturaDeCita(c.idCita);
      if (vinc) {
        idFactura = vinc.idFactura;
        this.facturaCitaService.guardarFacturaIdDeCita(c.idCita, vinc.idFactura);
      }
    }
    if (idFactura) {
      try {
        this.facturaCita.set(await firstValueFrom(this.facturasApi.getById(idFactura)));
      } catch {
        this.facturaCita.set(null);
      }
    }
  }

  async abrirPago(): Promise<void> {
    if (!this.facturaCita()) return;
    this.pagoError.set('');
    this.metodoPagoSeleccionado.set(null);
    try {
      const metodos = (await firstValueFrom(this.metodosPagoApi.getAll())) || [];
      this.metodosPago.set(metodos.filter((m) => m.estado));
      this.showPagoModal.set(true);
    } catch {
      this.pagoError.set('No se pudieron cargar los métodos de pago');
    }
  }

  async ejecutarPago(): Promise<void> {
    const factura = this.facturaCita();
    const metodo = this.metodoPagoSeleccionado();
    if (!factura || !metodo) return;
    this.pagando.set(true);
    this.pagoError.set('');
    try {
      await firstValueFrom(
        this.pagosApi.create({
          idFactura: factura.idFactura,
          idMetodoPago: metodo,
          monto: factura.total,
        }),
      );
      const fac = await firstValueFrom(this.facturasApi.getById(factura.idFactura));
      this.facturaCita.set(fac);
      this.showPagoModal.set(false);
      this.success.set('Pago registrado correctamente');
      setTimeout(() => this.success.set(''), 4000);
    } catch (e: unknown) {
      this.pagoError.set(getApiErrorMessage(e, 'No se pudo registrar el pago'));
    } finally {
      this.pagando.set(false);
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

  formatFecha(fecha: string | null): string {
    if (!fecha) return '—';
    const parts = fecha.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatHora(hora: string): string {
    if (!hora) return '';
    const parts = hora.split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  formatCurrency(valor: number): string {
    return valor?.toLocaleString('es-CO') || '0';
  }

  formatFechaHora(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
  }

  nombreMetodoPago(id: number | null): string {
    const m = this.metodosPago().find((x) => x.idMetodoPago === id);
    return m?.nombre || 'Método de pago';
  }

  // Open assign modal
  openAssignModal(): void {
    const cita = this.cita();
    if (!cita) return;
    this.formServicio.set(cita.idServicio);
    this.formEmpleado.set(cita.idEmpleado || 0);
    this.formFecha.set(cita.fechaCita || '');
    this.formHora.set(cita.horaCita?.substring(0, 5) || '');
    this.showAssignModal.set(true);
  }

  onServicioChange(idServicio: number | null): void {
    this.formServicio.set(idServicio);
    this.formEmpleado.set(0);
  }

  async handleAssign(): Promise<void> {
    const cita = this.cita();
    const idServicio = this.formServicio();
    const idEmpleado = this.formEmpleado();
    if (!idServicio || !idEmpleado || !this.formFecha() || !this.formHora() || !cita) return;
    this.submitting.set(true);
    try {
      await firstValueFrom(
        this.citasApi.confirmar(this.id, {
          idMascota: cita.idMascota,
          idEmpleado,
          idServicio,
          fechaCita: this.formFecha(),
          horaCita: this.formHora(),
          motivo: cita.motivo || '',
          observaciones: cita.observaciones || '',
        }),
      );
      const actualizada = await firstValueFrom(this.citasApi.getById(this.id));
      this.cita.set(actualizada);
      this.showAssignModal.set(false);
      this.success.set('Cita confirmada correctamente');
      setTimeout(() => this.success.set(''), 3000);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo confirmar la cita'));
      this.showAssignModal.set(false);
    } finally {
      this.submitting.set(false);
    }
  }

  async handleCancel(): Promise<void> {
    try {
      await firstValueFrom(this.citasApi.cambiarEstado(this.id, 'CANCELADA'));
      const actualizada = await firstValueFrom(this.citasApi.getById(this.id));
      this.cita.set(actualizada);
      this.showCancelDialog.set(false);
      this.success.set('Cita cancelada');
      setTimeout(() => this.success.set(''), 3000);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo cancelar'));
      this.showCancelDialog.set(false);
    }
  }

  async handleConfirmar(): Promise<void> {
    const cita = this.cita();
    if (!cita) return;
    // Si la cita no tiene profesional asignado, primero hay que asignarlo.
    if (!cita.idEmpleado) {
      this.openAssignModal();
      return;
    }
    try {
      await firstValueFrom(this.citasApi.cambiarEstado(this.id, 'CONFIRMADA'));
      const actualizada = await firstValueFrom(this.citasApi.getById(this.id));
      this.cita.set(actualizada);
      this.success.set('Cita confirmada correctamente');
      setTimeout(() => this.success.set(''), 3000);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo confirmar'));
    }
  }
}
