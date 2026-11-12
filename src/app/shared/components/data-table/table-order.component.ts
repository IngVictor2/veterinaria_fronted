import { Component, input, output } from '@angular/core';
import { TableSort } from './table-sort';

@Component({
  selector: 'app-table-order',
  styles: ':host { display: block; flex-shrink: 0; }',
  template: `
    <div class="flex flex-wrap items-center gap-2 text-xs text-[#545d6c]">
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
    </div>
  `,
})
export class TableOrderComponent {
  readonly columns = input.required<{ key: string; label: string }[]>();
  readonly value = input<TableSort | null>(null);
  readonly change = output<TableSort | null>();
}
