import { describe, expect, it } from 'vitest';
import { sortRows } from './table-sort';

describe('orden de tablas', () => {
  const rows = [
    { id: 3, nombre: 'Zoe', fecha: '2026-11-12', estado: true },
    { id: 1, nombre: 'Ágata', fecha: '2026-01-01', estado: false },
    { id: 2, nombre: 'Bella', fecha: '2026-05-20', estado: true },
  ];

  it('mantiene exactamente el orden predeterminado al entrar o restablecer', () => {
    expect(sortRows(rows, null)).toBe(rows);
    sortRows(rows, { key: 'nombre', direction: 'asc' });
    expect(sortRows(rows, null).map((r) => r.id)).toEqual([3, 1, 2]);
  });
  it('ordena nombres con tildes sin modificar los datos originales', () => {
    expect(sortRows(rows, { key: 'nombre', direction: 'asc' }).map((r) => r.id)).toEqual([1, 2, 3]);
    expect(rows.map((r) => r.id)).toEqual([3, 1, 2]);
  });
  it('ordena fechas de más reciente a más antigua', () => {
    expect(sortRows(rows, { key: 'fecha', direction: 'desc' }).map((r) => r.id)).toEqual([3, 2, 1]);
  });
  it('ordena estados y conserva los desempates del orden original', () => {
    expect(sortRows(rows, { key: 'estado', direction: 'desc' }).map((r) => r.id)).toEqual([
      3, 2, 1,
    ]);
  });
  it('ordena el conjunto completo antes de tomar una página', () => {
    expect(
      sortRows(rows, { key: 'nombre', direction: 'asc' })
        .slice(0, 2)
        .map((r) => r.id),
    ).toEqual([1, 2]);
  });
  it('ordena importes numéricamente y deja los valores vacíos al final', () => {
    const prices = [{ precio: 100000 }, { precio: null }, { precio: 9000 }];
    expect(sortRows(prices, { key: 'precio', direction: 'asc' }).map((r) => r.precio)).toEqual([
      9000,
      100000,
      null,
    ]);
    expect(sortRows(prices, { key: 'precio', direction: 'desc' }).map((r) => r.precio)).toEqual([
      100000,
      9000,
      null,
    ]);
  });
  it('compara el nombre completo y columnas anidadas', () => {
    const people = [
      { primerNombre: 'Ana', primerApellido: 'Zapata' },
      { primerNombre: 'Ana', primerApellido: 'Álvarez' },
    ];
    expect(sortRows(people, { key: 'primerNombre', direction: 'asc' })[0].primerApellido).toBe(
      'Álvarez',
    );
    expect(
      sortRows([{ mascota: { nombre: 'Zoe' } }, { mascota: { nombre: 'Ana' } }], {
        key: 'mascota.nombre',
        direction: 'asc',
      })[0].mascota.nombre,
    ).toBe('Ana');
  });
});
