export const MOCK_CAMPUS = {
  id: 'campus-ecatepec',
  name: 'Centro Universitario UAEM Ecatepec',
  shortName: 'CU UAEM Ecatepec',
  location: 'José Revueltas 17, Tierra Blanca, Ecatepec de Morelos, Méx.',
  programs: [
    'Ingeniería en Computación',
    'Licenciatura en Informática Administrativa',
    'Licenciatura en Derecho',
    'Licenciatura en Psicología',
    'Licenciatura en Administración',
    'Licenciatura en Contaduría',
  ],
  pickupLocations: [
    'Explanada Central / Asta Bandera (CU Ecatepec)',
    'Biblioteca Central (CU Ecatepec)',
    'Cafetería de Alumnos (Edificio B)',
    'Jardineras del Edificio A',
    'Área de Cómputo e Ingenierías',
  ]
};

export const MOCK_FACULTIES = [
  { id: 'eca-1', name: 'Ingeniería en Computación', campus_zone: 'CU Ecatepec' },
  { id: 'eca-2', name: 'Licenciatura en Informática Administrativa', campus_zone: 'CU Ecatepec' },
  { id: 'eca-3', name: 'Licenciatura en Derecho', campus_zone: 'CU Ecatepec' },
  { id: 'eca-4', name: 'Licenciatura en Psicología', campus_zone: 'CU Ecatepec' },
  { id: 'eca-5', name: 'Licenciatura en Administración', campus_zone: 'CU Ecatepec' },
  { id: 'eca-6', name: 'Licenciatura en Contaduría', campus_zone: 'CU Ecatepec' },
  { id: 'eca-7', name: 'Tronco Común y Posgrados', campus_zone: 'CU Ecatepec' },
];

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Libros y Códigos Legales', slug: 'libros', icon: 'BookOpen', description: 'Códigos civiles/penales, libros de cálculo, manuales de psicología' },
  { id: 'cat-2', name: 'Calculadoras y Hardware', slug: 'electronica', icon: 'Cpu', description: 'Calculadoras científicas, arduinos, laptops, teclados, cables' },
  { id: 'cat-3', name: 'Pruebas y Tests Psicométricos', slug: 'psicologia', icon: 'FlaskConical', description: 'Manuales de psicodiagnóstico, tarjetas Raven, escalas Weschler' },
  { id: 'cat-4', name: 'Mochilas y Papelería Universitaria', slug: 'accesorios', icon: 'Package', description: 'Mochilas, calculadoras financieras, carpetas y cuadernos' },
  { id: 'cat-5', name: 'Ropa y Accesorios UAEMex', slug: 'uniformes', icon: 'Shirt', description: 'Sudaderas verdes y oro, playeras institucionales, termos' },
  { id: 'cat-6', name: 'Habitaciones y Roommates en Ecatepec', slug: 'vivienda', icon: 'Home', description: 'Renta de cuartos cerca de CU Ecatepec y Tierra Blanca' },
];

// Catálogo limpio: no contiene publicaciones ficticias
export const MOCK_PRODUCTS = [];

export const MOCK_LOST_ITEMS = [];
