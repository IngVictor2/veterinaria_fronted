import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearEmpleadoRequest, Empleado } from '../models/empleado';

@Injectable({ providedIn: 'root' })
export class EmpleadosApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/empleados`;

  getAll(includeInactive = false): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.baseUrl, { params: { includeInactive } });
  }

  getById(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.baseUrl}/${id}`);
  }

  create(data: CrearEmpleadoRequest): Observable<Empleado> {
    return this.http.post<Empleado>(this.baseUrl, data);
  }

  update(id: number, data: Partial<CrearEmpleadoRequest>): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  cambiarEstado(id: number, estado: boolean): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/${id}/estado`, { estado });
  }
}
