import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';
import { RegisterRequest } from '../../../core/models/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div>
      <!-- Title -->
      <div class="text-center mb-6 form-field">
        <h2 class="text-xl sm:text-2xl font-extrabold text-[#FFFFE3]">Crear tu cuenta</h2>
        <p class="text-sm text-[#CBCBCB] mt-2">Únete a nuestra comunidad de mascotas</p>
      </div>

      <!-- Step indicator -->
      <div class="flex justify-center gap-2 mb-6 form-field">
        @for (s of [1, 2, 3]; track s) {
          <div
            class="step-dot h-2 rounded-full transition-all duration-500"
            [class]="s <= step() ? 'bg-[#1A8A8E] w-8' : 'bg-[#4A4A4A] w-2'"
          ></div>
        }
      </div>

      @if (stepErrors()[step()]) {
        <div class="text-center mb-2">
          <span class="text-xs text-red-400">{{ stepErrors()[step()] }}</span>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="alert alert-error mb-4 animate-shake">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm">{{ error() }}</span>
        </div>
      }

      <form (ngSubmit)="handleRegister()">
        <div class="steps-container">
          <!-- Step 1: Personal Info -->
          <div class="step-content" [class.active]="step() === 1">
            <div class="text-center mb-4">
              <span class="badge badge-outline gap-1 border-[#4A4A4A] bg-[#353535]/50 text-[#CBCBCB]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Datos personales
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Primer nombre *</span></label>
                <input name="primerNombre" type="text" placeholder="Primer nombre" class="input input-bordered input-sm w-full input-animated" required [ngModel]="primerNombre()" (ngModelChange)="primerNombre.set($event)" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Segundo nombre</span></label>
                <input name="segundoNombre" type="text" placeholder="Segundo nombre" class="input input-bordered input-sm w-full input-animated" [ngModel]="segundoNombre()" (ngModelChange)="segundoNombre.set($event)" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Primer apellido *</span></label>
                <input name="primerApellido" type="text" placeholder="Primer apellido" class="input input-bordered input-sm w-full input-animated" required [ngModel]="primerApellido()" (ngModelChange)="primerApellido.set($event)" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Segundo apellido</span></label>
                <input name="segundoApellido" type="text" placeholder="Segundo apellido" class="input input-bordered input-sm w-full input-animated" [ngModel]="segundoApellido()" (ngModelChange)="segundoApellido.set($event)" />
              </div>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Teléfono *</span></label>
              <input name="telefono" type="tel" placeholder="Número de telefono" class="input input-bordered input-sm w-full input-animated" required [ngModel]="telefono()" (ngModelChange)="telefono.set($event)" />
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Dirección</span></label>
              <input name="direccion" type="text" placeholder="Dirección de residencia" class="input input-bordered input-sm w-full input-animated" [ngModel]="direccion()" (ngModelChange)="direccion.set($event)" />
            </div>

            <div class="step-buttons">
              <button type="button" class="btn w-full h-11 btn-ripple rounded-xl font-bold text-sm bg-[#0D7377] hover:bg-[#1A8A8E] border-none text-white" (click)="nextStep()">
                Siguiente
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Step 2: Document & Email -->
          <div class="step-content" [class.active]="step() === 2">
            <div class="text-center mb-4">
              <span class="badge badge-outline gap-1 border-[#4A4A4A] bg-[#353535]/50 text-[#CBCBCB]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documento y contacto
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Tipo documento *</span></label>
                <select name="tipoDocumento" class="select select-bordered select-sm w-full input-animated" [ngModel]="tipoDocumento()" (ngModelChange)="tipoDocumento.set($event)">
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Número *</span></label>
                <input name="numeroDocumento" type="text" placeholder="Número de documento" class="input input-bordered input-sm w-full input-animated" required [ngModel]="numeroDocumento()" (ngModelChange)="numeroDocumento.set($event)" />
              </div>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Correo electrónico *</span></label>
              <div class="relative">
                <input name="email" type="email" placeholder="Correo electrónico" class="input input-bordered input-sm w-full pl-11 input-animated" required [ngModel]="email()" (ngModelChange)="email.set($event)" (blur)="normalizeEmail()" />
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="step-buttons flex gap-3">
              <button type="button" class="btn btn-outline flex-1 h-11 rounded-xl font-bold text-sm border-[#4A4A4A] text-[#CBCBCB] hover:bg-[#3a3a3a] hover:border-[#5a5a5a]" (click)="prevStep()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Atrás
              </button>
              <button type="button" class="btn flex-1 h-11 btn-ripple rounded-xl font-bold text-sm bg-[#0D7377] hover:bg-[#1A8A8E] border-none text-white" (click)="nextStep()">
                Siguiente
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Step 3: Password -->
          <div class="step-content" [class.active]="step() === 3">
            <div class="text-center mb-4">
              <span class="badge badge-outline gap-1 border-[#4A4A4A] bg-[#353535]/50 text-[#CBCBCB]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Crear contrasena
              </span>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Contraseña *</span></label>
              <div class="relative">
                <input
                  name="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  placeholder="Mínimo 8 caracteres"
                  class="input input-bordered input-sm w-full pl-11 pr-11 input-animated"
                  minlength="8"
                  required
                  [ngModel]="password()"
                  (ngModelChange)="password.set($event)"
                />
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#1A8A8E] transition-colors" (click)="showPassword.set(!showPassword())">
                  @if (!showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  }
                </button>
              </div>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text font-semibold text-xs text-[#CBCBCB]">Confirmar contraseña *</span></label>
              <div class="relative">
                <input
                  name="confirmPassword"
                  [type]="showPassword() ? 'text' : 'password'"
                  placeholder="Repetir contraseña"
                  class="input input-bordered input-sm w-full pl-11 pr-11 input-animated"
                  required
                  [ngModel]="confirmPassword()"
                  (ngModelChange)="confirmPassword.set($event)"
                />
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#1A8A8E] transition-colors" (click)="showPassword.set(!showPassword())">
                  @if (!showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  }
                </button>
              </div>
              @if (confirmPassword() && password() !== confirmPassword()) {
                <label class="label">
                  <span class="label-text-alt text-red-400 text-xs">Las contraseñas no coinciden</span>
                </label>
              }
            </div>

            <div class="step-buttons flex gap-3">
              <button type="button" class="btn btn-outline flex-1 h-11 rounded-xl font-bold text-sm border-[#4A4A4A] text-[#CBCBCB] hover:bg-[#3a3a3a] hover:border-[#5a5a5a]" (click)="prevStep()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Atrás
              </button>
              <button
                type="submit"
                class="btn flex-1 h-11 btn-ripple rounded-xl font-bold text-sm bg-[#0D7377] hover:bg-[#1A8A8E] border-none text-white"
                [disabled]="loading() || (password() !== confirmPassword())"
              >
                @if (loading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                } @else {
                  <span>Crear cuenta</span>
                }
              </button>
            </div>
          </div>
        </div>
      </form>

      <!-- Login link -->
      <div class="text-center mt-6 form-field">
        <p class="text-sm text-[#CBCBCB]">
          Ya tienes una cuenta?
          <a routerLink="/login" class="font-bold text-[#0D7377] hover:text-[#1A8A8E] ml-1">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  `,
  styles: `
    .steps-container {
      display: grid;
      grid-template-areas: "content";
    }

    .step-content {
      grid-area: content;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }

    .step-content.active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .step-buttons {
      padding-top: 0.5rem;
    }

    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
  `,
})
export class RegisterComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly totalSteps = 3;

  readonly step = signal(1);
  readonly tipoDocumento = signal('CC');
  readonly numeroDocumento = signal('');
  readonly primerNombre = signal('');
  readonly segundoNombre = signal('');
  readonly primerApellido = signal('');
  readonly segundoApellido = signal('');
  readonly telefono = signal('');
  readonly direccion = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');

  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);
  readonly stepErrors = signal<Record<number, string>>({});

  normalizeEmail(): void {
    this.email.set(this.email().trim().toLowerCase());
  }

  validateStep(stepNum: number): boolean {
    this.stepErrors.update((errors) => ({ ...errors, [stepNum]: '' }));
    if (stepNum === 1) {
      if (!this.primerNombre().trim()) {
        this.stepErrors.update((errors) => ({ ...errors, 1: 'El primer nombre es obligatorio' }));
        return false;
      }
      if (!this.primerApellido().trim()) {
        this.stepErrors.update((errors) => ({ ...errors, 1: 'El primer apellido es obligatorio' }));
        return false;
      }
      if (!this.telefono().trim()) {
        this.stepErrors.update((errors) => ({ ...errors, 1: 'El teléfono es obligatorio' }));
        return false;
      }
      return true;
    }
    if (stepNum === 2) {
      if (!this.numeroDocumento().trim()) {
        this.stepErrors.update((errors) => ({ ...errors, 2: 'El número de documento es obligatorio' }));
        return false;
      }
      if (!this.email().trim()) {
        this.stepErrors.update((errors) => ({ ...errors, 2: 'El correo electrónico es obligatorio' }));
        return false;
      }
      return true;
    }
    return true;
  }

  nextStep(): void {
    if (this.validateStep(this.step()) && this.step() < this.totalSteps) {
      this.step.update((s) => s + 1);
    }
  }

  prevStep(): void {
    if (this.step() > 1) {
      this.step.update((s) => s - 1);
    }
  }

  async handleRegister(): Promise<void> {
    this.normalizeEmail();
    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    try {
      const data: RegisterRequest & { direccion?: string } = {
        tipoDocumento: this.tipoDocumento(),
        numeroDocumento: this.numeroDocumento(),
        primerNombre: this.primerNombre(),
        primerApellido: this.primerApellido(),
        email: this.email(),
        password: this.password(),
      };
      if (this.segundoNombre()) data.segundoNombre = this.segundoNombre();
      if (this.segundoApellido()) data.segundoApellido = this.segundoApellido();
      data.telefono = this.telefono().trim();
      if (this.direccion()) data.direccion = this.direccion();
      await this.auth.register(data);
      this.router.navigateByUrl('/login');
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al registrarse'));
    } finally {
      this.loading.set(false);
    }
  }
}
