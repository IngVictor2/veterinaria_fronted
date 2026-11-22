import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { estadoApertura, fechaEnBogota } from '../../../datos/clinica';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink],
  template: `
    <section
      id="inicio"
      class="relative overflow-hidden border-b border-gray-200 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8"
    >
      <div class="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div class="animate-slide-up">
          <p
            class="inline-flex items-center gap-2 rounded-full border border-[#9D343C]/25 bg-[#9D343C]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9D343C]"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-[#9D343C]"></span>
            Clínica veterinaria · Barranquilla
          </p>

          <h1
            class="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#374151] sm:text-5xl lg:text-6xl"
          >
            Cuidamos a quienes
            <span class="block text-[#9D343C]">te acompañan.</span>
          </h1>

          <p class="mt-6 max-w-xl text-base leading-relaxed text-[#374151] sm:text-lg">
            Medicina y bienestar para perros y gatos, con atención cercana y el acompañamiento que
            tu familia necesita.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a routerLink="/login" class="btn btn-primary h-12 rounded-full px-6 text-sm font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
              </svg>
              Agendar una cita
            </a>
            <a
              routerLink="/"
              fragment="servicios"
              class="btn h-12 rounded-full border border-gray-200 bg-gray-50 px-6 text-sm font-semibold text-[#374151] hover:border-[#9D343C]/40 hover:bg-gray-50"
            >
              Ver servicios
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-md animate-fade-in">
          <div class="surface-card relative overflow-hidden rounded-[2rem] border border-gray-200 p-7 shadow-xl sm:p-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9D343C]">
                  Estado de atención
                </p>
                <p class="mt-2 text-xs font-semibold text-[#374151] first-letter:uppercase">
                  {{ fechaHoy() }}
                </p>
              </div>
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#9D343C]/25 bg-[#9D343C]/10 text-[#9D343C]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </span>
            </div>

            <p class="mt-10 flex items-center gap-3 text-2xl font-extrabold leading-tight text-[#374151] sm:text-3xl">
              <span
                class="h-2.5 w-2.5 shrink-0 rounded-full"
                [class]="estado().abierto ? 'bg-emerald-600' : 'bg-gray-400'"
                aria-hidden="true"
              ></span>
              {{ estado().abierto ? 'Abierto ahora' : 'Cerrado ahora' }}
            </p>
            <p class="mt-3 text-sm leading-relaxed text-[#374151]">{{ estado().mensaje }}</p>

            <a
              routerLink="/"
              fragment="contacto"
              class="mt-8 flex items-center justify-between border-t border-gray-200 pt-5 text-xs font-bold text-[#9D343C]"
            >
              Ver horario completo
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroSectionComponent {
  private readonly ahora = signal(new Date());
  private readonly destroyRef = inject(DestroyRef);

  readonly estado = computed(() => estadoApertura(this.ahora()));
  readonly fechaHoy = computed(() => fechaEnBogota(this.ahora()));

  constructor() {
    const intervalo = setInterval(() => this.ahora.set(new Date()), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(intervalo));
  }
}
