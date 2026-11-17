import { Component } from '@angular/core';

@Component({
  selector: 'app-quienes-somos-section',
  template: `
    <section
      id="quienes-somos"
      class="scroll-mt-24 border-b border-gray-200 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#9D343C]">
            Quiénes somos
          </p>
          <h2 class="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-[#374151] sm:text-4xl">
            Cuidado veterinario con información clara y trato cercano
          </h2>
          <p class="mt-5 max-w-2xl text-sm leading-relaxed text-[#374151] sm:text-base">
            VetClinic atiende perros y gatos con un enfoque simple: registrar cada atención,
            explicar qué sigue y mantener al día el historial de cada mascota.
          </p>

          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl border border-gray-200 bg-[#FFFFFF]/60 p-5">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9D343C]/15 text-[#9D343C]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                </svg>
              </div>
              <p class="mt-3 text-sm font-bold text-[#374151]">Historia clínica digital</p>
              <p class="mt-1 text-xs leading-relaxed text-[#374151]">
                Cada consulta, vacuna y tratamiento queda registrado para la siguiente cita.
              </p>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-[#FFFFFF]/60 p-5">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9D343C]/15 text-[#9D343C]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 10h18M7 3v4m10-4v4M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                </svg>
              </div>
              <p class="mt-3 text-sm font-bold text-[#374151]">Agenda y pagos en línea</p>
              <p class="mt-1 text-xs leading-relaxed text-[#374151]">
                El cliente reserva su cita, consulta la factura y paga desde el mismo sistema.
              </p>
            </div>
          </div>
        </div>

        <aside class="relative">
          <div class="surface-card relative rounded-[2rem] border border-gray-200 p-8 sm:p-10">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#9D343C]/25 bg-[#9D343C]/10 text-[#9D343C]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z" />
              </svg>
            </span>

            <blockquote class="mt-8">
              <p class="text-2xl font-extrabold leading-snug tracking-tight text-[#374151] sm:text-3xl">
                “Que cada familia entienda qué le pasa a su mascota y qué hacer después.”
              </p>
              <footer class="mt-6 text-[11px] font-bold uppercase tracking-[0.24em] text-[#9D343C]">
                Nuestro compromiso
              </footer>
            </blockquote>
          </div>
        </aside>
      </div>
    </section>
  `,
})
export class QuienesSomosSectionComponent {}
