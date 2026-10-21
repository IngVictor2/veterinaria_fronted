import { Component } from '@angular/core';
import { DemoHeaderComponent } from '../demo-header/demo-header.component';
import { Entrega1ViewComponent } from '../entrega1-view/entrega1-view.component';

@Component({
  selector: 'app-entrega1-page',
  imports: [DemoHeaderComponent, Entrega1ViewComponent],
  template: `
    <div class="demo-bg min-h-screen text-base-content">
      <app-demo-header />

      <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <app-entrega1-view />
      </main>

      <footer class="border-t border-white/10 py-5 text-center text-xs text-base-content/40">
        VetClinic · Gestión de citas veterinarias
      </footer>
    </div>
  `,
  styles: `
    .demo-bg {
      background:
        radial-gradient(circle at 15% 0%, rgba(13, 115, 119, 0.28), transparent 45%),
        radial-gradient(circle at 85% 15%, rgba(127, 231, 233, 0.08), transparent 35%),
        #071313;
    }
  `,
})
export class Entrega1PageComponent {}
