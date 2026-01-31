import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header, MobileNavigation } from '../components/layout'; // We might need a simpler header or re-use existing
import { SearchBar, PropertyCard } from '../components/property';
import { Icons } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertyContext';
import { usePropertyFilters } from '../hooks';
import { useToast } from '../hooks';
import { Property, ConversationKey } from '../types';
import { MessagesModal, LoginModal } from '../components/messaging';
import { useMessaging } from '../contexts/MessagingContext';

export function PropertiesPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { properties, deleteProperty, updateProperty } = useProperties();
  const { messages, sendMessage, addNotification } = useMessaging();
  
  // Filtrar propiedades: solo mostrar a clientes y usuarios no autenticados
  const propertiesForClients = React.useMemo(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin' || currentUser.role === 'owner')) {
      return [];
    }
    return properties.filter(p => p.status === 'active');
  }, [properties, currentUser]);
  
  const { filters, setFilters, filteredProperties } = usePropertyFilters(propertiesForClients, currentUser);
  const { showToast, toastMessage } = useToast();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<ConversationKey | null>(null);

  // Redirigir admins y propietarios a sus dashboards
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
        navigate('/admin');
        return;
      }
      if (currentUser.role === 'owner') {
        navigate('/owner');
        return;
      }
    }
  }, [currentUser, navigate]);

  const categories = [
    { name: 'Todas', icon: Icons.Grid },
    { name: 'Apartamentos', icon: Icons.Home },
    { name: 'Villas', icon: Icons.Building },
    { name: 'Habitaciones', icon: Icons.BedHeart },
    { name: 'Lujo', icon: Icons.Sparkles },
    { name: 'Cerca del Mar', icon: Icons.Location },
  ];

  const handlePropertyAction = (action: string, property: Property, payload?: any) => {
    if (action === 'viewDetails') {
      navigate(`/property/${property.id}`);
      return;
    }
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    
    // Solo clientes pueden realizar acciones en la pantalla principal
    const userRole = currentUser?.role || 'guest';
    if (userRole === 'admin' || userRole === 'superadmin' || userRole === 'owner') {
      return; // No permitir acciones a admins/propietarios
    }
    
    switch (action) {
      case "contact":
        if (property.ownerId === currentUser.id) {
          showToast("No puedes enviarte mensajes a ti mismo.");
          return;
        }
        setActiveConversation({ propertyId: property.id, partnerId: property.ownerId });
        setIsMessagesOpen(true);
        break;
      case "delete":
        // Los clientes no pueden eliminar propiedades
        showToast("No tienes permisos para eliminar propiedades.");
        break;
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      
      {/* Mobile-centric Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4">
           <h1 className="text-xl font-bold mb-4">Explorar Propiedades</h1>
           <SearchBar filters={filters} setFilters={setFilters} />
           
           {/* Categories */}
           <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2 pt-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = filters.category === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat.name }))}
                  className={`flex flex-col items-center gap-2 min-w-fit transition-all duration-300 group ${isActive ? 'text-black opacity-100' : 'text-gray-500 opacity-60 hover:opacity-100'}`}
                >
                  <Icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'border-b-2 border-black pb-1' : 'border-b-2 border-transparent pb-1'}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                userRole={currentUser?.role || 'guest'}
                onAction={handlePropertyAction}
              />
            ))
          ) : (
            <div className="text-center py-20 col-span-full">
               <Icons.Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
               <p className="text-gray-500">No se encontraron propiedades.</p>
            </div>
          )}
        </div>
      </main>

      {/* Re-use Login/Messages modals if needed */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {currentUser && (
        <MessagesModal 
          isOpen={isMessagesOpen} 
          onClose={() => setIsMessagesOpen(false)}
          currentUser={currentUser}
          messages={messages}
          properties={properties}
          users={[]} // pass empty if not strictly needed or fetch from context if updated
          onSendMessage={(pid, tid, content) => {
             sendMessage({
              id: Date.now().toString(),
              fromId: currentUser.id,
              toId: tid,
              propertyId: pid,
              content,
              timestamp: Date.now(),
            });
          }}
          initialContext={activeConversation}
        />
      )}

      {/* Navigation */}
      <MobileNavigation 
        currentUser={currentUser}
        onHomeClick={() => navigate('/')}
        onPropertiesClick={() => {
            // Already here, maybe scroll top?
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        onMessagesClick={() => {
            if (!currentUser) setIsLoginOpen(true);
            else setIsMessagesOpen(true);
        }}
        onProfileClick={() => navigate('/profile')}
        messageCount={messages.length}
      />
    </div>
  );
}
