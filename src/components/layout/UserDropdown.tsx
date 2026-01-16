import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { Icons } from '../Icons';
import { useNavigate } from 'react-router-dom';

interface UserDropdownProps {
  currentUser: User;
  onLogout: () => void;
  onProfileClick: () => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  currentUser,
  onLogout,
  onProfileClick,
  onNotificationsClick,
  onSettingsClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    ...(currentUser.role === 'admin' ? [{
      label: 'Panel Admin',
      icon: <Icons.Admin className="w-4 h-4" />,
      onClick: () => { navigate('/admin'); setIsOpen(false); },
      highlight: true
    }] : []),
    { 
      label: 'Mi Perfil', 
      icon: <Icons.User className="w-4 h-4" />, 
      onClick: () => { onProfileClick(); setIsOpen(false); } 
    },
    { 
      label: 'Notificaciones', 
      icon: <Icons.Bell className="w-4 h-4" />, 
      onClick: () => { onNotificationsClick?.(); setIsOpen(false); } 
    },
    { 
      label: 'Configuración', 
      icon: <Icons.Settings className="w-4 h-4" />, 
      onClick: () => { onSettingsClick?.(); setIsOpen(false); } 
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1 pr-3 border border-gray-200 rounded-full hover:shadow-md transition-all duration-200 bg-white shadow-sm"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand/10 text-brand">
              <Icons.User className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-bold text-gray-800 truncate max-w-[100px]">{currentUser.name}</span>
          <span className={`text-[10px] uppercase tracking-tighter ${currentUser.role === 'admin' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
            {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'owner' ? 'Propietario' : 'Cliente'}
          </span>
        </div>
        <Icons.ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in origin-top-right">
          <div className="px-4 py-3 border-b border-gray-50 mb-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Conectado como</p>
            <p className="text-sm font-bold text-gray-800 truncate">{currentUser.email}</p>
          </div>

          <div className="space-y-0.5 px-2">
            {menuItems.map((item: any, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors font-medium ${
                  item.highlight 
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <span className={item.highlight ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-50 px-2">
            <button
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold"
            >
              <Icons.Logout className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

