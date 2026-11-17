import { esFestivo, estadoApertura, festivosDe } from './clinica';

describe('calendario de la clínica', () => {
  it('marca los festivos fijos, trasladados y de Semana Santa', () => {
    expect(esFestivo(2026, 1, 1)).toBe(true);
    expect(esFestivo(2026, 1, 12)).toBe(true);
    expect(esFestivo(2026, 4, 3)).toBe(true);
    expect(esFestivo(2026, 11, 16)).toBe(true);
    expect(esFestivo(2026, 11, 17)).toBe(false);
    expect(festivosDe(2026).size).toBe(18);
  });

  it('abre en el horario largo un día entre semana', () => {
    const estado = estadoApertura(new Date('2026-11-17T10:00:00-05:00'));

    expect(estado.abierto).toBe(true);
    expect(estado.horaHoy).toBe('7:00 a 18:00');
    expect(estado.mensaje).toBe('Hoy atendemos hasta las 18:00');
  });

  it('cierra a las 18:00 en punto', () => {
    const estado = estadoApertura(new Date('2026-11-17T18:00:00-05:00'));

    expect(estado.abierto).toBe(false);
    expect(estado.mensaje).toBe('Abrimos mañana a las 7:00');
  });

  it('avisa cuando todavía no ha abierto', () => {
    const estado = estadoApertura(new Date('2026-11-17T06:30:00-05:00'));

    expect(estado.abierto).toBe(false);
    expect(estado.mensaje).toBe('Abrimos hoy a las 7:00');
  });

  it('los domingos atiende hasta las 13:00', () => {
    const estado = estadoApertura(new Date('2026-11-22T12:00:00-05:00'));

    expect(estado.abierto).toBe(true);
    expect(estado.etiquetaHoy).toBe('Domingos y festivos');
    expect(estado.mensaje).toBe('Hoy atendemos hasta las 13:00');
  });

  it('los festivos usan el horario corto', () => {
    const estado = estadoApertura(new Date('2026-11-16T10:00:00-05:00'));

    expect(estado.abierto).toBe(true);
    expect(estado.etiquetaHoy).toBe('Festivo');
    expect(estado.mensaje).toBe('Hoy atendemos hasta las 13:00');
  });

  it('el sábado después del cierre abre el domingo', () => {
    const estado = estadoApertura(new Date('2026-11-21T18:30:00-05:00'));

    expect(estado.abierto).toBe(false);
    expect(estado.mensaje).toBe('Abrimos mañana a las 7:00');
  });

  it('interpreta la hora en Bogotá y no en UTC', () => {
    // 00:30 UTC del 17 son las 19:30 del 16 en Bogotá: festivo y ya cerrado.
    const estado = estadoApertura(new Date('2026-11-17T00:30:00Z'));

    expect(estado.abierto).toBe(false);
    expect(estado.mensaje).toBe('Abrimos mañana a las 7:00');
  });
});
