import { Pipe, PipeTransform } from '@angular/core';
import { CategoriaBlog } from '../modelos/articulo-blog';

const ETIQUETAS: Record<CategoriaBlog, string> = {
  SALUD: 'Salud',
  PREVENCION: 'Prevención',
  NUTRICION: 'Nutrición',
  ESTETICA: 'Estética',
  CLINICA: 'Clínica',
};

/** Traduce la categoría interna de un artículo a una etiqueta legible. */
@Pipe({ name: 'categoriaBlog' })
export class CategoriaBlogPipe implements PipeTransform {
  transform(categoria: CategoriaBlog): string {
    return ETIQUETAS[categoria] ?? categoria;
  }
}
