import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { expect, it } from 'vitest';
import { MisCitasComponent } from './mis-citas.component';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { Cita } from '../../../core/models/cita';

const citas = [
  { idCita: 1, idMascota: 1, nombreMascota: 'Lúna', estadoCita: 'ATENDIDA' },
  { idCita: 2, idMascota: 2, nombreMascota: 'Milk', estadoCita: 'CANCELADA' },
  { idCita: 3, idMascota: 1, nombreMascota: 'Lúna', estadoCita: 'CANCELADA' },
] as Cita[];

function setup() {
  TestBed.configureTestingModule({ imports: [MisCitasComponent], providers: [
    { provide: Router, useValue: { navigate: () => {} } },
    { provide: CitasApiService, useValue: { getMisCitas: () => of(citas) } },
  ] });
  return TestBed.createComponent(MisCitasComponent);
}

it('busca todas las citas de una mascota antes de paginar y combina el estado sin renumerarlas', () => {
  const fixture = setup(), component = fixture.componentInstance;
  component.citas.set(citas);
  component.page.set(4);
  component.onBusquedaMascotaChange(' LUNA ');
  expect(component.page()).toBe(0);
  expect(component.sortedCitas().map(c => c.idCita)).toEqual([3, 1]);
  component.onFiltroEstadoChange('CANCELADA');
  expect(component.sortedCitas().map(c => c.idCita)).toEqual([3]);
  expect(component.numerosCitas()[3]).toBe(2);
  fixture.destroy();
});

it('muestra un mensaje sin resultados y permite limpiar ambos filtros', async () => {
  const fixture = setup(), component = fixture.componentInstance;
  fixture.detectChanges();
  await fixture.whenStable();
  component.onBusquedaMascotaChange('No existe');
  component.onFiltroEstadoChange('CONFIRMADA');
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('No encontramos citas con esos filtros');
  const button = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find(b => b.textContent?.includes('Limpiar filtros'))!;
  button.click();
  expect(component.busquedaMascota()).toBe('');
  expect(component.filtroEstado()).toBe('');
  expect(component.sortedCitas()).toHaveLength(3);
  fixture.destroy();
});
