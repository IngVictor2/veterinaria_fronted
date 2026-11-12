import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `
    <footer class="border-t border-gray-200 bg-[var(--landing-background)]">
      <div class="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <a routerLink="/" class="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="VetClinic"
              class="h-11 w-11 rounded-full border border-[#9D343C]/30 bg-[#9D343C]/20 p-1"
            />
            <span>
              <span class="block text-lg font-extrabold text-[#374151]">VetClinic</span>
              <span class="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#9D343C]">
                Clínica veterinaria
              </span>
            </span>
          </a>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-[#374151]">
            Consulta, estética e información de cuidado para perros y gatos, con contenidos claros
            para cada familia.
          </p>
        </div>

        <div>
          <h2 class="text-sm font-bold uppercase tracking-[0.18em] text-[#374151]">Explora</h2>
          <ul class="mt-4 space-y-2 text-sm text-[#374151]">
            <li><a href="#quienes-somos" class="transition hover:text-[#9D343C]">Quiénes somos</a></li>
            <li><a href="#servicios" class="transition hover:text-[#9D343C]">Servicios</a></li>
            <li><a href="#blog" class="transition hover:text-[#9D343C]">Blog de cuidado</a></li>
            <li><a href="#contacto" class="transition hover:text-[#9D343C]">Contacto</a></li>
          </ul>
        </div>

        <div>
          <h2 class="text-sm font-bold uppercase tracking-[0.18em] text-[#374151]">Horario</h2>
          <ul class="mt-4 space-y-2 text-sm text-[#374151]">
            <li>Lunes a sábado: 7:00 a 18:00</li>
            <li>Domingos: 7:00 a 13:00</li>
            <li>Consulta y estética con cita previa</li>
          </ul>
        </div>

        <div>
          <h2 class="text-sm font-bold uppercase tracking-[0.18em] text-[#374151]">Acceso</h2>
          <ul class="mt-4 space-y-2 text-sm text-[#374151]">
            <li><a routerLink="/login" class="transition hover:text-[#9D343C]">Ingresar al sistema</a></li>
            <li><a routerLink="/register" class="transition hover:text-[#9D343C]">Crear una cuenta</a></li>
          </ul>
          <p class="mt-4 text-xs leading-relaxed text-[#374151]">
            Barranquilla, Atlántico · Colombia
          </p>
        </div>
      </div>

      <div class="border-t border-gray-200">
        <div
          class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-[#374151] sm:flex-row sm:px-6 lg:px-8"
        >
          <p>© {{ anio }} VetClinic · Proyecto académico COM30</p>
          <a href="#inicio" class="transition hover:text-[#9D343C]">Volver arriba ↑</a>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooterComponent {
  readonly anio = new Date().getFullYear();
}
