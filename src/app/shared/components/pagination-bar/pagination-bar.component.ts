import { Component, computed, input, model } from '@angular/core';

interface PaginaItem {
  type: 'page' | 'ellipsis';
  value: number;
}

@Component({
  selector: 'app-pagination-bar',
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
      <div class="text-xs sm:text-sm text-base-content/60 text-center sm:text-left">
        Mostrando {{ page() * size() + 1 }} - {{ finMostrando() }}
        de {{ totalElements() }} registros
      </div>
      <div class="join">
        <button
          class="join-item btn btn-sm"
          [disabled]="page() === 0"
          (click)="goToPage(page() - 1)"
        >
          «
        </button>
        @for (p of pages(); track $index) {
          @if (p.type === 'page') {
            <button
              class="join-item btn btn-sm"
              [class.btn-active]="p.value === page()"
              (click)="goToPage(p.value)"
            >
              {{ p.value + 1 }}
            </button>
          } @else {
            <span class="join-item btn btn-sm btn-disabled">...</span>
          }
        }
        <button
          class="join-item btn btn-sm"
          [disabled]="page() >= totalPages() - 1"
          (click)="goToPage(page() + 1)"
        >
          »
        </button>
      </div>
    </div>
  `,
})
export class PaginationBarComponent {
  readonly page = model.required<number>();
  readonly totalPages = input(0);
  readonly totalElements = input(0);
  readonly size = input(10);

  readonly finMostrando = computed(() =>
    Math.min((this.page() + 1) * this.size(), this.totalElements()),
  );

  readonly pages = computed<PaginaItem[]>(() => {
    const result: PaginaItem[] = [];
    const total = this.totalPages();
    const current = this.page();

    if (total <= 7) {
      for (let i = 0; i < total; i++) result.push({ type: 'page', value: i });
    } else {
      result.push({ type: 'page', value: 0 });
      if (current > 3) result.push({ type: 'ellipsis', value: -1 });
      for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
        result.push({ type: 'page', value: i });
      }
      if (current < total - 4) result.push({ type: 'ellipsis', value: -1 });
      result.push({ type: 'page', value: total - 1 });
    }
    return result;
  });

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.page.set(page);
    }
  }
}
