import { computed, Injectable, signal } from '@angular/core';
import { CITAS_DEMO } from '../datos/citas-demo';
import { CitaDemo } from '../modelos/cita-demo';

/**
 * Dueño del estado de la agenda de demostración.
 * La señal es privada; el exterior solo puede leerla mediante asReadonly().
 * Todos los cambios se hacen con actualizaciones inmutables.
 */
@Injectable({ providedIn: 'root' })
export class CitasDemoService {
  private readonly _citas = signal<CitaDemo[]>(CITAS_DEMO);

  readonly citas = this._citas.asReadonly();

  readonly totalCitas = computed(() => this._citas().length);

  readonly totalPendientes = computed(
    () => this._citas().filter((cita) => cita.estado === 'PENDIENTE').length,
  );

  readonly ingresosConfirmados = computed(() =>
    this._citas()
      .filter((cita) => cita.estado === 'CONFIRMADA' || cita.estado === 'ATENDIDA')
      .reduce((total, cita) => total + cita.precio, 0),
  );

  confirmarCita(id: number): void {
    this._citas.update((citas) =>
      citas.map((cita) =>
        cita.id === id && cita.estado === 'PENDIENTE'
          ? { ...cita, estado: 'CONFIRMADA' }
          : cita,
      ),
    );
  }

  reiniciarDemo(): void {
    this._citas.set(CITAS_DEMO);
  }
}
