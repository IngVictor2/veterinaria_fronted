import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SiteFooterComponent } from '../inicio/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../inicio/site-header/site-header.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-[var(--landing-background)]">
      <app-site-header />

      <main class="flex flex-1 items-center px-4 py-16 sm:px-6 lg:px-8">
        <div class="mx-auto w-full max-w-2xl text-center">
          <p class="text-7xl font-black tracking-tight text-[#9D343C] sm:text-8xl">404</p>
          <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-[#374151] sm:text-4xl">
            No encontramos esta página
          </h1>
          <p class="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#374151] sm:text-base">
            La dirección <code class="rounded bg-black/5 px-1.5 py-0.5 text-xs">{{ url }}</code> no
            existe o cambió de lugar. Revisa el enlace o vuelve a uno de estos accesos.
          </p>

          <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a routerLink="/" class="btn btn-primary rounded-full px-6">Volver al inicio</a>
            <a routerLink="/blog" class="btn rounded-full border border-gray-300 px-6">
              Ir al blog
            </a>
          </div>

          <p class="mt-8 text-xs text-[#374151]">
            Si llegaste desde un enlace interno, escríbenos desde la sección de contacto.
          </p>
        </div>
      </main>

      <app-site-footer />
    </div>
  `,
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  get url(): string {
    return this.router.url;
  }
}
