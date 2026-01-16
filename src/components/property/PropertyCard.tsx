import React, { useState, useEffect } from 'react';
import { Property, UserRole } from '../../types';
import { Icons } from '../Icons';
import { Button } from '../ui';

interface PropertyCardProps {
  property: Property;
  userRole: UserRole | 'guest';
  onAction: (action: string, property: Property, payload?: any) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  userRole, 
  onAction 
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

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
  const handleCardClick = () => onAction('viewDetails', property);

  return (
    <div 
      className={`bg-white rounded-3xl flex flex-col h-full group cursor-pointer overflow-hidden border border-gray-100 premium-shadow transition-all duration-500 transform ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden m-2 rounded-2xl">
        {/* Stacked Carousel (fade between images) */}
        <div className="relative h-full w-full">
          {property.imageUrls.length > 0 ? (
            property.imageUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`${property.title} - ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${idx === currentImgIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
              <Icons.Image className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 glass-effect hover:bg-white text-gray-800 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm z-10 focus:opacity-100"
              aria-label="Imagen anterior"
            >
              <Icons.ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 glass-effect hover:bg-white text-gray-800 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm z-10 focus:opacity-100"
              aria-label="Imagen siguiente"
            >
              <Icons.ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Interactive Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {property.imageUrls.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImgIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all duration-300 ${
                    idx === currentImgIndex ? 'bg-white scale-150 w-3' : 'bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Ver imagen ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <span className={`glass-effect text-xs font-bold px-3.5 py-2 rounded-full shadow-sm uppercase tracking-wider ${property.isOccupied ? 'text-red-600' : 'text-emerald-600'}`}>
            {property.isOccupied ? 'Ocupado' : 'Disponible'}
          </span>
        </div>
        {property.status === 'suspended' && (
           <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center z-10 pointer-events-none backdrop-blur-[2px]">
             <span className="text-white font-black text-xl border-2 border-white px-5 py-2.5 rounded-2xl tracking-widest uppercase">Suspendido</span>
           </div>
        )}
      </div>

      
      <div className="flex-1 flex flex-col p-3 pt-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900 leading-tight text-sm">{property.location}</h3>
          
          <div className="flex items-center gap-1 group/rating relative">
            <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                <Icons.Star className="w-3.5 h-3.5 text-black fill-black mr-1" />
                <span className="text-xs font-medium text-gray-900">{property.rating.toFixed(2)}</span>
                <span className="text-xs text-gray-500 ml-0.5">({property.reviewCount})</span>
                
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
                            aria-label={`Valorar con ${star} estrellas`}
                        >
                            <Icons.Star 
                                className={`w-4 h-4 transition-colors ${
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
        
        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{property.title}</p>
        
        {/* Icons Row */}
        <div className="flex items-center gap-3 mt-2 mb-2">
            <div className="flex items-center gap-1 text-gray-600 text-xs">
                <Icons.Bed className="w-3.5 h-3.5 property-card-icon" /> <span className="font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 text-xs">
                <Icons.Bath className="w-3.5 h-3.5 property-card-icon" /> <span className="font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 text-xs">
                <Icons.Area className="w-3.5 h-3.5 property-card-icon" /> <span className="font-medium">{property.area} m²</span>
            </div>
        </div>
        
        <div className="mt-auto flex items-baseline gap-1">
            <span className="font-bold text-gray-900 text-sm">{property.price.toLocaleString()} FCA</span>
            <span className="text-gray-900 text-[10px]">/Mes</span>
        </div>

        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          {(userRole === 'client' || userRole === 'guest') && (
            property.isOccupied ? (
              <Button 
                onClick={() => onAction('notify', property)} 
                variant="secondary" 
                className="w-full text-xs py-2 h-8"
              >
                <Icons.Bell className="w-3 h-3 mr-1.5" /> Avisarme
              </Button>
            ) : (
              <Button 
                onClick={() => onAction('contact', property)} 
                variant="brand"
                className="w-full text-xs py-2 h-8"
              >
                <Icons.Message className="w-3 h-3 mr-1.5" /> Contactar
              </Button>
            )
          )}
          
          {userRole === 'owner' && (
            <div className="flex gap-2">
              <Button onClick={() => onAction('edit', property)} variant="secondary" className="flex-1 text-xs py-2 h-8">Editar</Button>
              <Button onClick={() => onAction('delete', property)} variant="danger" className="text-xs py-2 h-8 px-2"><Icons.Delete className="w-3 h-3" /></Button>
            </div>
          )}

          {userRole === 'admin' && (
            <div className="flex gap-2">
              {property.status === 'active' ? (
                <Button onClick={() => onAction('suspend', property)} variant="danger" className="w-full text-xs py-2 h-8">Suspender</Button>
              ) : (
                <Button onClick={() => onAction('activate', property)} className="w-full text-xs py-2 h-8 bg-green-600 hover:bg-green-700">Activar</Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

