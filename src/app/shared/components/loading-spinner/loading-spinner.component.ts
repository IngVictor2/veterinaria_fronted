import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-base-100 rounded-xl p-8 shadow-2xl text-center">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          @if (title()) {
            <p class="mt-4 text-base-content/70">{{ title() }}</p>
          }
        </div>
      </div>
    }
  `,
})
export class LoadingSpinnerComponent {
  readonly show = input(false);
  readonly title = input<string | undefined>(undefined);
}
