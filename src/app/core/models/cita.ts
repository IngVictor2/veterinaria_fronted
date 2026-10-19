export interface Cita {
  idCita: number;
  idMascota: number;
  nombreMascota: string;
  idCliente: number;
  nombreCliente: string;
  idEmpleado: number | null;
  nombreEmpleado: string | null;
  idServicio: number;
  nombreServicio: string;
  tipoServicio: 'CONSULTA' | 'ESTETICA' | 'OTRO';
  duracionMinutos: number;
  fechaCita: string;
  horaCita: string;
  motivo: string | null;
  estadoCita: 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA';
  observaciones: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CrearCitaRequest {
  idMascota: number;
  idEmpleado?: number;
  idServicio: number;
  fechaCita: string;
  horaCita: string;
  motivo?: string;
  observaciones?: string;
}

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA';

export const DURACION_SERVICIO: Record<string, number> = {
  CONSULTA: 30,
  ESTETICA: 60,
  OTRO: 120,
};

export function getDuracionServicio(tipoServicio: string): number {
  return DURACION_SERVICIO[tipoServicio] || 60;
}

export function getHorarioLaboral(fecha: Date): { inicio: number; fin: number } {
  const esDomingo = fecha.getDay() === 0;
  return esDomingo ? { inicio: 7, fin: 13 } : { inicio: 7, fin: 18 };
}

export function formatHora(hora: string | undefined): string {
  if (!hora) return '';
  const parts = hora.split(':');
  const hour = parseInt(parts[0] || '0');
  const minute = parts[1] || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
}

export function citasOrdenadasCronologicamente(citas: Cita[]): Cita[] {
  return [...citas].sort((a, b) => {
    const fa = `${a.fechaCita}T${a.horaCita || '00:00'}`;
    const fb = `${b.fechaCita}T${b.horaCita || '00:00'}`;
    const cmp = fa.localeCompare(fb);
    if (cmp !== 0) return cmp;
    return a.idCita - b.idCita;
  });
}

export function mapaNumerosCitasPorCliente(citas: Cita[]): Record<number, number> {
  const mapa: Record<number, number> = {};
  citasOrdenadasCronologicamente(citas).forEach((c, i) => {
    mapa[c.idCita] = i + 1;
  });
  return mapa;
}
