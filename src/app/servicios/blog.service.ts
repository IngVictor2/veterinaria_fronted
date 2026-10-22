import { computed, Injectable, signal } from '@angular/core';
import { ARTICULOS_BLOG } from '../datos/articulos-blog';
import { ArticuloBlog, CategoriaBlog } from '../modelos/articulo-blog';

export type FiltroCategoriaBlog = CategoriaBlog | 'TODAS';

/**
 * Dueño del estado del blog: artículos, filtro por categoría, búsqueda y
 * artículos guardados. La señal se expone como readonly y solo cambia por
 * medio de métodos con nombre.
 */
@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly _articulos = signal<ArticuloBlog[]>(ARTICULOS_BLOG);
  private readonly _categoria = signal<FiltroCategoriaBlog>('TODAS');
  private readonly _busqueda = signal('');
  private readonly _guardados = signal<ReadonlySet<number>>(new Set<number>());

  readonly articulos = this._articulos.asReadonly();
  readonly categoria = this._categoria.asReadonly();
  readonly busqueda = this._busqueda.asReadonly();
  readonly guardados = this._guardados.asReadonly();

  readonly totalArticulos = computed(() => this._articulos().length);

  readonly totalGuardados = computed(() => this._guardados().size);

  readonly totalPorCategoria = computed(() => {
    const articulos = this._articulos();

    return {
      todas: articulos.length,
      salud: articulos.filter((articulo) => articulo.categoria === 'SALUD').length,
      prevencion: articulos.filter((articulo) => articulo.categoria === 'PREVENCION').length,
      nutricion: articulos.filter((articulo) => articulo.categoria === 'NUTRICION').length,
      estetica: articulos.filter((articulo) => articulo.categoria === 'ESTETICA').length,
      clinica: articulos.filter((articulo) => articulo.categoria === 'CLINICA').length,
    };
  });

  readonly articulosFiltrados = computed(() => {
    const categoria = this._categoria();
    const termino = this._normalizar(this._busqueda().trim());

    return this._articulos().filter((articulo) => {
      if (categoria !== 'TODAS' && articulo.categoria !== categoria) {
        return false;
      }

      if (!termino) {
        return true;
      }

      return [articulo.titulo, articulo.resumen, articulo.categoria, ...articulo.etiquetas]
        .map((valor) => this._normalizar(valor))
        .some((valor) => valor.includes(termino));
    });
  });

  readonly articuloDestacado = computed(
    () => this._articulos().find((articulo) => articulo.destacado) ?? null,
  );

  cambiarCategoria(categoria: FiltroCategoriaBlog): void {
    this._categoria.set(categoria);
  }

  cambiarBusqueda(texto: string): void {
    this._busqueda.set(texto);
  }

  alternarGuardado(id: number): void {
    this._guardados.update((guardados) => {
      const copia = new Set(guardados);

      if (copia.has(id)) {
        copia.delete(id);
      } else {
        copia.add(id);
      }

      return copia;
    });
  }

  esGuardado(id: number): boolean {
    return this._guardados().has(id);
  }

  reiniciarFiltros(): void {
    this._categoria.set('TODAS');
    this._busqueda.set('');
  }

  private _normalizar(texto: string): string {
    return texto
      .toLocaleLowerCase('es-CO')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
