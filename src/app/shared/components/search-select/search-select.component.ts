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
      <div
        class="flex items-center gap-2 input input-bordered input-sm w-full cursor-pointer pr-8 hover:border-[#0D7377] transition-colors"
        [class]="isOpen() ? 'border-[#0D7377]' : ''"
        (click)="toggleDropdown()"
      >
        @if (selectedOption(); as selected) {
          <span class="truncate flex-1 text-sm">{{ selected.label }}</span>
        } @else {
          <span class="truncate flex-1 text-sm text-base-content/40">{{ placeholder() || 'Seleccionar...' }}</span>
        }
        @if (selectedOption()?.sublabel; as sublabel) {
          <span class="text-xs text-base-content/50 truncate">{{ sublabel }}</span>
        }
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40 flex-shrink-0 transition-transform" [class.rotate-180]="isOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
      </div>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div
          class="absolute z-50 mt-1 w-full rounded-lg shadow-xl border border-[#4A4A4A] overflow-hidden"
          style="background: rgba(30, 30, 30, 0.97);"
        >
          <!-- Search input -->
          <div class="p-2 border-b border-[#4A4A4A]">
            <input
              #searchInput
              type="text"
              class="input input-bordered input-sm w-full"
              placeholder="Buscar..."
              [value]="searchText()"
              (input)="onSearchInput($event)"
            />
          </div>

          <!-- Options list -->
          <div class="max-h-60 overflow-y-auto">
            @if (filteredOptions().length === 0) {
              <div class="p-3 text-sm text-[#CBCBCB]/60 text-center">
                No se encontraron resultados
              </div>
            }
            @for (option of filteredOptions(); track option.value) {
              <button
                type="button"
                class="w-full px-3 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors border-l-2"
                [class]="option.value === value()
                  ? 'bg-[#0D7377]/20 text-[#FFFFE3] font-medium border-[#0D7377]'
                  : 'text-[#CBCBCB] hover:bg-[#0D7377]/10 hover:text-[#FFFFE3] border-transparent'"
                (click)="select(option.value)"
              >
                <div class="flex items-center gap-2 min-w-0">
                  @if (option.value === value()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#0D7377] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  }
                  <span class="truncate">{{ option.label }}</span>
                </div>
                @if (option.sublabel) {
                  <span class="text-xs text-[#CBCBCB]/50 truncate flex-shrink-0">{{ option.sublabel }}</span>
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

  readonly isOpen = signal(false);
  readonly searchText = signal('');

  readonly selectedOption = computed(() =>
    this.options().find((o) => o.value === this.value()),
  );

  readonly filteredOptions = computed(() => {
    const text = this.searchText();
    if (!text) return this.options();
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
    if (abriendo) {
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
