import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ArticuloBlog } from '../../../modelos/articulo-blog';
import { CategoriaBlogPipe } from '../../../pipes/categoria-blog.pipe';

@Component({
  selector: 'app-blog-card',
  imports: [DatePipe, DecimalPipe, CategoriaBlogPipe],
  template: `
    <article
      class="group flex h-full flex-col rounded-3xl border border-gray-200 bg-gray-50 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#9D343C]/25 hover:bg-gray-50 sm:p-6"
    >
      <div class="flex items-center justify-between gap-3">
        <span
          class="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
          [class]="claseCategoria()"
        >
          {{ articulo().categoria | categoriaBlog }}
        </span>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full border transition"
          [class]="
            guardado()
              ? 'border-[#9D343C]/40 bg-[#9D343C]/15 text-[#9D343C]'
              : 'border-gray-200 text-[#374151] hover:border-[#9D343C]/40 hover:text-[#9D343C]'
          "
          [attr.aria-pressed]="guardado()"
          [attr.aria-label]="guardado() ? 'Quitar de guardados' : 'Guardar para leer después'"
          (click)="guardar.emit(articulo().id)"
        >
          @if (guardado()) {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1Z" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 4h12v17l-6-3.5L6 21V4Z" />
            </svg>
          }
        </button>
      </div>

      @if (articulo().destacado) {
        <p class="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#9D343C]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9D343C]">
          <span class="h-1 w-1 rounded-full bg-[#9D343C]"></span>
          Destacado
        </p>
      }

      <h3 class="mt-3 text-lg font-bold leading-snug text-[#374151]">{{ articulo().titulo }}</h3>
      <p class="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[#374151]">
        {{ articulo().resumen }}
      </p>

      <div class="mt-4 flex flex-wrap gap-1.5">
        @for (etiqueta of articulo().etiquetas; track etiqueta) {
          <span class="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-[#374151]">
            #{{ etiqueta }}
          </span>
        }
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-gray-200 pt-4 text-[11px] text-[#374151]">
        <span class="font-semibold text-[#374151]">{{ articulo().autor }}</span>
        <span aria-hidden="true">·</span>
        <time [attr.datetime]="articulo().fecha">
          {{ articulo().fecha | date: 'd MMM y' : undefined : 'es-CO' }}
        </time>
        <span aria-hidden="true">·</span>
        <span>{{ articulo().minutosLectura | number: '1.0-0' : 'es-CO' }} min</span>
      </div>

      <button
        type="button"
        class="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#9D343C] transition group-hover:gap-3"
        (click)="ver.emit(articulo())"
      >
        Leer artículo
        <span aria-hidden="true">→</span>
      </button>
    </article>
  `,
})
export class BlogCardComponent {
  readonly articulo = input.required<ArticuloBlog>();
  readonly guardado = input(false);
  readonly ver = output<ArticuloBlog>();
  readonly guardar = output<number>();

  claseCategoria(): string {
    switch (this.articulo().categoria) {
      case 'SALUD':
        return 'border-[#9D343C]/25 bg-[#9D343C]/10 text-[#9D343C]';
      case 'PREVENCION':
        return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-700';
      case 'NUTRICION':
        return 'border-amber-300/25 bg-amber-300/10 text-amber-800';
      case 'ESTETICA':
        return 'border-[#9D343C]/25 bg-[#9D343C]/10 text-[#9D343C]';
      default:
        return 'border-[#D1D5DB]/20 bg-gray-50 text-[#374151]';
    }
  }
}
