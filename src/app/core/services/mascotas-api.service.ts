import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearMascotaRequest, Mascota } from '../models/mascota';

@Injectable({ providedIn: 'root' })
export class MascotasApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/mascotas`;

  getAll(includeInactive = false): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(this.baseUrl, { params: { includeInactive } });
  }

  getMisMascotas(params?: { page?: number; size?: number }): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(`${this.baseUrl}/mis-mascotas`, {
      params: params ? { page: params.page ?? '', size: params.size ?? '' } : {},
    });
  }

  getById(id: number): Observable<Mascota> {
    return this.http.get<Mascota>(`${this.baseUrl}/${id}`);
  }

  getByCliente(idCliente: number): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(`${this.baseUrl}/cliente/${idCliente}`);
  }

  create(data: CrearMascotaRequest): Observable<Mascota> {
    return this.http.post<Mascota>(this.baseUrl, data);
  }

  update(id: number, data: Partial<CrearMascotaRequest>): Observable<Mascota> {
    return this.http.put<Mascota>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
