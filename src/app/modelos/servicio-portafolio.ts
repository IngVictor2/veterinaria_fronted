export type TipoServicioPortafolio = 'CONSULTA' | 'ESTETICA';

export type IconoServicio =
  | 'consulta'
  | 'especializada'
  | 'vacunacion'
  | 'avanzada'
  | 'bano-medicado'
  | 'corte'
  | 'dental';

export interface ServicioPortafolio {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: TipoServicioPortafolio;
  icono: IconoServicio;
  /** Precio base en pesos colombianos. */
  precioDesde: number;
  duracion: string;
  incluye: string[];
}

export const TIPOS_PORTAFOLIO: ReadonlyArray<{
  valor: TipoServicioPortafolio | 'TODOS';
  etiqueta: string;
}> = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'CONSULTA', etiqueta: 'Consulta' },
  { valor: 'ESTETICA', etiqueta: 'Estética' },
];
