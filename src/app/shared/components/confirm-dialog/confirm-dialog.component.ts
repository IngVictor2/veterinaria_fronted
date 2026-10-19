import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <dialog class="modal" [class.modal-open]="show()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          {{ title() || 'Confirmar' }}
        </h3>
        <p class="py-4">{{ message() }}</p>
        <div class="modal-action">
          <button class="btn" (click)="cancel.emit()">
            {{ cancelText() || 'Cancelar' }}
          </button>
          <button class="btn" [class]="confirmClass()" (click)="confirm.emit()">
            {{ confirmText() || 'Confirmar' }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="cancel.emit()">close</button>
      </form>
    </dialog>
  `,
})
export class ConfirmDialogComponent {
  readonly show = input(false);
  readonly title = input<string | undefined>(undefined);
  readonly message = input.required<string>();
  readonly confirmText = input<string | undefined>(undefined);
  readonly cancelText = input<string | undefined>(undefined);
  readonly variant = input<'primary' | 'error' | 'warning' | 'success' | undefined>(undefined);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  readonly confirmClass = computed(() => {
    const variant = this.variant();
    return {
      'btn-primary': variant === 'primary' || !variant,
      'btn-error': variant === 'error',
      'btn-warning': variant === 'warning',
      'btn-success': variant === 'success',
    };
  });
}
