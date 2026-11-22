import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { BlogDetailComponent } from './blog-detail.component';

registerLocaleData(localeEsCO, 'es-CO');

function setup(id: string) {
  TestBed.configureTestingModule({
    imports: [BlogDetailComponent],
    providers: [provideRouter([])],
  });
  const fixture = TestBed.createComponent(BlogDetailComponent);
  fixture.componentRef.setInput('id', id);
  fixture.detectChanges();
  return fixture;
}

describe('detalle de artículo por parámetro', () => {
  it('muestra el artículo cuando el identificador existe', () => {
    const fixture = setup('1');

    expect(fixture.nativeElement.textContent).toContain(
      'Cómo preparar a tu mascota para su primera consulta',
    );
  });

  it('muestra un mensaje cuando el identificador no existe', () => {
    const fixture = setup('99999');

    expect(fixture.nativeElement.textContent).toContain('No encontramos el artículo #99999');
    expect(fixture.nativeElement.textContent).toContain('Ver todos los artículos');
  });
});
