import type { Speaker, DaySchedule, ScientificArea, Fee, FAQItem } from '../types';

export const SPEAKERS: Speaker[] = [
  {
    id: 'spk-1',
    name: 'Dr. Alberto Ruiz',
    specialty: 'Ecología Tropical y Biodiversidad',
    bio: 'Investigador principal con más de 20 años de trayectoria liderando proyectos de conservación y ecología de bosques inundables en el llano amazónico.',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400',
    socials: {
      twitter: 'https://twitter.com/aruiz_ecology',
      linkedin: 'https://linkedin.com/in/alberto-ruiz-unap',
    },
  },
  {
    id: 'spk-2',
    name: 'Dra. Elena Rostova',
    specialty: 'Ciencia de Datos y Monitoreo Ambiental',
    bio: 'Especialista en inteligencia artificial aplicada a la teledetección de cambios de cobertura forestal y modelado predictivo del cambio climático global.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400',
    socials: {
      twitter: 'https://twitter.com/elena_rostova',
      linkedin: 'https://linkedin.com/in/elena-rostova-data',
      github: 'https://github.com/erostova',
    },
  },
  {
    id: 'spk-3',
    name: 'Mg. Carlos Valdéz',
    specialty: 'Epidemiología y Salud Pública Intercultural',
    bio: 'Consultor de salud enfocado en el impacto de patógenos tropicales emergentes y en el desarrollo de sistemas de salud adaptados para comunidades indígenas amazónicas.',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400',
    socials: {
      linkedin: 'https://linkedin.com/in/carlos-valdez-health',
    },
  },
  {
    id: 'spk-4',
    name: 'Dra. Sofía Lindgren',
    specialty: 'Políticas Públicas y Desarrollo Sostenible',
    bio: 'Investigadora en sociología política. Colabora en el diseño de planes de gobernanza territorial y valoración de saberes ancestrales de la cuenca amazónica.',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400',
    socials: {
      twitter: 'https://twitter.com/sofia_lindgren',
      linkedin: 'https://linkedin.com/in/sofia-lindgren-policy',
    },
  },
];

export const SCIENTIFIC_AREAS: ScientificArea[] = [
  {
    id: 'salud',
    title: 'Ciencias de la Salud',
    description: 'Investigaciones en salud intercultural, patologías tropicales, medicina tradicional y bienestar en poblaciones amazónicas.',
    iconName: 'HeartPulse',
  },
  {
    id: 'naturales',
    title: 'Ciencias Naturales',
    description: 'Biodiversidad de la flora y fauna, ecología forestal, conservación ambiental, cambio climático y recursos hídricos.',
    iconName: 'Leaf',
  },
  {
    id: 'ingenierias',
    title: 'Ingenierías y Tecnología',
    description: 'Soluciones tecnológicas sostenibles, energías renovables, bioingeniería, infraestructura verde y procesamiento alimentario.',
    iconName: 'Cpu',
  },
  {
    id: 'sociales',
    title: 'Ciencias Sociales y Políticas',
    description: 'Educación bilingüe intercultural, gobernanza territorial, derechos indígenas, economía ecológica y patrimonio cultural.',
    iconName: 'Globe2',
  },
];

export const SCHEDULE: DaySchedule[] = [
  {
    day: 1,
    dateString: 'Jueves, 02 de Julio de 2026',
    activities: [
      {
        id: 'act-101',
        time: '08:00 - 08:30',
        title: 'Registro y Entrega de Materiales',
        description: 'Registro de participantes en el auditorio principal y entrega de credenciales.',
        type: 'break',
      },
      {
        id: 'act-102',
        time: '08:30 - 09:00',
        title: 'Ceremonia de Apertura',
        description: 'Palabras de bienvenida del Rector de la UNAP y el Director de la Escuela de Postgrado.',
        type: 'ceremony',
      },
      {
        id: 'act-103',
        time: '09:00 - 10:30',
        title: 'Conferencia Magistral: Desafíos Ecológicos en la Amazonía',
        description: 'Análisis detallado del impacto del calentamiento global en la biodiversidad fluvial y terrestre de la Amazonía peruana.',
        speakerId: 'spk-1',
        type: 'keynote',
        track: 'Ciencias Naturales',
      },
      {
        id: 'act-104',
        time: '10:30 - 11:00',
        title: 'Coffe Break & Sesión de Posters Científicos',
        description: 'Exposición de infografías y avances de tesis de postgrado en el hall de exposiciones.',
        type: 'break',
      },
      {
        id: 'act-105',
        time: '11:00 - 13:00',
        title: 'Mesa de Debate: Innovación y Transferencia Tecnológica',
        description: 'Discusión multidisciplinar sobre la integración de tecnologías limpias y bioeconomía para el desarrollo de la región Loreto.',
        type: 'panel',
        track: 'Ingenierías y Tecnología',
      },
      {
        id: 'act-106',
        time: '13:00 - 14:30',
        title: 'Receso / Almuerzo Libre',
        description: 'Intervalo libre para el almuerzo y networking en las áreas comunes del campus.',
        type: 'break',
      },
      {
        id: 'act-107',
        time: '14:30 - 17:00',
        title: 'Exposición de Ponencias: Salud y Ecosistemas Amazónicos',
        description: 'Presentación de trabajos libres seleccionados por el comité científico sobre salud tropical y vulnerabilidad ecosistémica.',
        speakerId: 'spk-3',
        type: 'research',
        track: 'Ciencias de la Salud',
      },
    ],
  },
  {
    day: 2,
    dateString: 'Viernes, 03 de Julio de 2026',
    activities: [
      {
        id: 'act-201',
        time: '09:00 - 10:30',
        title: 'Conferencia Magistral: IA y Satélites al Servicio del Bosque',
        description: 'Cómo las redes neuronales y los sensores multiespectrales permiten predecir focos de deforestación e incendios forestales.',
        speakerId: 'spk-2',
        type: 'keynote',
        track: 'Ingenierías y Tecnología',
      },
      {
        id: 'act-202',
        time: '10:30 - 11:00',
        title: 'Coffe Break & Sesión de Posters Científicos',
        description: 'Segunda ronda de interacción científica en base a trabajos postulados por alumnos de maestría y doctorado.',
        type: 'break',
      },
      {
        id: 'act-203',
        time: '11:00 - 13:00',
        title: 'Exposiciones Paralelas: Gobernanza y Políticas Sociales',
        description: 'Políticas para la conservación de conocimientos indígenas, educación bilingüe y fortalecimiento de capacidades.',
        speakerId: 'spk-4',
        type: 'research',
        track: 'Ciencias Sociales y Políticas',
      },
      {
        id: 'act-204',
        time: '13:00 - 14:30',
        title: 'Receso / Almuerzo Libre',
        description: 'Intervalo libre de integración.',
        type: 'break',
      },
      {
        id: 'act-205',
        time: '14:30 - 16:30',
        title: 'Taller Metodológico: Redacción Científica de Alto Impacto',
        description: 'Taller práctico intensivo para estructurar artículos académicos con miras a indexarse en Scopus o Web of Science.',
        type: 'workshop',
        track: 'Investigación General',
      },
      {
        id: 'act-206',
        time: '16:30 - 17:30',
        title: 'Premiación de Trabajos de Investigación & Clausura',
        description: 'Reconocimiento a las mejores ponencias y posters científicos del Encuentro, y clausura oficial del evento.',
        type: 'ceremony',
      },
    ],
  },
];

