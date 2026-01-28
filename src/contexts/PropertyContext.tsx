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
  refreshProperties: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // 1. Fetch Properties with Cache
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: supabaseService.fetchProperties,
    staleTime: 1000 * 30, // 30 seconds fresh
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
    await updateMutation.mutateAsync({ id, updates }); 
  };

  const deletePropertyFn = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const refreshProperties = async () => {
    await queryClient.invalidateQueries({ queryKey: ['properties'] });
  };

  return (
    <PropertyContext.Provider value={{ 
      properties, 
      isLoading,
      error,
      addProperty, 
      updateProperty, 
      deleteProperty: deletePropertyFn,
      refreshProperties
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
