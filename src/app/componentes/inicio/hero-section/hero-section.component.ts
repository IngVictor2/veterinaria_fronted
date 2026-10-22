import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PORTAFOLIO_SERVICIOS } from '../../../datos/servicios-portafolio';
import { BlogService } from '../../../servicios/blog.service';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink],
  template: `
    <section
      id="inicio"
      class="hero-section relative overflow-hidden border-b border-white/5 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8"
    >
      <div class="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#0D7377]/20 blur-3xl"></div>
      <div class="pointer-events-none absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-[#E8650A]/10 blur-3xl"></div>

      <div class="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div class="animate-slide-up">
          <p
            class="inline-flex items-center gap-2 rounded-full border border-[#7FE7E9]/25 bg-[#0D7377]/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7FE7E9]"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-[#7FE7E9]"></span>
            Clínica veterinaria · Barranquilla
          </p>

          <h1 class="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#FFFFE3] sm:text-5xl lg:text-6xl">
            Cuidamos a quienes
            <span class="block bg-gradient-to-r from-[#7FE7E9] via-[#FFFFE3] to-[#E8650A] bg-clip-text text-transparent">
              te acompañan.
            </span>
          </h1>

          <p class="mt-6 max-w-xl text-base leading-relaxed text-[#CBCBCB]/75 sm:text-lg">
            Consulta y estética para perros y gatos en un solo lugar. Agenda tu cita, revisa el
            cuidado de tu mascota y aprende con nuestro blog veterinario.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a routerLink="/login" class="btn btn-primary h-12 rounded-full px-6 text-sm font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
              </svg>
              Agendar una cita
            </a>
            <a
              href="#blog"
              class="btn h-12 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-[#FFFFE3] hover:border-[#7FE7E9]/40 hover:bg-white/10"
            >
              Leer el blog
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <dl class="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <dt class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CBCBCB]/50">Servicios</dt>
              <dd class="mt-1 text-2xl font-extrabold text-[#FFFFE3]">{{ totalServicios() }}</dd>
              <p class="text-[11px] text-[#CBCBCB]/45">consulta y estética</p>
            </div>
            <div>
              <dt class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CBCBCB]/50">Blog</dt>
              <dd class="mt-1 text-2xl font-extrabold text-[#FFFFE3]">{{ blog.totalArticulos() }}</dd>
              <p class="text-[11px] text-[#CBCBCB]/45">artículos de cuidado</p>
            </div>
            <div>
              <dt class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CBCBCB]/50">Horario</dt>
              <dd class="mt-1 text-2xl font-extrabold text-[#FFFFE3]">7–18</dd>
              <p class="text-[11px] text-[#CBCBCB]/45">lunes a sábado</p>
            </div>
          </dl>
        </div>

        <div class="relative mx-auto w-full max-w-lg animate-fade-in">
          <div class="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-[#0D7377]/30 via-transparent to-[#E8650A]/20 blur-2xl"></div>

          <div
            class="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#123333] via-[#0c2020] to-[#071313] p-6 shadow-2xl sm:p-8"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7FE7E9]">Nuestros servicios</p>
                <p class="mt-1 text-sm font-semibold text-[#FFFFE3]">Consulta y estética</p>
              </div>
              <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
                Abierto
              </span>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-[#CBCBCB]/50">Consulta</p>
                <p class="mt-1 text-2xl font-extrabold text-[#FFFFE3]">{{ totalConsultas() }}</p>
                <p class="text-[11px] text-[#CBCBCB]/45">servicios</p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p class="text-[10px] font-semibold uppercase tracking-wide text-[#CBCBCB]/50">Estética</p>
                <p class="mt-1 text-2xl font-extrabold text-[#7FE7E9]">{{ totalEstetica() }}</p>
                <p class="text-[11px] text-[#CBCBCB]/45">servicios</p>
              </div>
            </div>

            <div class="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-[#E8650A]/20 bg-[#E8650A]/5 p-4">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8650A]">Horario de atención</p>
                <p class="mt-1 text-xs font-semibold text-[#FFFFE3]">Lunes a sábado · 7:00 a 18:00</p>
              </div>
              <p class="shrink-0 text-right text-[11px] text-[#7FE7E9]">
                Domingos
                <span class="block text-[#CBCBCB]/50">7:00 a 13:00</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero-section {
      background:
        radial-gradient(circle at 12% 8%, rgba(13, 115, 119, 0.22), transparent 38%),
        radial-gradient(circle at 88% 20%, rgba(232, 101, 10, 0.08), transparent 32%),
        #071313;
    }
  `,
})
export class HeroSectionComponent {
  readonly blog = inject(BlogService);

  readonly totalServicios = computed(() => PORTAFOLIO_SERVICIOS.length);
  readonly totalConsultas = computed(
    () => PORTAFOLIO_SERVICIOS.filter((servicio) => servicio.tipo === 'CONSULTA').length,
  );
  readonly totalEstetica = computed(
    () => PORTAFOLIO_SERVICIOS.filter((servicio) => servicio.tipo === 'ESTETICA').length,
  );
}
