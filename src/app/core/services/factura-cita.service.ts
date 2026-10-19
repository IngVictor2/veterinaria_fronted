import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CitasApiService } from '../services/citas-api.service';
import { FacturasApiService } from '../services/facturas-api.service';
import { Factura } from '../models/factura';

const FACTURA_KEY = (idCita: number) => `cita_factura_${idCita}`;

@Injectable({ providedIn: 'root' })
export class FacturaCitaService {
  private readonly citasApi = inject(CitasApiService);
  private readonly facturasApi = inject(FacturasApiService);

  async vincularFacturaDeCita(idCita: number): Promise<Factura | null> {
    try {
      const cita = await firstValueFrom(this.citasApi.getById(idCita));
      const lista = (await firstValueFrom(this.facturasApi.getByCliente(cita.idCliente))) || [];
      const pendienteMatching =
        lista.find(
          (f) =>
            f.estadoFactura === 'PENDIENTE' &&
            (f.items || []).some((i) => i.idServicio === cita.idServicio),
        ) || lista.find((f) => f.estadoFactura === 'PENDIENTE');
      if (pendienteMatching) {
        localStorage.setItem(FACTURA_KEY(idCita), String(pendienteMatching.idFactura));
        return pendienteMatching;
      }
      return null;
    } catch {
      return null;
    }
  }

  getFacturaIdDeCita(idCita: number): number | null {
    const raw = localStorage.getItem(FACTURA_KEY(idCita));
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  guardarFacturaIdDeCita(idCita: number, idFactura: number): void {
    localStorage.setItem(FACTURA_KEY(idCita), String(idFactura));
  }
}
