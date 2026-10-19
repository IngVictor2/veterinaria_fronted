import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { ClientesApiService } from './clientes-api.service';
import { EmpleadosApiService } from './empleados-api.service';
import { LoginRequest, RegisterRequest, Usuario } from '../models/auth';

export interface UsuarioSesion {
  tipo?: string;
  idUsuario: number;
  nombreUsuario: string;
  correo: string;
  roles: string[];
  modulos: string[];
  nombreCompleto?: string;
}

const ALL_MODULOS = ['CLIENTES', 'MASCOTAS', 'CITAS', 'FACTURACION', 'HISTORIAL', 'USUARIOS', 'ROLES', 'TARIFAS', 'CALIFICACIONES'];

const MODULOS_POR_ROL: Record<string, string[]> = {
  ADMIN: ALL_MODULOS,
  RECEPCIONISTA: ['CLIENTES', 'MASCOTAS', 'CITAS', 'FACTURACION'],
  VETERINARIO: ['MASCOTAS', 'CITAS', 'HISTORIAL'],
  ESTILISTA: ['MASCOTAS', 'CITAS', 'HISTORIAL'],
  CLIENTE: ['MASCOTAS', 'CITAS', 'FACTURACION', 'CALIFICACIONES'],
};

function leerUsuarioDeStorage(): UsuarioSesion | null {
  try {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly empleadosApi = inject(EmpleadosApiService);
  private readonly clientesApi = inject(ClientesApiService);

  private readonly _token = signal<string | null>(localStorage.getItem('token'));
  private readonly _usuario = signal<UsuarioSesion | null>(leerUsuarioDeStorage());
  private readonly _idEmpleadoActual = signal<number | null>(null);
  private readonly _cargoEmpleadoActual = signal<string>('');
  private readonly _rolesEmpleadoActual = signal<string[]>([]);

  readonly token = this._token.asReadonly();
  readonly usuario = this._usuario.asReadonly();
  readonly idEmpleadoActual = this._idEmpleadoActual.asReadonly();
  readonly cargoEmpleadoActual = this._cargoEmpleadoActual.asReadonly();
  readonly rolesEmpleadoActual = this._rolesEmpleadoActual.asReadonly();

  readonly isAuthenticated = computed(() => !!this._token());
  readonly roles = computed(() => this._usuario()?.roles || []);
  readonly modulos = computed(() => {
    const backend = this._usuario()?.modulos;
    if (Array.isArray(backend) && backend.length > 0) return backend;
    return MODULOS_POR_ROL[this.roles()[0]] || [];
  });
  readonly nombreUsuario = computed(() => this._usuario()?.nombreUsuario || '');
  readonly nombreCompleto = computed(() => this._usuario()?.nombreCompleto || this._usuario()?.nombreUsuario || '');
  readonly esProfesional = computed(() => this.hasAnyRole('VETERINARIO', 'ESTILISTA'));

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(...rolesToCheck: string[]): boolean {
    return rolesToCheck.some((r) => this.roles().includes(r));
  }

  hasModule(modulo: string): boolean {
    return this.modulos().includes(modulo);
  }

  hasAnyModule(...modulosToCheck: string[]): boolean {
    return modulosToCheck.some((m) => this.modulos().includes(m));
  }

  async fetchProfile(): Promise<void> {
    try {
      const c = await firstValueFrom(this.clientesApi.getProfile());
      const fullName = [c.primerNombre, c.segundoNombre, c.primerApellido, c.segundoApellido]
        .filter(Boolean)
        .join(' ');
      const usuario = this._usuario();
      if (fullName && usuario) {
        const actualizado = { ...usuario, nombreCompleto: fullName };
        this._usuario.set(actualizado);
        localStorage.setItem('usuario', JSON.stringify(actualizado));
      }
    } catch {
      // No es cliente, no se puede obtener el nombre completo
    }
  }

  async cargarEmpleadoActual(): Promise<void> {
    if (this._idEmpleadoActual()) return;
    const correo = this._usuario()?.correo;
    if (!correo) return;
    try {
      const empleados = await firstValueFrom(this.empleadosApi.getAll());
      const emp = (empleados || []).find((e) => e.correo?.toLowerCase() === correo.toLowerCase());
      if (emp) {
        this._idEmpleadoActual.set(emp.idEmpleado);
        this._cargoEmpleadoActual.set(emp.nombreCargo || '');
        this._rolesEmpleadoActual.set(emp.roles || []);
      }
    } catch {
      // no se pudo identificar al empleado
    }
  }

  limpiarEmpleadoActual(): void {
    this._idEmpleadoActual.set(null);
    this._cargoEmpleadoActual.set('');
    this._rolesEmpleadoActual.set([]);
  }

  async login(data: LoginRequest): Promise<void> {
    const response = await firstValueFrom(this.authApi.login(data));
    const { token: newToken, ...userData } = response;
    this._token.set(newToken);
    this._usuario.set(userData as UsuarioSesion);
    localStorage.setItem('token', newToken);
    localStorage.setItem('usuario', JSON.stringify(userData));
    await this.fetchProfile();
  }

  async register(data: RegisterRequest): Promise<void> {
    await firstValueFrom(this.authApi.register(data));
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.authApi.logout());
    } catch {
      // ignore error
    } finally {
      this._token.set(null);
      this._usuario.set(null);
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      this.limpiarEmpleadoActual();
    }
  }

  /** Compatibilidad: tipo Usuario completo usado por algunas vistas. */
  usuarioComoUsuario(): Usuario | null {
    const u = this._usuario();
    return u ? { ...u, roles: u.roles, modulos: u.modulos } : null;
  }
}
