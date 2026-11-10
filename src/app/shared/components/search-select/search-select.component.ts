import { Component, ElementRef, HostListener, computed, inject, input, model, signal, viewChild } from '@angular/core';

export interface SearchSelectOption {
  value: number | string;
  label: string;
  sublabel?: string;
}

@Component({
  selector: 'app-search-select',
  template: `
    <div class="relative">
      <!-- Display selected value -->
      <button
        type="button"
        [disabled]="disabled()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-label]="placeholder() || 'Seleccionar'"
        aria-haspopup="listbox"
        (keydown.escape)="isOpen.set(false)"
        class="flex items-center justify-start text-left gap-2 input input-bordered input-sm w-full cursor-pointer pr-8 hover:border-[#9D343C] transition-colors"
        [class]="isOpen() ? 'border-[#9D343C]' : ''"
        (click)="toggleDropdown()"
      >
        @if (selectedOption(); as selected) {
          <span class="truncate flex-1 text-left text-sm">{{ selected.label }}</span>
        } @else {
          <span class="truncate flex-1 text-left text-sm text-base-content/40">{{ placeholder() || 'Seleccionar...' }}</span>
        }
        @if (selectedOption()?.sublabel; as sublabel) {
          <span class="text-xs text-base-content/50 truncate">{{ sublabel }}</span>
        }
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40 flex-shrink-0 transition-transform" [class.rotate-180]="isOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
      </button>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div
          class="absolute top-full left-0 z-50 mt-1 w-full rounded-lg shadow-xl border border-[#1F2937] overflow-hidden"
          style="background: #FFFFFF;"
          (keydown.escape)="isOpen.set(false)"
        >
          <!-- Search input -->
          @if (searchable()) {
          <div class="p-2 border-b border-[#1F2937]">
            <input
              #searchInput
              type="text"
              class="input input-bordered input-sm w-full"
              placeholder="Buscar..."
              [value]="searchText()"
              (input)="onSearchInput($event)"
            />
          </div>

          }

          <!-- Options list -->
          <div class="overflow-y-auto overscroll-contain" [style.max-height.px]="maxListHeight()" role="listbox">
            @if (filteredOptions().length === 0) {
              <div class="p-3 text-sm text-[#374151] text-left">
                No se encontraron resultados
              </div>
            }
            @for (option of filteredOptions(); track option.value) {
              <button
                type="button"
                role="option"
                [attr.aria-selected]="option.value === value()"
                class="w-full px-3 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors border-l-2"
                [class]="option.value === value()
                  ? 'bg-[#9D343C]/20 text-[#374151] font-medium border-[#9D343C]'
                  : 'text-[#374151] hover:bg-[#9D343C]/10 hover:text-[#374151] border-transparent'"
                (click)="select(option.value)"
              >
                <div class="flex items-center gap-2 min-w-0">
                  @if (option.value === value()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#9D343C] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  }
                  <span class="truncate">{{ option.label }}</span>
                </div>
                @if (option.sublabel) {
                  <span class="text-xs text-[#374151] truncate flex-shrink-0">{{ option.sublabel }}</span>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SearchSelectComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly value = model<number | string | null>(null);
  readonly options = input<SearchSelectOption[]>([]);
  readonly placeholder = input<string | undefined>(undefined);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly maxListHeight = input(240);
  readonly searchable = input(false);

  readonly isOpen = signal(false);
  readonly searchText = signal('');

  readonly selectedOption = computed(() =>
    this.options().find((o) => o.value === this.value()),
  );

  readonly filteredOptions = computed(() => {
    const text = this.searchText();
    if (!this.searchable() || !text) return this.options();
    const q = text.toLowerCase();
    return this.options().filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q),
    );
  });

  toggleDropdown(): void {
    if (this.disabled()) return;
    const abriendo = !this.isOpen();
    this.isOpen.set(abriendo);
    this.searchText.set('');
    if (abriendo && this.searchable()) {
      setTimeout(() => this.searchInput()?.nativeElement.focus(), 0);
    }
  }

  select(value: number | string): void {
    this.value.set(value);
    this.isOpen.set(false);
    this.searchText.set('');
  }

  onSearchInput(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
      this.searchText.set('');
    }
  }
}
