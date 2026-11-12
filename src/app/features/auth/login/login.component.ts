import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div>
      <div class="text-center mb-8 form-field">
        <h2 class="text-xl sm:text-2xl font-extrabold text-[#374151]">Bienvenido de vuelta</h2>
        <p class="text-sm text-[#374151] mt-2">Ingresa tus credenciales para continuar</p>
      </div>

      @if (error()) {
        <div class="alert alert-error mb-6 animate-shake" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm">{{ error() }}</span>
        </div>
      }

      <form (ngSubmit)="handleLogin()" class="space-y-5">
        <div class="form-field form-control">
          <label class="label">
            <span class="label-text font-semibold text-sm text-[#374151]">Correo electrónico</span>
          </label>
          <div class="relative">
            <input
              name="correo"
              type="email"
              placeholder="Tu correo electrónico"
              class="input input-bordered w-full pl-11 input-animated"
              required
              [ngModel]="correo()"
              (ngModelChange)="correo.set($event)"
              (focus)="focusedField.set('user')"
              (blur)="normalizeCorreo(); focusedField.set('')"
            />
            <div
              class="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300"
              [class]="focusedField() === 'user' ? 'text-[#9D343C]' : 'text-[#9a9a9a]'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="form-field form-control">
          <label class="label">
            <span class="label-text font-semibold text-sm text-[#374151]">Contraseña</span>
          </label>
          <div class="relative">
            <input
              name="password"
              [type]="showPassword() ? 'text' : 'password'"
              placeholder="Tu contraseña"
              class="input input-bordered w-full pl-11 pr-11 input-animated"
              required
              [ngModel]="password()"
              (ngModelChange)="password.set($event)"
              (focus)="focusedField.set('pass')"
              (blur)="focusedField.set('')"
            />
            <div
              class="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300"
              [class]="focusedField() === 'pass' ? 'text-[#9D343C]' : 'text-[#9a9a9a]'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#7D2931] transition-colors"
              (click)="showPassword.set(!showPassword())"
            >
              @if (!showPassword()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              }
            </button>
          </div>
        </div>

        <div class="form-field">
          <button
            type="submit"
            class="btn btn-primary w-full h-12 text-sm font-bold tracking-wide btn-ripple rounded-xl bg-[#9D343C] hover:bg-[#7D2931] border-none text-white"
            [disabled]="loading()"
          >
            @if (loading()) {
              <span class="loading loading-spinner loading-sm"></span>
            } @else {
              <span>Iniciar Sesión</span>
            }
          </button>
        </div>
      </form>

      <div class="mt-4 form-field">
        <a
          routerLink="/"
          class="btn btn-outline w-full h-11 rounded-xl border-[#9D343C]/50 text-[#9D343C] hover:border-[#9D343C] hover:bg-[#9D343C]/15 hover:text-[#374151] font-semibold text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5"
            />
          </svg>
          Volver al inicio
        </a>
      </div>

      <div class="mt-6 text-center form-field">
        <p class="text-sm text-[#374151]">
          No tienes una cuenta?
          <a routerLink="/register" class="font-bold text-[#9D343C] hover:text-[#7D2931] ml-1">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  `,
  styles: `
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
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly correo = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);
  readonly focusedField = signal('');

  normalizeCorreo(): void {
    this.correo.set(this.correo().trim().toLowerCase());
  }

  async handleLogin(): Promise<void> {
    if (this.loading()) return;
    this.normalizeCorreo();
    this.error.set('');
    if (!this.correo() && !this.password().trim()) {
      this.error.set('Escribe tu correo electrónico y tu contraseña para iniciar sesión.');
      return;
    }
    if (!this.correo()) {
      this.error.set('Escribe tu correo electrónico para continuar.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo())) {
      this.error.set('Revisa tu correo electrónico. Debe tener un formato como nombre@correo.com.');
      return;
    }
    if (!this.password().trim()) {
      this.error.set('Escribe tu contraseña para continuar.');
      return;
    }
    this.loading.set(true);
    try {
      await this.auth.login({ correo: this.correo(), password: this.password() });
      this.router.navigateByUrl('/dashboard');
    } catch (e: unknown) {
      const status = e instanceof HttpErrorResponse ? e.status : null;
      this.error.set(
        status === 400 || status === 401
          ? 'El correo o la contraseña no son correctos. Revisa tus datos e inténtalo de nuevo.'
          : status === 403
            ? 'No pudimos acceder a tu cuenta. Comunícate con recepción para recibir ayuda.'
            : status === 429
              ? 'Has realizado varios intentos. Espera unos minutos antes de volver a iniciar sesión.'
              : 'No pudimos conectar con el servicio. Inténtalo de nuevo en unos momentos.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
