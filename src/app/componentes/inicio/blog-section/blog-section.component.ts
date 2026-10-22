import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ArticuloBlog, CategoriaBlog, CATEGORIAS_BLOG } from '../../../modelos/articulo-blog';
import { CategoriaBlogPipe } from '../../../pipes/categoria-blog.pipe';
import { BlogService, FiltroCategoriaBlog } from '../../../servicios/blog.service';
import { BlogCardComponent } from '../blog-card/blog-card.component';

@Component({
  selector: 'app-blog-section',
  imports: [BlogCardComponent, CategoriaBlogPipe, DatePipe, DecimalPipe],
  template: `
    <section id="blog" class="scroll-mt-24 border-b border-white/5 px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#7FE7E9]">
              Blog de cuidado
            </p>
            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-[#FFFFE3] sm:text-4xl">
              Información útil para cuidar mejor
            </h2>
            <p class="mt-4 text-sm leading-relaxed text-[#CBCBCB]/65 sm:text-base">
              Artículos escritos por el equipo de la clínica sobre salud, prevención, nutrición y
              estética. Guarda los que quieras leer después.
            </p>
          </div>

          @if (blog.totalGuardados() > 0) {
            <p class="inline-flex w-fit items-center gap-2 rounded-full border border-[#E8650A]/30 bg-[#E8650A]/10 px-4 py-2 text-xs font-semibold text-[#FFB27A]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1Z" />
              </svg>
              {{ blog.totalGuardados() }} guardado(s) para leer
            </p>
          }
        </div>

        @if (destacadoVisible(); as destacado) {
          <button
            type="button"
            class="mt-9 flex w-full flex-col gap-5 rounded-3xl border border-[#7FE7E9]/20 bg-gradient-to-r from-[#0D7377]/25 via-[#0c2020] to-[#071313] p-6 text-left transition hover:border-[#7FE7E9]/40 sm:flex-row sm:items-center sm:justify-between sm:p-8"
            (click)="abrirArticulo(destacado)"
          >
            <div class="max-w-3xl">
              <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7FE7E9]">
                Lectura recomendada
              </p>
              <h3 class="mt-2 text-xl font-extrabold text-[#FFFFE3] sm:text-2xl">
                {{ destacado.titulo }}
              </h3>
              <p class="mt-2 line-clamp-2 text-sm text-[#CBCBCB]/65">{{ destacado.resumen }}</p>
              <p class="mt-3 text-xs text-[#CBCBCB]/45">
                {{ destacado.autor }} · {{ destacado.fecha | date: 'd MMM y' : undefined : 'es-CO' }} ·
                {{ destacado.minutosLectura | number: '1.0-0' : 'es-CO' }} min de lectura
              </p>
            </div>
            <span class="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#FFFFE3] px-5 py-3 text-xs font-bold text-[#071313] sm:self-center">
              Leer ahora
              <span aria-hidden="true">→</span>
            </span>
          </button>
        }

        <div
          class="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoría">
            @for (opcion of categorias; track opcion.valor) {
              <button
                type="button"
                class="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                [class]="
                  blog.categoria() === opcion.valor
                    ? 'border-[#0D7377] bg-[#0D7377] text-[#FFFFE3]'
                    : 'border-transparent text-[#CBCBCB] hover:bg-white/5 hover:text-[#FFFFE3]'
                "
                [attr.aria-pressed]="blog.categoria() === opcion.valor"
                (click)="blog.cambiarCategoria(opcion.valor)"
              >
                {{ opcion.etiqueta }}
                <span class="ml-1 text-[10px] opacity-60">{{ totalCategoria(opcion.valor) }}</span>
              </button>
            }
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <label class="input input-sm flex w-full items-center gap-2 rounded-full border-white/10 bg-[#071313] lg:w-64">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5Z" />
              </svg>
              <input
                type="search"
                class="grow bg-transparent text-xs"
                placeholder="Buscar artículo o etiqueta"
                aria-label="Buscar artículos del blog"
                [value]="blog.busqueda()"
                (input)="blog.cambiarBusqueda($any($event.target).value)"
              />
            </label>

            @if (!sinFiltros()) {
              <button
                type="button"
                class="btn btn-ghost btn-sm rounded-full text-xs text-[#7FE7E9]"
                (click)="blog.reiniciarFiltros()"
              >
                Limpiar filtros
              </button>
            }
          </div>
        </div>

        <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (articulo of blog.articulosFiltrados(); track articulo.id) {
            <app-blog-card
              [articulo]="articulo"
              [guardado]="blog.esGuardado(articulo.id)"
              (ver)="abrirArticulo($event)"
              (guardar)="blog.alternarGuardado($event)"
            />
          } @empty {
            <div class="col-span-full rounded-3xl border border-dashed border-white/15 px-6 py-14 text-center">
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-xl" aria-hidden="true">
                📝
              </div>
              <p class="mt-4 text-lg font-bold text-[#FFFFE3]">No encontramos artículos</p>

              @switch (blog.categoria()) {
                @case ('TODAS') {
                  @if (blog.busqueda()) {
                    <p class="mx-auto mt-2 max-w-md text-sm text-[#CBCBCB]/55">
                      No hay coincidencias para “{{ blog.busqueda() }}”. Prueba con otra palabra o
                      limpia los filtros.
                    </p>
                  } @else {
                    <p class="mt-2 text-sm text-[#CBCBCB]/55">
                      Todavía no hay artículos publicados.
                    </p>
                  }
                }
                @case ('SALUD') {
                  <p class="mt-2 text-sm text-[#CBCBCB]/55">
                    No hay artículos de salud con este filtro. Revisa las demás categorías.
                  </p>
                }
                @case ('PREVENCION') {
                  <p class="mt-2 text-sm text-[#CBCBCB]/55">
                    No hay artículos de prevención con este filtro.
                  </p>
                }
                @case ('NUTRICION') {
                  <p class="mt-2 text-sm text-[#CBCBCB]/55">
                    No hay artículos de nutrición con este filtro.
                  </p>
                }
                @case ('ESTETICA') {
                  <p class="mt-2 text-sm text-[#CBCBCB]/55">
                    No hay artículos de estética con este filtro.
                  </p>
                }
                @default {
                  <p class="mt-2 text-sm text-[#CBCBCB]/55">
                    No hay artículos de la categoría clínica con este filtro.
                  </p>
                }
              }

              <button
                type="button"
                class="btn btn-primary btn-sm mt-5 rounded-full"
                (click)="blog.reiniciarFiltros()"
              >
                Ver todos los artículos
              </button>
            </div>
          }
        </div>

        <p class="mt-6 text-xs text-[#CBCBCB]/40">
          Mostrando {{ blog.articulosFiltrados().length }} de {{ blog.totalArticulos() }} artículos.
        </p>
      </div>

      @if (seleccionado(); as articulo) {
        <div
          class="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
          (click)="cerrarArticulo()"
        >
          <article
            class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0c2020] shadow-2xl sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            [attr.aria-label]="articulo.titulo"
            (click)="$event.stopPropagation()"
          >
            <div class="border-b border-white/10 bg-gradient-to-r from-[#0D7377]/25 to-transparent p-6 sm:p-8">
              <div class="flex items-start justify-between gap-4">
                <span
                  class="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                  [class]="claseCategoria(articulo.categoria)"
                >
                  {{ articulo.categoria | categoriaBlog }}
                </span>
                <button
                  type="button"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#CBCBCB] transition hover:bg-white/10 hover:text-[#FFFFE3]"
                  aria-label="Cerrar artículo"
                  (click)="cerrarArticulo()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h2 class="mt-4 text-2xl font-extrabold leading-tight text-[#FFFFE3] sm:text-3xl">
                {{ articulo.titulo }}
              </h2>
              <p class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#CBCBCB]/50">
                <span class="font-semibold text-[#CBCBCB]/70">{{ articulo.autor }}</span>
                <span aria-hidden="true">·</span>
                <time [attr.datetime]="articulo.fecha">
                  {{ articulo.fecha | date: 'd MMMM y' : undefined : 'es-CO' }}
                </time>
                <span aria-hidden="true">·</span>
                <span>{{ articulo.minutosLectura | number: '1.0-0' : 'es-CO' }} min de lectura</span>
              </p>
            </div>

            <div class="space-y-4 p-6 text-sm leading-relaxed text-[#CBCBCB]/75 sm:p-8 sm:text-[15px]">
              @for (parrafo of articulo.contenido; track $index) {
                <p>{{ parrafo }}</p>
              }
            </div>

            <div class="flex flex-col gap-3 border-t border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div class="flex flex-wrap gap-1.5">
                @for (etiqueta of articulo.etiquetas; track etiqueta) {
                  <span class="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-[#CBCBCB]/50">
                    #{{ etiqueta }}
                  </span>
                }
              </div>

              <button
                type="button"
                class="btn btn-sm rounded-full"
                [class]="
                  blog.esGuardado(articulo.id)
                    ? 'border-[#E8650A]/40 bg-[#E8650A]/15 text-[#FFB27A]'
                    : 'btn-outline'
                "
                (click)="blog.alternarGuardado(articulo.id)"
              >
                {{ blog.esGuardado(articulo.id) ? 'Guardado' : 'Guardar para leer' }}
              </button>
            </div>
          </article>
        </div>
      }
    </section>
  `,
})
export class BlogSectionComponent {
  readonly blog = inject(BlogService);
  readonly categorias = CATEGORIAS_BLOG;
  readonly seleccionado = signal<ArticuloBlog | null>(null);

