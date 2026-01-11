import React, { useState, useEffect } from 'react';
import { Property, User } from '../../types';
import { Icons } from '../Icons';
import { Button } from '../ui';

interface PropertyDetailsViewProps {
  property: Property;
  onBack: () => void;
  currentUser: User | null;
  onAction: (action: string, property: Property) => void;
}

export const PropertyDetailsView: React.FC<PropertyDetailsViewProps> = ({ 
  property, 
  onBack, 
  currentUser, 
  onAction 
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (property.imageUrls.length > 1) {
        setCurrentImgIndex((prev) => (prev + 1) % property.imageUrls.length);
      }
    }, 3000);

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
          aria-label="Volver al listado"
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
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2" aria-label="Imagen anterior">
              <Icons.ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2" aria-label="Imagen siguiente">
              <Icons.ChevronRight className="w-8 h-8" />
            </button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {property.imageUrls.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImgIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                  aria-label={`Ver imagen ${idx + 1} de ${property.imageUrls.length}`}
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

          {/* Host Info */}
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

      {/* Floating Action Bottom Bar */}
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

