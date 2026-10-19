export interface Servicio {
  idServicio: number;
  nombre: string;
  descripcion: string | null;
  tipoServicio: string;
  precio: number;
  estado: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CrearServicioRequest {
  nombre: string;
  descripcion?: string;
  tipoServicio: string;
  precio: number;
}

export type TipoServicio = 'CONSULTA' | 'ESTETICA' | 'OTRO';
