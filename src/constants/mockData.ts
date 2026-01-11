import { User, Property, Message } from '../types';
import img1 from '../assets/images/img1.jpg';
import img2 from '../assets/images/img2.jpg';
import img3 from '../assets/images/img3.jpg';
import img4 from '../assets/images/img4.jpg';
import img5 from '../assets/images/img5.jpg';
import img6 from '../assets/images/img6.jpg';
import img7 from '../assets/images/img7.jpg';

export const INITIAL_USERS: User[] = [
  { 
    id: '1', 
    name: 'Admin General', 
    email: 'admin@vesta.com', 
    role: 'admin', 
    avatar: img1, 
    password: '123' 
  },
  { 
    id: '2', 
    name: 'Carlos Dueño', 
    email: 'owner@test.com', 
    role: 'owner', 
    avatar: img2, 
    password: '123' 
  },
  { 
    id: '3', 
    name: 'Ana Cliente', 
    email: 'client@test.com', 
    role: 'client', 
    avatar: img3, 
    password: '123' 
  },
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: '101',
    ownerId: '2',
    title: 'Apartamento Moderno Centro',
    description: 'Hermoso apartamento en el corazón de la ciudad, cerca de todos los servicios. Cuenta con iluminación natural, acabados de lujo, suelo radiante y ventanas insonorizadas para tu máximo confort.',
    price: 120000,
    location: 'Santa Isabel',
    imageUrls: [
      img1,
      img2,
      img3
    ],
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    isOccupied: false,
    features: ['WiFi', 'AC', 'Balcón', 'Cocina equipada', 'Smart TV'],
    waitingList: [],
    status: 'active',
    rating: 4.85,
    reviewCount: 124
  },
  {
    id: '102',
    ownerId: '2',
    title: 'Chalet con Piscina',
    description: 'Ideal para familias. Zona tranquila con jardín privado, barbacoa y seguridad 24h. A solo 10 minutos de los mejores colegios internacionales.',
    price: 250000,
    location: 'Malabo II',
    imageUrls: [
      img4,
      img5,
      img6
    ],
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    isOccupied: true,
    features: ['Piscina', 'Garaje', 'Jardín', 'Seguridad', 'Chimenea'],
    waitingList: [],
    status: 'active',
    rating: 4.92,
    reviewCount: 38
  },
  {
    id: '103',
    ownerId: '99',
    title: 'Loft Industrial',
    description: 'Espacio abierto estilo industrial, techos altos, muy luminoso. Antigua fábrica renovada con gusto exquisito.',
    price: 95000,
    location: 'Sipopo',
    imageUrls: [img7, img1],
    bedrooms: 1,
    bathrooms: 1,
    area: 60,
    isOccupied: false,
    features: ['Ascensor', 'Cerca del mar', 'Minimalista'],
    waitingList: [],
    status: 'suspended',
    rating: 4.50,
    reviewCount: 12
  },
  {
    id: '104',
    ownerId: '2',
    title: 'Ático con Vistas al Mar',
    description: 'Espectacular ático con terraza de 50m2 frente al mar. Disfruta de los mejores atardeceres desde tu jacuzzi privado.',
    price: 180000,
    location: 'Punta Europa',
    imageUrls: [img2, img3, img4, img5],
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    isOccupied: false,
    features: ['Terraza', 'Jacuzzi', 'Vistas al mar', 'Parking'],
    waitingList: [],
    status: 'active',
    rating: 4.98,
    reviewCount: 215
  },
  {
    id: '105',
    ownerId: '2',
    title: 'Estudio Bohemio',
    description: 'Pequeño pero acogedor estudio en el barrio de las letras. Perfecto para escritores o estudiantes que buscan inspiración.',
    price: 75000,
    location: 'Banapa',
    imageUrls: [img6, img7],
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    isOccupied: false,
    features: ['Céntrico', 'Silencioso', 'Reformado'],
    waitingList: [],
    status: 'active',
    rating: 4.65,
    reviewCount: 45
  },
  {
    id: '106',
    ownerId: '99',
    title: 'Casa Rural de Piedra',
    description: 'Escapada perfecta a la montaña. Casa de piedra tradicional con todas las comodidades modernas en un entorno natural.',
    price: 110000,
    location: 'Mile 17',
    imageUrls: [img1, img2],
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    isOccupied: false,
    features: ['Chimenea', 'Montaña', 'Senderismo', 'Mascotas permitidas'],
    waitingList: [],
    status: 'active',
    rating: 4.88,
    reviewCount: 89
  },
  {
    id: '107',
    ownerId: '2',
    title: 'Piso de Diseño',
    description: 'Decoración de autor, muebles de diseño italiano y tecnología domótica en toda la casa.',
    price: 210000,
    location: 'Sbika',
    imageUrls: [img3, img4, img5],
    bedrooms: 2,
    bathrooms: 2,
    area: 100,
    isOccupied: true,
    features: ['Domótica', 'Diseño', 'Gimnasio'],
    waitingList: [],
    status: 'active',
    rating: 4.75,
    reviewCount: 67
  },
  {
    id: '108',
    ownerId: '3',
    title: 'Villa Mediterránea',
    description: 'Villa blanca con toques azules, patio interior con fuente y naranjos. Un oasis de paz.',
    price: 320000,
    location: 'Bioko Estate',
    imageUrls: [img6, img7],
    bedrooms: 5,
    bathrooms: 4,
    area: 350,
    isOccupied: false,
    features: ['Patio', 'Histórico', 'Lujo', 'Servicio limpieza'],
    waitingList: [],
    status: 'active',
    rating: 5.0,
    reviewCount: 12
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    fromId: '3', // Ana Client
    toId: '2',   // Carlos Owner
    propertyId: '101',
    content: 'Hola, ¿está disponible para visitar este fin de semana?',
    timestamp: Date.now() - 86400000 * 2 // 2 days ago
  },
  {
    id: 'm2',
    fromId: '2', // Carlos Owner
    toId: '3',   // Ana Client
    propertyId: '101',
    content: '¡Hola Ana! Sí, el sábado por la mañana tengo hueco. ¿Te va bien?',
    timestamp: Date.now() - 86400000 * 1.8 
  }
];

