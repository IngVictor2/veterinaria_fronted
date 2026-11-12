import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-animated flex items-center justify-center p-4 relative overflow-hidden"
      [style.background-color]="esLogin() ? '#E7E1D8' : null">

      <div class="w-full max-w-md relative z-10">
        <div class="text-center mb-8 animate-slide-up">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg shadow-[#9D343C]/25 mb-4 logo-hover">
            <img src="/logo.svg" alt="VetClinic" class="w-20 h-20 rounded-full" />
          </div>
          <h1 class="text-3xl font-extrabold gradient-text">VetClinic</h1>
        </div>

        <div class="auth-card rounded-3xl animate-scale-in" [style.background-color]="esLogin() ? '#FFFFFF' : null">
          <div class="card-body p-8">
            <router-outlet />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {
  private readonly router = inject(Router);

  esLogin(): boolean {
    return this.router.url.split(/[?#]/)[0] === '/login';
  }
}
