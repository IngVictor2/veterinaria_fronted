import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contacto-section',
  imports: [RouterLink],
  template: `
    <section id="contacto" class="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
        <div class="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div class="relative overflow-hidden bg-gradient-to-br from-[#0D7377] via-[#0b2a2a] to-[#071313] p-7 sm:p-10">
            <div class="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full border border-[#7FE7E9]/15"></div>
            <div class="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full border border-[#7FE7E9]/10"></div>

            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#7FE7E9]">Contacto</p>
            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-[#FFFFE3]">
              Hablemos del cuidado de tu mascota
            </h2>
            <p class="mt-4 max-w-md text-sm leading-relaxed text-[#FFFFE3]/70">
              Agenda una cita o escríbenos para resolver dudas sobre consulta, estética y
              prevención. Este formulario es una demostración local del proyecto.
            </p>

            <ul class="mt-8 space-y-4 text-sm text-[#FFFFE3]/80">
              <li class="flex items-start gap-3">
                <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#7FE7E9]" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  </svg>
                </span>
                <span>
                  <span class="block font-semibold text-[#FFFFE3]">Ubicación</span>
                  <span class="text-[#FFFFE3]/60">Barranquilla, Atlántico · Colombia</span>
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#7FE7E9]" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
                <span>
                  <span class="block font-semibold text-[#FFFFE3]">Horario de atención</span>
                  <span class="text-[#FFFFE3]/60">Lunes a sábado 7:00–18:00 · domingos 7:00–13:00</span>
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#7FE7E9]" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16v12H4zM4 7l8 6 8-6" />
                  </svg>
                </span>
                <span>
                  <span class="block font-semibold text-[#FFFFE3]">Atención con cita</span>
                  <span class="text-[#FFFFE3]/60">Consulta y estética se programan desde la agenda</span>
                </span>
              </li>
            </ul>

            <a
              routerLink="/login"
              class="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FFFFE3] px-5 py-3 text-xs font-bold text-[#071313] transition hover:bg-white"
            >
              Ingresar al sistema
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div class="bg-[#0a1a1a] p-7 sm:p-10">
            <h3 class="text-xl font-extrabold text-[#FFFFE3]">Déjanos un mensaje</h3>
            <p class="mt-1 text-sm text-[#CBCBCB]/55">
              Cuéntanos qué necesita tu mascota y qué servicio te interesa.
            </p>

            <form class="mt-6 space-y-4" (submit)="enviar($event)">
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="mb-1.5 block text-xs font-semibold text-[#CBCBCB]">Nombre</span>
                  <input
                    name="nombre"
                    type="text"
                    required
                    placeholder="Tu nombre"
                    class="input input-bordered h-11 w-full rounded-xl text-sm"
                    [value]="nombre()"
                    (input)="nombre.set($any($event.target).value)"
                  />
                </label>

                <label class="block">
                  <span class="mb-1.5 block text-xs font-semibold text-[#CBCBCB]">Correo</span>
                  <input
                    name="correo"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    class="input input-bordered h-11 w-full rounded-xl text-sm"
                    [value]="correo()"
                    (input)="correo.set($any($event.target).value)"
                  />
                </label>
              </div>

              <label class="block">
                <span class="mb-1.5 block text-xs font-semibold text-[#CBCBCB]">Mensaje</span>
                <textarea
                  name="mensaje"
                  required
                  rows="4"
                  placeholder="Ejemplo: quiero agendar una valoración preventiva para mi perro."
                  class="textarea textarea-bordered w-full rounded-xl text-sm"
                  [value]="mensaje()"
                  (input)="mensaje.set($any($event.target).value)"
                ></textarea>
              </label>

              @if (error()) {
                <p class="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-300" role="alert">
                  {{ error() }}
                </p>
              }

              @if (enviado()) {
                <div class="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200" role="status">
                  <p class="font-semibold">Mensaje registrado en esta demostración</p>
                  <p class="mt-0.5 text-emerald-200/70">
                    No se envía a un servidor. En producción se conectará con el módulo de contacto.
                  </p>
                </div>
              }

              <button type="submit" class="btn btn-primary h-11 w-full rounded-xl text-sm font-bold">
                Enviar mensaje
              </button>

              <p class="text-[11px] leading-relaxed text-[#CBCBCB]/40">
                Los datos se usan únicamente para responder a tu solicitud. No se almacenan en esta
                versión de demostración.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactoSectionComponent {
  readonly nombre = signal('');
  readonly correo = signal('');
  readonly mensaje = signal('');
  readonly enviado = signal(false);
  readonly error = signal('');

  enviar(event: Event): void {
    event.preventDefault();

    if (!this.nombre().trim() || !this.correo().trim() || !this.mensaje().trim()) {
      this.error.set('Completa el nombre, el correo y el mensaje.');
      this.enviado.set(false);
      return;
    }

    this.error.set('');
    this.enviado.set(true);
    this.nombre.set('');
    this.correo.set('');
    this.mensaje.set('');
  }
}
