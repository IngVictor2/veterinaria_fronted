import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearFacturaRequest, Factura } from '../models/factura';

@Injectable({ providedIn: 'root' })
export class FacturasApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/facturas`;

  getAll(includeInactive = false): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.baseUrl, { params: { includeInactive } });
  }

  getMisFacturas(params?: { page?: number; size?: number }): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.baseUrl}/mis-facturas`, {
      params: params ? { page: params.page ?? '', size: params.size ?? '' } : {},
    });
  }

  getById(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.baseUrl}/${id}`);
  }

  getByCliente(idCliente: number): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.baseUrl}/cliente/${idCliente}`);
  }

  create(data: CrearFacturaRequest): Observable<Factura> {
    return this.http.post<Factura>(this.baseUrl, data);
  }

  cambiarEstado(id: number, estado: string): Observable<Factura> {
    return this.http.patch<Factura>(`${this.baseUrl}/${id}/estado`, { estadoFactura: estado });
  }
}
