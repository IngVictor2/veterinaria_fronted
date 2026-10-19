import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { Modulo, Rol, RolModulo } from '../../../core/models/admin';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-permisos',
  imports: [ConfirmDialogComponent],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Permisos por Rol</h1>
        <p class="text-sm text-base-content/60 mt-1">Asigna o revoca módulos de acceso para cada rol</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Panel izquierdo: selector de rol -->
          <div class="bg-base-100 rounded-xl p-6">
            <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Roles
            </h4>
            <div class="space-y-2">
              @for (rol of rolesFiltrados(); track rol.idRol) {
                <button
                  class="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                  [class]="selectedRol() === rol.idRol
                    ? 'bg-[#0D7377]/20 text-[#FFFFE3] border border-[#0D7377]/40 shadow-sm'
                    : 'text-[#CBCBCB] hover:bg-white/5 border border-transparent'"
                  (click)="selectRol(rol.idRol)"
                >
                  <div class="flex items-center justify-between">
                    <span>{{ rol.nombre }}</span>
                    @if (selectedRol() === rol.idRol) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" /></svg>
                    }
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Panel derecho: permisos -->
          <div class="lg:col-span-2 bg-base-100 rounded-xl p-6">
            @if (!selectedRol()) {
              <div class="flex flex-col items-center justify-center py-12 text-base-content/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                <p class="text-sm">Selecciona un rol para ver sus permisos</p>
              </div>
            } @else {
              <!-- Permisos actuales -->
              <div class="mb-6">
                <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#7a9e7e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" /></svg>
                  Permisos activos ({{ permisosActivos().length }})
                </h4>
                @if (permisosActivos().length > 0) {
                  <div class="flex flex-wrap gap-2">
                    @for (permiso of permisosActivos(); track permiso.idRolModulo) {
                      <div class="group flex items-center gap-2 bg-[#0D7377]/15 border border-[#0D7377]/25 text-[#FFFFE3] rounded-lg px-3 py-2 text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" /></svg>
                        {{ permiso.nombreModulo }}
                        <button
                          class="ml-1 text-[#CBCBCB]/40 hover:text-[#c47070] transition-colors"
                          (click)="confirmRevocar({ idModulo: permiso.idModulo, nombre: permiso.nombreModulo, descripcion: '', estado: true })"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-sm text-base-content/40 py-4 text-center bg-base-200/30 rounded-lg">
                    Este rol no tiene ningun permiso asignado
                  </p>
                }
              </div>

              <!-- Modulos disponibles -->
              <div>
                <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#CBCBCB]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                  Modulos disponibles ({{ modulosDisponibles().length }})
                </h4>
                @if (modulosDisponibles().length > 0) {
                  <div class="flex flex-wrap gap-2">
                    @for (modulo of modulosDisponibles(); track modulo.idModulo) {
                      <button
                        class="flex items-center gap-1.5 bg-base-200/50 border border-base-300/60 text-[#CBCBCB] rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#0D7377]/10 hover:border-[#0D7377]/30 hover:text-[#FFFFE3] transition-all duration-200"
                        (click)="asignarPermiso(modulo)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        {{ modulo.nombre }}
                      </button>
                    }
                  </div>
                } @else {
                  <p class="text-sm text-base-content/40 py-4 text-center bg-base-200/30 rounded-lg">
                    Todos los modulos estan asignados a este rol
                  </p>
                }
              </div>
            }
          </div>
        </div>
      }

      <app-confirm-dialog
        [show]="showRevocarDialog()"
        title="Revocar permiso"
        [message]="mensajeRevocar()"
        confirmText="Revocar"
        variant="error"
        (confirm)="revocarPermiso()"
        (cancel)="showRevocarDialog.set(false)"
      />
    </div>
  `,
})
export class PermisosComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  readonly roles = signal<Rol[]>([]);
  readonly modulos = signal<Modulo[]>([]);
  readonly permisos = signal<RolModulo[]>([]);
  readonly selectedRol = signal(0);
  readonly loading = signal(true);
  readonly showRevocarDialog = signal(false);
  readonly selectedModulo = signal<Modulo | null>(null);

  readonly rolesFiltrados = computed(() => {
    return this.roles()
      .filter((r) => r.estado)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  readonly permisosActivos = computed(() => this.permisos().filter((p) => p.estado));

  readonly modulosDisponibles = computed(() => this.modulos().filter((m) => !this.tienePermiso(m)));

  readonly mensajeRevocar = computed(() => {
    const modulo = this.selectedModulo();
    return `¿Estas seguro de revocar el permiso de ${modulo?.nombre}?`;
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const [rolesRes, modulosRes] = await Promise.all([
        firstValueFrom(this.adminApi.getRoles()),
        firstValueFrom(this.adminApi.getModulos()),
      ]);
      this.roles.set(rolesRes ?? []);
      this.modulos.set(modulosRes ?? []);
      if (this.roles().length > 0) {
        this.selectedRol.set(this.roles()[0].idRol);
        void this.loadPermisos();
      }
    } catch (e: unknown) {
      console.error('Error loading data', e);
    } finally {
      this.loading.set(false);
    }
  }

  async loadPermisos(): Promise<void> {
    if (!this.selectedRol()) return;
    try {
      this.permisos.set(await firstValueFrom(this.adminApi.getPermisos(this.selectedRol())));
    } catch (e: unknown) {
      console.error('Error loading permisos', e);
    }
  }

  async asignarPermiso(modulo: Modulo): Promise<void> {
    try {
      await firstValueFrom(this.adminApi.asignarPermiso({ idRol: this.selectedRol(), idModulo: modulo.idModulo }));
      void this.loadPermisos();
    } catch (e: unknown) {
      console.error('Error assigning permiso', e);
    }
  }

  selectRol(idRol: number): void {
    this.selectedRol.set(idRol);
    void this.loadPermisos();
  }

  confirmRevocar(modulo: Modulo): void {
    this.selectedModulo.set(modulo);
    this.showRevocarDialog.set(true);
  }

  async revocarPermiso(): Promise<void> {
    const modulo = this.selectedModulo();
    if (!modulo) return;
    try {
      await firstValueFrom(this.adminApi.revocarPermiso(this.selectedRol(), modulo.idModulo));
      this.showRevocarDialog.set(false);
      void this.loadPermisos();
    } catch (e: unknown) {
      console.error('Error revoking permiso', e);
    }
  }

  tienePermiso(modulo: Modulo): boolean {
    return this.permisos().some((p) => p.idModulo === modulo.idModulo && p.estado) || false;
  }
}
