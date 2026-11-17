const ZONA_HORARIA = 'America/Bogota';

export interface TramoHorario {
  readonly etiqueta: string;
  /** Minutos desde la medianoche. */
  readonly abre: number;
  readonly cierra: number;
}

export const HORARIO_SEMANAL: readonly [TramoHorario, TramoHorario] = [
  { etiqueta: 'Lunes a sábado', abre: 7 * 60, cierra: 18 * 60 },
  { etiqueta: 'Domingos y festivos', abre: 7 * 60, cierra: 13 * 60 },
];

export interface EstadoApertura {
  readonly abierto: boolean;
  readonly etiquetaHoy: string;
  readonly horaHoy: string;
  readonly mensaje: string;
}

const FORMATO_BOGOTA = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', {
  timeZone: ZONA_HORARIA,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

interface PartesFecha {
  readonly anio: number;
  readonly mes: number;
  readonly dia: number;
  readonly diaSemana: number;
  readonly minutos: number;
}

export function formatearHora(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas}:${String(resto).padStart(2, '0')}`;
}

export function fechaEnBogota(fecha: Date = new Date()): string {
  return FORMATO_FECHA.format(fecha);
}

export function estadoApertura(fecha: Date = new Date()): EstadoApertura {
  const partes = partesEnBogota(fecha);
  const festivo = esFestivo(partes.anio, partes.mes, partes.dia);
  const tramo = tramoDelDia(partes.diaSemana, festivo);
  const abierto = partes.minutos >= tramo.abre && partes.minutos < tramo.cierra;

  let mensaje: string;
  if (abierto) {
    mensaje = `Hoy atendemos hasta las ${formatearHora(tramo.cierra)}`;
  } else if (partes.minutos < tramo.abre) {
    mensaje = `Abrimos hoy a las ${formatearHora(tramo.abre)}`;
  } else {
    const proxima = proximaApertura(partes.anio, partes.mes, partes.dia);
    mensaje = `Abrimos mañana a las ${formatearHora(proxima)}`;
  }

  return {
    abierto,
    etiquetaHoy: festivo ? 'Festivo' : tramo.etiqueta,
    horaHoy: `${formatearHora(tramo.abre)} a ${formatearHora(tramo.cierra)}`,
    mensaje,
  };
}

function partesEnBogota(fecha: Date): PartesFecha {
  const partes = FORMATO_BOGOTA.formatToParts(fecha);
  const valor = (tipo: string): string => partes.find((parte) => parte.type === tipo)?.value ?? '0';

  const anio = Number(valor('year'));
  const mes = Number(valor('month'));
  const dia = Number(valor('day'));

  return {
    anio,
    mes,
    dia,
    diaSemana: new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay(),
    minutos: Number(valor('hour')) * 60 + Number(valor('minute')),
  };
}

function tramoDelDia(diaSemana: number, festivo: boolean): TramoHorario {
  return diaSemana === 0 || festivo ? HORARIO_SEMANAL[1] : HORARIO_SEMANAL[0];
}

function proximaApertura(anio: number, mes: number, dia: number): number {
  const manana = new Date(Date.UTC(anio, mes - 1, dia + 1));
  const festivo = esFestivo(
    manana.getUTCFullYear(),
    manana.getUTCMonth() + 1,
    manana.getUTCDate(),
  );

  return tramoDelDia(manana.getUTCDay(), festivo).abre;
}

function clave(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

const cacheFestivos = new Map<number, ReadonlySet<string>>();

/**
 * Festivos colombianos: los fijos, los trasladados al lunes (Ley Emiliani)
 * y los que dependen de la Semana Santa.
 */
export function festivosDe(anio: number): ReadonlySet<string> {
  const existente = cacheFestivos.get(anio);
  if (existente) {
    return existente;
  }

  const festivos = new Set<string>();
  const agregar = (fecha: Date): void => {
    festivos.add(
      clave(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, fecha.getUTCDate()),
    );
  };

  const fijos: ReadonlyArray<readonly [number, number]> = [
    [1, 1],
    [5, 1],
    [7, 20],
    [8, 7],
    [12, 8],
    [12, 25],
  ];
  for (const [mes, dia] of fijos) {
    festivos.add(clave(anio, mes, dia));
  }

  const trasladados: ReadonlyArray<readonly [number, number]> = [
    [1, 6],
    [3, 19],
    [6, 29],
    [8, 15],
    [10, 12],
    [11, 1],
    [11, 11],
  ];
  for (const [mes, dia] of trasladados) {
    agregar(siguienteLunes(new Date(Date.UTC(anio, mes - 1, dia))));
  }

  const domingoPascua = pascua(anio);
  for (const desplazamiento of [-3, -2, 43, 64, 71]) {
    agregar(sumarDias(domingoPascua, desplazamiento));
  }

  const resultado: ReadonlySet<string> = festivos;
  cacheFestivos.set(anio, resultado);
  return resultado;
}

export function esFestivo(anio: number, mes: number, dia: number): boolean {
  return festivosDe(anio).has(clave(anio, mes, dia));
}

function pascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(Date.UTC(anio, mes - 1, dia));
}

function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha);
  copia.setUTCDate(copia.getUTCDate() + dias);
  return copia;
}

function siguienteLunes(fecha: Date): Date {
  const diaSemana = fecha.getUTCDay();
  return sumarDias(fecha, (8 - diaSemana) % 7);
}
