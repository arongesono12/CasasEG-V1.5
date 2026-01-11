import React, { useState } from 'react';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui';
import { Icons } from '../Icons';

interface ProfileViewProps {
  onBack: () => void;
  onAdminClick?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onAdminClick }) => {
  const { currentUser, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    avatar: currentUser?.avatar || '',
    password: currentUser?.password || ''
  });

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-2xl mx-auto px-4">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <Icons.ChevronLeft className="w-5 h-5 mr-1" />
          Volver
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header / Cover */}
          <div className="h-32 bg-black relative">
            <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full">
               <img 
                 src={formData.avatar || 'https://via.placeholder.com/150'} 
                 alt={currentUser.name} 
                 className="w-24 h-24 rounded-full object-cover bg-gray-200"
               />
            </div>
          </div>

          <div className="pt-16 px-8 pb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
                <p className="text-gray-500">{currentUser.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-full tracking-wider">
                  {currentUser.role === 'owner' ? 'Propietario' : currentUser.role === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                 <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancelar' : 'Editar Perfil'}
                 </Button>
                 {currentUser.role === 'admin' && onAdminClick && (
                    <Button variant="brand" onClick={onAdminClick}>
                       Panel Admin
                    </Button>
                 )}
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-lg animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL del Avatar</label>
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={e => setFormData({...formData, avatar: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>
                <div className="pt-2">
                   <Button type="submit" variant="brand" className="w-full">Guardar Cambios</Button>
                </div>
              </form>
            ) : (
                <div className="border-t border-gray-100 pt-6 mt-6">
                    <h3 className="text-lg font-bold mb-4">Información de la Cuenta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <span className="block text-xs text-gray-400 uppercase">ID de Usuario</span>
                            <span className="font-mono text-sm text-gray-700">{currentUser.id}</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <span className="block text-xs text-gray-400 uppercase">Seguridad</span>
                            <span className="text-sm text-gray-700">Contraseña: ••••••••</span>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button 
                          onClick={logout}
                          className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Icons.Logout className="w-4 h-4" /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
