import React, { useState, useRef } from 'react';
import { User, Property } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useProperties } from '../../contexts/PropertyContext';
import { Button } from '../ui';
import { Icons } from '../Icons';
import { optimizeImage, isValidImageFile } from '../../utils/imageOptimizer';

interface ProfileViewProps {
  onBack: () => void;
  onAdminClick?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onAdminClick }) => {
  const { currentUser, updateProfile, logout, users } = useAuth();
  const { properties } = useProperties();
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImageFile(file)) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, WebP, GIF)');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const optimizedImage = await optimizeImage(file, {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.85,
        format: 'jpeg'
      });
      
      setFormData(prev => ({ ...prev, avatar: optimizedImage }));
    } catch (error) {
      console.error('Error optimizing image:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar la imagen');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Get user-specific data
  const userProperties = properties.filter(p => p.ownerId === currentUser.id);
  const activeProperties = userProperties.filter(p => p.status === 'active');

  const TabButton = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
        activeTab === id 
          ? 'bg-black text-white shadow-md' 
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-black transition-colors"
          >
            <Icons.ChevronLeft className="w-5 h-5 mr-1" />
            <span className="font-medium">Volver</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Mi Perfil</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-gray-900 to-gray-700 relative">
            <div className="absolute -bottom-10 left-6">
              <div 
                className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer group relative"
                onClick={handleAvatarClick}
              >
                <img 
                  src={formData.avatar || 'https://via.placeholder.com/150'} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isUploadingAvatar ? (
                    <div className="animate-spin">
                      <Icons.Settings className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <Icons.Image className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>
          
          <div className="pt-12 px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                    currentUser.role === 'admin' ? 'bg-gray-900 text-white border-gray-900' :
                    currentUser.role === 'owner' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {currentUser.role === 'owner' ? '🏠 Propietario' : currentUser.role === 'admin' ? '⚡ Administrador' : '👤 Cliente'}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {currentUser.role === 'admin' && onAdminClick && (
                  <Button variant="brand" onClick={onAdminClick} className="text-sm">
                    <Icons.Dashboard className="w-4 h-4 mr-2" />
                    Panel Admin
                  </Button>
                )}
                <Button 
                  variant="secondary" 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm"
                >
                  {isEditing ? 'Cancelar' : 'Editar Perfil'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton id="profile" icon={Icons.User} label="Información" />
          <TabButton id="activity" icon={Icons.Activity} label="Actividad" />
          <TabButton id="settings" icon={Icons.Settings} label="Configuración" />
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Editar Información</h3>
                  <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                      <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
                        💡 Haz clic en tu avatar arriba para cambiar tu foto de perfil
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        placeholder="Dejar en blanco para mantener actual"
                      />
                    </div>
                    <div className="pt-2">
                      <Button type="submit" variant="brand" className="w-full">Guardar Cambios</Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icons.User className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">Información Personal</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-medium">Nombre Completo</span>
                        <p className="text-sm text-gray-700 mt-1">{currentUser.name}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-medium">Email</span>
                        <p className="text-sm text-gray-700 mt-1">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icons.Admin className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">Seguridad</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-medium">Contraseña</span>
                        <p className="text-sm text-gray-700 mt-1">••••••••</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-medium">Rol</span>
                        <p className="text-sm text-gray-700 mt-1 capitalize">{currentUser.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Admin Activity */}
              {currentUser.role === 'admin' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icons.Users className="w-8 h-8 text-blue-600" />
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Sistema</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{users.length}</h3>
                    <p className="text-sm text-gray-500">Usuarios Totales</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icons.Building className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{properties.length}</h3>
                    <p className="text-sm text-gray-500">Propiedades Totales</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icons.Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {properties.filter(p => p.status === 'active').length}
                    </h3>
                    <p className="text-sm text-gray-500">Propiedades Activas</p>
                  </div>
                </div>
              )}

              {/* Owner Activity */}
              {currentUser.role === 'owner' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Icons.Building className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">{userProperties.length}</h3>
                      <p className="text-sm text-gray-500">Mis Propiedades</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Icons.Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">{activeProperties.length}</h3>
                      <p className="text-sm text-gray-500">Publicadas</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Icons.TrendingUp className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {userProperties.reduce((sum, p) => sum + (p.rating || 0), 0) / (userProperties.length || 1) || 0}
                      </h3>
                      <p className="text-sm text-gray-500">Rating Promedio</p>
                    </div>
                  </div>

                  {userProperties.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Mis Propiedades</h3>
                      <div className="space-y-3">
                        {userProperties.slice(0, 5).map(property => (
                          <div key={property.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <img src={property.imageUrls[0]} alt="" className="w-16 h-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{property.title}</p>
                              <p className="text-xs text-gray-500">{property.location}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              property.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {property.status === 'active' ? 'Activa' : 'Suspendida'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Client Activity */}
              {currentUser.role === 'client' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Icons.Heart className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Próximamente</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Aquí podrás ver tus propiedades favoritas, historial de búsquedas y recomendaciones personalizadas.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Preferencias</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Notificaciones por Email</p>
                      <p className="text-sm text-gray-500">Recibir actualizaciones importantes</p>
                    </div>
                    <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Modo Oscuro</p>
                      <p className="text-sm text-gray-500">Próximamente disponible</p>
                    </div>
                    <div className="w-12 h-6 bg-gray-200 rounded-full relative opacity-50">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Zona Peligrosa</h3>
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                >
                  <Icons.Logout className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
