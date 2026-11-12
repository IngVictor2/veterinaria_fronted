import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DataTableComponent } from './data-table.component';
import { TableSort } from './table-sort';

describe('controles de tabla', () => {
  it('permite ascendente, descendente y recuperar el orden original mediante la cabecera', async () => {
    await TestBed.configureTestingModule({ imports: [DataTableComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DataTableComponent);
    fixture.componentRef.setInput('columns', [{ key: 'nombre', label: 'Nombre', sortable: true }]);
    fixture.componentRef.setInput('data', [{ nombre: 'Zoe' }]);
    let selected: TableSort | null = null;
    fixture.componentInstance.sortChange.subscribe((value) => {
      selected = value;
      fixture.componentRef.setInput('sortState', value);
    });
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.column-sort') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(selected).toEqual({ key: 'nombre', direction: 'asc' });
    expect(fixture.nativeElement.querySelector('th').getAttribute('aria-sort')).toBe('ascending');
    button.click();
    fixture.detectChanges();
    expect(selected).toEqual({ key: 'nombre', direction: 'desc' });
    button.click();
    fixture.detectChanges();
    expect(selected).toBeNull();
    fixture.destroy();
  });
});
