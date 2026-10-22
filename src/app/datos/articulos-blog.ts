import { ArticuloBlog } from '../modelos/articulo-blog';

export const ARTICULOS_BLOG: ArticuloBlog[] = [
  {
    id: 1,
    titulo: 'Cómo preparar a tu mascota para su primera consulta',
    resumen:
      'Llegar con anticipación, llevar su carné y anotar los síntomas ayuda a que la valoración sea más precisa y menos estresante.',
    contenido: [
      'La primera visita a la clínica marca la relación entre la mascota, su familia y el equipo veterinario. Llegar unos minutos antes permite que el animal explore el espacio con calma y se adapte a los olores y sonidos del lugar.',
      'Lleva el carné de vacunación, la información de desparasitaciones y cualquier examen previo. Si no cuentas con esos documentos, anota las fechas aproximadas y los productos que se han aplicado.',
      'Antes de la cita, escribe los cambios que has notado: apetito, consumo de agua, comportamiento, heces, vómito o cojera. Ese registro ayuda al profesional a orientar las preguntas y a construir una historia clínica completa.',
    ],
    categoria: 'SALUD',
    autor: 'Equipo médico VetClinic',
    fecha: '2026-10-18',
    minutosLectura: 5,
    etiquetas: ['primera consulta', 'historia clínica', 'carné'],
    destacado: true,
  },
  {
    id: 2,
    titulo: 'Calendario de vacunación: qué debe tener al día tu perro o gato',
    resumen:
      'La vacunación se organiza por especie, edad y riesgo. Revisar el carné una vez al año evita interrupciones en el plan.',
    contenido: [
      'Los planes de vacunación no son iguales para todos los animales. La especie, la edad, el estilo de vida y los antecedentes clínicos determinan qué vacunas se necesitan y con qué frecuencia.',
      'Los cachorros y gatitos suelen recibir una serie inicial con refuerzos. En adultos, el esquema se mantiene con dosis periódicas y revisiones anuales. Un carné actualizado permite saber qué falta y cuándo corresponde la siguiente aplicación.',
      'Si tu mascota estuvo enferma, tomó medicamentos o cambió de ciudad, coméntalo durante la consulta. Esa información puede modificar el momento adecuado para vacunar.',
    ],
    categoria: 'PREVENCION',
    autor: 'Equipo de prevención VetClinic',
    fecha: '2026-10-15',
    minutosLectura: 4,
    etiquetas: ['vacunas', 'carné', 'prevención'],
    destacado: false,
  },
  {
    id: 3,
    titulo: 'Baño y corte: cada cuánto es recomendable según el pelaje',
    resumen:
      'La frecuencia depende del tipo de pelo, la actividad y la piel. Baños muy seguidos también pueden resecar la barrera cutánea.',
    contenido: [
      'Un perro de pelo corto que vive dentro de casa puede necesitar un baño cada tres o cuatro semanas, mientras que un pelaje largo o de doble capa requiere cepillado frecuente y una rutina ajustada por el estilista.',
      'El baño no debe convertirse en una práctica diaria sin indicación profesional. Los productos inadecuados o el secado incompleto pueden favorecer irritaciones, hongos y mal olor persistente.',
      'En la cita de estética conviene revisar uñas, oídos, glándulas y presencia de nudos. Si notas enrojecimiento, secreción o rascado constante, lo mejor es valorar primero la piel con el equipo veterinario.',
    ],
    categoria: 'ESTETICA',
    autor: 'Equipo de estética VetClinic',
    fecha: '2026-10-12',
    minutosLectura: 3,
    etiquetas: ['baño', 'corte', 'pelaje', 'piel'],
    destacado: false,
  },
  {
    id: 4,
    titulo: 'Señales de alerta que no deberías ignorar',
    resumen:
      'Decaimiento, vómito repetido, dificultad para respirar o cambios súbitos de peso justifican una valoración oportuna.',
    contenido: [
      'Las mascotas suelen ocultar el malestar. Por eso, los cambios en la rutina son una pista importante: dejar de comer, esconderse, caminar diferente o dormir más de lo habitual puede indicar dolor o enfermedad.',
      'Algunos signos requieren atención inmediata: dificultad para respirar, encías pálidas, convulsiones, vómito con sangre, intentos de orinar sin éxito o dolor abdominal marcado.',
      'Para el resto de cambios, anota cuándo comenzaron y qué los acompaña. Esa información, junto con la revisión clínica, permite decidir si basta con una consulta programada o si se necesita una atención prioritaria.',
    ],
    categoria: 'SALUD',
    autor: 'Equipo médico VetClinic',
    fecha: '2026-10-09',
    minutosLectura: 6,
    etiquetas: ['urgencias', 'síntomas', 'consulta'],
    destacado: false,
  },
  {
    id: 5,
    titulo: 'Alimentación equilibrada: porciones, horarios y cambios graduales',
    resumen:
      'Medir la ración y cambiar de alimento de forma paulatina protege la digestión y ayuda a mantener un peso saludable.',
    contenido: [
      'La cantidad de alimento depende de la edad, el peso, la actividad y la condición corporal. Una porción estimada “a ojo” suele terminar en excesos o faltantes, por eso conviene usar una balanza o un medidor.',
      'Los cambios de alimento deben hacerse de forma gradual durante varios días, mezclando la nueva fórmula con la anterior. Un cambio brusco puede causar diarrea, vómito o rechazo.',
      'Los premios también cuentan dentro de la ración diaria. Si la mascota está en control de peso, reduce las porciones principales o utiliza parte de su alimento como recompensa.',
    ],
    categoria: 'NUTRICION',
    autor: 'Equipo de prevención VetClinic',
    fecha: '2026-10-06',
    minutosLectura: 5,
    etiquetas: ['alimentación', 'peso', 'porciones'],
    destacado: false,
  },
  {
    id: 6,
    titulo: 'La historia clínica: por qué importa tenerla ordenada',
    resumen:
      'Un registro único por mascota evita repetir exámenes, conserva alergias y permite continuar el tratamiento sin perder contexto.',
    contenido: [
      'La historia clínica reúne la identificación de la mascota, los motivos de consulta, los hallazgos, los diagnósticos, los tratamientos y las recomendaciones. Es un documento privado y fundamental para la continuidad de la atención.',
      'Cuando cada visita queda registrada, el profesional puede comparar pesos, revisar reacciones previas a medicamentos y entender cómo evolucionó un problema. También se reducen las duplicidades y los olvidos.',
      'En VetClinic la información se organiza por mascota y por cita. El propietario puede consultar el historial desde su cuenta y el personal autorizado accede solo a los módulos que le corresponden.',
    ],
    categoria: 'CLINICA',
    autor: 'Equipo administrativo VetClinic',
    fecha: '2026-10-03',
    minutosLectura: 4,
    etiquetas: ['historial', 'datos', 'privacidad'],
    destacado: false,
  },
  {
    id: 7,
    titulo: 'Desparasitación interna y externa: mitos y cuidados',
    resumen:
      'Las pulgas, garrapatas y parásitos intestinales se previenen con un plan adaptado al entorno y a la edad del animal.',
    contenido: [
      'La desparasitación no se limita a una sola pastilla al año. El riesgo depende de si la mascota sale a parques, convive con otros animales o vive en una zona con alta presencia de garrapatas.',
      'Los productos deben elegirse según la especie, el peso y la edad. Algunos medicamentos para perros no son seguros para gatos, por lo que nunca conviene compartir dosis sin indicación profesional.',
      'Revisar el pelaje después de los paseos, lavar las camas con frecuencia y mantener al día el plan de prevención reduce la probabilidad de infestaciones y enfermedades transmitidas por vectores.',
    ],
    categoria: 'PREVENCION',
    autor: 'Equipo de prevención VetClinic',
    fecha: '2026-09-30',
    minutosLectura: 5,
    etiquetas: ['parásitos', 'pulgas', 'garrapatas'],
    destacado: false,
  },
  {
    id: 8,
    titulo: 'Gatos: cómo reducir el estrés en la visita al veterinario',
    resumen:
      'El transportador, una manta con su olor y un traslado tranquilo hacen una diferencia real en la consulta felina.',
    contenido: [
      'Para muchos gatos, salir de casa es la parte más difícil de la visita. Dejar el transportador abierto unos días antes, con una manta que conserve su olor, ayuda a que lo perciba como un refugio y no como una amenaza.',
      'Durante el traslado conviene cubrir el transportador con una tela y evitar ruidos fuertes. No se recomienda sacar al gato en el trayecto ni abrir la puerta en la sala de espera.',
      'Si el gato se esconde o se muestra agresivo, avisa al equipo antes de la cita. Existen protocolos de manejo amable que reducen la manipulación brusca y permiten una valoración más segura.',
    ],
    categoria: 'SALUD',
    autor: 'Equipo médico VetClinic',
    fecha: '2026-09-27',
    minutosLectura: 4,
    etiquetas: ['gatos', 'estrés', 'manejo amable'],
    destacado: false,
  },
  {
    id: 9,
    titulo: 'Agenda compartida: menos esperas, más tiempo de atención',
    resumen:
      'Una sola agenda para consulta y estética evita cruces de horarios y permite que cada profesional vea su disponibilidad real.',
    contenido: [
      'Cuando la recepción agenda en un cuaderno y cada profesional lleva su propia agenda, es fácil asignar dos citas a la misma hora o dejar espacios sin usar.',
      'Una agenda compartida muestra la disponibilidad de cada empleado y bloquea los cruces. El cliente recibe una confirmación clara y el equipo sabe qué mascota llega, con qué servicio y en qué horario.',
      'El recordatorio y la confirmación también reducen las citas perdidas. En VetClinic, el estado de cada cita cambia de pendiente a confirmada, atendida o cancelada, y los indicadores se actualizan en el momento.',
    ],
    categoria: 'CLINICA',
    autor: 'Equipo administrativo VetClinic',
    fecha: '2026-09-24',
    minutosLectura: 3,
    etiquetas: ['agenda', 'citas', 'disponibilidad'],
    destacado: false,
  },
  {
    id: 10,
    titulo: 'Cuidado de oídos y uñas: una rutina sencilla en casa',
    resumen:
      'Revisar semanalmente los oídos y mantener las uñas a una longitud cómoda previene molestias y lesiones al caminar.',
    contenido: [
      'Los oídos sanos no necesitan limpiezas profundas cada día. Basta con revisar el interior de la oreja y limpiar solo la parte visible con un producto adecuado, sin introducir copitos en el conducto.',
      'Si hay olor fuerte, secreción, enrojecimiento o el animal sacude la cabeza con frecuencia, conviene una valoración veterinaria. Rascarse puede generar heridas y complicar una infección.',
      'Las uñas demasiado largas cambian la postura y pueden engancharse. El corte debe respetar la zona rosada interna; si no estás seguro, pide apoyo en la cita de estética.',
    ],
    categoria: 'ESTETICA',
    autor: 'Equipo de estética VetClinic',
    fecha: '2026-09-21',
    minutosLectura: 4,
    etiquetas: ['oídos', 'uñas', 'cuidado en casa'],
    destacado: false,
  },
];
