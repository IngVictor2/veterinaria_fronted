import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { ArticuloBlog } from '../../../modelos/articulo-blog';
import { tituloUnico } from './titulo-unico.validator';

const articulos = [
  { titulo: 'Cómo preparar a tu mascota para su primera consulta' },
  { titulo: 'Calendario de vacunación para perros y gatos' },
] as ArticuloBlog[];

const validador = tituloUnico(() => articulos);

describe('validador propio de título único', () => {
  it('marca un título repetido sin importar mayúsculas, tildes ni espacios', () => {
    const control = new FormControl('  CÓMO PREPARAR A TU MASCOTA PARA SU PRIMERA CONSULTA  ');

    expect(validador(control)).toEqual({ tituloDuplicado: true });
  });

  it('acepta un título distinto y un valor vacío', () => {
    expect(validador(new FormControl('Cómo elegir un juguete seguro'))).toBeNull();
    expect(validador(new FormControl(''))).toBeNull();
  });

  it('vuelve a validar cuando cambia el valor del control', () => {
    const control = new FormControl('Calendario de vacunación para perros y gatos');
    expect(validador(control)).toEqual({ tituloDuplicado: true });

    control.setValue('Calendario de vacunación para conejos');
    expect(validador(control)).toBeNull();
  });
});
