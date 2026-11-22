import { computed, Injectable, signal } from '@angular/core';
import { ARTICULOS_BLOG } from '../datos/articulos-blog';
import { ArticuloBlog, CategoriaBlog } from '../modelos/articulo-blog';

export type FiltroCategoriaBlog = CategoriaBlog | 'TODAS';
export type TotalesBlog = Record<FiltroCategoriaBlog, number>;

export interface NuevoArticuloBlog {
  titulo: string;
  autor: string;
  categoria: CategoriaBlog;
  resumen: string;
  contenido: string[];
  minutosLectura: number;
  etiquetas: string[];
  destacado: boolean;
}

const FORMATO_FECHA_ISO = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

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

  readonly totalPorCategoria = computed<TotalesBlog>(() => {
    const articulos = this._articulos();
    const contar = (categoria: CategoriaBlog): number =>
      articulos.filter((articulo) => articulo.categoria === categoria).length;

    return {
      TODAS: articulos.length,
      SALUD: contar('SALUD'),
      PREVENCION: contar('PREVENCION'),
      NUTRICION: contar('NUTRICION'),
      ESTETICA: contar('ESTETICA'),
      CLINICA: contar('CLINICA'),
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

      return [
        articulo.titulo,
        articulo.resumen,
        articulo.autor,
        articulo.categoria,
        ...articulo.etiquetas,
      ]
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

  obtenerPorId(id: number): ArticuloBlog | undefined {
    return this._articulos().find((articulo) => articulo.id === id);
  }

  crearArticulo(datos: NuevoArticuloBlog): ArticuloBlog {
    const nuevo: ArticuloBlog = {
      id: this._siguienteId(),
      ...datos,
      fecha: FORMATO_FECHA_ISO.format(new Date()),
    };

    this._articulos.update((articulos) => {
      if (!nuevo.destacado) {
        return [nuevo, ...articulos];
      }

      return [nuevo, ...articulos.map((articulo) => ({ ...articulo, destacado: false }))];
    });

    return nuevo;
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

  private _siguienteId(): number {
    return this._articulos().reduce((maximo, articulo) => Math.max(maximo, articulo.id), 0) + 1;
  }

  private _normalizar(texto: string): string {
    return texto
      .toLocaleLowerCase('es-CO')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
