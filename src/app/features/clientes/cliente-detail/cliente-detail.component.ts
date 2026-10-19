import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClientesApiService } from '../../../core/services/clientes-api.service';
import { MascotasApiService } from '../../../core/services/mascotas-api.service';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { Cliente } from '../../../core/models/cliente';
import { Mascota } from '../../../core/models/mascota';
import { Usuario } from '../../../core/models/admin';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cliente-detail',
  imports: [FormsModule, ConfirmDialogComponent],
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
      } @else if (cliente(); as c) {
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-xl sm:text-2xl font-extrabold text-[#FFFFE3] flex items-center gap-2">
              {{ nombreCompleto() }}
              @if (tieneCuenta()) {
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5 text-primary inline-block shrink-0" title="Tiene cuenta de acceso">
                  <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                </svg>
              }
            </h1>
            <p class="text-sm text-base-content/50">Detalle del cliente</p>
          </div>
          <span class="badge badge-lg hidden sm:inline-flex" [class]="c.estado ? 'badge-success' : 'badge-error'">
            {{ c.estado ? 'Activo' : 'Inactivo' }}
          </span>
          <!-- 3-dot menu -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-[#2A2A2A] rounded-xl w-52 z-50">
              <li><a (click)="router.navigate(['/clientes', id, 'editar'])" class="text-[#CBCBCB] hover:bg-white/10 hover:text-[#FFFFE3]">Editar</a></li>
              @if (puedeCrearCuenta()) {
                <li><a (click)="openCrearCuentaDialog()" class="text-[#CBCBCB] hover:bg-white/10 hover:text-[#FFFFE3]">Crear cuenta</a></li>
              }
              @if (esAdmin() && tieneCuenta()) {
                <li><a (click)="openPasswordDialog()" class="text-[#CBCBCB] hover:bg-white/10 hover:text-[#FFFFE3]">Restablecer contraseña</a></li>
              }
              @if (c.estado) {
                <li><a (click)="showDeleteDialog.set(true)" class="text-red-400 hover:bg-red-500/20">Desactivar</a></li>
              }
              @if (!c.estado) {
                <li><a (click)="showReactivateDialog.set(true)" class="text-green-400 hover:bg-green-500/20">Reactivar</a></li>
              }
            </ul>
          </div>
        </div>

        <!-- Info Card -->
        <div class="bg-base-100 rounded-2xl overflow-hidden mb-6">
          <div class="bg-gradient-to-r from-[#0D7377]/20 to-transparent px-6 py-5 flex items-center gap-5">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D7377] to-[#4A4A4A] flex items-center justify-center shadow-lg">
              <span class="text-[#FFFFE3] font-bold text-xl">{{ initials() }}</span>
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-bold text-[#FFFFE3] flex items-center gap-1.5">
                {{ nombreCompleto() }}
                @if (tieneCuenta()) {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5 text-primary inline-block shrink-0" title="Tiene cuenta de acceso">
                    <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                  </svg>
                }
              </h2>
              <p class="text-sm text-base-content/50">{{ c.tipoDocumento }} {{ c.numeroDocumento }}</p>
            </div>
          </div>
          <div class="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Teléfono</p>
              <p class="text-sm font-medium">{{ c.telefono || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Correo</p>
              <p class="text-sm font-medium">{{ c.correo || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Dirección</p>
              <p class="text-sm font-medium">{{ c.direccion || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Fecha registro</p>
              <p class="text-sm font-medium">{{ formatFecha(c.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Mascotas -->
        <div class="bg-base-100 rounded-2xl overflow-hidden">
          <div class="px-6 py-4 border-b border-base-300">
            <h3 class="font-bold text-[#FFFFE3]">Mascotas ({{ mascotas().length }})</h3>
          </div>
          @if (mascotas().length === 0) {
            <div class="px-6 py-12 text-center text-base-content/40">
              No tiene mascotas registradas
            </div>
          } @else {
            <div class="divide-y divide-base-300">
              @for (mascota of mascotas(); track mascota.idMascota) {
                <div
                  class="px-6 py-4 flex items-center gap-4 hover:bg-base-200/50 cursor-pointer transition-colors"
                  (click)="router.navigate(['/mascotas', mascota.idMascota])"
                >
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-sm">{{ mascota.nombre }}</p>
                    <p class="text-xs text-base-content/50">{{ mascota.especie }} · {{ mascota.raza }}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              }
            </div>
          }
        </div>
      }

      @if (showPasswordDialog()) {
        <dialog class="modal modal-open">
          <div class="modal-box bg-[#1a1a2e] w-full max-w-sm sm:w-96">
            <h3 class="font-bold text-lg text-[#FFFFE3] mb-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Restablecer contraseña
            </h3>
            <p class="text-sm text-base-content/50 mb-5">
              Escribe la nueva contraseña. Debe tener al menos 8 caracteres.
            </p>

            @if (resetError()) {
              <div class="alert alert-error mb-4 py-2 text-sm">
                <span>{{ resetError() }}</span>
              </div>
            }

            @if (resetSuccess()) {
              <div class="alert mb-4 py-2 text-sm bg-[#7a9e7e]/15 border border-[#7a9e7e]/30 text-[#7a9e7e]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ resetSuccess() }}</span>
              </div>
            }

            <form (ngSubmit)="handleResetPassword()" class="space-y-4" (keydown.escape)="showPasswordDialog.set(false)">
              <div class="form-control">
                <label class="label pb-1">
                  <span class="label-text text-xs uppercase tracking-wider text-base-content/50">Nueva contraseña</span>
                </label>
                <div class="relative">
                  <input
                    name="nuevaPassword"
                    [type]="mostrarClave() ? 'text' : 'password'"
                    class="input input-bordered w-full bg-[#2A2A2A] border-white/10 pr-10 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                    placeholder="Mínimo 8 caracteres"
                    minlength="8"
                    required
                    [ngModel]="nuevaPassword()"
                    (ngModelChange)="nuevaPassword.set($event)"
                  />
                  <button
                    type="button"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content btn btn-ghost btn-circle btn-xs"
                    (click)="mostrarClave.set(!mostrarClave())"
                    tabindex="-1"
                  >
                    @if (!mostrarClave()) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    }
                  </button>
                </div>
              </div>

              <div class="modal-action pt-4 -mb-4">
                <button type="button" class="btn btn-ghost btn-sm" [disabled]="resetPasswordLoading()" (click)="showPasswordDialog.set(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary btn-sm gap-1" [disabled]="resetPasswordLoading()">
                  @if (resetPasswordLoading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L15 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  }
                  Restablecer
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" class="modal-backdrop" (click)="showPasswordDialog.set(false)">
            <button>close</button>
          </form>
        </dialog>
      }

      @if (showCrearCuentaDialog()) {
        <dialog class="modal modal-open">
          <div class="modal-box bg-[#1a1a2e] w-full max-w-sm sm:w-96">
            <h3 class="font-bold text-lg text-[#FFFFE3] mb-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Crear cuenta de acceso
            </h3>
            <p class="text-sm text-base-content/50 mb-5">
              Define el correo y la contraseña para crear la cuenta de acceso del cliente.
            </p>

            @if (crearCuentaError()) {
              <div class="alert alert-error mb-4 py-2 text-sm">
                <span>{{ crearCuentaError() }}</span>
              </div>
            }

            @if (crearCuentaSuccess()) {
              <div class="alert mb-4 py-2 text-sm bg-[#7a9e7e]/15 border border-[#7a9e7e]/30 text-[#7a9e7e]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ crearCuentaSuccess() }}</span>
              </div>
            }

            <form (ngSubmit)="handleCrearCuenta()" class="space-y-4" (keydown.escape)="showCrearCuentaDialog.set(false)">
              <div class="form-control">
                <label class="label pb-1">
                  <span class="label-text text-xs uppercase tracking-wider text-base-content/50">Correo de la cuenta *</span>
                </label>
                <input
                  name="cuentaEmail"
                  type="text"
                  inputmode="email"
                  autocomplete="email"
                  class="input input-bordered w-full bg-[#2A2A2A] border-white/10 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  placeholder="correo@ejemplo.com"
                  [ngModel]="cuentaEmail()"
                  (ngModelChange)="cuentaEmail.set($event)"
                  (blur)="cuentaEmail.set(cuentaEmail().trim().toLowerCase())"
                />
              </div>
              <div class="form-control">
                <label class="label pb-1">
                  <span class="label-text text-xs uppercase tracking-wider text-base-content/50">Contraseña</span>
                </label>
                <div class="relative">
                  <input
                    name="cuentaPassword"
                    [type]="cuentaMostrarClave() ? 'text' : 'password'"
                    class="input input-bordered w-full bg-[#2A2A2A] border-white/10 pr-10 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                    placeholder="Mínimo 8 caracteres"
                    minlength="8"
                    required
                    [ngModel]="cuentaPassword()"
                    (ngModelChange)="cuentaPassword.set($event)"
                  />
                  <button
                    type="button"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content btn btn-ghost btn-circle btn-xs"
                    (click)="cuentaMostrarClave.set(!cuentaMostrarClave())"
                    tabindex="-1"
                  >
                    @if (!cuentaMostrarClave()) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    }
                  </button>
                </div>
              </div>

              <div class="modal-action pt-4 -mb-4">
                <button type="button" class="btn btn-ghost btn-sm" [disabled]="crearCuentaLoading()" (click)="showCrearCuentaDialog.set(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary btn-sm gap-1" [disabled]="crearCuentaLoading()">
                  @if (crearCuentaLoading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  }
                  Crear cuenta
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" class="modal-backdrop" (click)="showCrearCuentaDialog.set(false)">
            <button>close</button>
          </form>
        </dialog>
      }

      <app-confirm-dialog
        [show]="showDeleteDialog()"
        title="Desactivar cliente"
        message="¿Estás seguro de desactivar este cliente? No podrá iniciar sesión hasta que sea reactivado."
        confirmText="Desactivar"
        variant="error"
        (confirm)="handleDelete()"
        (cancel)="showDeleteDialog.set(false)"
      />

      <app-confirm-dialog
        [show]="showReactivateDialog()"
        title="Reactivar cliente"
        message="¿Estás seguro de reactivar este cliente?"
        confirmText="Reactivar"
        variant="success"
        (confirm)="handleReactivate()"
        (cancel)="showReactivateDialog.set(false)"
      />
    </div>
  `,
})
export class ClienteDetailComponent implements OnInit {
  readonly router = inject(Router);
  readonly location = inject(Location);
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly clientesApi = inject(ClientesApiService);
  private readonly mascotasApi = inject(MascotasApiService);
  private readonly adminApi = inject(AdminApiService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly cliente = signal<Cliente | null>(null);
  readonly mascotas = signal<Mascota[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');

  readonly showDeleteDialog = signal(false);
  readonly showReactivateDialog = signal(false);

  readonly showPasswordDialog = signal(false);
  readonly nuevaPassword = signal('');
  readonly resetPasswordLoading = signal(false);
  readonly resetError = signal('');
  readonly resetSuccess = signal('');
  readonly mostrarClave = signal(false);

  readonly showCrearCuentaDialog = signal(false);
  readonly cuentaEmail = signal('');
  readonly cuentaPassword = signal('');
  readonly cuentaMostrarClave = signal(false);
  readonly crearCuentaLoading = signal(false);
  readonly crearCuentaError = signal('');
  readonly crearCuentaSuccess = signal('');

  readonly esAdmin = computed(() => this.auth.hasRole('ADMIN'));

  readonly nombreCompleto = computed(() => {
    const c = this.cliente();
    if (!c) return '';
    return [c.primerNombre, c.segundoNombre, c.primerApellido, c.segundoApellido].filter(Boolean).join(' ');
  });

  readonly initials = computed(() => {
    const c = this.cliente();
    if (!c) return '?';
    return ((c.primerNombre?.[0] || '') + (c.primerApellido?.[0] || '')).toUpperCase();
  });

  readonly tieneCuenta = computed(() =>
    (this.usuarios() || []).some((u) => u.idCliente === this.cliente()?.idCliente),
  );

  readonly puedeCrearCuenta = computed(() => this.auth.hasModule('CLIENTES') && !this.tieneCuenta());

  async ngOnInit(): Promise<void> {
    void this.cargarUsuarios();
    try {
      const [clienteRes, mascotasRes] = await Promise.all([
        firstValueFrom(this.clientesApi.getById(this.id)),
        firstValueFrom(this.mascotasApi.getByCliente(this.id)),
      ]);
      this.cliente.set(clienteRes);
      this.mascotas.set((mascotasRes || []).filter((m) => m.estado === true));
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo cargar el cliente'));
    } finally {
      this.loading.set(false);
    }
  }

  async cargarUsuarios(): Promise<void> {
    if (!this.auth.hasModule('CLIENTES')) return;
    try {
      const res = await firstValueFrom(this.adminApi.getUsuarios());
      this.usuarios.set(res || []);
    } catch {
      this.usuarios.set([]);
    }
  }

  async handleDelete(): Promise<void> {
    try {
      await firstValueFrom(this.clientesApi.cambiarEstado(this.id, false));
      this.showDeleteDialog.set(false);
      this.success.set('Cliente desactivado correctamente');
      setTimeout(() => this.router.navigate(['/clientes']), 1500);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo desactivar'));
      this.showDeleteDialog.set(false);
    }
  }

  async handleReactivate(): Promise<void> {
    try {
      await firstValueFrom(this.clientesApi.cambiarEstado(this.id, true));
      this.showReactivateDialog.set(false);
      const res = await firstValueFrom(this.clientesApi.getById(this.id));
      this.cliente.set(res);
      this.success.set('Cliente reactivado correctamente');
      setTimeout(() => this.success.set(''), 3000);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo reactivar'));
      this.showReactivateDialog.set(false);
    }
  }

  openPasswordDialog(): void {
    this.nuevaPassword.set('');
    this.resetError.set('');
    this.resetSuccess.set('');
    this.mostrarClave.set(false);
    this.resetPasswordLoading.set(false);
    this.showPasswordDialog.set(true);
  }

  async handleResetPassword(): Promise<void> {
    if (this.nuevaPassword().length < 8) {
      this.resetError.set('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    try {
      const res = await firstValueFrom(this.adminApi.getUsuarios());
      const usuario = (res || []).find((u) => u.idCliente === this.cliente()?.idCliente);
      if (!usuario) {
        this.resetError.set('Este cliente no tiene usuario asociado');
        return;
      }
      this.resetPasswordLoading.set(true);
      this.resetError.set('');
      await firstValueFrom(this.adminApi.restablecerPassword(usuario.idUsuario, this.nuevaPassword()));
      this.resetSuccess.set('Contraseña restablecida correctamente');
      setTimeout(() => {
        this.showPasswordDialog.set(false);
        this.resetSuccess.set('');
      }, 1500);
    } catch (e: unknown) {
      this.resetError.set(getApiErrorMessage(e, 'No se pudo restablecer la contraseña'));
    } finally {
      this.resetPasswordLoading.set(false);
    }
  }

  formatFecha(fecha: string | null): string {
    if (!fecha) return '—';
    const dateStr = fecha.split('T')[0] ?? fecha;
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  openCrearCuentaDialog(): void {
    this.cuentaEmail.set('');
    this.cuentaPassword.set('');
    this.cuentaMostrarClave.set(false);
    this.crearCuentaError.set('');
    this.crearCuentaSuccess.set('');
    this.crearCuentaLoading.set(false);
    this.showCrearCuentaDialog.set(true);
  }

  async handleCrearCuenta(): Promise<void> {
    this.cuentaEmail.set(this.cuentaEmail().trim().toLowerCase());
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.cuentaEmail())) {
      this.crearCuentaError.set('Ingresa un correo electrónico válido para la cuenta');
      return;
    }
    if (this.cuentaPassword().length < 8) {
      this.crearCuentaError.set('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    try {
      this.crearCuentaLoading.set(true);
      this.crearCuentaError.set('');
      await firstValueFrom(
        this.clientesApi.crearUsuario(this.id, {
          email: this.cuentaEmail(),
          password: this.cuentaPassword(),
        }),
      );
      this.crearCuentaSuccess.set('Cuenta creada correctamente');
      void this.cargarUsuarios();
      setTimeout(() => {
        this.showCrearCuentaDialog.set(false);
        this.crearCuentaSuccess.set('');
      }, 1500);
    } catch (e: unknown) {
      this.crearCuentaError.set(getApiErrorMessage(e, 'No se pudo crear la cuenta'));
    } finally {
      this.crearCuentaLoading.set(false);
    }
  }
}
