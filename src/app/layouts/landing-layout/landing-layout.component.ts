import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooterComponent } from '../../componentes/inicio/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../componentes/inicio/site-header/site-header.component';

@Component({
  selector: 'app-landing-layout',
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <a
      href="#contenido-principal"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-[#F3F4F6] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#1F2937]"
    >
      Saltar al contenido
    </a>

    <div class="flex min-h-screen flex-col bg-[var(--landing-background)]">
      <app-site-header />

      <main id="contenido-principal" class="flex-1">
        <router-outlet />
      </main>

      <app-site-footer />
    </div>
  `,
})
export class LandingLayoutComponent {}
