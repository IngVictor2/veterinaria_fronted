import { Component, input, output } from '@angular/core';
import { TableSort } from './table-sort';

@Component({
  selector: 'app-table-order',
  template: `
    <div class="flex flex-wrap items-center gap-2 py-3 text-xs text-[#545d6c]">
      <label class="flex items-center gap-2"
        >Ordenar por
        <select
          class="select select-bordered select-sm bg-white"
          aria-label="Ordenar registros por"
          [value]="value()?.key || ''"
          (change)="
            change.emit(
              $any($event.target).value
                ? { key: $any($event.target).value, direction: 'asc' }
                : null
            )
          "
        >
          <option value="">Orden predeterminado</option>
          @for (column of columns(); track column.key) {
            <option [value]="column.key">{{ column.label }}</option>
          }
        </select>
      </label>
      @if (value(); as current) {
        <button
          type="button"
          class="btn btn-sm btn-ghost text-[#9d343c]"
          (click)="
            change.emit({
              key: current.key,
              direction: current.direction === 'asc' ? 'desc' : 'asc',
            })
          "
        >
          {{ current.direction === 'asc' ? '↑ Ascendente' : '↓ Descendente' }}
        </button>
        <button type="button" class="btn btn-sm btn-ghost" (click)="change.emit(null)">
          Restablecer
        </button>
      }
    </div>
  `,
})
export class TableOrderComponent {
  readonly columns = input.required<{ key: string; label: string }[]>();
  readonly value = input<TableSort | null>(null);
  readonly change = output<TableSort | null>();
}
