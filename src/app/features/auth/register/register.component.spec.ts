import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect, it } from 'vitest';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

function setup() {
  TestBed.configureTestingModule({ providers: [
    { provide: Router, useValue: {} }, { provide: AuthService, useValue: {} },
  ] });
  const component = TestBed.runInInjectionContext(() => new RegisterComponent());
  component.primerNombre.set('Ana'); component.primerApellido.set('Ruiz');
  component.email.set('ana@example.com');
  return component;
}

it('rechaza teléfonos cortos, largos o con letras y acepta 7 y 15 dígitos', () => {
  const component = setup();
  for (const telefono of ['123456', '1234567890123456', '123456a']) {
    component.telefono.set(telefono); expect(component.validateStep(1)).toBe(false);
  }
  for (const telefono of ['1234567', '123456789012345']) {
    component.telefono.set(telefono); expect(component.validateStep(1)).toBe(true);
  }
});

it('limpia letras al escribir o pegar y limita el teléfono a 15 caracteres', () => {
  const component = setup(), input = document.createElement('input');
  input.value = 'abc1234567890123456789';
  component.onTelefonoInput({target: input} as unknown as Event);
  expect(input.value).toBe('123456789012345');
  expect(component.telefono()).toBe(input.value);
});

it('las cédulas rechazan letras y el pasaporte acepta caracteres alfanuméricos', () => {
  const component = setup();
  for (const tipo of ['CC', 'CE']) {
    component.onTipoDocumentoChange(tipo);
    component.numeroDocumento.set('AB123'); expect(component.validateStep(2)).toBe(false);
    component.numeroDocumento.set('1234567'); expect(component.validateStep(2)).toBe(true);
  }
  component.onTipoDocumentoChange('PASAPORTE');
  component.numeroDocumento.set('AB123456'); expect(component.validateStep(2)).toBe(true);
  component.numeroDocumento.set('AB-123'); expect(component.validateStep(2)).toBe(false);
  component.onTipoDocumentoChange('CC'); expect(component.numeroDocumento()).toBe('');
});
