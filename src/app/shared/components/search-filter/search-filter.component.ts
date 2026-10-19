import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-search-filter',
  template: `
    <div class="flex gap-2">
      <input
        type="text"
        [value]="value()"
        [placeholder]="placeholder() || 'Buscar...'"
        class="input input-bordered flex-1 min-w-0"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
      />
      <button class="btn btn-primary btn-square shrink-0" (click)="search.emit()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  `,
})
export class SearchFilterComponent {
  readonly value = model('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly search = output<void>();

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.search.emit();
    }
  }
}
