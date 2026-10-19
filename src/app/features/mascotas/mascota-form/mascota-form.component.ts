import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MascotasApiService } from '../../../core/services/mascotas-api.service';
import { ClientesApiService } from '../../../core/services/clientes-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { Cliente } from '../../../core/models/cliente';
import { CrearMascotaRequest } from '../../../core/models/mascota';
import { SearchSelectComponent, SearchSelectOption } from '../../../shared/components/search-select/search-select.component';

const MAX_MASCOTAS = 5;

@Component({
  selector: 'app-mascota-form',
  imports: [FormsModule, SearchSelectComponent],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">{{ isEdit ? 'Editar Mascota' : 'Nueva Mascota' }}</h1>
          <p class="text-sm text-base-content/60">{{ isEdit ? 'Actualiza los datos de la mascota' : 'Registra una nueva mascota en el sistema' }}</p>
        </div>
      </div>

      @if (error()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
        </div>
      }

      <form (ngSubmit)="handleSubmit()" class="space-y-3">
        <!-- Info basica -->
        <div class="bg-base-100 rounded-xl p-5 space-y-3">
          <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
            Información básica
          </h4>
          <div class="form-control">
            <label class="label py-0"><span class="label-text font-medium text-sm">Nombre *</span></label>
            <input name="nombre" type="text" class="input input-bordered input-sm w-full" placeholder="Nombre de la mascota" [ngModel]="nombre()" (ngModelChange)="nombre.set($event)" />
            @if (submitted() && !nombre().trim()) {
              <label class="label py-0">
                <span class="label-text-alt text-error text-xs">Debes ingresar el nombre</span>
              </label>
            }
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Especie *</span></label>
              <select name="especie" class="select select-bordered select-sm w-full" [ngModel]="especie()" (ngModelChange)="especie.set($event)">
                <option value="" disabled>Seleccionar</option>
                @for (s of species; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
              @if (submitted() && !especie()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes seleccionar una especie</span>
                </label>
              }
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Raza</span></label>
              <input name="raza" type="text" class="input input-bordered input-sm w-full" placeholder="Ej: Labrador, Siames..." [ngModel]="raza()" (ngModelChange)="raza.set($event)" />
            </div>
          </div>
        </div>

        <!-- Detalles -->
        <div class="bg-base-100 rounded-xl p-5 space-y-3">
          <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Detalles
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Sexo *</span></label>
              <select name="sexo" class="select select-bordered select-sm w-full" [ngModel]="sexo()" (ngModelChange)="sexo.set($event)">
                <option value="MACHO">Macho</option>
                <option value="HEMBRA">Hembra</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Peso (kg)</span></label>
              <input name="peso" type="number" step="0.01" class="input input-bordered input-sm w-full" placeholder="Ej: 5.2" [ngModel]="peso()" (ngModelChange)="peso.set($event)" />
              @if (pesoError()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">{{ pesoError() }}</span>
                </label>
              }
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Fecha nacimiento *</span></label>
              <input
                name="fechaNacimiento"
                type="date"
                class="input input-bordered input-sm w-full"
                [attr.max]="hoy()"
                style="color-scheme: dark"
                [ngModel]="fechaNacimiento()"
                (ngModelChange)="fechaNacimiento.set($event)"
              />
              @if (submitted() && fechaNacimiento() && fechaNacimiento() > hoy()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">La fecha no puede ser futura</span>
                </label>
              }
            </div>
          </div>
          <div class="form-control">
            <label class="label py-0"><span class="label-text font-medium text-sm">Observaciones</span></label>
            <textarea name="observaciones" class="textarea textarea-bordered textarea-sm w-full" rows="2" placeholder="Alergias, condiciones medicas, etc." [ngModel]="observaciones()" (ngModelChange)="observaciones.set($event)"></textarea>
          </div>
        </div>

        <!-- Dueño (solo admin/recepcionista) -->
        @if (!isCliente()) {
          <div class="bg-base-100 rounded-xl p-5 space-y-3">
            <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Dueño
            </h4>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Cliente *</span></label>
              <app-search-select
                [(value)]="idCliente"
                [options]="clienteOptions()"
                placeholder="Buscar por nombre o documento..."
                [required]="true"
              />
              @if (submitted() && !idCliente()) {
                <label class="label py-0">
                  <span class="label-text-alt text-error text-xs">Debes seleccionar un cliente</span>
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
            {{ isEdit ? 'Actualizar' : 'Crear Mascota' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class MascotaFormComponent implements OnInit {
  readonly router = inject(Router);
  readonly location = inject(Location);
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly mascotasApi = inject(MascotasApiService);
  private readonly clientesApi = inject(ClientesApiService);

  readonly isEdit = !!this.route.snapshot.paramMap.get('id');
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly isCliente = computed(
    () =>
      this.auth.hasRole('CLIENTE') &&
      !this.auth.hasAnyRole('ADMIN', 'RECEPCIONISTA', 'VETERINARIO', 'ESTILISTA'),
  );

  readonly idCliente = signal<number | string | null>(0);
  readonly nombre = signal('');
  readonly especie = signal('');
  readonly raza = signal('');
  readonly sexo = signal('MACHO');
  readonly fechaNacimiento = signal('');
  readonly peso = signal<number | null>(null);
  readonly observaciones = signal('');

  readonly clientes = signal<Cliente[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly mascotasActivasCount = signal(0);
  readonly limitReached = signal(false);
  readonly submitted = signal(false);

  readonly species = ['Perro', 'Gato', 'Ave', 'Reptil', 'Conejo', 'Hamster', 'Otro'];

  readonly formValid = computed(
    () => this.nombre().trim() !== '' && this.especie() !== '' && this.sexo() !== '',
  );

  readonly pesoError = computed(() => {
    const peso = this.peso();
    if (!peso) return '';
    return Number.isFinite(peso) && peso >= 0.01 && peso <= 500
      ? ''
      : 'El peso debe estar entre 0.01 y 500 kg';
  });

  readonly clienteOptions = computed<SearchSelectOption[]>(() =>
    this.clientes()
      .filter((c) => c.estado === true)
      .map((c) => ({
        value: c.idCliente,
        label: `${c.primerNombre} ${c.primerApellido}`,
        sublabel: `${c.numeroDocumento} - ${c.correo || ''}`,
      })),
  );

  hoy(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  async ngOnInit(): Promise<void> {
    if (!this.isCliente()) {
      try {
        this.clientes.set((await firstValueFrom(this.clientesApi.getAll())) ?? []);
      } catch (e: unknown) {
        console.error('Error loading clientes', e);
      }
    } else {
      try {
        const perfil = await firstValueFrom(this.clientesApi.getProfile());
        this.idCliente.set(perfil.idCliente);

        const mascotasRes = await firstValueFrom(this.mascotasApi.getMisMascotas());
        const mascotasActivas = (mascotasRes || []).filter((m) => m.estado === true);
        this.mascotasActivasCount.set(mascotasActivas.length);
        this.limitReached.set(this.mascotasActivasCount() >= MAX_MASCOTAS && !this.isEdit);
      } catch (e: unknown) {
        console.error('Error loading profile', e);
      }
    }

    if (this.isEdit) {
      try {
        const m = await firstValueFrom(this.mascotasApi.getById(this.id));
        this.idCliente.set(m.idCliente);
        this.nombre.set(m.nombre);
        this.especie.set(m.especie);
        this.raza.set(m.raza || '');
        this.sexo.set(m.sexo);
        this.fechaNacimiento.set(m.fechaNacimiento || '');
        this.peso.set(m.peso);
        this.observaciones.set(m.observaciones || '');
      } catch (e: unknown) {
        console.error('Error loading mascota', e);
      }
    }
  }

  async handleSubmit(): Promise<void> {
    this.submitted.set(true);
    this.error.set('');

    if (!this.formValid() || this.pesoError()) {
      return;
    }

    this.loading.set(true);
    if (this.isCliente() && !this.isEdit && this.mascotasActivasCount() >= MAX_MASCOTAS) {
      this.error.set(
        `Has alcanzado el límite de ${MAX_MASCOTAS} mascotas activas. Desactiva una mascota existente para agregar una nueva.`,
      );
      this.loading.set(false);
      return;
    }

    if (this.fechaNacimiento() && this.fechaNacimiento() > this.hoy()) {
      this.error.set('La fecha de nacimiento no puede ser una fecha futura');
      this.loading.set(false);
      return;
    }

    try {
      const data: CrearMascotaRequest = {
        idCliente: Number(this.idCliente()),
        nombre: this.nombre(),
        especie: this.especie(),
        sexo: this.sexo(),
      };
      if (this.raza()) data.raza = this.raza();
      if (this.fechaNacimiento()) data.fechaNacimiento = this.fechaNacimiento();
      const peso = this.peso();
      if (peso) data.peso = peso;
      if (this.observaciones()) data.observaciones = this.observaciones();

      if (this.isEdit) {
        await firstValueFrom(this.mascotasApi.update(this.id, data));
      } else {
        await firstValueFrom(this.mascotasApi.create(data));
      }
      this.router.navigate([this.isCliente() ? '/mis-mascotas' : '/mascotas']);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al guardar la mascota'));
    } finally {
      this.loading.set(false);
    }
  }
}
