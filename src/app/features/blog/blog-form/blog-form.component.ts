import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CATEGORIAS_BLOG, CategoriaBlog } from '../../../modelos/articulo-blog';
import { BlogService } from '../../../servicios/blog.service';
import { FormularioArticulo, convertirArticulo } from './blog-form.model';
import { tituloUnico } from './titulo-unico.validator';

type CampoFormulario =
  'titulo' | 'autor' | 'categoria' | 'resumen' | 'contenido' | 'minutosLectura' | 'etiquetas';

@Component({
  selector: 'app-blog-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <nav aria-label="Migas de pan" class="text-xs font-semibold text-[#374151]">
          <a routerLink="/" class="transition hover:text-[#9D343C]">Inicio</a>
          <span class="mx-2" aria-hidden="true">/</span>
          <a routerLink="/blog" class="transition hover:text-[#9D343C]">Blog</a>
          <span class="mx-2" aria-hidden="true">/</span>
          <span aria-current="page">Publicar artículo</span>
        </nav>

        <div class="mt-6 max-w-2xl">
          <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-[#9D343C]">
            Nuevo artículo
          </p>
          <h1 class="mt-3 text-3xl font-extrabold tracking-tight text-[#374151] sm:text-4xl">
            Comparte una guía de cuidado
          </h1>
          <p class="mt-4 text-sm leading-relaxed text-[#374151] sm:text-base">
            El artículo se guarda con los datos locales de la aplicación y aparece de inmediato en
            el listado del blog, sin recargar la página.
          </p>
        </div>

        <form
          class="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
          [formGroup]="formulario"
          (ngSubmit)="publicar()"
          novalidate
        >
          <div class="grid gap-5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label for="titulo" class="mb-1.5 block text-sm font-bold text-[#374151]">
                Título <span class="text-[#9D343C]" aria-hidden="true">*</span>
              </label>
              <input
                id="titulo"
                type="text"
                class="input w-full rounded-xl"
                [class.campo-invalido]="invalido('titulo')"
                formControlName="titulo"
                aria-required="true"
                [attr.aria-invalid]="invalido('titulo') ? 'true' : null"
                [attr.aria-describedby]="mensajeError('titulo') ? 'titulo-error' : null"
              />
              <p class="mt-1 text-xs text-[#374151]">Entre 10 y 90 caracteres.</p>
              @if (mensajeError('titulo'); as mensaje) {
                <p id="titulo-error" class="mt-1 text-xs font-semibold text-[#B91C1C]" role="alert">
                  {{ mensaje }}
                </p>
              }
            </div>

            <div>
              <label for="autor" class="mb-1.5 block text-sm font-bold text-[#374151]">
                Autor <span class="text-[#9D343C]" aria-hidden="true">*</span>
              </label>
              <input
                id="autor"
                type="text"
                class="input w-full rounded-xl"
                [class.campo-invalido]="invalido('autor')"
                formControlName="autor"
                aria-required="true"
                [attr.aria-invalid]="invalido('autor') ? 'true' : null"
                [attr.aria-describedby]="mensajeError('autor') ? 'autor-error' : null"
              />
              @if (mensajeError('autor'); as mensaje) {
                <p id="autor-error" class="mt-1 text-xs font-semibold text-[#B91C1C]" role="alert">
                  {{ mensaje }}
                </p>
              }
            </div>

            <div>
              <label for="categoria" class="mb-1.5 block text-sm font-bold text-[#374151]">
                Categoría <span class="text-[#9D343C]" aria-hidden="true">*</span>
              </label>
              <select
                id="categoria"
                class="select w-full rounded-xl"
                [class.campo-invalido]="invalido('categoria')"
                formControlName="categoria"
                aria-required="true"
                [attr.aria-invalid]="invalido('categoria') ? 'true' : null"
                [attr.aria-describedby]="mensajeError('categoria') ? 'categoria-error' : null"
              >
                <option value="">Selecciona una categoría</option>
                @for (categoria of categorias; track categoria.valor) {
                  <option [value]="categoria.valor">{{ categoria.etiqueta }}</option>
                }
              </select>
              @if (mensajeError('categoria'); as mensaje) {
                <p
                  id="categoria-error"
                  class="mt-1 text-xs font-semibold text-[#B91C1C]"
                  role="alert"
                >
                  {{ mensaje }}
                </p>
              }
            </div>

            <div class="sm:col-span-2">
              <label for="resumen" class="mb-1.5 block text-sm font-bold text-[#374151]">
                Resumen <span class="text-[#9D343C]" aria-hidden="true">*</span>
              </label>
              <textarea
                id="resumen"
                rows="3"
                class="textarea w-full rounded-xl"
                [class.campo-invalido]="invalido('resumen')"
                formControlName="resumen"
                aria-required="true"
                [attr.aria-invalid]="invalido('resumen') ? 'true' : null"
                [attr.aria-describedby]="mensajeError('resumen') ? 'resumen-error' : null"
              ></textarea>
              <p class="mt-1 text-xs text-[#374151]">Entre 40 y 220 caracteres.</p>
              @if (mensajeError('resumen'); as mensaje) {
                <p
                  id="resumen-error"
                  class="mt-1 text-xs font-semibold text-[#B91C1C]"
                  role="alert"
                >
                  {{ mensaje }}
                </p>
              }
            </div>

            <div class="sm:col-span-2">
              <label for="contenido" class="mb-1.5 block text-sm font-bold text-[#374151]">
                Contenido <span class="text-[#9D343C]" aria-hidden="true">*</span>
              </label>
              <textarea
                id="contenido"
                rows="8"
                class="textarea w-full rounded-xl"
                [class.campo-invalido]="invalido('contenido')"
                formControlName="contenido"
                aria-required="true"
                [attr.aria-invalid]="invalido('contenido') ? 'true' : null"
                [attr.aria-describedby]="mensajeError('contenido') ? 'contenido-error' : null"
              ></textarea>
              <p class="mt-1 text-xs text-[#374151]">
                Mínimo 120 caracteres. Separa los párrafos con una línea en blanco.
              </p>
              @if (mensajeError('contenido'); as mensaje) {
                <p
                  id="contenido-error"
                  class="mt-1 text-xs font-semibold text-[#B91C1C]"
                  role="alert"
                >
                  {{ mensaje }}
                </p>
              }
            </div>

            <div>
              <label for="minutos-lectura" class="mb-1.5 block text-sm font-bold text-[#374151]">
                Minutos de lectura <span class="text-[#9D343C]" aria-hidden="true">*</span>
              </label>
              <input
                id="minutos-lectura"
                type="number"
                min="1"
                max="60"
                class="input w-full rounded-xl"
                [class.campo-invalido]="invalido('minutosLectura')"
                formControlName="minutosLectura"
                aria-required="true"
                [attr.aria-invalid]="invalido('minutosLectura') ? 'true' : null"
                [attr.aria-describedby]="
                  mensajeError('minutosLectura') ? 'minutos-lectura-error' : null
                "
              />
              @if (mensajeError('minutosLectura'); as mensaje) {
                <p
                  id="minutos-lectura-error"
                  class="mt-1 text-xs font-semibold text-[#B91C1C]"
                  role="alert"
                >
                  {{ mensaje }}
                </p>
              }
            </div>

            <div>
              <label for="etiquetas" class="mb-1.5 block text-sm font-bold text-[#374151]">
                Etiquetas <span class="text-[#9D343C]" aria-hidden="true">*</span>
              </label>
              <input
                id="etiquetas"
                type="text"
                class="input w-full rounded-xl"
                [class.campo-invalido]="invalido('etiquetas')"
                formControlName="etiquetas"
                aria-required="true"
                placeholder="salud, prevención, gatos"
                [attr.aria-invalid]="invalido('etiquetas') ? 'true' : null"
                [attr.aria-describedby]="mensajeError('etiquetas') ? 'etiquetas-error' : null"
              />
              <p class="mt-1 text-xs text-[#374151]">Sepáralas con comas.</p>
              @if (mensajeError('etiquetas'); as mensaje) {
                <p
                  id="etiquetas-error"
                  class="mt-1 text-xs font-semibold text-[#B91C1C]"
                  role="alert"
                >
                  {{ mensaje }}
                </p>
              }
            </div>

            <div class="sm:col-span-2">
              <label
                class="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <input
                  id="destacado"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 rounded border-gray-300"
                  formControlName="destacado"
                />
                <span class="text-sm text-[#374151]">
                  <span class="block font-bold">Destacar en la portada</span>
                  <span class="mt-0.5 block text-xs">
                    Si se marca, reemplaza el artículo recomendado de la landing.
                  </span>
                </span>
              </label>
            </div>
          </div>

          @if (formulario.invalid) {
            <p
              class="mt-6 rounded-xl bg-[#9D343C]/10 px-4 py-3 text-xs font-semibold text-[#7D2931]"
            >
              Completa los campos marcados con * para habilitar la publicación.
            </p>
          }

          <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <a routerLink="/blog" class="btn rounded-full border border-gray-200 px-5">Cancelar</a>
            <button
              type="submit"
              class="btn btn-primary rounded-full px-5 disabled:cursor-not-allowed disabled:opacity-60"
              [disabled]="formulario.invalid"
            >
              Publicar artículo
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: `
    .campo-invalido {
      border-color: #b91c1c !important;
    }
  `,
})
export class BlogFormComponent {
  readonly blog = inject(BlogService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly categorias = CATEGORIAS_BLOG.filter(
    (categoria): categoria is { valor: CategoriaBlog; etiqueta: string } =>
      categoria.valor !== 'TODAS',
  );

  readonly formulario = this.fb.group({
    titulo: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(90),
      tituloUnico(() => this.blog.articulos()),
    ]),
    autor: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(60),
    ]),
    categoria: this.fb.control<CategoriaBlog | ''>('', [Validators.required]),
    resumen: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(40),
      Validators.maxLength(220),
    ]),
    contenido: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(120)]),
    minutosLectura: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(60),
    ]),
    etiquetas: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^[^,]+(,\s*[^,]+)*$/),
    ]),
    destacado: this.fb.nonNullable.control(false),
  });

  publicar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valor = this.formulario.getRawValue() as FormularioArticulo;
    const nuevo = this.blog.crearArticulo(convertirArticulo(valor));

    this.formulario.reset({
      titulo: '',
      autor: '',
      categoria: '',
      resumen: '',
      contenido: '',
      minutosLectura: null,
      etiquetas: '',
      destacado: false,
    });

    void this.router.navigate(['/blog'], { queryParams: { creado: nuevo.id } });
  }

  invalido(campo: CampoFormulario): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  mensajeError(campo: CampoFormulario): string {
    const control = this.formulario.get(campo);

    if (!control || control.valid || (!control.touched && !control.dirty)) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('tituloDuplicado')) {
      return 'Ya existe un artículo con este título.';
    }

    const minLength = control.getError('minlength') as { requiredLength: number } | null;
    if (minLength) {
      return `Escribe al menos ${minLength.requiredLength} caracteres.`;
    }

    const maxLength = control.getError('maxlength') as { requiredLength: number } | null;
    if (maxLength) {
      return `No superes los ${maxLength.requiredLength} caracteres.`;
    }

    const min = control.getError('min') as { min: number } | null;
    if (min) {
      return `El valor mínimo es ${min.min}.`;
    }

    const max = control.getError('max') as { max: number } | null;
    if (max) {
      return `El valor máximo es ${max.max}.`;
    }

    if (control.hasError('pattern')) {
      return 'Separa las etiquetas con comas.';
    }

    return 'Revisa este campo.';
  }
}
