import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ArticuloBlog } from '../../../modelos/articulo-blog';

function normalizar(texto: string): string {
  return texto
    .trim()
    .toLocaleLowerCase('es-CO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function tituloUnico(articulos: () => readonly ArticuloBlog[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const titulo = normalizar(String(control.value ?? ''));

    if (!titulo) {
      return null;
    }

    const duplicado = articulos().some((articulo) => normalizar(articulo.titulo) === titulo);

    return duplicado ? { tituloDuplicado: true } : null;
  };
}
