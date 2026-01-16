import React from 'react';
import { Icons } from '../Icons';

interface SearchBarProps {
  filters: { location: string; name: string; maxPrice: string; category: string };
  setFilters: React.Dispatch<React.SetStateAction<{ location: string; name: string; maxPrice: string; category: string }>>;
}

export const SearchBar: React.FC<SearchBarProps> = ({ filters, setFilters }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className={`mx-auto transition-all duration-300 ${isExpanded ? 'max-w-3xl' : 'max-w-md md:max-w-3xl'}`}>
      <div className={`bg-white shadow-2xl shadow-black/5 border border-gray-200 transition-all duration-300 ${
        isExpanded 
          ? 'rounded-3xl md:rounded-full flex flex-col md:flex-row md:items-center md:divide-x divide-gray-100' 
          : 'rounded-full flex items-center justify-between p-1.5 md:p-0 md:flex-row md:divide-x divide-gray-100'
      }`}>
        
        {/* Mobile Initial State / Desktop Always Visible */}
        {!isExpanded && (
          <div className="md:hidden flex-1 px-4 py-1 flex items-center gap-2 cursor-pointer" onClick={() => setIsExpanded(true)}>
            <Icons.Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">¿A dónde quieres ir?</span>
          </div>
        )}

        {/* Location */}
        <div className={`${!isExpanded ? 'hidden md:block' : 'block'} flex-1 px-6 py-3 hover:bg-gray-50 rounded-t-3xl md:rounded-l-full cursor-text transition-colors relative group border-b md:border-b-0 border-gray-100`}>
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
        <div className={`${!isExpanded ? 'hidden md:block' : 'block'} flex-1 px-6 py-3 hover:bg-gray-50 cursor-text transition-colors border-b md:border-b-0 border-gray-100`}>
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
        <div className={`${!isExpanded ? 'hidden md:block' : 'block'} flex-1 px-6 py-3 hover:bg-gray-50 cursor-text transition-colors rounded-b-3xl md:rounded-r-full`}>
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
        <div className={`${isExpanded ? 'p-2' : 'p-0 md:p-2'}`}>
            <button 
              onClick={() => isExpanded ? setIsExpanded(false) : setIsExpanded(true)}
              className={`${
                isExpanded 
                  ? 'w-full md:w-auto bg-black hover:bg-gray-800 text-white rounded-full p-2 md:p-3 shadow-lg shadow-black/20 transition-all active:scale-95 flex items-center justify-center gap-2 md:aspect-square'
                  : 'bg-black text-white rounded-full p-3 shadow-lg shadow-black/20 transition-all active:scale-95 flex items-center justify-center md:aspect-square'
              }`}
            >
               <Icons.Search className="w-5 h-5" />
               <span className={`${isExpanded ? '' : 'hidden'} md:hidden font-bold text-sm`}>Buscar</span>
            </button>
        </div>

      </div>
      
      {isExpanded && (
        <button 
          onClick={() => setIsExpanded(false)}
          className="md:hidden w-full mt-4 text-gray-500 font-medium text-xs flex items-center justify-center gap-1"
        >
          <Icons.ChevronUp className="w-3 h-3" /> Contraer búsqueda
        </button>
      )}
    </div>
  );
};

