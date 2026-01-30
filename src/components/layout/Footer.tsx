import React, { useEffect, useState } from 'react';
import { Icons } from '../Icons';
import { Link } from 'react-router-dom';
import { getVisitorCount } from '../../services/visitService';
import logo from '../../assets/logo/logo.png';

export const Footer: React.FC = () => {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getVisitorCount();
      setVisitorCount(count);
    };
    fetchCount();
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Brand Section */}
        <div className="flex flex-col gap-4 max-w-xs">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logo} alt="CasasEG" className="h-8 w-auto object-contain" />
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            La plataforma líder en alquiler de viviendas. Encuentra tu hogar ideal con nosotros, de forma segura y rápida.
          </p>
          {/* Social Media Icons */}
          <div className="flex gap-3 mt-2">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
              aria-label="Instagram"
            >
              <Icons.Instagram className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              aria-label="X (Twitter)"
            >
              <Icons.X className="w-5 h-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="LinkedIn"
            >
              <Icons.LinkedIn className="w-5 h-5" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="YouTube"
            >
              <Icons.Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 w-full md:w-auto">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-gray-900">Plataforma</h4>
            <ul className="flex flex-col gap-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-indigo-600">Inicio</Link></li>
              <li><Link to="/properties" className="hover:text-indigo-600">Propiedades</Link></li>
              <li><Link to="/map" className="hover:text-indigo-600">Explorar Mapa</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-gray-900">Soporte</h4>
            <ul className="flex flex-col gap-2 text-sm text-gray-500">
              <li><Link to="/help" className="hover:text-indigo-600">Centro de Ayuda</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-600">Contacto</Link></li>
              <li><Link to="/faq" className="hover:text-indigo-600">Preguntas Frecuentes</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-gray-900">Legal</h4>
            <ul className="flex flex-col gap-2 text-sm text-gray-500">
              <li><Link to="/terms" className="hover:text-indigo-600 font-medium text-indigo-600">Términos y Condiciones</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-600">Privacidad</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-center text-gray-400">
          © {new Date().getFullYear()} CasasEG. Todos los derechos reservados.
        </p>
        
        {/* Visitor Counter Section */}
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">En Vivo</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Icons.Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-900">
              {visitorCount !== null ? visitorCount.toLocaleString() : '...'}
            </span>
            <span className="text-xs text-gray-500 font-medium">visitas totales</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
