import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-animated flex items-center justify-center p-4 relative overflow-hidden">
      <div class="floating-shape floating-shape-1"></div>
      <div class="floating-shape floating-shape-2"></div>
      <div class="floating-shape floating-shape-3"></div>

      <div class="absolute top-20 left-10 animate-float opacity-10 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-[#0D7377]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div class="absolute top-40 right-16 animate-float-delayed opacity-10 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-[#CBCBCB]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.5 11.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zM12 17c-2.7 0-5-1.8-5-4h10c0 2.2-2.3 4-5 4z"/>
        </svg>
      </div>
      <div class="absolute bottom-32 left-20 animate-float opacity-10 pointer-events-none" style="animation-delay: 1s;">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-[#E8650A]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.5 11.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
        </svg>
      </div>

      <div class="w-full max-w-md relative z-10">
        <div class="text-center mb-8 animate-slide-up">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg shadow-[#0D7377]/25 mb-4 logo-hover">
            <img src="/logo.svg" alt="VetClinic" class="w-20 h-20 rounded-full" />
          </div>
          <h1 class="text-3xl font-extrabold gradient-text">VetClinic</h1>
        </div>

        <div class="auth-card rounded-3xl animate-scale-in">
          <div class="card-body p-8">
            <router-outlet />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
