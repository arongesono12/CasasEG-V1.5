import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Property, UserRole, Notification, Message } from './types';
import { Icons } from './components/Icons';

// --- MOCK DATA ---
const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin General', email: 'admin@vesta.com', role: 'admin', avatar: 'https://picsum.photos/id/1/100/100', password: '123' },
  { id: '2', name: 'Carlos Dueño', email: 'owner@test.com', role: 'owner', avatar: 'https://picsum.photos/id/2/100/100', password: '123' },
  { id: '3', name: 'Ana Cliente', email: 'client@test.com', role: 'client', avatar: 'https://picsum.photos/id/3/100/100', password: '123' },
];

const INITIAL_PROPERTIES: Property[] = [
  {
    id: '101',
    ownerId: '2',
    title: 'Apartamento Moderno Centro',
    description: 'Hermoso apartamento en el corazón de la ciudad, cerca de todos los servicios. Cuenta con iluminación natural, acabados de lujo, suelo radiante y ventanas insonorizadas para tu máximo confort.',
    price: 120000,
    location: 'Madrid, Centro',
    imageUrls: [
      'https://picsum.photos/id/10/800/600',
      'https://picsum.photos/id/11/800/600',
      'https://picsum.photos/id/12/800/600'
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
    location: 'Pozuelo',
    imageUrls: ['https://picsum.photos/id/15/800/600', 'https://picsum.photos/id/16/800/600', 'https://picsum.photos/id/17/800/600'],
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
    location: 'Barcelona, Poble Nou',
    imageUrls: ['https://picsum.photos/id/20/800/600', 'https://picsum.photos/id/21/800/600'],
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
    location: 'Valencia, Playa',
    imageUrls: ['https://picsum.photos/id/25/800/600', 'https://picsum.photos/id/26/800/600', 'https://picsum.photos/id/27/800/600', 'https://picsum.photos/id/28/800/600'],
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
    location: 'Madrid, Huertas',
    imageUrls: ['https://picsum.photos/id/30/800/600', 'https://picsum.photos/id/31/800/600'],
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
    location: 'Asturias, Cangas',
    imageUrls: ['https://picsum.photos/id/35/800/600', 'https://picsum.photos/id/36/800/600'],
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
    location: 'Bilbao, Ensanche',
    imageUrls: ['https://picsum.photos/id/40/800/600', 'https://picsum.photos/id/41/800/600', 'https://picsum.photos/id/42/800/600'],
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
    location: 'Sevilla, Santa Cruz',
    imageUrls: ['https://picsum.photos/id/45/800/600', 'https://picsum.photos/id/46/800/600'],
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

const INITIAL_MESSAGES: Message[] = [
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

const ITEMS_PER_PAGE = 8;

// --- COMPONENTS ---

const Button: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'brand';
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-full font-medium transition-transform active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-black disabled:bg-gray-300",
    brand: "bg-black text-white hover:bg-gray-800 shadow-md disabled:bg-gray-400 disabled:shadow-none",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 disabled:opacity-50"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Skeleton Component for loading state
const PropertyCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl flex flex-col h-full overflow-hidden border border-gray-100 shadow-sm">
    <div className="relative aspect-[4/3] m-2 rounded-2xl bg-gray-100 animate-pulse" />
    <div className="flex-1 flex flex-col p-4 pt-2 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-100 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-12" />
      </div>
      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
      <div className="mt-2 h-8 bg-gray-100 rounded animate-pulse w-1/3" />
      <div className="mt-4 h-10 bg-gray-100 rounded-full animate-pulse w-full" />
    </div>
  </div>
);

const ImageViewer: React.FC<{
  images: string[];
  initialIndex: number;
  onClose: () => void;
}> = ({ images, initialIndex, onClose }) => {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex(prev => (prev - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setIndex(prev => (prev + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-50">
        <Icons.Close className="w-6 h-6" />
      </button>

      <div className="relative w-full h-full p-4 md:p-10 flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
          <img src={images[index]} alt="Full view" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          
          {images.length > 1 && (
            <>
                <button 
                  onClick={() => setIndex((prev) => (prev - 1 + images.length) % images.length)} 
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all"
                >
                    <Icons.ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={() => setIndex((prev) => (prev + 1) % images.length)} 
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all"
                >
                    <Icons.ChevronRight className="w-8 h-8" />
                </button>
                <div className="absolute bottom-6 flex gap-2">
                    {images.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setIndex(i)}
                          className={`h-2.5 w-2.5 rounded-full transition-all shadow-sm ${i === index ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`} 
                        />
                    ))}
                </div>
            </>
          )}
          <div className="absolute bottom-6 right-6 text-white/70 text-sm font-medium px-3 py-1 bg-black/50 rounded-full">
            {index + 1} / {images.length}
          </div>
      </div>
    </div>
  );
};

// --- MESSAGING COMPONENT ---

interface ConversationKey {
  propertyId: string;
  partnerId: string;
}

// Group messages by conversation (Property + Other User)
type ConversationGroup = {
  property: Property;
  partner: User;
  lastMessage: Message;
  propertyId: string;
  partnerId: string;
};

const MessagesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  messages: Message[];
  properties: Property[];
  onSendMessage: (propertyId: string, toId: string, content: string) => void;
  initialContext?: ConversationKey | null;
}> = ({ isOpen, onClose, currentUser, messages, properties, onSendMessage, initialContext }) => {
  const [selectedChat, setSelectedChat] = useState<ConversationKey | null>(initialContext || null);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Update selected chat if initialContext changes (e.g. from external trigger)
  useEffect(() => {
    if (initialContext) {
      setSelectedChat(initialContext);
    }
  }, [initialContext]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedChat, messages]);

  if (!isOpen) return null;

  const conversations = messages.reduce<Record<string, ConversationGroup>>((acc, msg) => {
    const isMe = msg.fromId === currentUser.id;
    const partnerId = isMe ? msg.toId : msg.fromId;
    const key = `${msg.propertyId}-${partnerId}`;

    if (!acc[key]) {
      const property = properties.find(p => p.id === msg.propertyId);
      const partner = INITIAL_USERS.find(u => u.id === partnerId);
      if (property && partner) {
        acc[key] = {
          property,
          partner,
          lastMessage: msg,
          propertyId: msg.propertyId,
          partnerId: partnerId
        };
      }
    } else {
      if (msg.timestamp > acc[key].lastMessage.timestamp) {
        acc[key].lastMessage = msg;
      }
    }
    return acc;
  }, {});

  // If initialContext doesn't exist in conversations (new chat), add a placeholder
  if (initialContext) {
    const key = `${initialContext.propertyId}-${initialContext.partnerId}`;
    if (!conversations[key]) {
      const property = properties.find(p => p.id === initialContext.propertyId);
      const partner = INITIAL_USERS.find(u => u.id === initialContext.partnerId);
      if (property && partner) {
        conversations[key] = {
          property,
          partner,
          lastMessage: { content: 'Nueva conversación', timestamp: Date.now() } as Message,
          propertyId: initialContext.propertyId,
          partnerId: initialContext.partnerId
        };
      }
    }
  }

  const conversationList = Object.values(conversations).sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

  const currentMessages = selectedChat 
    ? messages.filter(m => 
        m.propertyId === selectedChat.propertyId && 
        ((m.fromId === currentUser.id && m.toId === selectedChat.partnerId) || 
         (m.fromId === selectedChat.partnerId && m.toId === currentUser.id))
      ).sort((a, b) => a.timestamp - b.timestamp)
    : [];

  const handleSend = () => {
    if (!selectedChat || !newMessage.trim()) return;
    onSendMessage(selectedChat.propertyId, selectedChat.partnerId, newMessage);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="bg-white w-full h-full md:h-[80vh] md:max-w-4xl md:rounded-3xl shadow-2xl flex overflow-hidden relative">
        <button onClick={onClose} className="hidden md:block absolute top-4 right-4 z-50 p-2 hover:bg-gray-100 rounded-full">
          <Icons.Close className="w-5 h-5 text-gray-500" />
        </button>

        {/* Sidebar / List (Hidden on mobile if chat selected) */}
        <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center md:h-20">
            <h2 className="text-xl font-bold">Mensajes</h2>
            <button onClick={onClose} className="md:hidden p-2"><Icons.Close className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversationList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Icons.Message className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No tienes mensajes</p>
              </div>
            ) : (
              conversationList.map((conv) => (
                <div 
                  key={`${conv.propertyId}-${conv.partnerId}`}
                  onClick={() => setSelectedChat({ propertyId: conv.propertyId, partnerId: conv.partnerId })}
                  className={`p-4 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 ${
                    selectedChat?.propertyId === conv.propertyId && selectedChat?.partnerId === conv.partnerId ? 'bg-white border-l-4 border-l-black' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                     <span className="font-bold text-gray-900 text-sm truncate">{conv.partner.name}</span>
                     <span className="text-[10px] text-gray-400">{new Date(conv.lastMessage.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs font-medium text-gray-500 mb-1 truncate">{conv.property.title}</div>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`w-full md:w-2/3 flex flex-col bg-white ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white h-16 md:h-20 shadow-sm z-10">
                <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 -ml-2">
                  <Icons.ChevronLeft className="w-6 h-6" />
                </button>
                <img 
                  src={INITIAL_USERS.find(u => u.id === selectedChat.partnerId)?.avatar} 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200" 
                  alt="Partner"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">
                    {INITIAL_USERS.find(u => u.id === selectedChat.partnerId)?.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {properties.find(p => p.id === selectedChat.propertyId)?.title}
                  </p>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={chatContainerRef}>
                {currentMessages.length === 0 && (
                   <div className="text-center py-10 text-gray-400 text-sm">
                      Comienza la conversación...
                   </div>
                )}
                {currentMessages.map((msg) => {
                  const isMe = msg.fromId === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isMe ? 'bg-black text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                      }`}>
                        <p>{msg.content}</p>
                        <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form 
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 focus:ring-2 focus:ring-black outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-black text-white p-3 rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    <Icons.Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
               <Icons.Message className="w-16 h-16 mb-4" />
               <p className="text-lg font-medium text-gray-400">Selecciona una conversación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- VIEWS ---

const PropertyDetailsView: React.FC<{
  property: Property;
  onBack: () => void;
  currentUser: User | null;
  onAction: (action: string, property: Property) => void;
}> = ({ property, onBack, currentUser, onAction }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (property.imageUrls.length > 1) {
        setCurrentImgIndex((prev) => (prev + 1) % property.imageUrls.length);
      }
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [property.imageUrls.length]);

  const nextImage = () => setCurrentImgIndex((prev) => (prev + 1) % property.imageUrls.length);
  const prevImage = () => setCurrentImgIndex((prev) => (prev - 1 + property.imageUrls.length) % property.imageUrls.length);

  return (
    <div className="bg-white min-h-screen animate-fade-in relative pb-24">
      {/* Sticky Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={onBack}
          className="bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md transition-all active:scale-95"
        >
          <Icons.ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Hero Carousel */}
      <div className="relative h-[45vh] md:h-[60vh] bg-gray-100 overflow-hidden">
        {property.imageUrls.map((url, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentImgIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={url} alt={property.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
          </div>
        ))}
        
        {/* Carousel Controls */}
        {property.imageUrls.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2">
              <Icons.ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2">
              <Icons.ChevronRight className="w-8 h-8" />
            </button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {property.imageUrls.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImgIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto -mt-8 relative z-10 px-4 md:px-0">
        <div className="bg-white rounded-t-3xl shadow-xl p-6 md:p-10 min-h-[500px]">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {property.status === 'active' ? 'En Alquiler' : 'Suspendido'}
                 </span>
                 <div className="flex items-center gap-1 text-yellow-500">
                    <Icons.Star className="w-4 h-4 fill-current" />
                    <span className="text-gray-900 font-bold text-sm">{property.rating}</span>
                    <span className="text-gray-400 text-sm">({property.reviewCount} reseñas)</span>
                 </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-500">
                <Icons.Location className="w-5 h-5" />
                <span className="text-lg">{property.location}</span>
              </div>
            </div>
            
            <div className="text-left md:text-right">
              <p className="text-3xl font-bold text-gray-900">{property.price.toLocaleString()} FCA</p>
              <p className="text-gray-500">/ mes</p>
            </div>
          </div>

          <hr className="border-gray-100 my-8" />

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Icons.Bed className="w-6 h-6 text-gray-700 mb-2" />
              <span className="font-bold text-lg text-gray-900">{property.bedrooms}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Habitaciones</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Icons.Bath className="w-6 h-6 text-gray-700 mb-2" />
              <span className="font-bold text-lg text-gray-900">{property.bathrooms}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Baños</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Icons.Area className="w-6 h-6 text-gray-700 mb-2" />
              <span className="font-bold text-lg text-gray-900">{property.area}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">m² Superficie</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sobre esta vivienda</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{property.description}</p>
          </div>

          {/* Features */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Lo que ofrece este lugar</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
              {property.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-black/20" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Host Info (Mock) */}
          <div className="border-t border-gray-100 pt-8">
             <div className="flex items-center gap-4">
                <img src={`https://picsum.photos/seed/${property.ownerId}/100`} alt="Host" className="w-16 h-16 rounded-full object-cover" />
                <div>
                   <h4 className="font-bold text-gray-900">Anfitrión: Agente Inmobiliario</h4>
                   <p className="text-gray-500 text-sm">Responde en menos de 1 hora</p>
                </div>
                <Button variant="secondary" onClick={() => onAction('contact', property)} className="ml-auto text-sm">Contactar</Button>
             </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bottom Bar for Mobile/Desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 md:px-10 z-30 pb-safe">
         <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:block">
               <span className="font-bold text-xl">{property.price.toLocaleString()} FCA</span>
               <span className="text-gray-500 text-sm"> / mes</span>
            </div>
            
            {property.isOccupied ? (
              <Button 
                onClick={() => onAction('notify', property)} 
                variant="secondary" 
                className="w-full md:w-auto md:px-12 py-3 md:py-3 text-base"
              >
                <Icons.Bell className="w-5 h-5" /> Avisarme cuando esté libre
              </Button>
            ) : (
              <Button 
                onClick={() => onAction('contact', property)} 
                variant="brand"
                className="w-full md:w-auto md:px-12 py-3 md:py-3 text-base shadow-lg shadow-black/20"
              >
                 <Icons.Message className="w-4 h-4 mr-2" /> Contactar
              </Button>
            )}
         </div>
      </div>
    </div>
  );
};

const LoginModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (newUser: User) => void;
}> = ({ isOpen, onClose, onLogin, users, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client' as UserRole
  });
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', password: '', role: 'client' });
      setError('');
      setIsRegistering(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      // REGISTRATION LOGIC
      if (!formData.name || !formData.email || !formData.password) {
        setError('Todos los campos son obligatorios');
        return;
      }
      if (users.some(u => u.email === formData.email)) {
        setError('El email ya está registrado');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
        password: formData.password
      };
      
      onRegister(newUser);
    } else {
      // LOGIN LOGIC
      if (!formData.email || !formData.password) {
        setError('Por favor ingresa email y contraseña');
        return;
      }

      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Credenciales inválidas');
      }
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white text-gray-800 placeholder-gray-400";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
          <Icons.Close className="w-5 h-5 text-gray-500" />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          <div className="bg-black p-3 rounded-full mb-4 shadow-lg">
            <Icons.Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            {isRegistering ? 'Crear Cuenta' : 'Bienvenido de nuevo'}
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1">
            {isRegistering ? 'Únete a la comunidad de CasasEG' : 'Accede a tu cuenta para continuar'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="animate-fade-in">
               <label className="block text-xs font-bold text-gray-600 ml-2 mb-1 uppercase tracking-wider">Nombre Completo</label>
               <input 
                  type="text"
                  className={inputClass}
                  placeholder="Ej. Juan Pérez"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
               />
            </div>
          )}

          <div>
             <label className="block text-xs font-bold text-gray-600 ml-2 mb-1 uppercase tracking-wider">Email</label>
             <input 
                type="email"
                className={inputClass}
                placeholder="usuario@ejemplo.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
             />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-600 ml-2 mb-1 uppercase tracking-wider">Contraseña</label>
             <input 
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
             />
          </div>

          {isRegistering && (
             <div className="animate-fade-in pt-2">
                <label className="block text-xs font-bold text-gray-600 ml-2 mb-2 uppercase tracking-wider">Soy...</label>
                <div className="grid grid-cols-2 gap-3">
                   <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'client'})}
                      className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                         formData.role === 'client' 
                         ? 'bg-black text-white shadow-md' 
                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                   >
                      Cliente
                   </button>
                   <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'owner'})}
                      className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                         formData.role === 'owner' 
                         ? 'bg-black text-white shadow-md' 
                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                   >
                      Propietario
                   </button>
                </div>
             </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button onClick={() => {}} variant="brand" className="w-full py-3 text-base">
               {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 font-bold text-black hover:underline focus:outline-none"
            >
              {isRegistering ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </div>

        {/* Development Quick Access - Optional, kept hidden or small for devs */}
        {!isRegistering && (
          <div className="mt-8 border-t border-gray-100 pt-4 text-center">
            <p className="text-xs text-gray-400 mb-2">Acceso Rápido (Demo)</p>
            <div className="flex justify-center gap-2">
               <button onClick={() => { setFormData({...formData, email: 'admin@vesta.com', password: '123'}) }} className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Admin</button>
               <button onClick={() => { setFormData({...formData, email: 'owner@test.com', password: '123'}) }} className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Owner</button>
               <button onClick={() => { setFormData({...formData, email: 'client@test.com', password: '123'}) }} className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Client</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PropertyCard: React.FC<{
  property: Property;
  userRole: UserRole | 'guest';
  onAction: (action: string, property: Property, payload?: any) => void;
}> = ({ property, userRole, onAction }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.imageUrls.length > 0) {
      setCurrentImgIndex((prev) => (prev + 1) % property.imageUrls.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (property.imageUrls.length > 0) {
      setCurrentImgIndex((prev) => (prev - 1 + property.imageUrls.length) % property.imageUrls.length);
    }
  };

  const handleRate = (star: number) => {
    onAction('rate', property, star);
  };

  const hasMultipleImages = property.imageUrls.length > 1;

  // Main Card Click Handler - Opens Details
  const handleCardClick = () => {
    onAction('viewDetails', property);
  };

  return (
    <div 
      className="bg-white rounded-3xl flex flex-col h-full group cursor-pointer overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
      onClick={handleCardClick}
    >
      <div 
        className="relative aspect-[4/3] overflow-hidden m-2 rounded-2xl"
      >
        {/* Sliding Carousel Container */}
        <div 
          className="flex h-full w-full transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
        >
          {property.imageUrls.length > 0 ? (
            property.imageUrls.map((url, idx) => (
              <img 
                key={idx}
                src={url} 
                alt={`${property.title} - ${idx + 1}`} 
                className="w-full h-full object-cover flex-shrink-0" 
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 flex-shrink-0">
              <Icons.Image className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 focus:opacity-100"
              aria-label="Previous image"
            >
              <Icons.ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 focus:opacity-100"
              aria-label="Next image"
            >
              <Icons.ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Interactive Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {property.imageUrls.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImgIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${
                    idx === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                  }`} 
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-3 right-3 flex gap-2 z-10">
          {property.isOccupied ? (
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide">Ocupado</span>
          ) : (
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide">Disponible</span>
          )}
        </div>
        {property.status === 'suspended' && (
           <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10 pointer-events-none">
             <span className="text-white font-bold text-xl border-2 border-white px-4 py-2 rounded-xl">SUSPENDIDO</span>
           </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col p-4 pt-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900 leading-tight text-lg">{property.location}</h3>
          
          <div className="flex items-center gap-1 group/rating relative">
            <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                <Icons.Star className="w-4 h-4 text-gray-900 fill-gray-900 mr-1" />
                <span className="text-sm font-medium text-gray-900">{property.rating.toFixed(2)}</span>
                <span className="text-sm text-gray-500 ml-0.5">({property.reviewCount})</span>
                
                {/* Hover Rating Popup */}
                <div className="absolute top-6 right-0 bg-white border border-gray-100 shadow-xl rounded-xl p-2 flex gap-1 invisible opacity-0 group-hover/rating:visible group-hover/rating:opacity-100 transition-all z-20">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className="focus:outline-none"
                            onMouseEnter={() => setHoverRating(star)}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRate(star);
                            }}
                        >
                            <Icons.Star 
                                className={`w-5 h-5 transition-colors ${
                                    star <= (hoverRating || Math.round(property.rating)) 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : 'text-gray-200'
                                }`} 
                            />
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{property.title}</p>
        
        {/* NEW ICONS ROW */}
        <div className="flex items-center gap-4 mt-2 mb-3">
            <div className="flex items-center gap-1.5 text-gray-600 text-sm" title="Habitaciones">
                <Icons.Bed className="w-4 h-4" /> <span className="font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 text-sm" title="Baños">
                <Icons.Bath className="w-4 h-4" /> <span className="font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 text-sm" title="Superficie">
                <Icons.Area className="w-4 h-4" /> <span className="font-medium">{property.area} m²</span>
            </div>
        </div>
        
        <div className="mt-auto flex items-baseline gap-1">
            <span className="font-bold text-gray-900 text-lg">{property.price.toLocaleString()} FCA</span>
            <span className="text-gray-900 text-sm">Mes</span>
        </div>

        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          {(userRole === 'client' || userRole === 'guest') && (
            property.isOccupied ? (
              <Button 
                onClick={() => onAction('notify', property)} 
                variant="secondary" 
                className="w-full text-sm"
              >
                <Icons.Bell className="w-4 h-4" /> Avisarme
              </Button>
            ) : (
              <Button 
                onClick={() => onAction('contact', property)} 
                variant="brand"
                className="w-full text-sm"
              >
                <Icons.Message className="w-4 h-4 mr-2" /> Contactar
              </Button>
            )
          )}
          
          {userRole === 'owner' && (
            <div className="flex gap-2">
              <Button onClick={() => onAction('edit', property)} variant="secondary" className="flex-1 text-sm">Editar</Button>
              <Button onClick={() => onAction('delete', property)} variant="danger" className="p-2"><Icons.Delete className="w-4 h-4" /></Button>
            </div>
          )}

          {userRole === 'admin' && (
            <div className="flex gap-2">
              {property.status === 'active' ? (
                <Button onClick={() => onAction('suspend', property)} variant="danger" className="w-full text-sm">Suspender</Button>
              ) : (
                <Button onClick={() => onAction('activate', property)} className="w-full text-sm bg-green-600 hover:bg-green-700">Activar</Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface LocalImage {
  id: string;
  url: string;
  isUploading: boolean;
  progress: number;
}

const CreatePropertyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (p: Partial<Property>) => void;
  initialData?: Property | null;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    features: ''
  });
  // Replaced imageUrls string array with richer local state
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          location: initialData.location,
          price: initialData.price.toString(),
          bedrooms: initialData.bedrooms.toString(),
          bathrooms: initialData.bathrooms.toString(),
          area: initialData.area ? initialData.area.toString() : '',
          description: initialData.description,
          features: initialData.features.join(', ')
        });
        setLocalImages(initialData.imageUrls.map(url => ({
          id: Math.random().toString(36).substr(2, 9),
          url,
          isUploading: false,
          progress: 100
        })));
      } else {
        setFormData({
          title: '',
          location: '',
          price: '',
          bedrooms: '',
          bathrooms: '',
          area: '',
          description: '',
          features: ''
        });
        setLocalImages([]);
      }
    }
  }, [isOpen, initialData]);

  const addRandomImage = () => {
    const newImage: LocalImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: `https://picsum.photos/800/600?random=${Math.random()}`,
        isUploading: false,
        progress: 100
    };
    setLocalImages([...localImages, newImage]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempId = Math.random().toString(36).substr(2, 9);
      
      // Initialize uploading state
      const newImage: LocalImage = {
        id: tempId,
        url: '', // Placeholder
        isUploading: true,
        progress: 0
      };
      
      setLocalImages(prev => [...prev, newImage]);

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setLocalImages(prev => prev.map(img => 
           img.id === tempId ? { ...img, progress: Math.min(progress, 90) } : img
        ));
      }, 100);

      const reader = new FileReader();
      reader.onloadend = () => {
        clearInterval(interval);
        if (typeof reader.result === 'string') {
          // Finish upload simulation
          setLocalImages(prev => prev.map(img => 
             img.id === tempId ? { 
               ...img, 
               url: reader.result as string, 
               progress: 100, 
               isUploading: false 
             } : img
          ));
        }
      };
      
      // Add small delay to make progress visible for local files
      setTimeout(() => {
          reader.readAsDataURL(file);
      }, 1000);
    }
    // Reset value to allow re-selecting the same file if needed
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setLocalImages(localImages.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
      const newImages = [...localImages];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      
      if (targetIndex >= 0 && targetIndex < newImages.length) {
          [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
          setLocalImages(newImages);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{initialData ? 'Editar Propiedad' : 'Publicar Propiedad'}</h2>
            <button onClick={onClose}><Icons.Close className="w-6 h-6 text-gray-400 hover:text-black transition-colors" /></button>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Título</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ej. Apartamento luminoso"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Precio (FCA)</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ubicación</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hab.</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  value={formData.bedrooms}
                  onChange={e => setFormData({...formData, bedrooms: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Baños</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  value={formData.bathrooms}
                  onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">m²</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Imágenes</label>
              <div className="space-y-3">
                <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar touch-pan-x">
                  {localImages.map((img, idx) => (
                    <div key={img.id} className="relative flex-shrink-0 w-32 h-32 group rounded-2xl overflow-hidden border border-gray-100">
                      {img.isUploading ? (
                        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-2">
                           <Icons.Image className="w-6 h-6 text-gray-300 mb-2 animate-pulse" />
                           <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full transition-all duration-300" style={{width: `${img.progress}%`}}></div>
                           </div>
                           <span className="text-[10px] text-gray-400 mt-1">{img.progress}%</span>
                        </div>
                      ) : (
                        <>
                          <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                             {/* Reordering Controls */}
                             {idx > 0 && (
                               <button 
                                 onClick={() => moveImage(idx, 'left')} 
                                 className="bg-white/90 p-1.5 rounded-full hover:bg-white text-black"
                               >
                                 <Icons.ChevronLeft className="w-4 h-4" />
                               </button>
                             )}
                             {idx < localImages.length - 1 && (
                               <button 
                                 onClick={() => moveImage(idx, 'right')} 
                                 className="bg-white/90 p-1.5 rounded-full hover:bg-white text-black"
                               >
                                 <Icons.ChevronRight className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                          <button 
                            onClick={() => removeImage(img.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Icons.Close className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                  
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  
                  {/* Upload Button */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black hover:bg-gray-50 transition-all flex-shrink-0"
                  >
                    <Icons.Image className="w-8 h-8 mb-1" />
                    <span className="text-xs font-medium">Subir Foto</span>
                  </button>

                  {/* Random Button (for demo/testing) */}
                  <button 
                    onClick={addRandomImage}
                    className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-300 hover:border-gray-400 hover:text-gray-500 transition-colors flex-shrink-0"
                  >
                    <Icons.Sparkles className="w-8 h-8 mb-1" />
                    <span className="text-xs">Aleatoria</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Características</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                value={formData.features}
                onChange={e => setFormData({...formData, features: e.target.value})}
                placeholder="Wifi, Balcón, Garaje"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Descripción</label>
              </div>
              <textarea 
                className="w-full border border-gray-300 rounded-3xl p-4 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all h-32 text-sm"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción detallada..."
              />
            </div>

            <Button 
              onClick={async () => {
                setIsSaving(true);
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                onSubmit({
                  title: formData.title,
                  price: Number(formData.price),
                  location: formData.location,
                  bedrooms: Number(formData.bedrooms),
                  bathrooms: Number(formData.bathrooms),
                  area: Number(formData.area),
                  description: formData.description,
                  features: formData.features.split(',').map(s => s.trim()),
                  // Map localImages back to string[] for the Property type
                  imageUrls: localImages.length > 0 ? localImages.map(img => img.url) : [`https://picsum.photos/800/600?random=${Math.random()}`],
                  isOccupied: false,
                  status: 'active',
                });
                setIsSaving(false);
                onClose();
              }}
              variant="brand"
              className="w-full mt-6 py-3"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   {initialData ? 'Guardando...' : 'Publicando...'}
                </>
              ) : (
                initialData ? 'Guardar Cambios' : 'Publicar Propiedad'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SEARCH COMPONENT ---
const SearchBar: React.FC<{
  filters: { location: string; name: string; maxPrice: string };
  setFilters: React.Dispatch<React.SetStateAction<{ location: string; name: string; maxPrice: string }>>;
}> = ({ filters, setFilters }) => {
  return (
    <div className="bg-white rounded-3xl md:rounded-full shadow-xl border border-gray-200 flex flex-col md:flex-row md:items-center max-w-4xl mx-auto md:divide-x divide-gray-200">
      
      {/* Location */}
      <div className="flex-1 p-4 md:px-8 md:py-3 hover:bg-gray-50 rounded-t-3xl md:rounded-l-full cursor-text transition-colors relative group border-b md:border-b-0 border-gray-100">
        <label className="block text-xs font-bold text-gray-800 tracking-wider mb-0.5">UBICACIÓN</label>
        <input 
          type="text" 
          placeholder="¿A dónde vas?"
          className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400"
          value={filters.location}
          onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
        />
      </div>

      {/* Name/Title */}
      <div className="flex-1 p-4 md:px-8 md:py-3 hover:bg-gray-50 cursor-text transition-colors border-b md:border-b-0 border-gray-100">
        <label className="block text-xs font-bold text-gray-800 tracking-wider mb-0.5">VIVIENDA</label>
        <input 
          type="text" 
          placeholder="Nombre o tipo..."
          className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400"
          value={filters.name}
          onChange={(e) => setFilters(prev => ({...prev, name: e.target.value}))}
        />
      </div>

      {/* Price */}
      <div className="flex-1 p-4 md:px-8 md:py-3 hover:bg-gray-50 cursor-text transition-colors rounded-b-3xl md:rounded-r-full">
        <label className="block text-xs font-bold text-gray-800 tracking-wider mb-0.5">PRECIO (FCA)</label>
        <input 
          type="number" 
          placeholder="Max. precio"
          className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400"
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
        />
      </div>
      
      {/* Search Button Area */}
      <div className="p-4 md:p-2 md:pl-0">
          <button className="w-full md:w-auto bg-black hover:bg-gray-800 text-white md:rounded-full rounded-2xl p-3 md:px-4 md:py-3 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
             <Icons.Search className="w-5 h-5 font-bold" />
             <span className="md:hidden font-bold">Buscar</span>
          </button>
      </div>

    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS); // Added state for user management
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewingImageState, setViewingImageState] = useState<{ images: string[], index: number } | null>(null);
  
  // Messages State
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<ConversationKey | null>(null);

  // New Filter State
  const [filters, setFilters] = useState({
    location: '',
    name: '',
    maxPrice: ''
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
    showToast(`Bienvenido, ${user.name}`);
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    handleLogin(newUser);
    showToast('¡Cuenta creada con éxito!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsMessagesOpen(false);
  };

  const handleSendMessage = (propertyId: string, toId: string, content: string) => {
    if (!currentUser) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      fromId: currentUser.id,
      toId,
      propertyId,
      content,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handlePropertyAction = (action: string, property: Property, payload?: any) => {
    if (action === 'viewImage') {
        // Allow viewing images even if not logged in
        setViewingImageState({ images: property.imageUrls, index: payload });
        return;
    }

    if (action === 'viewDetails') {
        setSelectedProperty(property);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    if (action === 'notify') {
      showToast(`Te avisaremos cuando "${property.title}" esté libre.`);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        userId: currentUser.id,
        message: `Estás siguiendo: ${property.title}`,
        read: false,
        timestamp: Date.now()
      }]);
    } else if (action === 'contact') {
      // Open messages with context
      if (property.ownerId === currentUser.id) {
        showToast('No puedes enviarte mensajes a ti mismo.');
        return;
      }
      setActiveConversation({ propertyId: property.id, partnerId: property.ownerId });
      setIsMessagesOpen(true);
    } else if (action === 'delete') {
      setProperties(prev => prev.filter(p => p.id !== property.id));
      showToast('Propiedad eliminada.');
    } else if (action === 'suspend') {
      setProperties(prev => prev.map(p => p.id === property.id ? {...p, status: 'suspended'} : p));
    } else if (action === 'activate') {
      setProperties(prev => prev.map(p => p.id === property.id ? {...p, status: 'active'} : p));
    } else if (action === 'edit') {
      setEditingProperty(property);
      setShowCreateModal(true);
    } else if (action === 'rate') {
       const newRatingValue = payload;
       // Formula: newAverage = ((oldAverage * count) + newVote) / (count + 1)
       const totalScore = property.rating * property.reviewCount;
       const newCount = property.reviewCount + 1;
       const newAverage = (totalScore + newRatingValue) / newCount;
       
       setProperties(prev => prev.map(p => p.id === property.id ? {
           ...p, 
           rating: parseFloat(newAverage.toFixed(2)), 
           reviewCount: newCount 
       } : p));
       showToast(`¡Gracias por tu valoración de ${newRatingValue} estrellas!`);
    }
  };

  const handleSaveProperty = (data: Partial<Property>) => {
    if (editingProperty) {
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? { ...p, ...data } : p));
      showToast('Propiedad actualizada con éxito.');
    } else {
      const newProperty: Property = {
        id: Date.now().toString(),
        ownerId: currentUser!.id,
        waitingList: [],
        rating: 5,
        reviewCount: 0,
        ...data as any
      };
      setProperties(prev => [newProperty, ...prev]);
      showToast('Propiedad publicada con éxito.');
    }
    setShowCreateModal(false);
    setEditingProperty(null);
  };

  // Advanced Filtering
  const filteredProperties = properties.filter(p => {
    // 1. Text Search (Name & Location)
    const nameMatch = filters.name === '' || p.title.toLowerCase().includes(filters.name.toLowerCase());
    const locMatch = filters.location === '' || p.location.toLowerCase().includes(filters.location.toLowerCase());
    
    // 2. Price Filter
    const priceMatch = filters.maxPrice === '' || p.price <= Number(filters.maxPrice);

    // 3. Role based visibility
    let roleMatch = true;
    if (currentUser?.role === 'owner') {
      roleMatch = p.ownerId === currentUser.id;
    } else if (!currentUser || currentUser.role === 'client') {
      // Public/Client only sees active properties
      roleMatch = p.status === 'active';
    }
    // Admin sees all

    return nameMatch && locMatch && priceMatch && roleMatch;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- RENDER SELECTED VIEW ---
  
  if (selectedProperty) {
      return (
          <>
            <PropertyDetailsView 
                property={selectedProperty} 
                onBack={() => setSelectedProperty(null)}
                currentUser={currentUser}
                onAction={handlePropertyAction}
            />
            {currentUser && (
              <MessagesModal 
                isOpen={isMessagesOpen}
                onClose={() => setIsMessagesOpen(false)}
                currentUser={currentUser}
                messages={messages}
                properties={properties}
                onSendMessage={handleSendMessage}
                initialContext={activeConversation}
              />
            )}
            <LoginModal 
                isOpen={isLoginOpen} 
                onClose={() => setIsLoginOpen(false)} 
                onLogin={handleLogin}
                users={users}
                onRegister={handleRegister}
            />
            {toastMessage && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in-up flex items-center gap-2">
                <Icons.Check className="w-4 h-4 text-green-400" />
                {toastMessage}
                </div>
            )}
          </>
      );
  }

  // --- RENDER MAIN GRID ---

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-white">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
             setFilters({location: '', name: '', maxPrice: ''});
             window.scrollTo({top: 0, behavior: 'smooth'});
          }}>
            <Icons.Home className="w-8 h-8 text-black" />
            <span className="font-bold text-xl tracking-tight text-black hidden sm:block">CasasEG</span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
               {currentUser.role === 'owner' && (
                  <Button variant="ghost" onClick={() => setShowCreateModal(true)} className="hidden md:flex text-sm">
                     Pon tu casa en Vesta
                  </Button>
               )}
                <div className="flex items-center gap-2 border border-gray-200 rounded-full p-1 pl-4 hover:shadow-md transition-shadow cursor-pointer">
                  <button 
                    onClick={() => {
                      setActiveConversation(null);
                      setIsMessagesOpen(true);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full mr-2 relative"
                    title="Mensajes"
                  >
                    <Icons.Message className="w-5 h-5 text-gray-600" />
                    {messages.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                  </button>
                  <Icons.Menu className="w-4 h-4 text-gray-500" />
                  <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full bg-gray-200" />
                  <button onClick={handleLogout} className="ml-2 mr-2 text-gray-400 hover:text-black">
                    <Icons.Logout className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                 <div 
                   onClick={() => setIsLoginOpen(true)}
                   className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 hover:shadow-md transition-shadow cursor-pointer"
                  >
                   <Icons.Menu className="w-4 h-4 text-gray-500" />
                   <div className="bg-gray-500 rounded-full p-1">
                      <Icons.User className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-sm font-medium text-gray-700">Acceder</span>
                 </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sticky Search Bar Container */}
      <div className="sticky top-20 z-30 bg-white py-6 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <SearchBar filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Role Specific Actions Header (Only for Owners/Admin) */}
        {currentUser && currentUser.role !== 'client' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {currentUser.role === 'owner' ? 'Mis Propiedades' : 'Panel de Administración'}
            </h1>
            <p className="text-gray-500 mt-1">
              {currentUser.role === 'owner' ? 'Gestiona tus alquileres.' : 'Supervisión global.'}
            </p>
          </div>
        )}

        {/* Property Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {paginatedProperties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  userRole={currentUser?.role || 'guest'}
                  onAction={handlePropertyAction}
                />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-16 pb-8">
                <Button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  variant="secondary"
                  className="w-12 h-12 !rounded-full !p-0 flex items-center justify-center"
                >
                  <Icons.ChevronLeft className="w-5 h-5" />
                </Button>
                
                <span className="text-sm font-medium text-gray-500">
                  Página <span className="text-black font-bold">{currentPage}</span> de {totalPages}
                </span>

                <Button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  variant="secondary"
                  className="w-12 h-12 !rounded-full !p-0 flex items-center justify-center"
                >
                  <Icons.ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Icons.Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No hay resultados</h3>
            <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda.</p>
            <button 
              onClick={() => setFilters({location: '', name: '', maxPrice: ''})}
              className="mt-4 text-black font-medium hover:underline"
            >
              Borrar filtros
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLogin}
        users={users}
        onRegister={handleRegister}
      />
      
      <CreatePropertyModal 
        isOpen={showCreateModal} 
        onClose={() => {
          setShowCreateModal(false);
          setEditingProperty(null);
        }}
        onSubmit={handleSaveProperty}
        initialData={editingProperty}
      />
      
      {currentUser && (
        <MessagesModal 
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          currentUser={currentUser}
          messages={messages}
          properties={properties}
          onSendMessage={handleSendMessage}
          initialContext={activeConversation}
        />
      )}

      {viewingImageState && (
        <ImageViewer 
            images={viewingImageState.images} 
            initialIndex={viewingImageState.index} 
            onClose={() => setViewingImageState(null)} 
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in-up flex items-center gap-2">
          <Icons.Check className="w-4 h-4 text-green-400" />
          {toastMessage}
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-40 pb-safe">
        <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="flex flex-col items-center text-black">
          <Icons.Home className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Explorar</span>
        </button>
        <button 
          onClick={() => {
            if (!currentUser) setIsLoginOpen(true);
            else {
              setActiveConversation(null);
              setIsMessagesOpen(true);
            }
          }} 
          className="flex flex-col items-center text-gray-400 relative"
        >
          <Icons.Message className="w-6 h-6" />
          {messages.length > 0 && currentUser && <span className="absolute top-0 right-3 w-2 h-2 bg-red-500 rounded-full"></span>}
          <span className="text-[10px] font-medium mt-1">Mensajes</span>
        </button>
        <button onClick={() => !currentUser && setIsLoginOpen(true)} className="flex flex-col items-center text-gray-400">
          {currentUser ? (
             <img src={currentUser.avatar} className="w-6 h-6 rounded-full" />
          ) : (
             <Icons.User className="w-6 h-6" />
          )}
          <span className="text-[10px] font-medium mt-1">{currentUser ? 'Perfil' : 'Acceder'}</span>
        </button>
      </div>
    </div>
  );
}