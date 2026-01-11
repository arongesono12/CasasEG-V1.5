import { useState, useMemo } from 'react';
import { Property, User } from '../types';

interface Filters {
  location: string;
  name: string;
  maxPrice: string;
}

export const usePropertyFilters = (properties: Property[], currentUser: User | null) => {
  const [filters, setFilters] = useState<Filters>({
    location: '',
    name: '',
    maxPrice: ''
  });

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
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
  }, [properties, filters, currentUser]);

  return {
    filters,
    setFilters,
    filteredProperties
  };
};

