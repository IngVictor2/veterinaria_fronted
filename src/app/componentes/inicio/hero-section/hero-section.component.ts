import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PORTAFOLIO_SERVICIOS } from '../../../datos/servicios-portafolio';
import { BlogService } from '../../../servicios/blog.service';
import { estaAbierta } from './horario-atencion';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink],
  template: `
    <section
      id="inicio"
      class="hero-section relative overflow-hidden border-b border-gray-200 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8"
    >
      <div class="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div class="animate-slide-up">
          <p
            class="inline-flex items-center gap-2 rounded-full border border-[#9D343C]/25 bg-[#9D343C]/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9D343C]"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-[#9D343C]"></span>
            Clínica veterinaria · Barranquilla
          </p>

          <h1
            class="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#374151] sm:text-5xl lg:text-6xl"
          >
            Cuidamos a quienes
            <span
              class="block bg-gradient-to-r from-[#9D343C] via-[#374151] to-[#9D343C] bg-clip-text text-transparent"
            >
              te acompañan.
            </span>
          </h1>

          <p class="mt-6 max-w-xl text-base leading-relaxed text-[#374151] sm:text-lg">
            Consulta y estética para perros y gatos en un solo lugar. Agenda tu cita, revisa el
            cuidado de tu mascota y aprende con nuestro blog veterinario.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a routerLink="/login" class="btn btn-primary h-12 rounded-full px-6 text-sm font-bold">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                />
              </svg>
              Agendar una cita
            </a>
            <a
              href="#blog"
              class="btn h-12 rounded-full border border-gray-200 bg-gray-50 px-6 text-sm font-semibold text-[#374151] hover:border-[#9D343C]/40 hover:bg-gray-50"
            >
              Leer el blog
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <dl class="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-gray-200 pt-6">
            <div>
              <dt class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#374151]">
                Servicios
              </dt>
              <dd class="mt-1 text-2xl font-extrabold text-[#374151]">{{ totalServicios() }}</dd>
              <p class="text-[11px] text-[#374151]">consulta y estética</p>
            </div>
            <div>
              <dt class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#374151]">
                Blog
              </dt>
              <dd class="mt-1 text-2xl font-extrabold text-[#374151]">
                {{ blog.totalArticulos() }}
              </dd>
              <p class="text-[11px] text-[#374151]">artículos de cuidado</p>
            </div>
            <div>
              <dt class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#374151]">
                Horario
              </dt>
              <dd class="mt-1 text-2xl font-extrabold text-[#374151]">7–18</dd>
              <p class="text-[11px] text-[#374151]">lunes a sábado</p>
            </div>
          </dl>
        </div>

        <div class="relative mx-auto w-full max-w-lg animate-fade-in">
          <div class="absolute -inset-4 rounded-[3rem] bg-[var(--landing-background)]    blur-2xl"></div>

          <div
            class="surface-card relative overflow-hidden rounded-[2.5rem] border border-gray-200     p-6 shadow-2xl sm:p-8"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9D343C]">
                  Nuestros servicios
                </p>
                <p class="mt-1 text-sm font-semibold text-[#374151]">Consulta y estética</p>
              </div>
              <span
                class="estado-atencion inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                [class.abierto]="abierta()"
                [class.cerrado]="!abierta()"
                role="status"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
                {{ abierta() ? 'Abierto' : 'Cerrado' }}
              </span>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-[#374151]">
                  Consulta
                </p>
                <p class="mt-1 text-2xl font-extrabold text-[#374151]">{{ totalConsultas() }}</p>
                <p class="text-[11px] text-[#374151]">servicios</p>
              </div>
              <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-[#374151]">
                  Estética
                </p>
                <p class="mt-1 text-2xl font-extrabold text-[#9D343C]">{{ totalEstetica() }}</p>
                <p class="text-[11px] text-[#374151]">servicios</p>
              </div>
            </div>

            <div
              class="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-[#9D343C]/20 bg-[#9D343C]/5 p-4"
            >
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9D343C]">
                  Horario de atención
                </p>
                <p class="mt-1 text-xs font-semibold text-[#374151]">
                  Lunes a sábado · 7:00 a 18:00
                </p>
              </div>
              <p class="shrink-0 text-right text-[11px] text-[#9D343C]">
                Domingos
                <span class="block text-[#374151]">7:00 a 13:00</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero-section {
      background-color: var(--landing-background);
    }
    .estado-atencion.abierto {
      background: #d1fae5;
      color: #047857;
    }
    .estado-atencion.cerrado {
      background: #f5e6e7;
      color: #9d343c;
    }
  `,
})
export class HeroSectionComponent {
  readonly blog = inject(BlogService);
  readonly abierta = signal(estaAbierta(new Date()));

  constructor() {
    const reloj = setInterval(() => this.abierta.set(estaAbierta(new Date())), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(reloj));
  }

  readonly totalServicios = computed(() => PORTAFOLIO_SERVICIOS.length);
  readonly totalConsultas = computed(
    () => PORTAFOLIO_SERVICIOS.filter((servicio) => servicio.tipo === 'CONSULTA').length,
  );
  readonly totalEstetica = computed(
    () => PORTAFOLIO_SERVICIOS.filter((servicio) => servicio.tipo === 'ESTETICA').length,
  );
}
