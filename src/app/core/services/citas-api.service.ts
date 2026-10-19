import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cita, CrearCitaRequest } from '../models/cita';

export interface RegistroConsultaRequest {
  idCita: number;
  peso?: number;
  temperatura?: number;
  sintomas: string;
  diagnosticoGeneral?: string;
  tratamientoIndicado?: string;
  observaciones?: string;
}

export interface RegistroEsteticaRequest {
  idCita: number;
  detalles?: string;
  observaciones?: string;
}

@Injectable({ providedIn: 'root' })
export class CitasApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/citas`;

  getAll(includeInactive = false): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.baseUrl, { params: { includeInactive } });
  }

  getMisCitas(params?: { page?: number; size?: number }): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.baseUrl}/mis-citas`, {
      params: params ? { page: params.page ?? '', size: params.size ?? '' } : {},
    });
  }

  getById(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.baseUrl}/${id}`);
  }

  getByCliente(idCliente: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.baseUrl}/cliente/${idCliente}`);
  }

  getByMascota(idMascota: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.baseUrl}/mascota/${idMascota}`);
  }

  getByEmpleado(idEmpleado: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.baseUrl}/empleado/${idEmpleado}`);
  }

  create(data: CrearCitaRequest): Observable<Cita> {
    return this.http.post<Cita>(this.baseUrl, data);
  }

  update(id: number, data: Partial<CrearCitaRequest>): Observable<Cita> {
    return this.http.put<Cita>(`${this.baseUrl}/${id}`, data);
  }

  confirmar(id: number, data: CrearCitaRequest): Observable<Cita> {
    return this.http.post<Cita>(`${this.baseUrl}/${id}/confirmar`, data);
  }

  cambiarEstado(id: number, estado: string): Observable<Cita> {
    return this.http.patch<Cita>(`${this.baseUrl}/${id}/estado`, { estadoCita: estado });
  }

  cancelar(id: number): Observable<Cita> {
    return this.http.post<Cita>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  getDisponibilidad(fecha: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.baseUrl}/disponibilidad/${fecha}`);
  }

  registrarConsulta(data: RegistroConsultaRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/consulta`, data);
  }

  registrarEstetica(data: RegistroEsteticaRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/estetica`, data);
  }
}
