import React from 'react';
import { Icons } from '../Icons';

interface SearchBarProps {
  filters: { location: string; name: string; maxPrice: string };
  setFilters: React.Dispatch<React.SetStateAction<{ location: string; name: string; maxPrice: string }>>;
}

export const SearchBar: React.FC<SearchBarProps> = ({ filters, setFilters }) => {
  return (
    <div className="bg-white rounded-3xl md:rounded-full shadow-2xl shadow-black/5 border border-gray-200 flex flex-col md:flex-row md:items-center max-w-3xl mx-auto md:divide-x divide-gray-100">
      
      {/* Location */}
      <div className="flex-1 px-6 py-3 hover:bg-gray-50 rounded-t-3xl md:rounded-l-full cursor-text transition-colors relative group border-b md:border-b-0 border-gray-100">
        <label className="block text-[10px] font-bold text-gray-800 tracking-wider mb-0.5 uppercase">Ubicación</label>
        <input 
          type="text" 
          placeholder="¿Dónde quieres vivir?"
          className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 font-medium truncate"
          value={filters.location}
          onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
        />
      </div>

      {/* Name/Title */}
      <div className="flex-1 px-6 py-3 hover:bg-gray-50 cursor-text transition-colors border-b md:border-b-0 border-gray-100">
        <label className="block text-[10px] font-bold text-gray-800 tracking-wider mb-0.5 uppercase">Propiedad</label>
        <input 
          type="text" 
          placeholder="Apartamento, Villa..."
          className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 font-medium truncate"
          value={filters.name}
          onChange={(e) => setFilters(prev => ({...prev, name: e.target.value}))}
        />
      </div>

      {/* Price */}
      <div className="flex-1 px-6 py-3 hover:bg-gray-50 cursor-text transition-colors rounded-b-3xl md:rounded-r-full">
        <label className="block text-[10px] font-bold text-gray-800 tracking-wider mb-0.5 uppercase">Presupuesto</label>
        <input 
          type="number" 
          placeholder="Precio máximo (FCA)"
          className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 font-medium truncate"
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
        />
      </div>
      
      {/* Search Button */}
      <div className="p-2">
          <button className="w-full md:w-auto bg-black hover:bg-gray-800 text-white md:rounded-full rounded-2xl p-3 shadow-lg shadow-black/20 transition-all active:scale-95 flex items-center justify-center gap-2 aspect-square">
             <Icons.Search className="w-5 h-5" />
             <span className="md:hidden font-bold text-sm">Buscar</span>
          </button>
      </div>

    </div>
  );
};

