import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-activate-account',
  imports: [RouterLink],
  template: `
    <div>
      <div class="text-center mb-6 form-field">
        <h2 class="text-2xl font-extrabold text-[#374151]">Funcion no disponible</h2>
        <p class="text-sm text-[#374151] mt-2">La activacion de cuentas aun no esta habilitada. Contacta al administrador para crear tu usuario.</p>
      </div>

      <div class="text-center mt-6 form-field">
        <a routerLink="/login" class="text-sm font-bold text-[#9D343C] hover:text-[#7D2931]">
          Volver al inicio de sesion
        </a>
      </div>
    </div>
  `,
})
export class ActivateAccountComponent {}
