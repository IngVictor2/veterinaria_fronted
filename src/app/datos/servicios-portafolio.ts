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
    precioDesde: 50000,
    duracion: '30 a 40 min',
    incluye: ['Revisión física', 'Registro en historia clínica', 'Recomendaciones de cuidado'],
  },
  {
    id: 2,
    nombre: 'Consulta especializada',
    descripcion:
      'Evaluación enfocada en un área o problema específico, con un plan de manejo más detallado.',
    tipo: 'CONSULTA',
    icono: 'especializada',
    precioDesde: 80000,
    duracion: '40 a 50 min',
    incluye: ['Revisión del caso', 'Examen dirigido', 'Plan de manejo'],
  },
  {
    id: 3,
    nombre: 'Vacunación',
    descripcion:
      'Aplicación del esquema de vacunas según la edad, el estado de salud y el riesgo de cada mascota.',
    tipo: 'CONSULTA',
    icono: 'vacunacion',
    precioDesde: 35000,
    duracion: '15 a 20 min',
    incluye: ['Revisión previa', 'Aplicación de la vacuna', 'Registro en el carné'],
  },
  {
    id: 4,
    nombre: 'Consulta avanzada',
    descripcion:
      'Evaluación integral para casos complejos, con seguimiento y un plan de atención ampliado.',
    tipo: 'CONSULTA',
    icono: 'avanzada',
    precioDesde: 100000,
    duracion: '50 a 60 min',
    incluye: ['Evaluación integral', 'Plan de seguimiento', 'Recomendaciones para el hogar'],
  },
  {
    id: 5,
    nombre: 'Baño medicado',
    descripcion:
      'Baño con productos indicados para piel sensible o con afecciones, bajo recomendación veterinaria.',
    tipo: 'ESTETICA',
    icono: 'bano-medicado',
    precioDesde: 40000,
    duracion: '60 a 90 min',
    incluye: ['Baño con producto medicado', 'Secado completo', 'Revisión de la piel'],
  },
  {
    id: 6,
    nombre: 'Corte de pelo',
    descripcion:
      'Corte adaptado al tipo de pelaje, la raza y las preferencias de cada familia.',
    tipo: 'ESTETICA',
    icono: 'corte',
    precioDesde: 35000,
    duracion: '60 a 90 min',
    incluye: ['Corte según el pelaje', 'Baño y secado', 'Acabado final'],
  },
  {
    id: 7,
    nombre: 'Limpieza dental',
    descripcion:
      'Limpieza bucal para remover placa y apoyar el cuidado de la salud dental de la mascota.',
    tipo: 'ESTETICA',
    icono: 'dental',
    precioDesde: 60000,
    duracion: '40 a 60 min',
    incluye: ['Revisión bucal', 'Limpieza dental', 'Recomendaciones de cuidado'],
  },
];
