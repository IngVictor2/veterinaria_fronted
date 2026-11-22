import { Component, computed, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ArticuloBlog, CATEGORIAS_BLOG } from '../../../modelos/articulo-blog';
import { BlogService } from '../../../servicios/blog.service';
import { BlogCardComponent } from '../../../componentes/inicio/blog-card/blog-card.component';

@Component({
  selector: 'app-blog-list',
  imports: [ReactiveFormsModule, RouterLink, BlogCardComponent],
  template: `
    <section class="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <nav aria-label="Migas de pan" class="text-xs font-semibold text-[#374151]">
          <a routerLink="/" class="transition hover:text-[#9D343C]">Inicio</a>
          <span class="mx-2" aria-hidden="true">/</span>
          <span aria-current="page">Blog</span>
        </nav>

        <div class="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#9D343C]">
              Blog de cuidado
            </p>
            <h1 class="mt-3 text-3xl font-extrabold tracking-tight text-[#374151] sm:text-4xl">
              Artículos para cuidar mejor
            </h1>
            <p class="mt-4 text-sm leading-relaxed text-[#374151] sm:text-base">
              Consulta las guías del equipo de la clínica y filtra por categoría o por texto. Los
              artículos nuevos aparecen en esta misma lista.
            </p>
          </div>

          <a
            routerLink="/blog/nuevo"
            class="btn btn-primary h-11 shrink-0 rounded-full px-5 text-sm font-bold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 5v14m-7-7h14"
              />
            </svg>
            Publicar artículo
          </a>
        </div>

        @if (creado(); as id) {
          <div
            class="mt-6 flex flex-col gap-2 rounded-2xl border border-emerald-700/25 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p class="font-semibold">El artículo se publicó y ya aparece en el listado.</p>
            <a
              [routerLink]="['/blog', id]"
              class="font-bold underline decoration-emerald-700/40 underline-offset-4"
            >
              Ver el artículo
            </a>
          </div>
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
            <label
              class="input input-sm flex w-full items-center gap-2 rounded-full border-gray-200 bg-white lg:w-80"
            >
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
                id="busqueda-blog"
                type="search"
                class="grow bg-transparent text-xs"
                placeholder="Buscar por título, resumen o etiqueta"
                aria-label="Buscar artículos del blog"
                [formControl]="buscador"
              />
            </label>

            @if (!sinFiltros()) {
              <button
                type="button"
                class="btn btn-ghost btn-sm rounded-full text-xs text-[#9D343C]"
                (click)="limpiarFiltros()"
              >
                Limpiar filtros
              </button>
            }
          </div>
        </div>

        <p class="mt-6 text-xs text-[#374151]" role="status">
          Mostrando {{ blog.articulosFiltrados().length }} de {{ blog.totalArticulos() }} artículos.
          @if (blog.busqueda()) {
            <span> Búsqueda: “{{ blog.busqueda() }}”.</span>
          }
        </p>

        <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (articulo of blog.articulosFiltrados(); track articulo.id) {
            <app-blog-card
              [articulo]="articulo"
              [guardado]="blog.esGuardado(articulo.id)"
              (ver)="abrirArticulo($event)"
              (guardar)="blog.alternarGuardado($event)"
            />
          } @empty {
            <div
              class="col-span-full rounded-3xl border border-dashed border-gray-300 bg-white/70 px-6 py-14 text-center"
            >
              <p class="text-lg font-bold text-[#374151]">No encontramos artículos</p>
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
                (click)="limpiarFiltros()"
              >
                Ver todos los artículos
              </button>
            </div>
          }
        </div>
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
export class BlogListComponent {
  readonly blog = inject(BlogService);
  private readonly router = inject(Router);

  readonly categorias = CATEGORIAS_BLOG;
  readonly creado = input<string>();

  readonly buscador = new FormControl(this.blog.busqueda(), { nonNullable: true });

  readonly sinFiltros = computed(
    () => this.blog.categoria() === 'TODAS' && this.blog.busqueda().trim().length === 0,
  );

  constructor() {
    this.buscador.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((valor) => this.blog.cambiarBusqueda(valor));
  }

  abrirArticulo(articulo: ArticuloBlog): void {
    void this.router.navigate(['/blog', articulo.id]);
  }

  limpiarFiltros(): void {
    this.buscador.setValue('');
    this.blog.reiniciarFiltros();
  }
}
