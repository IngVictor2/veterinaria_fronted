import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../servicios/blog.service';
import { CitasDemoService } from '../../../servicios/citas-demo.service';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  template: `
    <header class="sticky top-0 z-50 border-b border-white/10 bg-[#071313]/85 backdrop-blur-xl">
      <div class="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a routerLink="/" class="flex items-center gap-3" (click)="cerrarMenu()">
          <img
            src="/logo.svg"
            alt="VetClinic"
            class="h-11 w-11 rounded-full border border-[#7FE7E9]/30 bg-[#0D7377]/20 p-1"
          />
          <span class="min-w-0">
            <span class="block text-lg font-extrabold leading-tight tracking-tight text-[#FFFFE3]">
              VetClinic
            </span>
            <span class="hidden text-[10px] font-semibold uppercase tracking-[0.26em] text-[#7FE7E9] sm:block">
              Clínica veterinaria
            </span>
          </span>
        </a>

        <nav class="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          @for (enlace of enlaces; track enlace.href) {
            <a
              [href]="enlace.href"
              class="rounded-full px-3 py-2 text-sm font-medium text-[#CBCBCB] transition hover:bg-white/5 hover:text-[#FFFFE3]"
            >
              {{ enlace.texto }}
            </a>
          }
        </nav>

        <div class="flex items-center gap-2">
          <a
            href="#agenda"
            class="hidden items-center gap-2 rounded-full border border-[#0D7377]/50 bg-[#0D7377]/15 px-3 py-1.5 text-xs font-semibold text-[#FFFFE3] transition hover:bg-[#0D7377]/30 sm:flex"
          >
            <span class="h-2 w-2 rounded-full bg-[#7FE7E9]"></span>
            <span>{{ citas.totalPendientes() }} pendientes</span>
          </a>

          @if (blog.totalGuardados() > 0) {
            <a
              href="#blog"
              class="flex items-center gap-1.5 rounded-full border border-[#E8650A]/40 bg-[#E8650A]/10 px-3 py-1.5 text-xs font-semibold text-[#FFB27A] transition hover:bg-[#E8650A]/20"
              [attr.aria-label]="'Artículos guardados: ' + blog.totalGuardados()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1Z" />
              </svg>
              {{ blog.totalGuardados() }}
            </a>
          }

          <a
            routerLink="/login"
            class="btn btn-primary btn-sm rounded-full px-4 text-xs font-bold sm:text-sm"
          >
            Ingresar
          </a>

          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#FFFFE3] transition hover:bg-white/5 lg:hidden"
            [attr.aria-expanded]="menuAbierto()"
            aria-controls="menu-movil"
            aria-label="Abrir menú de navegación"
            (click)="alternarMenu()"
          >
            @if (menuAbierto()) {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
          </button>
        </div>
      </div>

      @if (menuAbierto()) {
        <nav id="menu-movil" class="border-t border-white/10 bg-[#071313] px-4 py-3 lg:hidden" aria-label="Navegación móvil">
          <div class="flex flex-col gap-1">
            @for (enlace of enlaces; track enlace.href) {
              <a
                [href]="enlace.href"
                class="rounded-xl px-3 py-2.5 text-sm font-medium text-[#CBCBCB] transition hover:bg-white/5 hover:text-[#FFFFE3]"
                (click)="cerrarMenu()"
              >
                {{ enlace.texto }}
              </a>
            }
            <a
              href="#agenda"
              class="mt-2 flex items-center justify-between rounded-xl border border-[#0D7377]/40 bg-[#0D7377]/15 px-3 py-2.5 text-sm font-semibold text-[#FFFFE3]"
              (click)="cerrarMenu()"
            >
              <span>Citas pendientes</span>
              <span class="rounded-full bg-[#7FE7E9]/20 px-2 py-0.5 text-xs text-[#7FE7E9]">
                {{ citas.totalPendientes() }}
              </span>
            </a>
          </div>
        </nav>
      }
    </header>
  `,
})
export class SiteHeaderComponent {
  readonly citas = inject(CitasDemoService);
  readonly blog = inject(BlogService);
  readonly menuAbierto = signal(false);

  readonly enlaces: ReadonlyArray<{ texto: string; href: string }> = [
    { texto: 'Inicio', href: '#inicio' },
    { texto: 'Servicios', href: '#servicios' },
    { texto: 'Blog', href: '#blog' },
    { texto: 'Agenda', href: '#agenda' },
    { texto: 'Enfoque', href: '#enfoque' },
    { texto: 'Contacto', href: '#contacto' },
  ];

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
