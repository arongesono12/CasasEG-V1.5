import React, { useState } from 'react';
import { Property, User } from '../../types';
import { Icons } from '../Icons';
import { Button } from '../ui';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useProperties } from '../../contexts/PropertyContext';

interface PropertyDetailsViewProps {
  property?: Property;
  onBack: () => void;
  currentUser: User | null;
  onAction: (action: string, property: Property) => void;
}

export const PropertyDetailsView: React.FC<PropertyDetailsViewProps> = ({ 
  property: propProperty, 
  onBack, 
  currentUser, 
  onAction 
}) => {
  const { id } = useParams<{ id: string }>();
  const { properties } = useProperties();
  const navigate = useNavigate();
  
  const property = propProperty || properties.find(p => p.id === id);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  if (!property) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No se encontró la propiedad.</p>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }


  // Simplified images array for grid
  const images = property.imageUrls.length > 0 ? property.imageUrls : [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white min-h-screen relative pb-32"
    >
      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 md:px-12 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all font-medium"
        >
          <Icons.ChevronLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <div className="flex gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-all"><Icons.Send className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-all"><Icons.Heart className="w-5 h-5" /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title and Rating Bundle */}
        <div className="mb-6">
           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
           <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1 font-bold">
                 <Icons.Star className="w-4 h-4 fill-current" />
                 <span>{property.rating}</span>
                 <span className="font-normal text-gray-500 underline ml-1">{property.reviewCount} reseñas</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 font-medium">
                 <Icons.Location className="w-4 h-4" />
                 <span className="underline">{property.location}</span>
              </div>
              {!property.isOccupied && (
                 <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                   <Icons.Check className="w-3 h-3" /> Disponible ahora
                 </span>
              )}
           </div>
        </div>

        {/* Airbnb Style Image Grid */}
        <div className="relative rounded-2xl overflow-hidden group mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[350px] md:h-[500px]">
            {/* First Image - Large */}
            <div className="md:col-span-2 md:row-span-2 relative overflow-hidden">
               <img src={images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" alt="Main" />
            </div>
            {/* Gallery images - only shown on desktop */}
            <div className="hidden md:block md:col-span-1 relative overflow-hidden">
               <img src={images[1] || images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" alt="Gallery 1" />
            </div>
            <div className="hidden md:block md:col-span-1 relative overflow-hidden rounded-tr-2xl">
               <img src={images[2] || images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" alt="Gallery 2" />
            </div>
            <div className="hidden md:block md:col-span-1 relative overflow-hidden">
               <img src={images[3] || images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" alt="Gallery 3" />
            </div>
            <div className="hidden md:block md:col-span-1 relative overflow-hidden rounded-br-2xl">
               <img src={images[4] || images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" alt="Gallery 4" />
            </div>
            
            <button 
              onClick={() => setShowAllPhotos(true)}
              className="absolute bottom-5 right-5 glass-effect text-black font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
            >
              <Icons.Grid className="w-4 h-4" /> Mostrar todas las fotos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Main Content Column */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-start pb-8 border-b border-gray-100">
               <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Anfitrión: Agente Inmobiliario</h2>
                  <div className="flex gap-4 text-gray-600 text-sm">
                     <span>{property.bedrooms} habitaciones</span>
                     <span>•</span>
                     <span>{property.bathrooms} baños</span>
                     <span>•</span>
                     <span>{property.area} m²</span>
                  </div>
               </div>
               <div className="relative">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${property.ownerId}&background=random&color=fff&size=128`} 
                    alt="Host" 
                    className="w-14 h-14 rounded-full object-cover bg-gray-50 border border-gray-100 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                     <Icons.Check className="w-4 h-4 text-emerald-500 bg-emerald-50 rounded-full p-0.5" />
                  </div>
               </div>
            </div>

            {/* Fundamentos destacados */}
            <div className="py-8 space-y-6 border-b border-gray-100">
               <div className="flex gap-4">
                  <Icons.Map className="w-6 h-6 text-gray-800" />
                  <div>
                     <h4 className="font-bold text-gray-900">Ubicación excelente</h4>
                     <p className="text-gray-500 text-sm">El 95% de los últimos huéspedes valoraron con 5 estrellas la ubicación.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <Icons.Admin className="w-6 h-6 text-gray-800" />
                  <div>
                     <h4 className="font-bold text-gray-900">Proceso de reserva seguro</h4>
                     <p className="text-gray-500 text-sm">Protección total de tus datos y pagos mediante contrato legal.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <Icons.Message className="w-6 h-6 text-gray-800" />
                  <div>
                     <h4 className="font-bold text-gray-900">Comunicación rápida</h4>
                     <p className="text-gray-500 text-sm">Este anfitrión suele responder en menos de una hora.</p>
                  </div>
               </div>
            </div>

            <div className="py-8 border-b border-gray-100">
               <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {property.description}
               </p>
            </div>

            <div className="py-8">
               <h3 className="text-xl font-bold text-gray-900 mb-6">Lo que ofrece este lugar</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-gray-700 py-2">
                      <Icons.Sparkles className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Sticky Sidebar / Reservation Card */}
          <div className="md:col-span-1">
             <div className="sticky top-28 bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl shadow-black/5 premium-shadow">
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <span className="text-2xl font-bold text-gray-900">{property.price.toLocaleString()} FCA</span>
                      <span className="text-gray-500 text-sm font-medium ml-1">/ mes</span>
                   </div>
                   <div className="flex items-center gap-1 text-sm font-bold">
                      <Icons.Star className="w-3.5 h-3.5 fill-current" />
                      <span>{property.rating}</span>
                   </div>
                </div>

                {/* Simulated Availability Calendar/Interface */}
                <div className="border border-gray-300 rounded-xl mb-4 overflow-hidden">
                   <div className="grid grid-cols-2 divide-x divide-gray-300 border-b border-gray-300">
                      <div className="p-3">
                         <label className="block text-[10px] uppercase font-black text-gray-900">Tipo Alquiler</label>
                         <span className="text-sm text-gray-600">Largo Plazo</span>
                      </div>
                      <div className="p-3">
                         <label className="block text-[10px] uppercase font-black text-gray-900">Disponibilidad</label>
                         <span className="text-sm text-gray-600">Inmediata</span>
                      </div>
                   </div>
                   <div className="p-3">
                      <label className="block text-[10px] uppercase font-black text-gray-900">Estado de la vivienda</label>
                      <span className="text-sm text-gray-600">Amueblada y Lista</span>
                   </div>
                </div>

                <Button 
                   onClick={() => onAction('contact', property)}
                   variant="brand" 
                   className="w-full py-4 text-lg font-bold shadow-lg shadow-black/10 transition-transform active:scale-[0.98]"
                   disabled={property.isOccupied}
                >
                   {property.isOccupied ? 'Avisarme cuando esté libre' : 'Reservar Visita'}
                </Button>

                <p className="text-center text-gray-500 text-xs mt-4 font-medium">No se te cobrará nada todavía</p>
                
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center font-bold text-gray-900">
                   <span>Total Estimado (FCA)</span>
                   <span className="text-xl">{property.price.toLocaleString()}</span>
                </div>
             </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};
