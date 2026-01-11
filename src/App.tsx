import React, { useState, useEffect } from 'react';
import { TransitionGroup, CSSTransition } from './lib/rtg-shim';
import { Property, ConversationKey } from './types';
import { useAuth } from './contexts/AuthContext';
import { useProperties } from './contexts/PropertyContext';
import { useMessaging } from './contexts/MessagingContext';
import { useToast, usePagination, usePropertyFilters } from './hooks';
import { APP_CONFIG } from './constants/config';
import { scrollToTop } from './utils/helpers';

// Components
import { Header, MobileNavigation } from './components/layout';
import { PropertyCard, PropertyDetailsView, CreatePropertyModal, SearchBar } from './components/property';
import { MessagesModal, LoginModal } from './components/messaging';
import { Button, Toast, PropertyCardSkeleton, ImageViewer } from './components/ui';
import { Icons } from './components/Icons';

export default function App() {
  // Context
  const { currentUser, users, login, logout, register } = useAuth();
  const { properties, addProperty, updateProperty, deleteProperty, setProperties } = useProperties();
  const { messages, notifications, sendMessage, addNotification } = useMessaging();
  
  // Custom Hooks
  const { toastMessage, showToast } = useToast();
  const { filters, setFilters, filteredProperties } = usePropertyFilters(properties, currentUser);
  const { currentPage, totalPages, paginatedProperties, handlePageChange } = usePagination({ 
    items: filteredProperties,
    dependencies: [filters]
  });


  // Local State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewingImageState, setViewingImageState] = useState<{ images: string[], index: number } | null>(null);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<ConversationKey | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll to compact search bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // NOTE: list animations handled by react-transition-group

  // Handlers
  const handleLogin = (user: typeof currentUser) => {
    if (user) {
      login(user);
      setIsLoginOpen(false);
      showToast(`Bienvenido, ${user.name}`);
    }
  };

  const handleRegister = (newUser: typeof currentUser) => {
    if (newUser) {
      register(newUser);
      showToast('¡Cuenta creada con éxito!');
    }
  };

  const handleLogout = () => {
    logout();
    setIsMessagesOpen(false);
  };

  const handleSendMessage = (propertyId: string, toId: string, content: string) => {
    if (!currentUser) return;
    
    const newMessage = {
      id: Date.now().toString(),
      fromId: currentUser.id,
      toId,
      propertyId,
      content,
      timestamp: Date.now()
    };
    
    sendMessage(newMessage);
  };

  const handlePropertyAction = (action: string, property: Property, payload?: any) => {
    if (action === 'viewImage') {
      setViewingImageState({ images: property.imageUrls, index: payload });
      return;
    }

    if (action === 'viewDetails') {
      setSelectedProperty(property);
      scrollToTop();
      return;
    }

    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    switch (action) {
      case 'notify':
        showToast(`Te avisaremos cuando "${property.title}" esté libre.`);
        addNotification({
          id: Date.now().toString(),
          userId: currentUser.id,
          message: `Estás siguiendo: ${property.title}`,
          read: false,
          timestamp: Date.now()
        });
        break;
      
      case 'contact':
        if (property.ownerId === currentUser.id) {
          showToast('No puedes enviarte mensajes a ti mismo.');
          return;
        }
        setActiveConversation({ propertyId: property.id, partnerId: property.ownerId });
        setIsMessagesOpen(true);
        break;
      
      case 'delete':
        deleteProperty(property.id);
        showToast('Propiedad eliminada.');
        break;
      
      case 'suspend':
        updateProperty(property.id, { status: 'suspended' });
        showToast('Propiedad suspendida.');
        break;
      
      case 'activate':
        updateProperty(property.id, { status: 'active' });
        showToast('Propiedad activada.');
        break;
      
      case 'edit':
        setEditingProperty(property);
        setShowCreateModal(true);
        break;
      
      case 'rate':
        const newRatingValue = payload;
        const totalScore = property.rating * property.reviewCount;
        const newCount = property.reviewCount + 1;
        const newAverage = (totalScore + newRatingValue) / newCount;
        
        updateProperty(property.id, {
          rating: parseFloat(newAverage.toFixed(2)),
          reviewCount: newCount
        });
        showToast(`¡Gracias por tu valoración de ${newRatingValue} estrellas!`);
        break;
    }
  };

  const handleSaveProperty = (data: Partial<Property>) => {
    if (editingProperty) {
      updateProperty(editingProperty.id, data);
      showToast('Propiedad actualizada con éxito.');
    } else {
      const newProperty: Property = {
        id: Date.now().toString(),
        ownerId: currentUser!.id,
        waitingList: [],
        rating: 5,
        reviewCount: 0,
        ...data as any
      };
      addProperty(newProperty);
      showToast('Propiedad publicada con éxito.');
    }
    setShowCreateModal(false);
    setEditingProperty(null);
  };

  const handleLogoClick = () => {
    setFilters({ location: '', name: '', maxPrice: '' });
    scrollToTop();
  };

  // RENDER: Property Details View
  if (selectedProperty) {
    return (
      <>
        <PropertyDetailsView 
          property={selectedProperty} 
          onBack={() => setSelectedProperty(null)}
          currentUser={currentUser}
          onAction={handlePropertyAction}
        />
        {currentUser && (
          <MessagesModal 
            isOpen={isMessagesOpen}
            onClose={() => setIsMessagesOpen(false)}
            currentUser={currentUser}
            messages={messages}
            properties={properties}
            onSendMessage={handleSendMessage}
            initialContext={activeConversation}
          />
        )}
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          onLogin={handleLogin}
          users={users}
          onRegister={handleRegister}
        />
        {toastMessage && <Toast message={toastMessage} />}
      </>
    );
  }

  // RENDER: Main Grid View
  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-white">
      <Header 
        currentUser={currentUser}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onMessagesClick={() => {
          setActiveConversation(null);
          setIsMessagesOpen(true);
        }}
        onCreatePropertyClick={() => setShowCreateModal(true)}
        onLogoClick={handleLogoClick}
        messageCount={messages.length}
      />

      {/* Hero Section with Search Bar */}
      <div className={`sticky top-20 z-30 bg-white border-b border-gray-100 shadow-sm transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-0 pointer-events-none h-0' : 'opacity-100'}`}>
        <div className="relative h-[400px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-cover bg-center hero-bg">
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
            {/* Hero Text */}
            <div className="text-center mb-8 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
                Encuentra tu Hogar Ideal
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-light drop-shadow-md">
                Descubre las mejores propiedades en alquiler en tu zona preferida
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-7xl mx-auto">
              <SearchBar filters={filters} setFilters={setFilters} />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Search Bar (appears on scroll) */}
      <div className={`sticky top-20 z-30 bg-white border-b border-gray-100 shadow-md transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none h-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <SearchBar filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Specific Header */}
        {currentUser && currentUser.role !== 'client' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {currentUser.role === 'owner' ? 'Mis Propiedades' : 'Panel de Administración'}
            </h1>
            <p className="text-gray-500 mt-1">
              {currentUser.role === 'owner' ? 'Gestiona tus alquileres.' : 'Supervisión global.'}
            </p>
          </div>
        )}

        {/* Property Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(APP_CONFIG.ITEMS_PER_PAGE)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <>
            <div className="grid property-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              <TransitionGroup component={null}>
                {paginatedProperties.map((property) => (
                  <CSSTransition key={property.id} timeout={300} classNames="rtg-item">
                    <div>
                      <PropertyCard 
                        property={property} 
                        userRole={currentUser?.role || 'guest'}
                        onAction={handlePropertyAction}
                      />
                    </div>
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-16 pb-8">
                <Button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  variant="secondary"
                  className="w-12 h-12 !rounded-full !p-0 flex items-center justify-center"
                >
                  <Icons.ChevronLeft className="w-5 h-5" />
                </Button>
                
                <span className="text-sm font-medium text-gray-500">
                  Página <span className="text-black font-bold">{currentPage}</span> de {totalPages}
                </span>

                <Button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  variant="secondary"
                  className="w-12 h-12 !rounded-full !p-0 flex items-center justify-center"
                >
                  <Icons.ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Icons.Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No hay resultados</h3>
            <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda.</p>
            <button 
              onClick={() => setFilters({ location: '', name: '', maxPrice: '' })}
              className="mt-4 text-black font-medium hover:underline"
            >
              Borrar filtros
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLogin}
        users={users}
        onRegister={handleRegister}
      />
      
      <CSSTransition in={showCreateModal} timeout={300} classNames="modal" unmountOnExit mountOnEnter>
        <CreatePropertyModal 
          isOpen={showCreateModal} 
          onClose={() => {
            setShowCreateModal(false);
            setEditingProperty(null);
          }}
          onSubmit={handleSaveProperty}
          initialData={editingProperty}
        />
      </CSSTransition>
      
      {currentUser && (
        <MessagesModal 
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          currentUser={currentUser}
          messages={messages}
          properties={properties}
          onSendMessage={handleSendMessage}
          initialContext={activeConversation}
        />
      )}

      {viewingImageState && (
        <ImageViewer 
          images={viewingImageState.images} 
          initialIndex={viewingImageState.index} 
          onClose={() => setViewingImageState(null)} 
        />
      )}

      {toastMessage && <Toast message={toastMessage} />}

      {/* Mobile Navigation */}
      <MobileNavigation 
        currentUser={currentUser}
        onHomeClick={() => scrollToTop()}
        onMessagesClick={() => {
          if (!currentUser) setIsLoginOpen(true);
          else {
            setActiveConversation(null);
            setIsMessagesOpen(true);
          }
        }}
        onProfileClick={() => !currentUser && setIsLoginOpen(true)}
        messageCount={messages.length}
      />
    </div>
  );
}

