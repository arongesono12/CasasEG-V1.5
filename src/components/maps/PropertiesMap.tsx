import React, { useEffect, useRef } from 'react';
import { Property } from '../../types';
import { Icons } from '../Icons';

interface PropertiesMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

export const PropertiesMap: React.FC<PropertiesMapProps> = ({ 
  properties, 
  onPropertySelect,
  className 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Default to Malabo, GE
  const defaultCenter = [3.7504, 8.7371];

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = window.L.map(mapContainerRef.current).setView(defaultCenter, 12);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const map = mapInstanceRef.current;
    const propertiesWithCoords = properties.filter(p => p.coordinates);

    propertiesWithCoords.forEach(property => {
      if (!property.coordinates) return;
      
      const { lat, lng } = property.coordinates;
      
      const marker = window.L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`
          <div class="min-w-[200px]">
            <div class="h-32 w-full mb-2 bg-gray-100 rounded-lg overflow-hidden relative">
               <img src="${property.imageUrls[0]}" class="w-full h-full object-cover" />
               <div class="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                 ${property.price.toLocaleString()} FCA
               </div>
            </div>
            <h3 class="font-bold text-sm mb-1 line-clamp-1">${property.title}</h3>
            <p class="text-xs text-gray-500 mb-2 line-clamp-1">${property.location}</p>
            <button 
              id="view-prop-${property.id}"
              class="w-full bg-black text-white py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
            >
              Ver Detalles
            </button>
          </div>
        `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-prop-${property.id}`);
        if (btn && onPropertySelect) {
          btn.onclick = () => onPropertySelect(property);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if there are markers
    if (markersRef.current.length > 0) {
      const group = window.L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [properties, onPropertySelect]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      <div className="absolute top-4 right-4 z-[400] bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold text-gray-700">
          {properties.filter(p => p.coordinates).length} propiedades en mapa
        </span>
      </div>
    </div>
  );
};
