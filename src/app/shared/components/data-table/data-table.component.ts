import { Component, ContentChildren, QueryList, TemplateRef, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActionsTemplateDirective, CellTemplateContext, CellTemplateDirective } from './cell-template.directive';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet],
  template: `
    <!-- Desktop table -->
    <div class="overflow-x-auto hidden sm:block">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            @for (col of columns(); track col.key) {
              <th
                [class]="col.sortable ? 'cursor-pointer hover:bg-base-200' : ''"
                (click)="col.sortable && sort.emit(col.key)"
              >
                <div class="flex items-center gap-1">
                  {{ col.label }}
                  @if (col.sortable) {
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  }
                </div>
              </th>
            }
            <th class="w-24">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            <tr>
              <td [attr.colspan]="columns().length + 1" class="text-center py-8">
                <span class="loading loading-spinner loading-md text-primary"></span>
              </td>
            </tr>
          } @else if (data().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length + 1" class="text-center py-8 text-base-content/50">
                {{ emptyMessage() }}
              </td>
            </tr>
          } @else {
            @for (item of data(); track $index) {
              <tr>
                @for (col of columns(); track col.key) {
                  <td [class]="dimInactive() && isInactive(item) ? 'opacity-50 line-through' : ''">
                    @if (getCellTemplate(col.key); as tpl) {
                      <ng-container
                        [ngTemplateOutlet]="tpl"
                        [ngTemplateOutletContext]="{ $implicit: item, value: getNestedValue(item, col.key) }"
                      />
                    } @else {
                      {{ getNestedValue(item, col.key) }}
                    }
                  </td>
                }
                <td>
                  @if (getActionsTemplate(); as tpl) {
                    <ng-container
                      [ngTemplateOutlet]="tpl"
                      [ngTemplateOutletContext]="{ $implicit: item, value: item }"
                    />
                  }
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden space-y-3">
      @if (loading()) {
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md text-primary"></span>
        </div>
      } @else if (data().length === 0) {
        <div class="text-center py-8 text-base-content/50">
          {{ emptyMessage() }}
        </div>
      } @else {
        @for (item of data(); track $index) {
          <div class="bg-white/5 rounded-xl p-4 space-y-2">
            @for (col of columns(); track col.key) {
              <div class="flex justify-between items-start gap-2" [class]="dimInactive() && isInactive(item) ? 'opacity-50 line-through' : ''">
                <span class="text-xs text-base-content/50 uppercase shrink-0">{{ col.label }}</span>
                <span class="text-sm text-right">
                  @if (getCellTemplate(col.key); as tpl) {
                    <ng-container
                      [ngTemplateOutlet]="tpl"
                      [ngTemplateOutletContext]="{ $implicit: item, value: getNestedValue(item, col.key) }"
                    />
                  } @else {
                    {{ getNestedValue(item, col.key) }}
                  }
                </span>
              </div>
            }
            <div class="pt-2 flex justify-end">
              @if (getActionsTemplate(); as tpl) {
                <ng-container
                  [ngTemplateOutlet]="tpl"
                  [ngTemplateOutletContext]="{ $implicit: item, value: item }"
                />
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class DataTableComponent<T = unknown> {
  readonly columns = input.required<DataTableColumn[]>();
  readonly data = input.required<T[]>();
  readonly loading = input(false);
  readonly emptyMessage = input('No hay datos disponibles');
  readonly dimInactive = input(false);

  readonly sort = output<string>();

  @ContentChildren(CellTemplateDirective, { descendants: true })
  private readonly cells!: QueryList<CellTemplateDirective>;

  @ContentChildren(ActionsTemplateDirective, { descendants: true })
  private readonly actionsTemplates!: QueryList<ActionsTemplateDirective>;

  getCellTemplate(key: string): TemplateRef<CellTemplateContext> | null {
    return this.cells?.find((c) => c.key() === key)?.template ?? null;
  }

  getActionsTemplate(): TemplateRef<CellTemplateContext> | null {
    return this.actionsTemplates?.first?.template ?? null;
  }

  getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  }

  isInactive(item: T): boolean {
    return (item as { estado?: boolean }).estado === false;
  }
}
