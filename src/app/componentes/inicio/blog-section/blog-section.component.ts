import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ArticuloBlog, CATEGORIAS_BLOG } from '../../../modelos/articulo-blog';
import { BlogService } from '../../../servicios/blog.service';
import { BlogCardComponent } from '../blog-card/blog-card.component';

@Component({
  selector: 'app-blog-section',
  imports: [BlogCardComponent, DatePipe, DecimalPipe, ReactiveFormsModule, RouterLink],
  template: `
    <section id="blog" class="scroll-mt-24 border-b border-gray-200 px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#9D343C]">
              Blog de cuidado
            </p>
            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-[#374151] sm:text-4xl">
              Información útil para cuidar mejor
            </h2>
            <p class="mt-4 text-sm leading-relaxed text-[#374151] sm:text-base">
              Artículos escritos por el equipo de la clínica sobre salud, prevención, nutrición y
              estética. Guarda los que quieras leer después.
            </p>
          </div>

          <a
            routerLink="/blog"
            class="btn h-11 shrink-0 rounded-full border border-[#9D343C]/25 bg-[#9D343C]/10 px-5 text-sm font-bold text-[#9D343C] hover:bg-[#9D343C]/20"
          >
            Ver todos los artículos
            <span aria-hidden="true">→</span>
          </a>
        </div>

        @if (blog.articuloDestacado(); as destacado) {
          <a
            [routerLink]="['/blog', destacado.id]"
            class="mt-9 flex w-full flex-col gap-5 rounded-3xl border border-[#9D343C]/20 bg-white p-6 text-left transition hover:border-[#9D343C]/40 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div class="max-w-3xl">
              <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9D343C]">
                Lectura recomendada
              </p>
              <h3 class="mt-2 text-xl font-extrabold text-[#374151] sm:text-2xl">
                {{ destacado.titulo }}
              </h3>
              <p class="mt-2 line-clamp-2 text-sm text-[#374151]">{{ destacado.resumen }}</p>
              <p class="mt-3 text-xs text-[#374151]">
                {{ destacado.autor }} · {{ destacado.fecha | date: 'd MMM y' : undefined : 'es-CO' }} ·
                {{ destacado.minutosLectura | number: '1.0-0' : 'es-CO' }} min de lectura
              </p>
            </div>
            <span class="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#F3F4F6] px-5 py-3 text-xs font-bold text-[#1F2937] sm:self-center">
              Leer ahora
              <span aria-hidden="true">→</span>
            </span>
          </a>
        }

        <div
          class="mt-8 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoría">
            @for (opcion of categorias; track opcion.valor) {
              <button
                type="button"
                class="blog-category-filter rounded-full border px-3 py-1.5 text-xs font-semibold transition duration-200"
                [class]="
                  blog.categoria() === opcion.valor
                    ? 'border-[#9D343C] bg-[#9D343C] text-white'
                    : 'border-transparent text-[#374151] hover:bg-gray-200 hover:text-[#374151]'
                "
                [attr.aria-pressed]="blog.categoria() === opcion.valor"
                (click)="blog.cambiarCategoria(opcion.valor)"
              >
                {{ opcion.etiqueta }}
                <span class="ml-1 text-[10px]">{{ blog.totalPorCategoria()[opcion.valor] }}</span>
              </button>
            }
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <label class="input input-sm flex w-full items-center gap-2 rounded-full border-gray-200 bg-[#FFFFFF] lg:w-64">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.15 6.15a7.5 7.5 0 0 0 10.5 10.5Z"
                />
              </svg>
              <input
                type="search"
                class="grow bg-transparent text-xs"
                placeholder="Buscar artículo o etiqueta"
                aria-label="Buscar artículos del blog"
                [formControl]="buscador"
              />
            </label>

            @if (!sinFiltros()) {
              <button
                type="button"
                class="btn btn-ghost btn-sm rounded-full text-xs text-[#9D343C]"
                (click)="reiniciarFiltros()"
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
              (ver)="verArticulo($event)"
              (guardar)="blog.alternarGuardado($event)"
            />
          } @empty {
            <div class="col-span-full rounded-3xl border border-dashed border-gray-200 px-6 py-14 text-center">
              <div
                class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-xl"
                aria-hidden="true"
              >
                📝
              </div>
              <p class="mt-4 text-lg font-bold text-[#374151]">No encontramos artículos</p>
              <p class="mx-auto mt-2 max-w-md text-sm text-[#374151]">
                @if (blog.busqueda()) {
                  No hay coincidencias para “{{ blog.busqueda() }}”. Prueba con otra palabra o
                  limpia los filtros.
                } @else {
                  No hay artículos en esta categoría. Selecciona otra para ver el blog completo.
                }
              </p>
              <button
                type="button"
                class="btn btn-primary btn-sm mt-5 rounded-full"
                (click)="reiniciarFiltros()"
              >
                Ver todos los artículos
              </button>
            </div>
          }
        </div>

        <p class="mt-6 text-xs text-[#374151]">
          Mostrando {{ blog.articulosFiltrados().length }} de {{ blog.totalArticulos() }} artículos.
        </p>
      </div>
    </section>
  `,
  styles: `
    .blog-category-filter:hover,
    .blog-category-filter:focus-visible {
      box-shadow: 0 2px 8px rgba(55, 65, 81, 0.12);
    }
    .blog-category-filter[aria-pressed='true']:hover,
    .blog-category-filter[aria-pressed='true']:focus-visible {
      background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(125, 41, 49, 0.35));
      box-shadow: 0 3px 10px rgba(125, 41, 49, 0.25);
    }
  `,
})
export class BlogSectionComponent {
  readonly blog = inject(BlogService);
  private readonly router = inject(Router);

  readonly categorias = CATEGORIAS_BLOG;
  readonly buscador = new FormControl(this.blog.busqueda(), { nonNullable: true });

  readonly sinFiltros = computed(
    () => this.blog.categoria() === 'TODAS' && this.blog.busqueda().trim().length === 0,
  );

  constructor() {
    this.buscador.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((valor) => this.blog.cambiarBusqueda(valor));
  }

  verArticulo(articulo: ArticuloBlog): void {
    void this.router.navigate(['/blog', articulo.id]);
  }

  reiniciarFiltros(): void {
    this.buscador.setValue('');
    this.blog.reiniciarFiltros();
  }
}
