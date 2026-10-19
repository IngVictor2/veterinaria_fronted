import { Directive, TemplateRef, input } from '@angular/core';

export interface CellTemplateContext {
  $implicit: unknown;
  value: unknown;
}

/** Marca un `<ng-template>` como plantilla de celda para una columna de la DataTable. */
@Directive({
  selector: '[appCell]',
})
export class CellTemplateDirective {
  readonly key = input.required<string>({ alias: 'appCell' });

  constructor(readonly template: TemplateRef<CellTemplateContext>) {}
}

/** Marca un `<ng-template>` como plantilla de acciones de la DataTable. */
@Directive({
  selector: '[appActions]',
})
export class ActionsTemplateDirective {
  constructor(readonly template: TemplateRef<CellTemplateContext>) {}
}
