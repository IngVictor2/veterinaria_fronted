import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CategoriaBlogPipe } from '../../../pipes/categoria-blog.pipe';
import { BlogService } from '../../../servicios/blog.service';

@Component({
  selector: 'app-blog-detail',
  imports: [RouterLink, DatePipe, DecimalPipe, CategoriaBlogPipe],
  template: `
    <section class="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <nav aria-label="Migas de pan" class="text-xs font-semibold text-[#374151]">
          <a routerLink="/" class="transition hover:text-[#9D343C]">Inicio</a>
          <span class="mx-2" aria-hidden="true">/</span>
          <a routerLink="/blog" class="transition hover:text-[#9D343C]">Blog</a>
          <span class="mx-2" aria-hidden="true">/</span>
          <span aria-current="page">Artículo</span>
        </nav>

        @if (articulo(); as articulo) {
          <article class="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white">
            <header class="border-b border-gray-200 bg-white p-6 sm:p-8">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded-full border border-[#9D343C]/25 bg-[#9D343C]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9D343C]"
                >
                  {{ articulo.categoria | categoriaBlog }}
                </span>
                @if (articulo.destacado) {
                  <span
                    class="rounded-full bg-[#9D343C]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9D343C]"
                  >
                    Destacado
                  </span>
                }
              </div>

              <h1 class="mt-4 text-3xl font-extrabold leading-tight text-[#374151] sm:text-4xl">
                {{ articulo.titulo }}
              </h1>

              <p class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#374151]">
                <span class="font-semibold text-[#374151]">{{ articulo.autor }}</span>
                <span aria-hidden="true">·</span>
                <time [attr.datetime]="articulo.fecha">
                  {{ articulo.fecha | date: 'd MMMM y' : undefined : 'es-CO' }}
                </time>
                <span aria-hidden="true">·</span>
                <span
                  >{{ articulo.minutosLectura | number: '1.0-0' : 'es-CO' }} min de lectura</span
                >
              </p>

              <p
                class="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-[#374151]"
              >
                {{ articulo.resumen }}
              </p>
            </header>

            <div class="space-y-4 p-6 text-sm leading-relaxed text-[#374151] sm:p-8 sm:text-[15px]">
              @for (parrafo of articulo.contenido; track $index) {
                <p>{{ parrafo }}</p>
              }
            </div>

            <footer
              class="flex flex-col gap-4 border-t border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
            >
              <div class="flex flex-wrap gap-1.5">
                @for (etiqueta of articulo.etiquetas; track etiqueta) {
                  <span class="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] text-[#374151]">
                    #{{ etiqueta }}
                  </span>
                }
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="btn btn-sm rounded-full"
                  [class]="
                    blog.esGuardado(articulo.id)
                      ? 'border-[#9D343C]/40 bg-[#9D343C]/15 text-[#9D343C]'
                      : 'btn-outline'
                  "
                  [attr.aria-pressed]="blog.esGuardado(articulo.id)"
                  (click)="blog.alternarGuardado(articulo.id)"
                >
                  {{ blog.esGuardado(articulo.id) ? 'Guardado' : 'Guardar para leer' }}
                </button>

                <a routerLink="/blog" class="btn btn-sm rounded-full border border-gray-200">
                  Volver al blog
                </a>
              </div>
            </footer>
          </article>
        } @else {
          <div
            class="mt-8 rounded-3xl border border-dashed border-[#9D343C]/30 bg-white/80 px-6 py-16 text-center"
          >
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#9D343C]">
              Artículo no encontrado
            </p>
            <h1 class="mt-3 text-2xl font-extrabold text-[#374151] sm:text-3xl">
              No encontramos el artículo #{{ id() }}
            </h1>
            <p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#374151]">
              Puede que el identificador esté mal escrito o que el artículo ya no exista. Revisa la
              dirección o vuelve al listado para ver los artículos disponibles.
            </p>
            <div class="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a routerLink="/blog" class="btn btn-primary rounded-full px-5"
                >Ver todos los artículos</a
              >
              <a routerLink="/" class="btn rounded-full border border-gray-200 px-5"
                >Volver al inicio</a
              >
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class BlogDetailComponent {
  readonly blog = inject(BlogService);
  private readonly title = inject(Title);

  readonly id = input.required<string>();

  readonly articulo = computed(() => {
    const id = Number(this.id());
    return Number.isInteger(id) ? this.blog.obtenerPorId(id) : undefined;
  });

  constructor() {
    effect(() => {
      const articulo = this.articulo();
      this.title.setTitle(
        articulo ? `${articulo.titulo} | VetClinic` : 'Artículo no encontrado | VetClinic',
      );
    });
  }
}
