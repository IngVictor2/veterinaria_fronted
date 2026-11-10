import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  const register = vi.fn();

  beforeEach(() => {
    register.mockReset().mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: { register } }],
    });
  });

  function setup() {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  function fillPersonalData(component: RegisterComponent) {
    component.primerNombre.set('Ana');
    component.primerApellido.set('Pérez');
    component.telefono.set('3001234567');
  }

  it('renders only the active step and preserves data when returning', () => {
    const { fixture, component } = setup();
    fillPersonalData(component);
    component.nextStep();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.step-content')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('[name="primerNombre"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[name="email"]')).not.toBeNull();
    component.prevStep();
    fixture.detectChanges();
    expect(component.primerNombre()).toBe('Ana');
    expect(fixture.nativeElement.querySelector('[name="email"]')).toBeNull();
  });

  it('advances on form submission without registering before the last step', async () => {
    const { fixture, component } = setup();
    fillPersonalData(component);
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(component.step()).toBe(2);
    expect(register).not.toHaveBeenCalled();
  });

  it('recreates the error alert so repeated invalid attempts replay the animation', () => {
    const { fixture, component } = setup();
    component.nextStep();
    fixture.detectChanges();
    const firstAlert = fixture.nativeElement.querySelector('[role="alert"]');
    component.nextStep();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBe(firstAlert);
    expect(component.step()).toBe(1);
  });

  it('rejects invalid email and short or mismatched passwords', async () => {
    const { component } = setup();
    fillPersonalData(component);
    component.numeroDocumento.set('123456');
    component.email.set('correo-invalido');
    expect(component.validateStep(2)).toBe(false);
    component.email.set(' ANA@EXAMPLE.COM ');
    expect(component.validateStep(2)).toBe(true);
    expect(component.email()).toBe('ana@example.com');
    component.password.set('123');
    component.confirmPassword.set('123');
    await component.handleRegister();
    expect(component.step()).toBe(3);
    expect(register).not.toHaveBeenCalled();
    component.password.set('12345678');
    expect(component.validateStep(3)).toBe(false);
  });

  it('does not hide the confirmation when toggling the first password', () => {
    const { fixture, component } = setup();
    component.step.set(3);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button[aria-label="Mostrar contraseña"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[name="password"]').type).toBe('text');
    expect(fixture.nativeElement.querySelector('[name="confirmPassword"]').type).toBe('password');
  });
});
