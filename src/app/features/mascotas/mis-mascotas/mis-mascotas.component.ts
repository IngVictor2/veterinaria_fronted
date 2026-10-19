import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MascotasApiService } from '../../../core/services/mascotas-api.service';
import { Mascota } from '../../../core/models/mascota';
import { getApiErrorMessage } from '../../../core/utils/api-error';

const MAX_MASCOTAS = 5;

@Component({
  selector: 'app-mis-mascotas',
  template: `
    <div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Mis Mascotas</h1>
        <button class="btn btn-primary gap-2" (click)="handleNuevaMascota()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Mascota
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (error()) {
        <div class="card bg-base-100 shadow-md">
          <div class="card-body text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-error/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 class="text-lg font-medium mt-4">Algo salió mal</h3>
            <p class="text-base-content/50 mt-2">{{ error() }}</p>
          </div>
        </div>
      } @else if (mascotasActivas().length === 0) {
        <div class="card bg-base-100 shadow-md">
          <div class="card-body text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <h3 class="text-lg font-medium mt-4">No tienes mascotas registradas</h3>
            <p class="text-base-content/50 mt-2">Agrega tu mascota para comenzar</p>
            <button class="btn btn-primary gap-2 mt-4" (click)="router.navigate(['/mascotas/nueva'])">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nueva Mascota
            </button>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (mascota of mascotasActivas(); track mascota.idMascota) {
            <div
              class="card bg-base-100 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              (click)="router.navigate(['/mascotas', mascota.idMascota])"
            >
              <div class="card-body">
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-primary/20 text-primary rounded-full w-12 flex items-center justify-center">
                      <span class="text-lg font-bold leading-none">{{ mascota.nombre.charAt(0) }}</span>
                    </div>
                  </div>
                  <div>
                    <h3 class="font-bold text-lg">{{ mascota.nombre }}</h3>
                    <p class="text-sm text-base-content/60">{{ mascota.especie }} - {{ mascota.raza }}</p>
                  </div>
                </div>
                <div class="divider my-1"></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-base-content/50">Sexo:</span>
                    <span class="ml-1">{{ mascota.sexo }}</span>
                  </div>
                  <div>
                    <span class="text-base-content/50">Peso:</span>
                    <span class="ml-1">{{ mascota.peso }} kg</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (showLimitDialog()) {
      <dialog class="modal modal-open">
        <div class="modal-box bg-[#1a1a2e] w-full max-w-sm sm:w-96">
          <h3 class="font-bold text-lg text-[#FFFFE3] mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Límite de mascotas alcanzado
          </h3>
          <p class="text-sm text-base-content/70 mb-5">
            Has alcanzado el límite de <strong>{{ MAX_MASCOTAS }} mascotas</strong> registradas.
            Si deseas agregar otra mascota, por favor acércate a <strong>recepción</strong> para que puedan asistirte con el registro.
          </p>
          <div class="modal-action pt-2">
            <button class="btn btn-primary btn-sm" (click)="showLimitDialog.set(false)">Entendido</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop" (click)="showLimitDialog.set(false)">
          <button>close</button>
        </form>
      </dialog>
    }
  `,
})
export class MisMascotasComponent implements OnInit {
  readonly router = inject(Router);
  private readonly mascotasApi = inject(MascotasApiService);

  readonly MAX_MASCOTAS = MAX_MASCOTAS;

  readonly mascotas = signal<Mascota[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly showLimitDialog = signal(false);

  readonly mascotasActivas = computed(() => this.mascotas().filter((m) => m.estado === true));
  readonly limiteAlcanzado = computed(() => this.mascotasActivas().length >= MAX_MASCOTAS);

  handleNuevaMascota(): void {
    if (this.limiteAlcanzado()) {
      this.showLimitDialog.set(true);
    } else {
      this.router.navigate(['/mascotas/nueva']);
    }
  }

  async ngOnInit(): Promise<void> {
    try {
      this.mascotas.set((await firstValueFrom(this.mascotasApi.getMisMascotas())) || []);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudieron cargar las mascotas'));
    } finally {
      this.loading.set(false);
    }
  }
}
