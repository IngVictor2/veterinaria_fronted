import { Component, computed, signal } from '@angular/core';

type RolClinica = 'recepcion' | 'veterinario' | 'estilista' | 'administracion';

interface PerfilClinica {
  id: RolClinica;
  nombre: string;
  titulo: string;
  descripcion: string;
  modulos: string[];
}

const PERFILES: ReadonlyArray<PerfilClinica> = [
  {
    id: 'recepcion',
    nombre: 'Recepción',
    titulo: 'Agenda sin cruces de horarios',
    descripcion:
      'Registra clientes y mascotas, programa citas de consulta o estética y confirma la disponibilidad antes de asignar un profesional. La agenda deja de depender del cuaderno o de mensajes sueltos.',
    modulos: ['Clientes', 'Mascotas', 'Citas', 'Facturación'],
  },
  {
    id: 'veterinario',
    nombre: 'Veterinario',
    titulo: 'La historia clínica en el momento de la consulta',
    descripcion:
      'Consulta la agenda del día, revisa los antecedentes de la mascota y registra peso, síntomas, diagnóstico y tratamiento. La información queda asociada a la cita y disponible para el siguiente control.',
    modulos: ['Citas', 'Mascotas', 'Historial', 'Consulta médica'],
  },
  {
    id: 'estilista',
    nombre: 'Estilista',
    titulo: 'Disponibilidad real para cada servicio',
    descripcion:
      'Ve únicamente las citas de estética asignadas, registra los detalles del servicio y deja observaciones sobre el estado de la piel o el pelaje. Recepción y estilista trabajan sobre la misma agenda.',
    modulos: ['Citas', 'Mascotas', 'Servicio de estética', 'Observaciones'],
  },
  {
    id: 'administracion',
    nombre: 'Administración',
    titulo: 'Cifras claras para decidir',
    descripcion:
      'Consulta servicios, tarifas, facturas y pagos en un solo sistema. Los permisos definen qué módulos ve cada rol y los indicadores se actualizan cuando cambia el estado de una cita o una factura.',
    modulos: ['Servicios', 'Facturación', 'Pagos', 'Roles y permisos'],
  },
];

@Component({
  selector: 'app-enfoque-section',
  template: `
    <section id="enfoque" class="scroll-mt-24 border-b border-white/5 px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="max-w-2xl">
          <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#7FE7E9]">
            Enfoque de trabajo
          </p>
          <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-[#FFFFE3] sm:text-4xl">
            Un sistema, varios roles, la misma información
          </h2>
          <p class="mt-4 text-sm leading-relaxed text-[#CBCBCB]/65 sm:text-base">
            Cada persona de la clínica necesita ver algo distinto. Selecciona un rol para conocer
            qué módulos usa y cómo se conecta con el resto del equipo.
          </p>
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            @for (perfil of perfiles; track perfil.id) {
              <button
                type="button"
                class="flex items-center gap-3 rounded-2xl border p-4 text-left transition"
                [class]="
                  perfilActivo() === perfil.id
                    ? 'border-[#7FE7E9]/40 bg-[#0D7377]/20'
                    : 'border-white/10 bg-white/[0.03] hover:border-[#7FE7E9]/25 hover:bg-white/[0.05]'
                "
                [attr.aria-pressed]="perfilActivo() === perfil.id"
                (click)="perfilActivo.set(perfil.id)"
              >
                <span
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#7FE7E9]"
                  aria-hidden="true"
                >
                  @switch (perfil.id) {
                    @case ('recepcion') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                      </svg>
                    }
                    @case ('veterinario') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.5 5.5v6a4 4 0 0 0 4 4h2m9-10v6a4 4 0 0 1-4 4h-2m-2 0v3m-3 0h6M6 3.5v2m12-2v2" />
                      </svg>
                    }
                    @case ('estilista') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m14 6 4 4m-8 8 4-4m-7 3 2.5-.5L19 7a2.1 2.1 0 0 0-3-3l-9.5 9.5L6 17h1Z" />
                      </svg>
                    }
                    @default {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v18M5 8h14M7 8v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8" />
                      </svg>
                    }
                  }
                </span>
                <span class="min-w-0">
                  <span class="block text-sm font-bold text-[#FFFFE3]">{{ perfil.nombre }}</span>
                  <span class="block truncate text-[11px] text-[#CBCBCB]/45">{{ perfil.modulos.length }} módulos</span>
                </span>
              </button>
            }
          </div>

          <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0D7377]/20 via-[#0b1b1b] to-[#071313] p-6 sm:p-8">
            <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#7FE7E9]/10 blur-2xl"></div>

            <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7FE7E9]">
              {{ perfil().nombre }}
            </p>
            <h3 class="mt-3 text-2xl font-extrabold text-[#FFFFE3]">{{ perfil().titulo }}</h3>
            <p class="mt-4 max-w-xl text-sm leading-relaxed text-[#CBCBCB]/70">
              {{ perfil().descripcion }}
            </p>

            <div class="mt-6">
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CBCBCB]/45">
                Módulos que utiliza
              </p>
              <ul class="mt-3 flex flex-wrap gap-2">
                @for (modulo of perfil().modulos; track modulo) {
                  <li class="rounded-full border border-[#7FE7E9]/20 bg-[#0D7377]/15 px-3 py-1.5 text-xs font-semibold text-[#FFFFE3]">
                    {{ modulo }}
                  </li>
                }
              </ul>
            </div>

            <div class="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
              @for (paso of pasos; track paso.numero) {
                <div>
                  <p class="text-[10px] font-bold text-[#E8650A]">{{ paso.numero }}</p>
                  <p class="mt-1 text-xs font-semibold text-[#FFFFE3]">{{ paso.titulo }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class EnfoqueSectionComponent {
  readonly perfiles = PERFILES;
  readonly perfilActivo = signal<RolClinica>('recepcion');

  readonly perfil = computed(
    () => this.perfiles.find((perfil) => perfil.id === this.perfilActivo()) ?? this.perfiles[0],
  );

  readonly pasos: ReadonlyArray<{ numero: string; titulo: string }> = [
    { numero: '01', titulo: 'Agenda' },
    { numero: '02', titulo: 'Confirma' },
    { numero: '03', titulo: 'Atiende' },
    { numero: '04', titulo: 'Factura' },
  ];
}
