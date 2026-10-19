import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AsignarPermisoRequest,
  AsignarRolUsuarioRequest,
  CrearRolRequest,
  Modulo,
  Rol,
  RolModulo,
  Usuario,
} from '../models/admin';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;

  getRoles(includeInactive = false): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/admin/roles`, { params: { includeInactive } });
  }

  createRol(data: CrearRolRequest): Observable<Rol> {
    return this.http.post<Rol>(`${this.baseUrl}/admin/roles`, data);
  }

  updateRol(id: number, data: CrearRolRequest): Observable<Rol> {
    return this.http.put<Rol>(`${this.baseUrl}/admin/roles/${id}`, data);
  }

  deleteRol(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/admin/roles/${id}`);
  }

  getPermisos(idRol: number): Observable<RolModulo[]> {
    return this.http.get<RolModulo[]>(`${this.baseUrl}/admin/permisos/rol/${idRol}`);
  }

  asignarPermiso(data: AsignarPermisoRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/admin/permisos`, data);
  }

  revocarPermiso(idRol: number, idModulo: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/admin/permisos/${idRol}/${idModulo}`);
  }

  getUsuarioRoles(idUsuario: number): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/admin/usuario-roles/usuario/${idUsuario}`);
  }

  asignarRolUsuario(data: AsignarRolUsuarioRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/admin/usuario-roles`, data);
  }

  revocarRolUsuario(idUsuario: number, idRol: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/admin/usuario-roles/${idUsuario}/${idRol}`);
  }

  getCargos(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/cargos`);
  }

  getMetodosPago(): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/metodos-pago`);
  }

  getModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.baseUrl}/modulos`);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/admin/usuarios`);
  }

  restablecerPassword(idUsuario: number, nuevaPassword: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/admin/usuarios/${idUsuario}/password`, { nuevaPassword });
  }
}
