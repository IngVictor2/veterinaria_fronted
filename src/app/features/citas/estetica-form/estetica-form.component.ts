import { Component, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { FacturaCitaService } from '../../../core/services/factura-cita.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-estetica-form',
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Registrar Servicio Estético</h1>
          <p class="text-sm text-base-content/60">Documenta el servicio estético de la cita #{{ idCita }}</p>
        </div>
      </div>

      @if (success()) {
        <div class="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Servicio estético registrado exitosamente. Redirigiendo...</span>
        </div>
      }

      @if (error() && !success()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
        </div>
      }

      @if (!success()) {
        <form (ngSubmit)="handleSubmit()" class="space-y-3">
          <!-- Detalles del servicio -->
          <div class="bg-base-100 rounded-xl p-5 space-y-3">
            <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              Detalles del servicio
            </h4>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Descripción del servicio</span></label>
              <textarea
                class="textarea textarea-bordered textarea-sm w-full"
                rows="4"
                placeholder="Describe el servicio estético realizado (baño, corte de pelo, manicura, limpieza de oídos, etc.)..."
                name="detalles"
                [ngModel]="detalles()"
                (ngModelChange)="detalles.set($event)"
              ></textarea>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="bg-base-100 rounded-xl p-5 space-y-3">
            <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Observaciones
            </h4>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Notas adicionales</span></label>
              <textarea
                class="textarea textarea-bordered textarea-sm w-full"
                rows="3"
                placeholder="Notas sobre el comportamiento de la mascota, recomendaciones, etc."
                name="observaciones"
                [ngModel]="observaciones()"
                (ngModelChange)="observaciones.set($event)"
              ></textarea>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" class="btn btn-ghost" (click)="location.back()">Cancelar</button>
            <button type="submit" class="btn btn-primary gap-2" [disabled]="loading()">
              @if (loading()) {
                <span class="loading loading-spinner loading-sm"></span>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              }
              Registrar Servicio
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class EsteticaFormComponent {
  readonly router = inject(Router);
  readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly citasApi = inject(CitasApiService);
  private readonly facturaCitaService = inject(FacturaCitaService);

  readonly idCita = Number(this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);

  readonly detalles = signal('');
  readonly observaciones = signal('');

  async handleSubmit(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await firstValueFrom(
        this.citasApi.registrarEstetica({
          idCita: this.idCita,
          detalles: this.detalles().trim() || undefined,
          observaciones: this.observaciones().trim() || undefined,
        }),
      );
      await this.facturaCitaService.vincularFacturaDeCita(this.idCita);
      this.success.set(true);
      setTimeout(() => void this.router.navigate(['/citas']), 2000);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al registrar servicio estético'));
    } finally {
      this.loading.set(false);
    }
  }
}
