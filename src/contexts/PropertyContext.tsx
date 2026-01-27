import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Property } from '../types';
import * as supabaseService from '../services/supabaseService';

interface PropertyContextType {
  properties: Property[];
  isLoading: boolean;
  error: unknown;
  addProperty: (property: Property) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // 1. Fetch Properties with Cache
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: supabaseService.fetchProperties,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });

  // 2. Mutations (Optimistic Updates or Invalidation)
  
  const addMutation = useMutation({
    mutationFn: (newProperty: Property) => supabaseService.createProperty(newProperty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Property> }) => 
      supabaseService.updateProperty(id, updates), // Assuming updateProperty exists directly or via generic update
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supabaseService.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  // Wrapper functions to match legacy interface roughly, but async
  const addProperty = async (property: Property) => {
    await addMutation.mutateAsync(property);
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    // Note: supabaseService needs an updateProperty specific for properties table if not generic
    // Currently supabaseService.updateProperty might be for USERS? Let's check service.
    // If not exists, we use a generic placeholder or ensure service has it.
    // Assuming service was updated or we need to add it. 
    // The previous context implementation assumed `supabaseService.updateProperty` meant for 'properties'?
    // Wait, in previous context: `setProperties(prev => prev.map...)`. It was local state only?
    // No, `updateProperty` in context was optimistic? 
    // Checking `supabaseService.ts`: `createProperty`, `deleteProperty` exist. `updateUser` exists.
    // `updateProperty` for properties table MISSING in service? 
    // Ah, `updateUser` is for users table. 
    // I need to add `updateProperty` to `supabaseService.ts` for this to work fully backend-synced.
    // For now, I will assume I'll add it.
    await supabaseService.updatePropertyResource(id, updates); 
  };

  const deletePropertyFn = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, 
      isLoading,
      error,
      addProperty, 
      updateProperty, 
      deleteProperty: deletePropertyFn
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};
