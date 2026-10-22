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
    id: 4,
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
    id: 5,
    nombre: 'Vacunación anual',
    descripcion:
      'Aplicación de la dosis correspondiente al esquema y registro en el carné de vacunación.',
    tipo: 'PREVENCION',
    icono: 'vacuna',
    precioDesde: 60000,
    duracion: '15 a 20 min',
    incluye: ['Revisión del esquema', 'Aplicación de la vacuna', 'Actualización del carné'],
  },
  {
    id: 6,
    nombre: 'Desparasitación',
    descripcion:
      'Prevención de parásitos internos y externos con un producto elegido según peso y edad.',
    tipo: 'PREVENCION',
    icono: 'desparasitacion',
    precioDesde: 35000,
    duracion: '15 min',
    incluye: ['Valoración de riesgo', 'Producto según peso', 'Indicaciones de seguimiento'],
  },
  {
    id: 7,
    nombre: 'Procedimiento ambulatorio',
    descripcion:
      'Apoyo en procedimientos menores programados, con indicaciones previas y control posterior.',
    tipo: 'CONSULTA',
    icono: 'procedimiento',
    precioDesde: 250000,
    duracion: 'Según valoración',
    incluye: ['Valoración preprocedimiento', 'Registro del procedimiento', 'Control de recuperación'],
  },
  {
    id: 8,
    nombre: 'Valoración preventiva',
    descripcion:
      'Revisión periódica de una mascota sana para detectar cambios antes de que aparezcan síntomas.',
    tipo: 'BIENESTAR',
    icono: 'bienestar',
    precioDesde: 50000,
    duracion: '25 a 35 min',
    incluye: ['Peso y condición corporal', 'Revisión general', 'Plan de prevención anual'],
  },
];
