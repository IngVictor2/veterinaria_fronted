const relojColombia = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Bogota',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function estaAbierta(fecha: Date): boolean {
  const partes = relojColombia.formatToParts(fecha);
  const valor = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value;
  const minutos = Number(valor('hour')) * 60 + Number(valor('minute'));
  const cierre = valor('weekday') === 'Sun' ? 13 * 60 : 18 * 60;
  return minutos >= 7 * 60 && minutos < cierre;
}
