import { Component } from '@angular/core';

@Component({
  selector: 'app-quienes-somos-section',
  template: `
    <section
      id="quienes-somos"
      class="scroll-mt-24 border-b border-white/5 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#7FE7E9]">
            Quiénes somos
          </p>
          <h2 class="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-[#FFFFE3] sm:text-4xl">
            Cuidado veterinario con información clara y trato cercano
          </h2>
          <p class="mt-5 max-w-2xl text-sm leading-relaxed text-[#CBCBCB]/70 sm:text-base">
            VetClinic es una clínica veterinaria enfocada en perros y gatos. Reunimos consulta y
            estética en un mismo espacio para acompañar el cuidado de cada mascota, desde la
            prevención hasta el bienestar diario.
          </p>
          <p class="mt-4 max-w-2xl text-sm leading-relaxed text-[#CBCBCB]/70 sm:text-base">
            Trabajamos con historia clínica, agenda de citas y comunicación directa con el
            propietario. Así cada atención queda registrada y las recomendaciones son fáciles de
            seguir en casa.
          </p>

          <div class="mt-7 flex flex-wrap gap-2">
            <span class="rounded-full border border-[#7FE7E9]/20 bg-[#0D7377]/10 px-3 py-1.5 text-xs font-semibold text-[#7FE7E9]">
              Perros y gatos
            </span>
            <span class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#CBCBCB]">
              Consulta y estética
            </span>
            <span class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#CBCBCB]">
              Barranquilla, Atlántico
            </span>
          </div>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#servicios" class="btn btn-primary h-11 rounded-full px-5 text-sm font-bold">
              Conoce los servicios
            </a>
            <a
              href="#contacto"
              class="btn h-11 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-[#FFFFE3] hover:border-[#7FE7E9]/40 hover:bg-white/10"
            >
              Escríbenos
            </a>
          </div>
        </div>

        <div class="relative">
          <div class="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-[#0D7377]/25 via-transparent to-[#E8650A]/15 blur-2xl"></div>

          <div class="relative rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7FE7E9]">
                  Nuestra forma de trabajar
                </p>
                <p class="mt-2 text-lg font-extrabold text-[#FFFFE3]">Lo que nos define</p>
              </div>
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#E8650A]/25 bg-[#E8650A]/10 text-[#FFB27A]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z" />
                </svg>
              </span>
            </div>

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-white/10 bg-[#071313]/60 p-4">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D7377]/20 text-[#7FE7E9]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 10h8M8 14h5m-8 6V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15l-4-3-4 3-4-3-4 3Z" />
                  </svg>
                </div>
                <p class="mt-3 text-sm font-bold text-[#FFFFE3]">Atención cercana</p>
                <p class="mt-1 text-xs leading-relaxed text-[#CBCBCB]/60">
                  Escuchamos el motivo de consulta y explicamos cada paso con lenguaje claro.
                </p>
              </div>

              <div class="rounded-2xl border border-white/10 bg-[#071313]/60 p-4">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8650A]/15 text-[#FFB27A]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M11.5 3.5c0-.83-.67-1.5-1.5-1.5S8.5 2.67 8.5 3.5 9.17 5 10 5s1.5-.67 1.5-1.5Zm4 0c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zm-8 3c0-.83-.67-1.5-1.5-1.5S4.5 5.67 4.5 6.5 5.17 8 6 8s1.5-.67 1.5-1.5zm12 0c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM12 22c-3 0-5.5-1.5-5.5-4 0-2 1.5-3.5 3-4.5.7-.5 1.5-.8 2.5-.8s1.8.3 2.5.8c1.5 1 3 2.5 3 4.5 0 2.5-2.5 4-5.5 4z" />
                  </svg>
                </div>
                <p class="mt-3 text-sm font-bold text-[#FFFFE3]">Cuidado integral</p>
                <p class="mt-1 text-xs leading-relaxed text-[#CBCBCB]/60">
                  Consulta y estética se complementan para cubrir las necesidades de la mascota.
                </p>
              </div>

              <div class="rounded-2xl border border-white/10 bg-[#071313]/60 p-4">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D7377]/20 text-[#7FE7E9]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m-6 8h6m-6 4h4" />
                  </svg>
                </div>
                <p class="mt-3 text-sm font-bold text-[#FFFFE3]">Información organizada</p>
                <p class="mt-1 text-xs leading-relaxed text-[#CBCBCB]/60">
                  La historia clínica y la agenda mantienen el seguimiento al día.
                </p>
              </div>

              <div class="rounded-2xl border border-white/10 bg-[#071313]/60 p-4">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8650A]/15 text-[#FFB27A]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4" />
                  </svg>
                </div>
                <p class="mt-3 text-sm font-bold text-[#FFFFE3]">Bienestar animal</p>
                <p class="mt-1 text-xs leading-relaxed text-[#CBCBCB]/60">
                  Adaptamos el manejo a la edad, el temperamento y el estado de salud.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class QuienesSomosSectionComponent {}
