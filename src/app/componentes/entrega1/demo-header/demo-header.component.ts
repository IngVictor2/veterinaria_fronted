import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CitasDemoService } from '../../../servicios/citas-demo.service';

@Component({
  selector: 'app-demo-header',
  imports: [CurrencyPipe],
  template: `
    <header class="sticky top-0 z-30 border-b border-white/10 bg-[#0b1b1b]/90 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div class="flex min-w-0 items-center gap-2.5">
          <img src="/logo.svg" alt="VetClinic" class="h-8 w-8 rounded-full" />
          <div class="min-w-0">
            <p class="truncate font-bold leading-tight text-[#FFFFE3]">VetClinic</p>
            <p class="text-[10px] uppercase tracking-[0.2em] text-[#7FE7E9]">
              Agenda de citas
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <div class="hidden items-center gap-2 text-xs text-base-content/60 sm:flex">
            <span>Ingresos confirmados</span>
            <strong class="text-sm text-[#FFFFE3]">
              {{ citasDemo.ingresosConfirmados() | currency: 'COP' : 'symbol' : '1.0-0' : 'es-CO' }}
            </strong>
          </div>

          <div
            class="flex items-center gap-2 rounded-full border border-[#0D7377]/50 bg-[#0D7377]/20 px-3 py-1.5"
          >
            <span class="h-2 w-2 rounded-full bg-[#7FE7E9]"></span>
            <span class="text-sm font-bold text-[#FFFFE3]">
              {{ citasDemo.totalPendientes() }}
            </span>
            <span class="text-xs text-base-content/60">pendientes</span>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class DemoHeaderComponent {
  readonly citasDemo = inject(CitasDemoService);
}
