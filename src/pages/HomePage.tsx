import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header, MobileNavigation } from "../components/layout";
import {
  SearchBar,
  PropertyCard,
  PropertyUploadModal,
} from "../components/property";
import { PropertiesMap } from "../components/maps";
import { Button, Toast, PropertyCardSkeleton } from "../components/ui";
import { MessagesModal, LoginModal } from "../components/messaging";
import { ImageViewer } from "../components/ui";
import { Icons } from "../components/Icons";
import { TransitionGroup, CSSTransition } from "../lib/rtg-shim";
import { useAuth } from "../contexts/AuthContext";
import { useProperties } from "../contexts/PropertyContext";
import { useMessaging } from "../contexts/MessagingContext";
import { useToast, usePagination, usePropertyFilters } from "../hooks";
import { APP_CONFIG } from "../constants/config";
import { scrollToTop } from "../utils/helpers";
import { Property, ConversationKey } from "../types";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();
  const { currentUser, users, login, register, logout } = useAuth();
  const { properties, deleteProperty, updateProperty, addProperty } =
    useProperties();
  const { messages, sendMessage, addNotification } = useMessaging();
  const { toastMessage, showToast } = useToast();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showPropertyUpload, setShowPropertyUpload] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeConversation, setActiveConversation] =
    useState<ConversationKey | null>(null);
  const [viewingImageState, setViewingImageState] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const { filters, setFilters, filteredProperties } = usePropertyFilters(
    properties,
    currentUser
  );
  const { currentPage, totalPages, paginatedProperties, handlePageChange } =
    usePagination({
      items: filteredProperties,
      dependencies: [filters],
    });

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      navigate('/admin');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);

    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { name: 'Todas', icon: Icons.Grid },
    { name: 'Apartamentos', icon: Icons.Home },
    { name: 'Villas', icon: Icons.Building },
    { name: 'Habitaciones', icon: Icons.Bed },
    { name: 'Lujo', icon: Icons.Sparkles },
    { name: 'Cerca del Mar', icon: Icons.Location },
  ];

  const handlePropertyAction = (
    action: string,
    property: Property,
    payload?: any
  ) => {
    if (action === "viewImage") {
      setViewingImageState({ images: property.imageUrls, index: payload });
      return;
    }

    if (action === "viewDetails") {
      navigate(`/property/${property.id}`);
      return;
    }

    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    switch (action) {
      case "notify":
        showToast(`Te avisaremos cuando "${property.title}" esté libre.`);
        addNotification({
          id: Date.now().toString(),
          userId: currentUser.id,
          message: `Estás siguiendo: ${property.title}`,
          read: false,
          timestamp: Date.now(),
        });
        break;

      case "contact":
        if (property.ownerId === currentUser.id) {
          showToast("No puedes enviarte mensajes a ti mismo.");
          return;
        }
        setActiveConversation({
          propertyId: property.id,
          partnerId: property.ownerId,
        });
        setIsMessagesOpen(true);
        break;

      case "delete":
        deleteProperty(property.id);
        showToast("Propiedad eliminada.");
        break;

      case "rate":
        const newRatingValue = payload;
        const totalScore = property.rating * property.reviewCount;
        const newCount = property.reviewCount + 1;
        const newAverage = (totalScore + newRatingValue) / newCount;

        updateProperty(property.id, {
          rating: parseFloat(newAverage.toFixed(2)),
          reviewCount: newCount,
        });
        showToast(`¡Gracias por tu valoración de ${newRatingValue} estrellas!`);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-20 md:pb-0 bg-white"
    >
      <Header
        currentUser={currentUser}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={logout}
        onMessagesClick={() => {
          setActiveConversation(null);
          setIsMessagesOpen(true);
        }}
        onCreatePropertyClick={() => setShowPropertyUpload(true)}
        onLogoClick={() => {
            setFilters({ location: '', name: '', maxPrice: '', category: 'Todas' });
            scrollToTop();
        }}
        messageCount={messages.length}
        onProfileClick={() => navigate("/profile")}
      />

      {/* Search & Category Bar Section */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <div className="flex-1 w-full">
              <SearchBar filters={filters} setFilters={setFilters} />
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1 shrink-0">
               <button
                 onClick={() => setViewMode('list')}
                 className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <div className="flex items-center gap-2">
                   <Icons.Grid className="w-4 h-4" />
                   <span>Lista</span>
                 </div>
               </button>
               <button
                 onClick={() => setViewMode('map')}
                 className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <div className="flex items-center gap-2">
                   <Icons.Map className="w-4 h-4" />
                   <span>Mapa</span>
                 </div>
               </button>
            </div>
          </div>

          {/* Airbnb style categories */}
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar pb-2 pt-2 border-t border-gray-50">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === "map" ? (
          <div className="h-[calc(100vh-250px)] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            <PropertiesMap
              properties={filteredProperties}
              onPropertySelect={(p) => handlePropertyAction("viewDetails", p)}
              className="w-full h-full"
            />
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
            {[...Array(APP_CONFIG.ITEMS_PER_PAGE)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <>
            <div className="grid property-grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
              <TransitionGroup component={null}>
                {paginatedProperties.map((property) => (
                  <CSSTransition
                    key={property.id}
                    timeout={300}
                    classNames="rtg-item"
                  >
                    <div>
                      <PropertyCard
                        property={property}
                        userRole={currentUser?.role || "guest"}
                        onAction={handlePropertyAction}
                      />
                    </div>
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </div>

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
                  Página{" "}
                  <span className="text-black font-bold">{currentPage}</span> de{" "}
                  {totalPages}
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
            <h3 className="text-lg font-medium text-gray-900">
              No hay resultados
            </h3>
            <p className="text-gray-500">
              Intenta ajustar tus filtros de búsqueda.
            </p>
          </div>
        )}
      </main>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={(u) => {
          login(u);
          setIsLoginOpen(false);
        }}
        users={users}
        onRegister={register}
      />

      {currentUser && (
        <MessagesModal
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          currentUser={currentUser}
          messages={messages}
          properties={properties}
          users={users}
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

      {viewingImageState && (
        <ImageViewer
          images={viewingImageState.images}
          initialIndex={viewingImageState.index}
          onClose={() => setViewingImageState(null)}
        />
      )}

      <PropertyUploadModal
        isOpen={showPropertyUpload}
        onClose={() => setShowPropertyUpload(false)}
        onSuccess={() => {
          showToast("Propiedad publicada exitosamente");
          setShowPropertyUpload(false);
        }}
      />

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
        onProfileClick={() => {
          if (!currentUser) setIsLoginOpen(true);
          else navigate("/profile");
        }}
        onCreatePropertyClick={() => {
          if (!currentUser) setIsLoginOpen(true);
          else if (
            currentUser.role === "owner" ||
            currentUser.role === "admin"
          ) {
            setShowPropertyUpload(true);
          }
        }}
        messageCount={messages.length}
      />

      {toastMessage && <Toast message={toastMessage} />}
    </motion.div>
  );
}
