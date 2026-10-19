import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActualizarClienteRequest, Cliente, CrearClienteRequest } from '../models/cliente';

export interface ClienteProfileData {
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
}

@Injectable({ providedIn: 'root' })
export class ClientesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  getAll(includeInactive = false): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl, { params: { includeInactive } });
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  getProfile(): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/me`);
  }

  updateProfile(data: ClienteProfileData): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/me`, data);
  }

  create(data: CrearClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, data);
  }

  update(id: number, data: ActualizarClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  cambiarEstado(id: number, estado: boolean): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/${id}/estado`, { estado });
  }

  crearUsuario(id: number, data: { email: string; password: string }): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${id}/usuario`, data);
  }
}
