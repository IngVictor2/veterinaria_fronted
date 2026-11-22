import { describe, expect, it } from 'vitest';
import { BlogService, NuevoArticuloBlog } from './blog.service';

const articulo: NuevoArticuloBlog = {
  titulo: 'Cómo preparar el hogar para un gato mayor',
  autor: 'Equipo VetClinic',
  categoria: 'SALUD',
  resumen: 'Una guía breve con recomendaciones para adaptar el hogar a un gato de edad avanzada.',
  contenido: ['Primer párrafo de prueba.', 'Segundo párrafo de prueba.'],
  minutosLectura: 4,
  etiquetas: ['gatos', 'cuidado'],
  destacado: false,
};

describe('estado del blog', () => {
  it('crea un artículo con id consecutivo, fecha local y lo deja al inicio del listado', () => {
    const servicio = new BlogService();
    const idMaximo = Math.max(...servicio.articulos().map((item) => item.id));
    const totalAnterior = servicio.totalArticulos();

    const nuevo = servicio.crearArticulo(articulo);

    expect(nuevo.id).toBe(idMaximo + 1);
    expect(nuevo.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(servicio.articulos()[0]).toEqual(nuevo);
    expect(servicio.totalArticulos()).toBe(totalAnterior + 1);
    expect(servicio.obtenerPorId(nuevo.id)).toEqual(nuevo);
  });

  it('deja un solo artículo destacado cuando el nuevo se marca como destacado', () => {
    const servicio = new BlogService();
    const nuevo = servicio.crearArticulo({ ...articulo, destacado: true });

    expect(servicio.articuloDestacado()?.id).toBe(nuevo.id);
    expect(servicio.articulos().filter((item) => item.destacado)).toHaveLength(1);
  });

  it('filtra por categoría y por texto sin distinguir mayúsculas ni tildes', () => {
    const servicio = new BlogService();

    servicio.cambiarCategoria('SALUD');
    expect(servicio.articulosFiltrados().every((item) => item.categoria === 'SALUD')).toBe(true);

    servicio.cambiarCategoria('TODAS');
    servicio.cambiarBusqueda('VACUNACION');
    expect(servicio.articulosFiltrados().some((item) => item.id === 2)).toBe(true);

    servicio.reiniciarFiltros();
    expect(servicio.categoria()).toBe('TODAS');
    expect(servicio.busqueda()).toBe('');
    expect(servicio.articulosFiltrados()).toHaveLength(servicio.totalArticulos());
  });

  it('suma los totales por categoría y conserva el total general', () => {
    const servicio = new BlogService();
    const totales = servicio.totalPorCategoria();

    expect(totales.TODAS).toBe(servicio.totalArticulos());
    expect(
      totales.SALUD + totales.PREVENCION + totales.NUTRICION + totales.ESTETICA + totales.CLINICA,
    ).toBe(totales.TODAS);
  });

  it('alterna el estado de guardado sin modificar el resto de artículos', () => {
    const servicio = new BlogService();
    const total = servicio.totalArticulos();

    servicio.alternarGuardado(1);
    expect(servicio.esGuardado(1)).toBe(true);
    expect(servicio.totalGuardados()).toBe(1);

    servicio.alternarGuardado(1);
    expect(servicio.esGuardado(1)).toBe(false);
    expect(servicio.totalGuardados()).toBe(0);
    expect(servicio.totalArticulos()).toBe(total);
  });
});
