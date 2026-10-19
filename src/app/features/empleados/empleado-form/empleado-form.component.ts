import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EmpleadosApiService } from '../../../core/services/empleados-api.service';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { CrearEmpleadoRequest } from '../../../core/models/empleado';
import { getApiErrorMessage } from '../../../core/utils/api-error';

interface CargoOpcion {
  idCargo: number;
  nombre: string;
  estado?: boolean;
}

interface EmpleadoPayload {
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
  telefono: string;
  correo: string | null;
  direccion: string | null;
  idCargo: number;
  fechaIngreso: string;
  nombreUsuario?: string;
  password?: string;
}

@Component({
  selector: 'app-empleado-form',
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">{{ isEdit() ? 'Editar Empleado' : 'Nuevo Empleado' }}</h1>
          <p class="text-sm text-base-content/60">{{ isEdit() ? 'Actualiza los datos del empleado' : 'Registra un nuevo empleado en el sistema' }}</p>
        </div>
      </div>

      @if (error()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
        </div>
      }

      <form (ngSubmit)="handleSubmit()" class="space-y-3">
        <!-- Documento -->
        <div class="bg-base-100 rounded-xl p-5 space-y-3">
          <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
            Documento
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Tipo *</span></label>
              <select
                name="tipoDocumento"
                class="select select-bordered select-sm w-full"
                [ngModel]="tipoDocumento()"
                (ngModelChange)="tipoDocumento.set($event)"
              >
                <option value="CC">Cedula de Ciudadania</option>
                <option value="CE">Cedula de Extranjeria</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Numero *</span></label>
              <input
                name="numeroDocumento"
                type="text"
                class="input input-bordered input-sm w-full"
                placeholder="Numero de documento"
                [ngModel]="numeroDocumento()"
                (ngModelChange)="numeroDocumento.set($event)"
              />
              @if (submitted() && !numeroDocumento().trim()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes ingresar el numero de documento</span>
                </label>
              }
            </div>
          </div>
        </div>

        <!-- Datos personales -->
        <div class="bg-base-100 rounded-xl p-5 space-y-3">
          <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Datos personales
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Primer nombre *</span></label>
              <input
                name="primerNombre"
                type="text"
                class="input input-bordered input-sm w-full"
                placeholder="Primer nombre"
                [ngModel]="primerNombre()"
                (ngModelChange)="primerNombre.set($event)"
              />
              @if (submitted() && !primerNombre().trim()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes ingresar el primer nombre</span>
                </label>
              }
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Segundo nombre</span></label>
              <input
                name="segundoNombre"
                type="text"
                class="input input-bordered input-sm w-full"
                placeholder="Segundo nombre"
                [ngModel]="segundoNombre()"
                (ngModelChange)="segundoNombre.set($event)"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Primer apellido *</span></label>
              <input
                name="primerApellido"
                type="text"
                class="input input-bordered input-sm w-full"
                placeholder="Primer apellido"
                [ngModel]="primerApellido()"
                (ngModelChange)="primerApellido.set($event)"
              />
              @if (submitted() && !primerApellido().trim()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes ingresar el primer apellido</span>
                </label>
              }
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Segundo apellido</span></label>
              <input
                name="segundoApellido"
                type="text"
                class="input input-bordered input-sm w-full"
                placeholder="Segundo apellido"
                [ngModel]="segundoApellido()"
                (ngModelChange)="segundoApellido.set($event)"
              />
            </div>
          </div>
        </div>

        <!-- Contacto -->
        <div class="bg-base-100 rounded-xl p-5 space-y-3">
          <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Contacto
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Telefono *</span></label>
              <input
                name="telefono"
                type="tel"
                class="input input-bordered input-sm w-full"
                placeholder="Telefono"
                required
                [ngModel]="telefono()"
                (ngModelChange)="telefono.set($event)"
              />
              @if (submitted() && !telefono().trim()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes ingresar un teléfono</span>
                </label>
              }
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Correo</span></label>
              <input
                name="correo"
                type="email"
                class="input input-bordered input-sm w-full"
                placeholder="Correo electronico"
                [ngModel]="correo()"
                (ngModelChange)="correo.set($event)"
                (blur)="normalizeCorreo()"
              />
              @if (submitted() && !isEdit() && !correo().trim()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes ingresar un correo electronico</span>
                </label>
              }
            </div>
          </div>
          <div class="form-control">
            <label class="label py-0"><span class="label-text font-medium text-sm">Direccion</span></label>
            <input
              name="direccion"
              type="text"
              class="input input-bordered input-sm w-full"
              placeholder="Direccion"
              [ngModel]="direccion()"
              (ngModelChange)="direccion.set($event)"
            />
          </div>
        </div>

        <!-- Cargo e ingreso -->
        <div class="bg-base-100 rounded-xl p-5 space-y-3">
          <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Cargo e ingreso
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Cargo *</span></label>
              <select
                name="idCargo"
                class="select select-bordered select-sm w-full"
                [ngModel]="idCargo()"
                (ngModelChange)="idCargo.set($event)"
              >
                <option [ngValue]="0" disabled>Seleccionar cargo</option>
                @for (c of cargosActivos(); track c.idCargo) {
                  <option [ngValue]="c.idCargo">{{ c.nombre }}</option>
                }
              </select>
              @if (submitted() && !idCargo()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes seleccionar un cargo</span>
                </label>
              }
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Fecha ingreso *</span></label>
              <input
                name="fechaIngreso"
                type="date"
                class="input input-bordered input-sm w-full"
                style="color-scheme: dark"
                [min]="hoy()"
                [ngModel]="fechaIngreso()"
                (ngModelChange)="fechaIngreso.set($event)"
              />
              @if (submitted() && !fechaIngreso()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes ingresar la fecha de ingreso</span>
                </label>
              } @else if (submitted() && fechaIngreso() && fechaIngreso() < hoy()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">La fecha no puede ser pasada</span>
                </label>
              }
            </div>
          </div>
        </div>

        <!-- Credenciales (solo al crear) -->
        @if (!isEdit()) {
          <div class="bg-base-100 rounded-xl p-5 space-y-3">
            <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Credenciales de acceso
            </h4>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Nombre de usuario</span></label>
              <input
                [value]="nombreUsuarioPreview()"
                type="text"
                class="input input-bordered input-sm w-full bg-base-200"
                disabled
                [placeholder]="correo() ? '' : 'Se genera desde el correo de contacto'"
              />
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Contrasena *</span></label>
              <input
                name="password"
                type="password"
                class="input input-bordered input-sm w-full"
                placeholder="Minimo 8 caracteres"
                [ngModel]="password()"
                (ngModelChange)="password.set($event)"
              />
              @if (submitted() && password().length < 8) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">La contrasena debe tener minimo 8 caracteres</span>
                </label>
              }
            </div>
          </div>
        }

        <!-- Acciones -->
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" class="btn btn-ghost" (click)="location.back()">Cancelar</button>
          <button type="submit" class="btn btn-primary gap-2" [disabled]="loading()">
            @if (loading()) {
              <span class="loading loading-spinner loading-sm"></span>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            }
            {{ isEdit() ? 'Actualizar' : 'Crear Empleado' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class EmpleadoFormComponent implements OnInit {
  readonly router = inject(Router);
  readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly empleadosApi = inject(EmpleadosApiService);
  private readonly adminApi = inject(AdminApiService);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly id = Number(this.idParam);
  readonly isEdit = signal(this.idParam !== null && !Number.isNaN(Number(this.idParam)));

  readonly tipoDocumento = signal('CC');
  readonly numeroDocumento = signal('');
  readonly primerNombre = signal('');
  readonly segundoNombre = signal('');
  readonly primerApellido = signal('');
  readonly segundoApellido = signal('');
  readonly telefono = signal('');
  readonly correo = signal('');
  readonly direccion = signal('');
  readonly idCargo = signal(0);
  readonly fechaIngreso = signal('');
  readonly password = signal('');

  readonly cargos = signal<CargoOpcion[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly submitted = signal(false);

  readonly hoy = computed(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  readonly cargosActivos = computed(() => this.cargos().filter((c) => c.estado === true));

  readonly formValid = computed(
    () =>
      this.numeroDocumento().trim() !== '' &&
      this.primerNombre().trim() !== '' &&
      this.primerApellido().trim() !== '' &&
      this.telefono().trim() !== '' &&
      this.idCargo() !== 0 &&
      this.fechaIngreso() !== '',
  );

  readonly credencialesValid = computed(
    () => this.isEdit() || (this.correo().trim() !== '' && this.password().length >= 8),
  );

  readonly nombreUsuarioPreview = computed(() => {
    if (!this.correo()) return '';
    return this.correo().split('@')[0];
  });

  async ngOnInit(): Promise<void> {
    try {
      this.cargos.set((await firstValueFrom(this.adminApi.getCargos())) as CargoOpcion[]);

      if (this.isEdit()) {
        const e = await firstValueFrom(this.empleadosApi.getById(this.id));
        this.tipoDocumento.set(e.tipoDocumento || 'CC');
        this.numeroDocumento.set(e.numeroDocumento || '');
        this.primerNombre.set(e.primerNombre);
        this.segundoNombre.set(e.segundoNombre || '');
        this.primerApellido.set(e.primerApellido);
        this.segundoApellido.set(e.segundoApellido || '');
        this.telefono.set(e.telefono || '');
        this.correo.set(e.correo || '');
        this.direccion.set(e.direccion || '');
        this.idCargo.set(e.idCargo || 0);
        this.fechaIngreso.set(e.fechaIngreso || '');
        this.password.set('');
      }
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo cargar el formulario'));
    }
  }

  normalizeCorreo(): void {
    this.correo.set(this.correo().trim().toLowerCase());
  }

  async handleSubmit(): Promise<void> {
    this.normalizeCorreo();
    this.submitted.set(true);

    if (!this.formValid() || !this.credencialesValid()) {
      return;
    }

    if (this.fechaIngreso() && this.fechaIngreso() < this.hoy()) {
      this.error.set('La fecha de ingreso no puede ser una fecha pasada');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');
    try {
      const payload: EmpleadoPayload = {
        tipoDocumento: this.tipoDocumento(),
        numeroDocumento: this.numeroDocumento(),
        primerNombre: this.primerNombre(),
        segundoNombre: this.segundoNombre() || null,
        primerApellido: this.primerApellido(),
        segundoApellido: this.segundoApellido() || null,
        telefono: this.telefono().trim(),
        correo: this.correo() || null,
        direccion: this.direccion() || null,
        idCargo: this.idCargo(),
        fechaIngreso: this.fechaIngreso(),
      };
      if (this.isEdit()) {
        payload.nombreUsuario = this.nombreUsuarioPreview();
        if (this.password()) {
          payload.password = this.password();
        }
        await firstValueFrom(this.empleadosApi.update(this.id, payload as unknown as Partial<CrearEmpleadoRequest>));
      } else {
        payload.nombreUsuario = this.nombreUsuarioPreview();
        payload.password = this.password();
        await firstValueFrom(this.empleadosApi.create(payload as unknown as CrearEmpleadoRequest));
      }
      this.router.navigate(['/empleados']);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al guardar el empleado'));
    } finally {
      this.loading.set(false);
    }
  }
}
