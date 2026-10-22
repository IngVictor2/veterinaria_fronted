export type TipoServicioPortafolio = 'CONSULTA' | 'ESTETICA' | 'PREVENCION' | 'BIENESTAR';

export type IconoServicio =
  | 'consulta'
  | 'seguimiento'
  | 'bano'
  | 'estetica'
  | 'vacuna'
  | 'desparasitacion'
  | 'procedimiento'
  | 'bienestar';

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
  { valor: 'PREVENCION', etiqueta: 'Prevención' },
  { valor: 'BIENESTAR', etiqueta: 'Bienestar' },
];
