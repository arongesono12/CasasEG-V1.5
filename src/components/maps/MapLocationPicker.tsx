import React, { useEffect, useRef, useState } from 'react';
import { Icons } from '../Icons';

interface MapLocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  className?: string;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ 
  initialLocation, 
  onLocationSelect,
  className 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Default to Malabo, GE
  const defaultCenter = [3.7504, 8.7371];

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = window.L.map(mapContainerRef.current).setView(
        initialLocation ? [initialLocation.lat, initialLocation.lng] : defaultCenter, 
        13
      );

      // Add OpenStreetMap tiles (free alternative to Overture direct access which is data-only)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add click handler
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng);
        await reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;

      // Add initial marker if exists
      if (initialLocation) {
        updateMarker(initialLocation.lat, initialLocation.lng);
      } else {
        // Initial marker at center
        updateMarker(defaultCenter[0], defaultCenter[1]);
        reverseGeocode(defaultCenter[0], defaultCenter[1]); // Ensure we have initial address
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current || !window.L) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = window.L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current);
      
      markerRef.current.on('dragend', async (event: any) => {
        const marker = event.target;
        const position = marker.getLatLng();
        await reverseGeocode(position.lat, position.lng);
      });
    }

    // Pan to marker
    mapInstanceRef.current.panTo([lat, lng]);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      
      const addr = data.display_name;
      setAddress(addr);
      
      onLocationSelect({
        lat,
        lng,
        address: addr
      });
    } catch (error) {
      console.error('Error fetching address:', error);
      onLocationSelect({ lat, lng });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200 shadow-inner group">
        <div ref={mapContainerRef} className="w-full h-full z-0" style={{ zIndex: 0 }} />
        
        {/* Search overlay placeholder could go here */}
        
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold rounded-full shadow-sm z-[400]">
           Mapa Interactivo
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-3">
        <div className={`p-2 rounded-full ${loading ? 'bg-gray-200 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
          <Icons.Location className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Ubicación Seleccionada</p>
          <p className="text-sm font-medium text-gray-900 break-words">
            {loading ? 'Obteniendo dirección...' : (address || 'Haz clic en el mapa para seleccionar')}
          </p>
          {initialLocation && (
             <p className="text-[10px] text-gray-400 font-mono mt-1">
               {initialLocation.lat.toFixed(6)}, {initialLocation.lng.toFixed(6)}
             </p>
          )}
        </div>
      </div>
    </div>
  );
};
