import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Historial {
  idHistorial: number;
  idMascota: number;
  nombreMascota: string;
  idCita: number;
  tipoHistorial: 'MEDICO' | 'ESTETICA';
  resumen: string;
  fechaRegistro: string;
  createdAt: string | null;
  updatedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class HistorialApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/historial`;

  getByMascota(idMascota: number): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.baseUrl}/mascota/${idMascota}`);
  }
}
