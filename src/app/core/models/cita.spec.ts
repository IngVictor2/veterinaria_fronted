import { describe, expect, it } from 'vitest';
import { Cita, mapaNumerosCitasPorMascota } from './cita';

const appointment = (idCita: number, idMascota: number, fechaCita: string, nombreMascota = 'Luna') =>
  ({ idCita, idMascota, fechaCita, nombreMascota, horaCita: '09:00', estadoCita: 'PENDIENTE' }) as Cita;

describe('número de cita por mascota', () => {
  const citas = [appointment(16, 2, '2026-01-01'), appointment(10, 1, '2026-12-01'), appointment(13, 1, '2026-11-01')];

  it('la primera cita de otra mascota comienza en uno aunque el cliente tenga citas anteriores', () => {
    expect(mapaNumerosCitasPorMascota(citas)).toEqual({ 10: 1, 13: 2, 16: 1 });
  });
  it('el listado de cliente y el detalle de mascota muestran el mismo número', () => {
    const list = mapaNumerosCitasPorMascota(citas);
    for (const cita of citas) {
      const detail = mapaNumerosCitasPorMascota(citas.filter(c => c.idMascota === cita.idMascota));
      expect(detail[cita.idCita]).toBe(list[cita.idCita]);
    }
  });
  it('reprogramar o cambiar estado no cambia los números y la última registrada tiene el mayor de su mascota', () => {
    const changed = citas.map(c => ({ ...c, fechaCita: '2027-05-20', estadoCita: 'CANCELADA' as const }));
    expect(mapaNumerosCitasPorMascota(changed)).toEqual(mapaNumerosCitasPorMascota(citas));
    expect(mapaNumerosCitasPorMascota(citas)[13]).toBe(2);
  });
  it('no confunde mascotas con el mismo nombre ni cambia los datos originales', () => {
    const before = [...citas];
    mapaNumerosCitasPorMascota(citas);
    expect(citas).toEqual(before);
    expect(mapaNumerosCitasPorMascota(citas)[16]).toBe(1);
  });
  it('un duplicado no incrementa el contador', () => {
    expect(mapaNumerosCitasPorMascota([...citas, citas[1]])).toEqual(mapaNumerosCitasPorMascota(citas));
  });
});
