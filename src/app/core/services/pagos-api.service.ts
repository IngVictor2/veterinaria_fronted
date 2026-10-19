import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearPagoRequest, Pago } from '../models/pago';

@Injectable({ providedIn: 'root' })
export class PagosApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pagos`;

  getAll(includeInactive = false): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.baseUrl, { params: { includeInactive } });
  }

  getByFactura(idFactura: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.baseUrl}/factura/${idFactura}`);
  }

  create(data: CrearPagoRequest): Observable<Pago> {
    return this.http.post<Pago>(this.baseUrl, data);
  }
}
