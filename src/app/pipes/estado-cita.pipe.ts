import { Pipe, PipeTransform } from '@angular/core';
import { EstadoCitaDemo } from '../modelos/cita-demo';

const ETIQUETAS: Record<EstadoCitaDemo, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  ATENDIDA: 'Atendida',
  CANCELADA: 'Cancelada',
};

/** Traduce el estado interno de una cita a una etiqueta legible. */
@Pipe({ name: 'estadoCita' })
export class EstadoCitaPipe implements PipeTransform {
  transform(estado: EstadoCitaDemo): string {
    return ETIQUETAS[estado];
  }
}
