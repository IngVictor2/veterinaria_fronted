import { ServicioPortafolio } from '../modelos/servicio-portafolio';

/**
 * Portafolio de servicios de la clínica. Los precios son tarifas base de
 * demostración y coinciden con los valores usados en la agenda local.
 */
export const PORTAFOLIO_SERVICIOS: ServicioPortafolio[] = [
  {
    id: 1,
    nombre: 'Consulta general',
    descripcion:
      'Valoración clínica completa para identificar el motivo de consulta y definir el plan de atención.',
    tipo: 'CONSULTA',
    icono: 'consulta',
    precioDesde: 80000,
    duracion: '30 a 40 min',
    incluye: ['Revisión física', 'Registro en historia clínica', 'Recomendaciones de cuidado'],
  },
  {
    id: 2,
    nombre: 'Consulta de seguimiento',
    descripcion:
      'Control de la evolución de un tratamiento o diagnóstico previo, con ajustes si son necesarios.',
    tipo: 'CONSULTA',
    icono: 'seguimiento',
    precioDesde: 60000,
    duracion: '20 a 30 min',
    incluye: ['Comparación de evolución', 'Revisión del tratamiento', 'Notas de control'],
  },
  {
    id: 3,
    nombre: 'Consulta preventiva',
    descripcion:
      'Revisión periódica de una mascota sana para detectar cambios antes de que aparezcan síntomas.',
    tipo: 'CONSULTA',
    icono: 'preventiva',
    precioDesde: 50000,
    duracion: '25 a 35 min',
    incluye: ['Peso y condición corporal', 'Revisión general', 'Plan de cuidado anual'],
  },
  {
    id: 4,
    nombre: 'Baño y corte',
    descripcion:
      'Rutina de higiene y estética adaptada al tipo de pelaje, con revisión de uñas y oídos.',
    tipo: 'ESTETICA',
    icono: 'bano',
    precioDesde: 45000,
    duracion: '60 a 90 min',
    incluye: ['Baño con producto adecuado', 'Secado completo', 'Corte de uñas'],
  },
  {
    id: 5,
    nombre: 'Estética canina',
    descripcion:
      'Servicio de peluquería con corte higiénico y acabado según la raza y las preferencias del hogar.',
    tipo: 'ESTETICA',
    icono: 'estetica',
    precioDesde: 55000,
    duracion: '90 a 120 min',
    incluye: ['Corte de pelo', 'Limpieza de oídos', 'Perfumado y acabado'],
  },
  {
    id: 6,
    nombre: 'Baño de mantenimiento',
    descripcion:
      'Baño de refuerzo entre cortes para mantener el pelaje limpio, sin resecar la piel.',
    tipo: 'ESTETICA',
    icono: 'mantenimiento',
    precioDesde: 35000,
    duracion: '45 a 60 min',
    incluye: ['Baño y masaje', 'Secado completo', 'Cepillado final'],
  },
  {
    id: 7,
    nombre: 'Corte de uñas y limpieza de oídos',
    descripcion:
      'Cuidado rápido de uñas y oídos, con revisión visual para detectar irritaciones o lesiones.',
    tipo: 'ESTETICA',
    icono: 'unas',
    precioDesde: 25000,
    duracion: '20 a 30 min',
    incluye: ['Corte de uñas', 'Limpieza de oídos', 'Revisión visual'],
  },
  {
    id: 8,
    nombre: 'Peluquería felina',
    descripcion:
      'Manejo amable para gatos que necesitan baño, cepillado o corte higiénico sin estrés adicional.',
    tipo: 'ESTETICA',
    icono: 'felino',
    precioDesde: 65000,
    duracion: '60 a 90 min',
    incluye: ['Manejo amable', 'Baño o cepillado', 'Corte higiénico'],
  },
];
