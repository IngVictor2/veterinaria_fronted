import { describe, expect, it } from 'vitest';
import { convertirArticulo, FormularioArticulo } from './blog-form.model';

const formulario: FormularioArticulo = {
  titulo: '  Cómo preparar el hogar para un gato mayor  ',
  autor: '  Equipo VetClinic  ',
  categoria: 'SALUD',
  resumen: '  Una guía práctica para adaptar el hogar.  ',
  contenido: 'Primer párrafo.\n\n  Segundo párrafo.  \n\n',
  minutosLectura: 5,
  etiquetas: ' Salud, prevención , SALUD ',
  destacado: false,
};

describe('conversión del formulario al modelo de datos', () => {
  it('recorta textos, separa párrafos y normaliza las etiquetas sin repetirlas', () => {
    const modelo = convertirArticulo(formulario);

    expect(modelo.titulo).toBe('Cómo preparar el hogar para un gato mayor');
    expect(modelo.autor).toBe('Equipo VetClinic');
    expect(modelo.resumen).toBe('Una guía práctica para adaptar el hogar.');
    expect(modelo.contenido).toEqual(['Primer párrafo.', 'Segundo párrafo.']);
    expect(modelo.etiquetas).toEqual(['salud', 'prevención']);
    expect(modelo.minutosLectura).toBe(5);
    expect(modelo.destacado).toBe(false);
  });

  it('exige una categoría antes de construir el modelo de datos', () => {
    expect(() => convertirArticulo({ ...formulario, categoria: '' })).toThrow(
      'La categoría es obligatoria',
    );
  });
});
