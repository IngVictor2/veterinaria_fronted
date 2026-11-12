export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}
const collator = new Intl.Collator('es-CO', { numeric: true, sensitivity: 'base' });

export function sortRows<T>(rows: T[], sort: TableSort | null): T[] {
  if (!sort) return rows;
  const value = (row: T): unknown => {
    const record = row as Record<string, unknown>;
    if (sort.key === 'primerNombre')
      return ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
        .map((k) => record[k] || '')
        .join(' ')
        .trim();
    return sort.key
      .split('.')
      .reduce<unknown>(
        (v, k) => (v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined),
        row,
      );
  };
  return [...rows].sort((a, b) => {
    const left = value(a),
      right = value(b);
    if (left == null || left === '') return right == null || right === '' ? 0 : 1;
    if (right == null || right === '') return -1;
    let comparison: number;
    if (typeof left === 'number' && typeof right === 'number') comparison = left - right;
    else if (typeof left === 'boolean' && typeof right === 'boolean')
      comparison = Number(left) - Number(right);
    else if (
      /fecha|createdAt|updatedAt/i.test(sort.key) &&
      Number.isFinite(Date.parse(String(left))) &&
      Number.isFinite(Date.parse(String(right)))
    )
      comparison = Date.parse(String(left)) - Date.parse(String(right));
    else comparison = collator.compare(String(left), String(right));
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}
