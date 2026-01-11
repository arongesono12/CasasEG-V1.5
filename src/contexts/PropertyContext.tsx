import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Property } from '../types';
import { INITIAL_PROPERTIES } from '../constants/mockData';
import * as supabaseService from '../services/supabaseService';

interface PropertyContextType {
  properties: Property[];
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);

  useEffect(() => {
    const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
    if (!useSupabase) return;

    (async () => {
      try {
        const remote = await supabaseService.fetchProperties();
        if (Array.isArray(remote) && remote.length) setProperties(remote as Property[]);
      } catch (e) {
        console.warn('Supabase properties fetch failed', e);
      }
    })();
  }, []);

  const addProperty = (property: Property) => {
    setProperties(prev => [property, ...prev]);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, 
      addProperty, 
      updateProperty, 
      deleteProperty,
      setProperties
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties debe ser usado dentro de un PropertyProvider');
  }
  return context;
};

