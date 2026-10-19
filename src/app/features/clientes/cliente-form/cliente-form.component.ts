import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClientesApiService } from '../../../core/services/clientes-api.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { ActualizarClienteRequest, CrearClienteRequest } from '../../../core/models/cliente';

@Component({
  selector: 'app-cliente-form',
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">{{ isEdit ? 'Editar Cliente' : 'Nuevo Cliente' }}</h1>
          <p class="text-sm text-base-content/60">{{ isEdit ? 'Actualiza los datos del cliente' : 'Registra un nuevo cliente en el sistema' }}</p>
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
              <select name="tipoDocumento" class="select select-bordered select-sm w-full" [ngModel]="tipoDocumento()" (ngModelChange)="tipoDocumento.set($event)">
                <option value="CC">Cedula de Ciudadania</option>
                <option value="CE">Cedula de Extranjeria</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Numero *</span></label>
              <input name="numeroDocumento" type="text" class="input input-bordered input-sm w-full" placeholder="Numero de documento" [ngModel]="numeroDocumento()" (ngModelChange)="numeroDocumento.set($event)" />
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
              <input name="primerNombre" type="text" class="input input-bordered input-sm w-full" placeholder="Primer nombre" [ngModel]="primerNombre()" (ngModelChange)="primerNombre.set($event)" />
              @if (submitted() && !primerNombre().trim()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes ingresar el primer nombre</span>
                </label>
              }
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Segundo nombre</span></label>
              <input name="segundoNombre" type="text" class="input input-bordered input-sm w-full" placeholder="Segundo nombre" [ngModel]="segundoNombre()" (ngModelChange)="segundoNombre.set($event)" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Primer apellido *</span></label>
              <input name="primerApellido" type="text" class="input input-bordered input-sm w-full" placeholder="Primer apellido" [ngModel]="primerApellido()" (ngModelChange)="primerApellido.set($event)" />
              @if (submitted() && !primerApellido().trim()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes ingresar el primer apellido</span>
                </label>
              }
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Segundo apellido</span></label>
              <input name="segundoApellido" type="text" class="input input-bordered input-sm w-full" placeholder="Segundo apellido" [ngModel]="segundoApellido()" (ngModelChange)="segundoApellido.set($event)" />
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
              <input name="telefono" type="tel" class="input input-bordered input-sm w-full" placeholder="Telefono" required [ngModel]="telefono()" (ngModelChange)="telefono.set($event)" />
              @if (submitted() && !telefono().trim()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes ingresar un teléfono</span>
                </label>
              }
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Correo{{ crearUsuario() ? ' *' : '' }}</span></label>
              <input name="correo" type="email" class="input input-bordered input-sm w-full" placeholder="Correo electronico" [ngModel]="correo()" (ngModelChange)="correo.set($event)" (blur)="normalizeCorreo()" />
              @if (submitted() && crearUsuario() && !correo().trim()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes ingresar un correo electronico</span>
                </label>
              }
            </div>
          </div>
          <div class="form-control">
            <label class="label py-0"><span class="label-text font-medium text-sm">Direccion</span></label>
            <input name="direccion" type="text" class="input input-bordered input-sm w-full" placeholder="Direccion" [ngModel]="direccion()" (ngModelChange)="direccion.set($event)" />
          </div>
        </div>

        <!-- Credenciales (solo al crear) -->
        @if (!isEdit) {
          <div class="bg-base-100 rounded-xl p-5 space-y-3">
            <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Credenciales de acceso
            </h4>
            <div class="form-control">
              <label class="label cursor-pointer gap-3">
                <input type="checkbox" name="crearUsuario" class="checkbox checkbox-sm checkbox-primary" [ngModel]="crearUsuario()" (ngModelChange)="crearUsuario.set($event)" />
                <span class="label-text text-sm">Crear usuario para que el cliente pueda iniciar sesion</span>
              </label>
            </div>
            @if (crearUsuario()) {
              <div class="space-y-3">
                <div class="form-control">
                  <label class="label py-0"><span class="label-text font-medium text-sm">Nombre de usuario</span></label>
                  <input type="text" class="input input-bordered input-sm w-full bg-base-200" disabled [value]="nombreUsuarioPreview()" [placeholder]="correo() ? '' : 'Se genera desde el correo de contacto'" />
                </div>
                <div class="form-control">
                  <label class="label py-0"><span class="label-text font-medium text-sm">Contrasena *</span></label>
                  <input name="usuarioPassword" type="password" class="input input-bordered input-sm w-full" placeholder="Minimo 8 caracteres" [ngModel]="usuarioPassword()" (ngModelChange)="usuarioPassword.set($event)" />
                  @if (submitted() && crearUsuario() && usuarioPassword().length < 8) {
                    <label class="label py-0">
                      <span class="label-text-alt text-error text-xs">La contrasena debe tener minimo 8 caracteres</span>
                    </label>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Cambiar contrasena (solo al editar) -->
        @if (isEdit) {
          <div class="bg-base-100 rounded-xl p-5 space-y-3">
            <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Cambiar contrasena
            </h4>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Nueva contrasena (dejar vacio para no cambiar)</span></label>
              <input name="editPassword" type="password" class="input input-bordered input-sm w-full" placeholder="Minimo 8 caracteres" [ngModel]="editPassword()" (ngModelChange)="editPassword.set($event)" />
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
            {{ isEdit ? 'Actualizar' : 'Crear Cliente' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ClienteFormComponent implements OnInit {
  readonly router = inject(Router);
  readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly clientesApi = inject(ClientesApiService);

  readonly isEdit = !!this.route.snapshot.paramMap.get('id');
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly tipoDocumento = signal('CC');
  readonly numeroDocumento = signal('');
  readonly primerNombre = signal('');
  readonly segundoNombre = signal('');
  readonly primerApellido = signal('');
  readonly segundoApellido = signal('');
  readonly telefono = signal('');
  readonly correo = signal('');
  readonly direccion = signal('');

  readonly crearUsuario = signal(false);
  readonly usuarioPassword = signal('');
  readonly editPassword = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly submitted = signal(false);

  readonly formValid = computed(
    () =>
      this.numeroDocumento().trim() !== '' &&
      this.primerNombre().trim() !== '' &&
      this.primerApellido().trim() !== '' &&
      this.telefono().trim() !== '',
  );

  readonly usuarioValid = computed(
    () => !this.crearUsuario() || (this.correo().trim() !== '' && this.usuarioPassword().length >= 8),
  );

  readonly nombreUsuarioPreview = computed(() => {
    if (!this.correo()) return '';
    return this.correo().split('@')[0];
  });

  normalizeCorreo(): void {
    this.correo.set(this.correo().trim().toLowerCase());
  }

  async ngOnInit(): Promise<void> {
    if (this.isEdit) {
      try {
        const c = await firstValueFrom(this.clientesApi.getById(this.id));
        this.tipoDocumento.set(c.tipoDocumento || 'CC');
        this.numeroDocumento.set(c.numeroDocumento || '');
        this.primerNombre.set(c.primerNombre);
        this.segundoNombre.set(c.segundoNombre || '');
        this.primerApellido.set(c.primerApellido);
        this.segundoApellido.set(c.segundoApellido || '');
        this.telefono.set(c.telefono || '');
        this.correo.set(c.correo || '');
        this.direccion.set(c.direccion || '');
      } catch (e: unknown) {
        this.error.set(getApiErrorMessage(e, 'No se pudo cargar el cliente'));
      }
    }
  }

  async handleSubmit(): Promise<void> {
    this.normalizeCorreo();
    this.submitted.set(true);

    if (!this.formValid() || !this.usuarioValid()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    try {
      if (this.isEdit) {
        const payload: ActualizarClienteRequest & { password?: string } = {
          tipoDocumento: this.tipoDocumento(),
          numeroDocumento: this.numeroDocumento(),
          primerNombre: this.primerNombre(),
          segundoNombre: this.segundoNombre(),
          primerApellido: this.primerApellido(),
          segundoApellido: this.segundoApellido(),
          telefono: this.telefono(),
          correo: this.correo(),
          direccion: this.direccion(),
        };
        if (this.editPassword()) {
          payload.password = this.editPassword();
        }
        await firstValueFrom(this.clientesApi.update(this.id, payload));
      } else {
        const data: CrearClienteRequest = {
          tipoDocumento: this.tipoDocumento(),
          numeroDocumento: this.numeroDocumento(),
          primerNombre: this.primerNombre(),
          segundoNombre: this.segundoNombre(),
          primerApellido: this.primerApellido(),
          segundoApellido: this.segundoApellido(),
          telefono: this.telefono(),
          correo: this.correo(),
          direccion: this.direccion(),
        };
        const res = await firstValueFrom(this.clientesApi.create(data));
        if (this.crearUsuario() && this.correo() && this.usuarioPassword()) {
          await firstValueFrom(
            this.clientesApi.crearUsuario(res.idCliente, {
              email: this.correo(),
              password: this.usuarioPassword(),
            }),
          );
        }
      }
      this.router.navigate(['/clientes']);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al guardar el cliente'));
    } finally {
      this.loading.set(false);
    }
  }
}
