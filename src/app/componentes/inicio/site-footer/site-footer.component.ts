import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `
    <footer class="border-t border-white/10 bg-[#050f0f]">
      <div class="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <a routerLink="/" class="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="VetClinic"
              class="h-11 w-11 rounded-full border border-[#7FE7E9]/30 bg-[#0D7377]/20 p-1"
            />
            <span>
              <span class="block text-lg font-extrabold text-[#FFFFE3]">VetClinic</span>
              <span class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#7FE7E9]">
                Clínica veterinaria
              </span>
            </span>
          </a>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-[#CBCBCB]/70">
            Consulta, estética e información de cuidado para perros y gatos, con contenidos claros
            para cada familia.
          </p>
        </div>

        <div>
          <h2 class="text-sm font-bold uppercase tracking-[0.18em] text-[#FFFFE3]">Explora</h2>
          <ul class="mt-4 space-y-2 text-sm text-[#CBCBCB]/70">
            <li><a href="#servicios" class="transition hover:text-[#7FE7E9]">Servicios</a></li>
            <li><a href="#blog" class="transition hover:text-[#7FE7E9]">Blog de cuidado</a></li>
            <li><a href="#contacto" class="transition hover:text-[#7FE7E9]">Contacto</a></li>
          </ul>
        </div>

        <div>
          <h2 class="text-sm font-bold uppercase tracking-[0.18em] text-[#FFFFE3]">Horario</h2>
          <ul class="mt-4 space-y-2 text-sm text-[#CBCBCB]/70">
            <li>Lunes a sábado: 7:00 a 18:00</li>
            <li>Domingos: 7:00 a 13:00</li>
            <li>Consulta y estética con cita previa</li>
          </ul>
        </div>

        <div>
          <h2 class="text-sm font-bold uppercase tracking-[0.18em] text-[#FFFFE3]">Acceso</h2>
          <ul class="mt-4 space-y-2 text-sm text-[#CBCBCB]/70">
            <li><a routerLink="/login" class="transition hover:text-[#7FE7E9]">Ingresar al sistema</a></li>
            <li><a routerLink="/register" class="transition hover:text-[#7FE7E9]">Crear una cuenta</a></li>
            <li><a routerLink="/entrega-1" class="transition hover:text-[#7FE7E9]">Demo de la Entrega 1</a></li>
          </ul>
          <p class="mt-4 text-xs leading-relaxed text-[#CBCBCB]/50">
            Barranquilla, Atlántico · Colombia
          </p>
        </div>
      </div>

      <div class="border-t border-white/5">
        <div
          class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-[#CBCBCB]/45 sm:flex-row sm:px-6 lg:px-8"
        >
          <p>© {{ anio }} VetClinic · Proyecto académico COM30</p>
          <a href="#inicio" class="transition hover:text-[#7FE7E9]">Volver arriba ↑</a>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  readonly anio = new Date().getFullYear();
}
