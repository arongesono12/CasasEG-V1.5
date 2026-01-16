import { useState, useMemo } from 'react';
import { Property, User } from '../types';

interface Filters {
  location: string;
  name: string;
  maxPrice: string;
  category: string;
}

export const usePropertyFilters = (properties: Property[] = [], currentUser: User | null) => {
  const [filters, setFilters] = useState<Filters>({
    location: '',
    name: '',
    maxPrice: '',
    category: 'Todas'
  });

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // 1. Text Search (Name & Location)
      const nameMatch = filters.name === '' || p.title.toLowerCase().includes(filters.name.toLowerCase());
      const locMatch = filters.location === '' || p.location.toLowerCase().includes(filters.location.toLowerCase());
      
      // 2. Price Filter
      const priceMatch = filters.maxPrice === '' || p.price <= Number(filters.maxPrice);

      // 3. Category Filter
      // Note: This assumes properties have a 'type' or 'category' field. 
      // If not, we might need to add it to the type definition.
      const categoryMatch = filters.category === 'Todas' || (p as any).category === filters.category;

      // 4. Role based visibility
      let roleMatch = true;
      if (currentUser?.role === 'owner') {
        roleMatch = p.ownerId === currentUser.id;
      } else if (!currentUser || currentUser.role === 'client') {
        // Public/Client only sees active properties
        roleMatch = p.status === 'active';
      }
      // Admin sees all

      return nameMatch && locMatch && priceMatch && categoryMatch && roleMatch;
    });
  }, [properties, filters, currentUser]);


  return {
    filters,
    setFilters,
    filteredProperties
  };
};

