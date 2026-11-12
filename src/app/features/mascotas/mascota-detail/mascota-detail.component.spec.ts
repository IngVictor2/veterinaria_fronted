import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { expect, it } from 'vitest';
import { MascotaDetailComponent } from './mascota-detail.component';
import { MascotasApiService } from '../../../core/services/mascotas-api.service';
import { CitasApiService } from '../../../core/services/citas-api.service';
import { Cita } from '../../../core/models/cita';

it('el historial mantiene números consecutivos descendentes entre páginas aunque las fechas difieran', () => {
  TestBed.configureTestingModule({ providers: [
    { provide: Router, useValue: {} },
    { provide: Location, useValue: {} },
    { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['id', '1']]) } } },
    { provide: MascotasApiService, useValue: {} },
    { provide: CitasApiService, useValue: {} },
  ] });
  const component = TestBed.runInInjectionContext(() => new MascotaDetailComponent());
  component.citas.set(Array.from({ length: 12 }, (_, index) => ({
    idCita: index + 100, idMascota: 1, fechaCita: index % 2 ? '2026-01-01' : '2026-12-01', horaCita: '07:00',
  }) as Cita).reverse());
  const pages: number[][] = [];
  for (let page = 0; page < 3; page++) {
    component.page.set(page);
    pages.push(component.citasPaginadas().map(c => Number(component.numeroCita(c.idCita))));
  }
  expect(pages).toEqual([[12, 11, 10, 9, 8], [7, 6, 5, 4, 3], [2, 1]]);
});