  readonly sinFiltros = computed(
    () => this.blog.categoria() === 'TODAS' && this.blog.busqueda().trim().length === 0,
  );

  readonly destacadoVisible = computed(() =>
    this.sinFiltros() ? this.blog.articuloDestacado() : null,
  );

  totalCategoria(categoria: FiltroCategoriaBlog): number {
    const totales = this.blog.totalPorCategoria();

    switch (categoria) {
      case 'TODAS':
        return totales.todas;
      case 'SALUD':
        return totales.salud;
      case 'PREVENCION':
        return totales.prevencion;
      case 'NUTRICION':
        return totales.nutricion;
      case 'ESTETICA':
        return totales.estetica;
      default:
        return totales.clinica;
    }
  }

  abrirArticulo(articulo: ArticuloBlog): void {
    this.seleccionado.set(articulo);
  }

  cerrarArticulo(): void {
    this.seleccionado.set(null);
  }

  claseCategoria(categoria: CategoriaBlog): string {
    switch (categoria) {
      case 'SALUD':
        return 'border-[#7FE7E9]/25 bg-[#7FE7E9]/10 text-[#7FE7E9]';
      case 'PREVENCION':
        return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
      case 'NUTRICION':
        return 'border-amber-300/25 bg-amber-300/10 text-amber-200';
      case 'ESTETICA':
        return 'border-[#E8650A]/25 bg-[#E8650A]/10 text-[#FFB27A]';
      default:
        return 'border-[#CBCBCB]/20 bg-white/5 text-[#CBCBCB]';
    }
  }
}
