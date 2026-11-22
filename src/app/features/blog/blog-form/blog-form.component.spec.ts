import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { BlogFormComponent } from './blog-form.component';

registerLocaleData(localeEsCO, 'es-CO');

const valoresValidos = {
  titulo: 'Cómo cuidar a un gato senior en casa',
  autor: 'Equipo VetClinic',
  categoria: 'SALUD' as const,
  resumen: 'Una guía práctica con recomendaciones para el cuidado diario de un gato mayor.',
  contenido:
    'Primer párrafo con recomendaciones de alimentación y descanso. Repite una rutina tranquila y observa los cambios de comportamiento. '.repeat(
      3,
    ),
  minutosLectura: 5,
  etiquetas: 'gatos, cuidado',
  destacado: false,
};

function setup() {
  TestBed.configureTestingModule({
    imports: [BlogFormComponent],
    providers: [provideRouter([])],
  });
  const fixture = TestBed.createComponent(BlogFormComponent);
  fixture.detectChanges();
  return fixture;
}

describe('formulario reactivo de alta del blog', () => {
  it('inicia inválido y deshabilita el envío', () => {
    const fixture = setup();
    const boton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(fixture.componentInstance.formulario.invalid).toBe(true);
    expect(boton.disabled).toBe(true);
  });

  it('habilita el envío cuando todos los campos son válidos', () => {
    const fixture = setup();
    fixture.componentInstance.formulario.setValue(valoresValidos);
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(fixture.componentInstance.formulario.valid).toBe(true);
    expect(boton.disabled).toBe(false);
  });

  it('muestra el error de un campo solo después de tocarlo o modificarlo', () => {
    const componente = setup().componentInstance;
    const titulo = componente.formulario.controls.titulo;

    expect(componente.mensajeError('titulo')).toBe('');

    titulo.markAsTouched();
    expect(componente.mensajeError('titulo')).toBe('Este campo es obligatorio.');

    titulo.setValue('Un título válido para el artículo');
    expect(componente.mensajeError('titulo')).toBe('');
  });

  it('aplica el validador propio y quita el error al corregir el título', () => {
    const componente = setup().componentInstance;
    const titulo = componente.formulario.controls.titulo;

    titulo.setValue('Cómo preparar a tu mascota para su primera consulta');
    titulo.markAsDirty();
    expect(titulo.hasError('tituloDuplicado')).toBe(true);
    expect(componente.mensajeError('titulo')).toBe('Ya existe un artículo con este título.');

    titulo.setValue('Cómo preparar a tu mascota para su primera consulta en casa');
    expect(titulo.hasError('tituloDuplicado')).toBe(false);
    expect(componente.mensajeError('titulo')).toBe('');
  });

  it('aplica el mínimo numérico y lo libera al llegar al límite', () => {
    const componente = setup().componentInstance;
    const minutos = componente.formulario.controls.minutosLectura;

    minutos.setValue(0);
    minutos.markAsDirty();
    expect(minutos.hasError('min')).toBe(true);
    expect(componente.mensajeError('minutosLectura')).toBe('El valor mínimo es 1.');

    minutos.setValue(1);
    expect(minutos.hasError('min')).toBe(false);
    expect(componente.mensajeError('minutosLectura')).toBe('');
  });
});
