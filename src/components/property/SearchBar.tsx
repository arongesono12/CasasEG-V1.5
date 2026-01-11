import React from 'react';
import { Icons } from '../Icons';

interface SearchBarProps {
  filters: { location: string; name: string; maxPrice: string };
  setFilters: React.Dispatch<React.SetStateAction<{ location: string; name: string; maxPrice: string }>>;
}

export const SearchBar: React.FC<SearchBarProps> = ({ filters, setFilters }) => {
  return (
    <div className="bg-white rounded-3xl md:rounded-full shadow-xl border border-gray-200 flex flex-col md:flex-row md:items-center max-w-4xl mx-auto md:divide-x divide-gray-200">
      
      {/* Location */}
      <div className="flex-1 p-4 md:px-8 md:py-3 hover:bg-gray-50 rounded-t-3xl md:rounded-l-full cursor-text transition-colors relative group border-b md:border-b-0 border-gray-100">
        <label className="block text-xs font-bold text-gray-800 tracking-wider mb-0.5">UBICACIÓN</label>
        <input 
          type="text" 
          placeholder="¿A dónde vas?"
          className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400"
          value={filters.location}
          onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
        />
      </div>

      {/* Name/Title */}
      <div className="flex-1 p-4 md:px-8 md:py-3 hover:bg-gray-50 cursor-text transition-colors border-b md:border-b-0 border-gray-100">
        <label className="block text-xs font-bold text-gray-800 tracking-wider mb-0.5">VIVIENDA</label>
        <input 
          type="text" 
          placeholder="Nombre o tipo..."
          className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400"
          value={filters.name}
          onChange={(e) => setFilters(prev => ({...prev, name: e.target.value}))}
        />
      </div>

      {/* Price */}
      <div className="flex-1 p-4 md:px-8 md:py-3 hover:bg-gray-50 cursor-text transition-colors rounded-b-3xl md:rounded-r-full">
        <label className="block text-xs font-bold text-gray-800 tracking-wider mb-0.5">PRECIO (FCA)</label>
        <input 
          type="number" 
          placeholder="Max. precio"
          className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400"
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
        />
      </div>
      
      {/* Search Button */}
      <div className="p-4 md:p-2 md:pl-0">
          <button className="w-full md:w-auto bg-black hover:bg-gray-800 text-white md:rounded-full rounded-2xl p-3 md:px-4 md:py-3 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
             <Icons.Search className="w-5 h-5 font-bold" />
             <span className="md:hidden font-bold">Buscar</span>
          </button>
      </div>

    </div>
  );
};

