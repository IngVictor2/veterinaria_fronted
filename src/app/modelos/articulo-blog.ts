export type CategoriaBlog = 'SALUD' | 'PREVENCION' | 'NUTRICION' | 'ESTETICA' | 'CLINICA';

export interface ArticuloBlog {
  id: number;
  titulo: string;
  resumen: string;
  /** Párrafos del artículo; se recorren con @for en el detalle. */
  contenido: string[];
  categoria: CategoriaBlog;
  autor: string;
  /** Fecha de publicación en formato ISO (YYYY-MM-DD). */
  fecha: string;
  minutosLectura: number;
  etiquetas: string[];
  destacado: boolean;
}

export const CATEGORIAS_BLOG: ReadonlyArray<{
  valor: CategoriaBlog | 'TODAS';
  etiqueta: string;
}> = [
  { valor: 'TODAS', etiqueta: 'Todas' },
  { valor: 'SALUD', etiqueta: 'Salud' },
  { valor: 'PREVENCION', etiqueta: 'Prevención' },
  { valor: 'NUTRICION', etiqueta: 'Nutrición' },
  { valor: 'ESTETICA', etiqueta: 'Estética' },
  { valor: 'CLINICA', etiqueta: 'Clínica' },
];
