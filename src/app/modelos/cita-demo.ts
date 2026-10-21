export type EstadoCitaDemo = 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA';

export interface CitaDemo {
  id: number;
  mascota: string;
  especie: string;
  propietario: string;
  servicio: string;
  /** Fecha y hora local en formato ISO (YYYY-MM-DDTHH:mm:ss). */
  fechaHora: string;
  precio: number;
  estado: EstadoCitaDemo;
}
