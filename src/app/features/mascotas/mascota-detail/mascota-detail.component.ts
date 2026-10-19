import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MascotasApiService } from '../../../core/services/mascotas-api.service';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { Mascota } from '../../../core/models/mascota';
import { Cita } from '../../../core/models/cita';
import { PaginationBarComponent } from '../../../shared/components/pagination-bar/pagination-bar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-mascota-detail',
  imports: [PaginationBarComponent, ConfirmDialogComponent],
  template: `
    <div class="max-w-5xl mx-auto">
      @if (error()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
        </div>
      }

      @if (loading()) {
        <div class="flex justify-center py-20">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (mascota(); as m) {
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-xl sm:text-2xl font-extrabold text-[#FFFFE3]">{{ m.nombre }}</h1>
            <p class="text-sm text-base-content/50">Detalle de mascota</p>
          </div>
          <span class="badge badge-lg" [class]="m.estado ? 'badge-success' : 'badge-error'">
            {{ m.estado ? 'Activa' : 'Inactiva' }}
          </span>
          <!-- 3-dot menu -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-[#2A2A2A] rounded-xl w-52 z-50">
              <li><a (click)="router.navigate(['/mascotas', id, 'editar'])" class="text-[#CBCBCB] hover:bg-white/10 hover:text-[#FFFFE3]">Editar</a></li>
              @if (m.estado) {
                <li><a (click)="showDeleteDialog.set(true)" class="text-red-400 hover:bg-red-500/20">Desactivar</a></li>
              }
            </ul>
          </div>
        </div>

        <!-- Info Card -->
        <div class="bg-base-100 rounded-2xl overflow-hidden mb-6">
          <div class="bg-gradient-to-r from-[#0D7377]/20 to-transparent px-6 py-5 flex items-center gap-5">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg">
              <span class="text-primary font-bold text-xl">{{ initials() }}</span>
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-bold text-[#FFFFE3]">{{ m.nombre }}</h2>
              <p class="text-sm text-base-content/50">{{ m.especie }} · {{ m.raza }} · {{ m.sexo }}</p>
            </div>
            @if (citasPendientes().length > 0) {
              <button class="badge badge-lg badge-warning gap-1">
                {{ citasPendientes().length }} cita(s) activa(s)
              </button>
            }
          </div>
          <div class="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Especie</p>
              <p class="text-sm font-medium">{{ m.especie }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Raza</p>
              <p class="text-sm font-medium">{{ m.raza }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Fecha nacimiento</p>
              <p class="text-sm font-medium">{{ formatFecha(m.fechaNacimiento) }}</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Peso</p>
              <p class="text-sm font-medium">{{ m.peso }} kg</p>
            </div>
            <div>
              <p class="text-xs text-base-content/40 uppercase tracking-wider mb-1">Dueño</p>
              <p
                class="text-sm font-medium text-primary cursor-pointer hover:underline"
                (click)="router.navigate(['/clientes', m.idCliente])"
              >
                {{ m.nombreCliente }}
              </p>
            </div>
          </div>
        </div>

        <!-- Historial de Citas -->
        <div class="bg-base-100 rounded-2xl overflow-hidden">
          <div class="px-6 py-4 border-b border-base-300">
            <h3 class="font-bold text-[#FFFFE3]">Historial de Citas ({{ citas().length }})</h3>
          </div>
          @if (citas().length === 0) {
            <div class="px-6 py-12 text-center text-base-content/40">
              No tiene citas registradas
            </div>
          } @else {
            <div class="divide-y divide-base-300">
              @for (cita of citasPaginadas(); track cita.idCita) {
                <div
                  class="px-6 py-4 flex items-center gap-4 hover:bg-base-200/50 cursor-pointer transition-colors"
                  (click)="router.navigate(['/citas', cita.idCita])"
                >
                  <div class="w-10 h-10 rounded-full flex items-center justify-center" [class]="estadoFondo(cita.estadoCita)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" [class]="estadoTexto(cita.estadoCita)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="w-8 text-center shrink-0">
                    <span class="text-xs font-bold text-base-content/50">#{{ numeroCita(cita.idCita) }}</span>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-sm">{{ cita.nombreServicio }}</p>
                    <p class="text-xs text-base-content/50">{{ formatFecha(cita.fechaCita) }} · {{ formatHora(cita.horaCita) }}</p>
                  </div>
                  <span class="badge badge-sm" [class]="estadoColor(cita.estadoCita)">{{ cita.estadoCita }}</span>
                </div>
              }
            </div>
          }
          @if (citasOrdenadas().length > size()) {
            <div class="px-6 pb-2">
              <app-pagination-bar
                [(page)]="page"
                [totalPages]="totalCitasPages()"
                [totalElements]="citasOrdenadas().length"
                [size]="size()"
              />
            </div>
          }
        </div>
      }

      <app-confirm-dialog
        [show]="showDeleteDialog()"
        title="Desactivar mascota"
        message="¿Estás seguro de desactivar esta mascota? No se podrán agendar citas hasta que sea reactivada."
        confirmText="Desactivar"
        variant="error"
        (confirm)="handleDelete()"
        (cancel)="showDeleteDialog.set(false)"
      />
    </div>
  `,
})
export class MascotaDetailComponent implements OnInit {
  readonly router = inject(Router);
  readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly mascotasApi = inject(MascotasApiService);
  private readonly citasApi = inject(CitasApiService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly mascota = signal<Mascota | null>(null);
  readonly citas = signal<Cita[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly showDeleteDialog = signal(false);
  readonly page = signal(0);
  readonly size = signal(5);

  readonly numerosCitas = computed(() => {
    const mapa: Record<number, number> = {};
    const ordenadas = [...this.citas()].sort((a, b) => a.idCita - b.idCita);
    ordenadas.forEach((c, i) => {
      mapa[c.idCita] = i + 1;
    });
    return mapa;
  });

  readonly initials = computed(() => {
    const m = this.mascota();
    if (!m) return '?';
    return m.nombre?.[0]?.toUpperCase() || '?';
  });

  readonly citasPendientes = computed(() =>
    this.citas().filter((c) => c.estadoCita === 'PENDIENTE' || c.estadoCita === 'CONFIRMADA'),
  );

  readonly citasOrdenadas = computed(() =>
    [...this.citas()].sort((a, b) => {
      const fechaA = a.fechaCita + (a.horaCita || '');
      const fechaB = b.fechaCita + (b.horaCita || '');
      return fechaB.localeCompare(fechaA);
    }),
  );

  readonly totalCitasPages = computed(() => Math.max(1, Math.ceil(this.citasOrdenadas().length / this.size())));

  readonly citasPaginadas = computed(() => {
    const start = this.page() * this.size();
    return this.citasOrdenadas().slice(start, start + this.size());
  });

  async ngOnInit(): Promise<void> {
    try {
      const [mascotaRes, citasRes] = await Promise.all([
        firstValueFrom(this.mascotasApi.getById(this.id)),
        firstValueFrom(this.citasApi.getByMascota(this.id)),
      ]);
      this.mascota.set(mascotaRes);
      this.citas.set(citasRes);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al cargar los datos de la mascota'));
    } finally {
      this.loading.set(false);
    }
  }

  numeroCita(idCita: number): number | string {
    return this.numerosCitas()[idCita] ?? '—';
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

  estadoFondo(estado: string): string {
    if (estado === 'PENDIENTE') return 'bg-warning/10';
    if (estado === 'CONFIRMADA') return 'bg-info/10';
    if (estado === 'ATENDIDA') return 'bg-success/10';
    return 'bg-error/10';
  }

  estadoTexto(estado: string): string {
    if (estado === 'PENDIENTE') return 'text-warning';
    if (estado === 'CONFIRMADA') return 'text-info';
    if (estado === 'ATENDIDA') return 'text-success';
    return 'text-error';
  }

  formatFecha(fecha: string | null): string {
    if (!fecha) return '—';
    const parts = fecha.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  async handleDelete(): Promise<void> {
    try {
      await firstValueFrom(this.mascotasApi.delete(this.id));
      this.showDeleteDialog.set(false);
      this.success.set('Mascota desactivada correctamente');
      setTimeout(() => this.location.back(), 1500);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'No se pudo desactivar'));
      this.showDeleteDialog.set(false);
    }
  }

  formatHora(hora: string): string {
    if (!hora) return '';
    const parts = hora.split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}
