import { Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { FacturaCitaService } from '../../../core/services/factura-cita.service';
import { getApiErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-consulta-form',
  imports: [FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="btn btn-ghost btn-sm btn-circle" (click)="location.back()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#FFFFE3]">Registrar Consulta Medica</h1>
          <p class="text-sm text-base-content/60">Completa la información clínica de la cita #{{ idCita }}</p>
        </div>
      </div>

      @if (success()) {
        <div class="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Consulta registrada exitosamente. Redirigiendo...</span>
        </div>
      }

      @if (error() && !success()) {
        <div class="alert alert-error mb-4">
          <span>{{ error() }}</span>
        </div>
      }

      @if (!success()) {
        <form (ngSubmit)="handleSubmit()" class="space-y-3">
          <!-- Signos vitales -->
          <div class="bg-base-100 rounded-xl p-5 space-y-3">
            <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              Signos vitales
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label py-0"><span class="label-text font-medium text-sm">Peso (kg)</span></label>
                <input
                  type="number"
                  class="input input-bordered input-sm w-full"
                  step="0.01"
                  placeholder="Ej: 5.2"
                  name="peso"
                  [ngModel]="peso()"
                  (ngModelChange)="onPesoChange($event)"
                />
                @if (pesoError()) {
                  <label class="label py-0">
                    <span class="label-text-alt text-error text-xs">{{ pesoError() }}</span>
                  </label>
                }
              </div>
              <div class="form-control">
                <label class="label py-0"><span class="label-text font-medium text-sm">Temperatura (C)</span></label>
                <input
                  type="number"
                  class="input input-bordered input-sm w-full"
                  step="0.1"
                  placeholder="Ej: 38.5"
                  name="temperatura"
                  [ngModel]="temperatura()"
                  (ngModelChange)="onTemperaturaChange($event)"
                />
                @if (temperaturaError()) {
                  <label class="label py-0">
                    <span class="label-text-alt text-error text-xs">{{ temperaturaError() }}</span>
                  </label>
                }
              </div>
            </div>
          </div>

          <!-- Evaluación clínica -->
          <div class="bg-base-100 rounded-xl p-5 space-y-3">
            <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Evaluación clínica
            </h4>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Síntomas <span class="text-error">*</span></span></label>
              <textarea
                class="textarea textarea-bordered textarea-sm w-full"
                rows="3"
                required
                placeholder="Descripcion de los síntomas observados..."
                name="sintomas"
                [ngModel]="sintomas()"
                (ngModelChange)="sintomas.set($event)"
              ></textarea>
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Diagnóstico General</span></label>
              <textarea
                class="textarea textarea-bordered textarea-sm w-full"
                rows="2"
                placeholder="Diagnóstico preliminary..."
                name="diagnosticoGeneral"
                [ngModel]="diagnosticoGeneral()"
                (ngModelChange)="diagnosticoGeneral.set($event)"
              ></textarea>
            </div>
          </div>

          <!-- Tratamiento -->
          <div class="bg-base-100 rounded-xl p-5 space-y-3">
            <h4 class="text-sm font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              Tratamiento
            </h4>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Tratamiento Indicado</span></label>
              <textarea
                class="textarea textarea-bordered textarea-sm w-full"
                rows="2"
                placeholder="Tratamiento recetado..."
                name="tratamientoIndicado"
                [ngModel]="tratamientoIndicado()"
                (ngModelChange)="tratamientoIndicado.set($event)"
              ></textarea>
            </div>
            <div class="form-control">
              <label class="label py-0"><span class="label-text font-medium text-sm">Observaciones</span></label>
              <textarea
                class="textarea textarea-bordered textarea-sm w-full"
                rows="2"
                placeholder="Notas adicionales..."
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
              Registrar Consulta
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class ConsultaFormComponent {
  readonly router = inject(Router);
  readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly citasApi = inject(CitasApiService);
  private readonly facturaCitaService = inject(FacturaCitaService);

  readonly idCita = Number(this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal(false);

  readonly peso = signal<number | string | null>(null);
  readonly temperatura = signal<number | string | null>(null);
  readonly sintomas = signal('');
  readonly diagnosticoGeneral = signal('');
  readonly tratamientoIndicado = signal('');
  readonly observaciones = signal('');

  readonly pesoError = computed(() => {
    const peso = this.peso();
    if (peso === null) return '';
    return typeof peso === 'number' && Number.isFinite(peso) && peso >= 0.01 && peso <= 500
      ? ''
      : 'El peso debe estar entre 0.01 y 500 kg';
  });

  readonly temperaturaError = computed(() => {
    const temperatura = this.temperatura();
    if (temperatura === null) return '';
    return typeof temperatura === 'number' &&
      Number.isFinite(temperatura) &&
      temperatura >= 30 &&
      temperatura <= 45
      ? ''
      : 'La temperatura debe estar entre 30 y 45 °C';
  });

  onPesoChange(value: string): void {
    const n = parseFloat(value);
    this.peso.set(isNaN(n) ? value : n);
  }

  onTemperaturaChange(value: string): void {
    const n = parseFloat(value);
    this.temperatura.set(isNaN(n) ? value : n);
  }

  async handleSubmit(): Promise<void> {
    if (!this.sintomas().trim()) {
      this.error.set('Los síntomas son obligatorios');
      return;
    }
    if (this.pesoError() || this.temperaturaError()) {
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const peso = this.peso();
    const temperatura = this.temperatura();
    try {
      await firstValueFrom(
        this.citasApi.registrarConsulta({
          idCita: this.idCita,
          peso: typeof peso === 'number' ? peso : undefined,
          temperatura: typeof temperatura === 'number' ? temperatura : undefined,
          sintomas: this.sintomas().trim(),
          diagnosticoGeneral: this.diagnosticoGeneral().trim() || undefined,
          tratamientoIndicado: this.tratamientoIndicado().trim() || undefined,
          observaciones: this.observaciones().trim() || undefined,
        }),
      );
      await this.facturaCitaService.vincularFacturaDeCita(this.idCita);
      this.success.set(true);
      setTimeout(() => void this.router.navigate(['/citas']), 2000);
    } catch (e: unknown) {
      this.error.set(getApiErrorMessage(e, 'Error al registrar consulta'));
    } finally {
      this.loading.set(false);
    }
  }
}