export const FEES: Fee[] = [
  {
    id: 'fee-1',
    category: 'Pregrado',
    price: 25.00,
    benefits: [
      'Acceso a todas las ponencias y talleres',
      'Materiales impresos y digitales del evento',
      'Certificado de participación digital oficial (24 horas académicas)',
      'Acceso a las grabaciones de las ponencias',
    ],
    popular: false,
  },
  {
    id: 'fee-2',
    category: 'Postgrado',
    price: 50.00,
    benefits: [
      'Acceso completo a conferencias y mesas de debate',
      'Prioridad en talleres metodológicos prácticos',
      'Material digital oficial de la Escuela de Postgrado',
      'Certificado oficial digital de aprobación/participación (36 horas académicas)',
      'Publicación de resúmenes aprobados en el libro digital',
    ],
    popular: true,
  },
  {
    id: 'fee-3',
    category: 'Público General',
    price: 60.00,
    benefits: [
      'Acceso a ponencias magistrales e investigación libre',
      'Kit completo del participante (mochila, cuaderno, lapicero oficial)',
      'Certificado digital institucional de participación (24 horas académicas)',
      'Materiales y resúmenes compartidos por correo electrónico',
    ],
    popular: false,
  },
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: '¿El evento se realizará de manera presencial o virtual?',
    answer: 'El III Encuentro Científico se desarrollará en modalidad presencial en las instalaciones de la Escuela de Postgrado de la Universidad Nacional de la Amazonía Peruana (UNAP), en Iquitos. Las ponencias principales también serán transmitidas vía streaming para participantes registrados en modalidad remota.',
  },
  {
    id: 'faq-2',
    question: '¿Cómo puedo obtener mi certificado digital oficial?',
    answer: 'Los certificados digitales oficiales, validados por la Escuela de Postgrado de la UNAP, se emitirán a partir de la semana siguiente a la clausura del evento. Podrá descargarlos ingresando su número de documento en la sección de consulta del portal, siempre que cumpla con el 80% de asistencia registrada.',
  },
  {
    id: 'faq-3',
    question: '¿Cuáles son los métodos de pago aceptados para la certificación?',
    answer: 'Aceptamos transferencias bancarias a la cuenta institucional de la UNAP (Banco de la Nación), depósitos directos en ventanilla y pagos digitales a través de Yape/Plin. Una vez realizado el pago, deberá adjuntar el comprobante en la sección de registro.',
  },
  {
    id: 'faq-4',
    question: '¿Tengo plazo para postular un trabajo de investigación?',
    answer: 'La recepción de resúmenes de ponencias y posters científicos estará habilitada hasta el 15 de junio de 2026. La evaluación por pares ciegos se comunicará a los autores el 22 de junio. Todos los trabajos aprobados se incluirán en el libro de actas oficial con código ISBN.',
  },
  {
    id: 'faq-5',
    question: '¿Cuáles son los números y canales de atención oficial?',
    answer: 'Puede contactarse directamente vía WhatsApp con nuestros coordinadores académicos a los números +51 917 531 867, +51 965 614 092 y +51 958 306 889, o escribirnos al correo postgrado@unapiquitos.edu.pe.',
  },
];

export const CONTACT_INFO = {
  address: 'Los Rosales s/n, San Juan Bautista, Maynas, Loreto, Perú',
  coordinates: {
    lat: -3.7844,
    lng: -73.2750,
  },
  phones: [
    '+51 917 531 867',
    '+51 965 614 092',
    '+51 958 306 889'
  ],
  whatsappNumbers: [
    '51917531867',
    '51965614092',
    '51958306889'
  ],
  emails: [
    'postgrado@unapiquitos.edu.pe',
    'contacto.postgrado@unapiquitos.edu.pe'
  ]
};
