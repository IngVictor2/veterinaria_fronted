import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { ClientesApiService, ClienteProfileData } from '../../../core/services/clientes-api.service';
import { EmpleadosApiService } from '../../../core/services/empleados-api.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { Cliente } from '../../../core/models/cliente';
import { Empleado } from '../../../core/models/empleado';

@Component({
  selector: 'app-mi-perfil',
  imports: [FormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Mi Perfil</h1>
      </div>

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
        <div class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else {
        <div class="space-y-6">
          <!-- Card principal con avatar y nombre -->
          <div class="card bg-base-100 shadow-md">
            <div class="card-body">
              <div class="flex flex-col md:flex-row items-center gap-6">
                <div class="avatar placeholder">
                  <div class="bg-gradient-to-br from-[#0D7377] to-[#4A4A4A] text-[#FFFFE3] rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                    <span class="text-3xl font-bold">{{ initials() }}</span>
                  </div>
                </div>
                <div class="text-center md:text-left flex-1">
                  <h2 class="text-2xl font-bold">{{ nombreCompleto() }}</h2>
                  <p class="text-base-content/60 mt-1">{{ auth.nombreUsuario() }}</p>
                  <div class="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    @for (rol of auth.roles(); track rol) {
                      <span class="badge badge-primary">{{ rol }}</span>
                    }
                  </div>
                </div>
                @if (isCliente()) {
                  <div class="flex flex-col gap-2">
                    <button class="btn btn-primary btn-sm gap-2" (click)="openEditModal()">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar Perfil
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Datos personales (clientes y empleados) -->
          @if (perfil(); as p) {
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title text-lg mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Datos Personales
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <div>
                      <span class="text-sm text-base-content/50">Nombre completo</span>
                      <p class="font-medium text-lg">{{ nombreCompleto() }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-base-content/50">Documento</span>
                      <p class="font-medium text-lg">{{ p.tipoDocumento }} {{ p.numeroDocumento }}</p>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div>
                      <span class="text-sm text-base-content/50">Fecha de registro</span>
                      <p class="font-medium text-lg">{{ fechaRegistro() }}</p>
                    </div>
                    <div>
                      <span class="text-sm text-base-content/50">Estado</span>
                      <p class="font-medium text-lg">
                        <span class="badge" [class]="p.estado ? 'badge-success' : 'badge-error'">
                          {{ p.estado ? 'Activo' : 'Inactivo' }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Datos de contacto (clientes y empleados) -->
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <h3 class="card-title text-lg mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Datos de Contacto
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span class="text-sm text-base-content/50">Correo electrónico</span>
                    <p class="font-medium text-lg flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {{ p.correo || 'No registrado' }}
                    </p>
                  </div>
                  <div>
                    <span class="text-sm text-base-content/50">Teléfono</span>
                    <p class="font-medium text-lg flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {{ p.telefono || 'No registrado' }}
                    </p>
                  </div>
                  <div class="md:col-span-2">
                    <span class="text-sm text-base-content/50">Dirección</span>
                    <p class="font-medium text-lg flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ p.direccion || 'No registrada' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Datos de cuenta (todos los roles) -->
          <div class="card bg-base-100 shadow-md">
            <div class="card-body">
              <h3 class="card-title text-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Datos de Cuenta
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span class="text-sm text-base-content/50">Nombre de usuario</span>
                  <p class="font-medium text-lg">{{ auth.nombreUsuario() || 'No disponible' }}</p>
                </div>
                <div>
                  <span class="text-sm text-base-content/50">Correo electrónico</span>
                  <p class="font-medium text-lg">{{ cliente()?.correo || auth.usuario()?.correo || 'No disponible' }}</p>
                </div>
                <div>
                  <span class="text-sm text-base-content/50">Roles</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    @for (rol of auth.roles(); track rol) {
                      <span class="badge badge-primary">{{ rol }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal Editar Perfil -->
      @if (showEditModal()) {
        <dialog class="modal modal-open">
          <div class="modal-box max-w-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-xl">Editar Perfil</h3>
              <button class="btn btn-ghost btn-sm btn-circle" (click)="showEditModal.set(false)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            @if (modalError()) {
              <div class="alert alert-error mb-4">
                <span>{{ modalError() }}</span>
                <button type="button" class="btn btn-ghost btn-xs" (click)="modalError.set('')">X</button>
              </div>
            }

            <form (ngSubmit)="handleSaveProfile()" class="space-y-4">
              @if (perfil()) {
                @if (!isCliente()) {
                  <p class="text-xs text-base-content/50 bg-base-200/40 rounded-lg p-3 mb-2">
                    Estos datos los gestiona la veterinaria. Contacta a un administrador para modificarlos.
                  </p>
                }
                <div class="bg-base-200/50 rounded-lg p-4 space-y-3">
                  <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide">Datos personales</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="form-control">
                      <label class="label py-0"><span class="label-text font-medium text-sm">Primer nombre *</span></label>
                      <input name="editPrimerNombre" type="text" class="input input-bordered input-sm w-full" required [disabled]="!isCliente()" [ngModel]="editPrimerNombre()" (ngModelChange)="editPrimerNombre.set($event)" />
                    </div>
                    <div class="form-control">
                      <label class="label py-0"><span class="label-text font-medium text-sm">Segundo nombre</span></label>
                      <input name="editSegundoNombre" type="text" class="input input-bordered input-sm w-full" [disabled]="!isCliente()" [ngModel]="editSegundoNombre()" (ngModelChange)="editSegundoNombre.set($event)" />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="form-control">
                      <label class="label py-0"><span class="label-text font-medium text-sm">Primer apellido *</span></label>
                      <input name="editPrimerApellido" type="text" class="input input-bordered input-sm w-full" required [disabled]="!isCliente()" [ngModel]="editPrimerApellido()" (ngModelChange)="editPrimerApellido.set($event)" />
                    </div>
                    <div class="form-control">
                      <label class="label py-0"><span class="label-text font-medium text-sm">Segundo apellido</span></label>
                      <input name="editSegundoApellido" type="text" class="input input-bordered input-sm w-full" [disabled]="!isCliente()" [ngModel]="editSegundoApellido()" (ngModelChange)="editSegundoApellido.set($event)" />
                    </div>
                  </div>
                </div>

                <div class="bg-base-200/50 rounded-lg p-4 space-y-3">
                  <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide">Contacto</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="form-control">
                      <label class="label py-0"><span class="label-text font-medium text-sm">Correo</span></label>
                      <input name="editCorreo" type="email" class="input input-bordered input-sm w-full" [disabled]="!isCliente()" [ngModel]="editCorreo()" (ngModelChange)="editCorreo.set($event)" />
                    </div>
                    <div class="form-control">
                      <label class="label py-0"><span class="label-text font-medium text-sm">Teléfono *</span></label>
                      <input name="editTelefono" type="tel" class="input input-bordered input-sm w-full" required [disabled]="!isCliente()" [ngModel]="editTelefono()" (ngModelChange)="editTelefono.set($event)" />
                    </div>
                  </div>
                  <div class="form-control">
                    <label class="label py-0"><span class="label-text font-medium text-sm">Dirección</span></label>
                    <input name="editDireccion" type="text" class="input input-bordered input-sm w-full" [disabled]="!isCliente()" [ngModel]="editDireccion()" (ngModelChange)="editDireccion.set($event)" />
                  </div>
                </div>
              }

              <!-- Nueva contraseña (para todos los roles) -->
              <div class="bg-base-200/50 rounded-lg p-4 space-y-3">
                <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Cambiar Contraseña
                </h4>
                <div class="form-control">
                  <label class="label py-0"><span class="label-text font-medium text-sm">Contraseña actual</span></label>
                  <input
                    name="passwordActual"
                    [type]="mostrarPasswords() ? 'text' : 'password'"
                    class="input input-bordered input-sm w-full"
                    placeholder="Tu contraseña actual"
                    autocomplete="current-password"
                    [ngModel]="passwordActual()"
                    (ngModelChange)="passwordActual.set($event)"
                  />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="form-control">
                    <label class="label py-0"><span class="label-text font-medium text-sm">Nueva contraseña</span></label>
                    <input
                      name="nuevaPassword"
                      [type]="mostrarPasswords() ? 'text' : 'password'"
                      class="input input-bordered input-sm w-full"
                      placeholder="Mínimo 8 caracteres"
                      minlength="8"
                      autocomplete="new-password"
                      [ngModel]="nuevaPassword()"
                      (ngModelChange)="nuevaPassword.set($event)"
                    />
                  </div>
                  <div class="form-control">
                    <label class="label py-0"><span class="label-text font-medium text-sm">Confirmar nueva contraseña</span></label>
                    <input
                      name="confirmPassword"
                      [type]="mostrarPasswords() ? 'text' : 'password'"
                      class="input input-bordered input-sm w-full"
                      placeholder="Repite la contraseña"
                      autocomplete="new-password"
                      [ngModel]="confirmPassword()"
                      (ngModelChange)="confirmPassword.set($event)"
                    />
                    @if (confirmPassword() && nuevaPassword() !== confirmPassword()) {
                      <label class="label">
                        <span class="label-text-alt text-red-400 text-xs">Las contraseñas no coinciden</span>
                      </label>
                    }
                  </div>
                </div>
                <label class="label cursor-pointer justify-start gap-2 py-1">
                  <input type="checkbox" name="mostrarPasswords" class="checkbox checkbox-sm checkbox-primary" [ngModel]="mostrarPasswords()" (ngModelChange)="mostrarPasswords.set($event)" />
                  <span class="label-text text-xs text-base-content/50">Mostrar contraseñas</span>
                </label>
              </div>

              <div class="modal-action">
                <button type="button" class="btn btn-ghost" (click)="showEditModal.set(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary gap-2" [disabled]="saving()">
                  @if (saving()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" class="modal-backdrop" (click)="showEditModal.set(false)">
            <button>close</button>
          </form>
        </dialog>
      }
    </div>
  `,
})
export class MiPerfilComponent implements OnInit {
  readonly location = inject(Location);
  readonly auth = inject(AuthService);
  private readonly authApi = inject(AuthApiService);
  private readonly clientesApi = inject(ClientesApiService);
  private readonly empleadosApi = inject(EmpleadosApiService);

  readonly cliente = signal<Cliente | null>(null);
  readonly empleado = signal<Empleado | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly saving = signal(false);
  readonly modalError = signal('');
  readonly showEditModal = signal(false);

  readonly editPrimerNombre = signal('');
  readonly editSegundoNombre = signal('');
  readonly editPrimerApellido = signal('');
  readonly editSegundoApellido = signal('');
  readonly editTelefono = signal('');
  readonly editCorreo = signal('');
  readonly editDireccion = signal('');

  readonly passwordActual = signal('');
  readonly nuevaPassword = signal('');
  readonly confirmPassword = signal('');
  readonly mostrarPasswords = signal(false);

  readonly isCliente = computed(() => this.auth.hasRole('CLIENTE'));

  readonly perfil = computed(() => this.cliente() || this.empleado());

  readonly nombreCompleto = computed(() => {
    const p = this.perfil();
    if (p) {
      return [p.primerNombre, p.segundoNombre, p.primerApellido, p.segundoApellido].filter(Boolean).join(' ');
    }
    return this.auth.nombreCompleto() || this.auth.nombreUsuario();
  });

  readonly fechaRegistro = computed(() => {
    const p = this.perfil();
    if (!p) return '';
    const fecha = 'fechaIngreso' in p ? p.fechaIngreso : (p.createdAt ?? '');
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  });

  readonly initials = computed(() => {
    const name = this.nombreCompleto();
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  });

  async ngOnInit(): Promise<void> {
    try {
      if (this.isCliente()) {
        this.cliente.set(await firstValueFrom(this.clientesApi.getProfile()));
      } else {
        const correo = this.auth.usuario()?.correo;
        if (correo) {
          const lista = (await firstValueFrom(this.empleadosApi.getAll())) ?? [];
          this.empleado.set(lista.find((e) => e.correo?.toLowerCase() === correo.toLowerCase()) || null);
        }
      }
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo cargar el perfil'));
    } finally {
      this.loading.set(false);
    }
  }

  openEditModal(): void {
    this.modalError.set('');
    const p = this.perfil();
    if (p) {
      this.editPrimerNombre.set(p.primerNombre);
      this.editSegundoNombre.set(p.segundoNombre || '');
      this.editPrimerApellido.set(p.primerApellido);
      this.editSegundoApellido.set(p.segundoApellido || '');
      this.editTelefono.set(p.telefono || '');
      this.editCorreo.set(p.correo || '');
      this.editDireccion.set(p.direccion || '');
    }
    this.passwordActual.set('');
    this.nuevaPassword.set('');
    this.confirmPassword.set('');
    this.mostrarPasswords.set(false);
    this.showEditModal.set(true);
  }

  async handleSaveProfile(): Promise<void> {
    this.modalError.set('');
    if (this.isCliente() && !this.editTelefono().trim()) {
      this.modalError.set('El teléfono es obligatorio');
      return;
    }
    const passwordsProvided =
      !!this.passwordActual() || !!this.nuevaPassword() || !!this.confirmPassword();

    if (passwordsProvided) {
      if (!this.passwordActual().trim()) {
        this.modalError.set('Ingresa tu contraseña actual para poder cambiarla');
        return;
      }
      if (this.nuevaPassword().length < 8) {
        this.modalError.set('La nueva contraseña debe tener al menos 8 caracteres');
        return;
      }
      if (this.nuevaPassword() !== this.confirmPassword()) {
        this.modalError.set('Las contraseñas no coinciden');
        return;
      }
    }

    this.saving.set(true);
    this.modalError.set('');
    try {
      if (this.isCliente()) {
        const data: ClienteProfileData = {
          primerNombre: this.editPrimerNombre(),
          segundoNombre: this.editSegundoNombre(),
          primerApellido: this.editPrimerApellido(),
          segundoApellido: this.editSegundoApellido(),
          telefono: this.editTelefono(),
          correo: this.editCorreo(),
          direccion: this.editDireccion(),
        };
        await firstValueFrom(this.clientesApi.updateProfile(data));
        this.cliente.set(await firstValueFrom(this.clientesApi.getProfile()));
        await this.auth.fetchProfile();
      }
      if (passwordsProvided) {
        await firstValueFrom(
          this.authApi.cambiarPassword({
            passwordActual: this.passwordActual(),
            nuevaPassword: this.nuevaPassword(),
          }),
        );
      }
      this.showEditModal.set(false);
      this.passwordActual.set('');
      this.nuevaPassword.set('');
      this.confirmPassword.set('');
      this.success.set(
        this.isCliente()
          ? passwordsProvided
            ? 'Perfil y contraseña actualizados correctamente'
            : 'Perfil actualizado correctamente'
          : 'Contraseña actualizada correctamente',
      );
      setTimeout(() => this.success.set(''), 3000);
    } catch (e: unknown) {
      this.modalError.set(getApiErrorMessage(e, 'Error al guardar los cambios'));
    } finally {
      this.saving.set(false);
    }
  }
}
