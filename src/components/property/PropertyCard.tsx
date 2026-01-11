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
      className={`bg-white rounded-3xl flex flex-col h-full group cursor-pointer overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 transform ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
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
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${idx === currentImgIndex ? 'opacity-100' : 'opacity-0'}`}
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
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
              aria-label="Imagen anterior"
            >
              <Icons.ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 focus:opacity-100"
              aria-label="Imagen siguiente"
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
                  aria-label={`Ver imagen ${idx + 1}`}
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
                            aria-label={`Valorar con ${star} estrellas`}
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
        
        {/* Icons Row */}
        <div className="flex items-center gap-4 mt-2 mb-3">
            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                <Icons.Bed className="w-4 h-4" /> <span className="font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                <Icons.Bath className="w-4 h-4" /> <span className="font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
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

