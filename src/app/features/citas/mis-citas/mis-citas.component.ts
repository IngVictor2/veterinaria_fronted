import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { Cita, formatHora as formatHoraFn } from '../../../core/models/cita';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { PaginationBarComponent } from '../../../shared/components/pagination-bar/pagination-bar.component';

@Component({
  selector: 'app-mis-citas',
  imports: [FormsModule, PaginationBarComponent],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Mis Citas</h1>
        <div class="flex items-center gap-2">
          <select
            class="select select-bordered select-sm h-10 text-sm min-w-[140px]"
            name="filtroEstado"
            [ngModel]="filtroEstado()"
            (ngModelChange)="onFiltroEstadoChange($event)"
          >
            <option value="">Todas</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="ATENDIDA">Atendidas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
          <button class="btn btn-primary gap-2" (click)="router.navigate(['/mis-citas/nueva'])">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Agendar cita
          </button>
        </div>
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
      } @else if (citas().length === 0) {
        <div class="card bg-base-100 shadow-md">
          <div class="card-body text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-medium mt-4">No tienes citas programadas</h3>
            <p class="text-base-content/50 mt-2">Agenda una cita para tu mascota</p>
            <button class="btn btn-primary mt-4 gap-2" (click)="router.navigate(['/mis-citas/nueva'])">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Agendar mi primera cita
            </button>
          </div>
        </div>
      } @else {
        <div class="space-y-4">
          @for (cita of paginatedCitas(); track cita.idCita) {
            <div
              class="card bg-base-100 shadow-md cursor-pointer hover:bg-base-200/50 transition-colors"
              (click)="router.navigate(['/citas', cita.idCita])"
            >
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="text-center bg-base-200 rounded-lg p-3 min-w-[4rem]">
                      <div class="text-2xl font-bold text-primary">
                        {{ diaCita(cita.fechaCita) }}
                      </div>
                      <div class="text-xs text-base-content/60">
                        {{ mesCita(cita.fechaCita) }}
                      </div>
                    </div>
                    <div>
                      <h3 class="font-bold">
                        Cita #{{ numerosCitas()[cita.idCita] ?? cita.idCita }}
                      </h3>
                      <p class="text-sm text-base-content/60">{{ cita.nombreServicio }}</p>
                      <p class="text-sm text-base-content/60">
                        {{ cita.nombreMascota }} - {{ formatHora(cita.horaCita ?? '') }}
                      </p>
                      <p class="text-sm text-base-content/60">
                        Veterinario: {{ cita.nombreEmpleado || 'Sin Asignar' }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="badge" [class]="estadoColor(cita.estadoCita)">
                      {{ estadoLabel(cita.estadoCita) }}
                    </span>
                  </div>
                </div>
                @if (cita.motivo) {
                  <div class="mt-3 p-3 bg-base-200 rounded-lg">
                    <p class="text-sm"><span class="font-medium">Motivo:</span> {{ cita.motivo }}</p>
                  </div>
                }
              </div>
            </div>
          }
          <app-pagination-bar
            [(page)]="page"
            [totalPages]="totalPages()"
            [totalElements]="sortedCitas().length"
            [size]="size()"
          />
        </div>
      }
    </div>
  `,
})
export class MisCitasComponent implements OnInit {
  readonly router = inject(Router);
  private readonly citasApi = inject(CitasApiService);

  protected readonly formatHora = formatHoraFn;

  readonly citas = signal<Cita[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(0);
  readonly size = signal(4);
  readonly filtroEstado = signal('');

  readonly numerosCitas = computed(() => {
    const mapa: Record<number, number> = {};
    const ordenadas = [...this.citas()].sort((a, b) => a.idCita - b.idCita);
    ordenadas.forEach((c, i) => {
      mapa[c.idCita] = i + 1;
    });
    return mapa;
  });

  readonly sortedCitas = computed(() => {
    let result = [...this.citas()];
    if (this.filtroEstado()) {
      result = result.filter((c) => c.estadoCita === this.filtroEstado());
    }
    return result.sort((a, b) => b.idCita - a.idCita);
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sortedCitas().length / this.size())));

  readonly paginatedCitas = computed(() => {
    const start = this.page() * this.size();
    return this.sortedCitas().slice(start, start + this.size());
  });

  async ngOnInit(): Promise<void> {
    try {
      this.citas.set(await firstValueFrom(this.citasApi.getMisCitas()));
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudieron cargar las citas'));
    } finally {
      this.loading.set(false);
    }
  }

  parseFechaLocal(fecha: string): Date {
    const parts = fecha.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    return new Date(y, m - 1, d);
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

  estadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADA: 'Confirmada',
      ATENDIDA: 'Atendida',
      CANCELADA: 'Cancelada',
    };
    return labels[estado] || estado;
  }

  formatFecha(fecha: string): string {
    return this.parseFechaLocal(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  diaCita(fecha: string): number {
    return this.parseFechaLocal(fecha).getDate();
  }

  mesCita(fecha: string): string {
    return this.parseFechaLocal(fecha).toLocaleDateString('es-CO', { month: 'short' });
  }

  onFiltroEstadoChange(value: string): void {
    this.filtroEstado.set(value);
    this.page.set(0);
  }
}
