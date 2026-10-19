import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MetodoPago {
  idMetodoPago: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
}

@Injectable({ providedIn: 'root' })
export class MetodosPagoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/metodos-pago`;

  getAll(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(this.baseUrl);
  }
}
