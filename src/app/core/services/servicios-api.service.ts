import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearServicioRequest, Servicio } from '../models/servicio';

@Injectable({ providedIn: 'root' })
export class ServiciosApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/servicios`;

  getAll(includeInactive = false, tipo?: string): Observable<Servicio[]> {
    const params: Record<string, string | boolean> = { includeInactive };
    if (tipo) params['tipo'] = tipo;
    return this.http.get<Servicio[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.baseUrl}/${id}`);
  }

  create(data: CrearServicioRequest): Observable<Servicio> {
    return this.http.post<Servicio>(this.baseUrl, data);
  }

  update(id: number, data: Partial<CrearServicioRequest>): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
