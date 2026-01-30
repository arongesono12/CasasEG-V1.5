import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertyContext';
import { Property } from '../types';
import { Icons } from '../components/Icons';
import { Button } from '../components/ui';
import { PropertyUploadModal } from '../components/property/PropertyUploadModal';
import { PropertyCard } from '../components/property/PropertyCard';
import * as supabaseService from '../services/supabaseService';

interface OwnerDashboardProps {
  onBack: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { properties, updateProperty, deleteProperty, refreshProperties } = useProperties();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  // Filter properties to show only owner's properties
  const ownerProperties = useMemo(() => {
    if (!currentUser) return [];
    return properties.filter(p => p.ownerId === currentUser.id);
  }, [properties, currentUser]);

  // Filter by status
  const filteredProperties = useMemo(() => {
    if (filterStatus === 'all') return ownerProperties;
    return ownerProperties.filter(p => p.status === filterStatus);
  }, [ownerProperties, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: ownerProperties.length,
      active: ownerProperties.filter(p => p.status === 'active').length,
      suspended: ownerProperties.filter(p => p.status === 'suspended').length,
    };
  }, [ownerProperties]);

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsUploadModalOpen(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await deleteProperty(propertyId);
      await refreshProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error al eliminar la propiedad');
    }
  };

  const handleToggleStatus = async (property: Property) => {
    try {
      const newStatus = property.status === 'active' ? 'suspended' : 'active';
      await updateProperty(property.id, { status: newStatus });
      await refreshProperties();
    } catch (error) {
      console.error('Error updating property status:', error);
      alert('Error al actualizar el estado de la propiedad');
    }
  };

  const handlePropertyAction = (action: string, property: Property, payload?: any) => {
    if (action === 'edit') {
      handleEditProperty(property);
    } else if (action === 'delete') {
      handleDeleteProperty(property.id);
    } else if (action === 'toggle-status') {
      handleToggleStatus(property);
    } else if (action === 'viewDetails') {
      navigate(`/property/${property.id}`);
    } else if (action === 'view') {
      navigate(`/property/${property.id}`);
    }
  };

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No tienes permisos para acceder a esta página.</p>
          <Button onClick={onBack} variant="brand">Volver</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onBack}
              className="flex items-center text-gray-500 hover:text-black transition-colors"
            >
              <Icons.ChevronLeft className="w-5 h-5 mr-1" />
              <span className="font-medium">Volver</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Panel de Propietario</h1>
            <Button 
              variant="brand" 
              onClick={() => {
                setEditingProperty(null);
                setIsUploadModalOpen(true);
              }}
              className="text-sm"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Nueva Propiedad
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Icons.Building className="w-6 h-6 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 bg-blue-200 px-2 py-1 rounded-full">Total</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-xs text-gray-600">Propiedades</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <Icons.Check className="w-6 h-6 text-green-600" />
                <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded-full">Activas</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.active}</h3>
              <p className="text-xs text-gray-600">Publicadas</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <Icons.Alert className="w-6 h-6 text-orange-600" />
                <span className="text-xs font-bold text-orange-700 bg-orange-200 px-2 py-1 rounded-full">Suspendidas</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.suspended}</h3>
              <p className="text-xs text-gray-600">Ocultas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-black text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Todas ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterStatus === 'active'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Activas ({stats.active})
          </button>
          <button
            onClick={() => setFilterStatus('suspended')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterStatus === 'suspended'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Suspendidas ({stats.suspended})
          </button>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <div key={property.id} className="relative group">
                <PropertyCard 
                  property={property}
                  userRole="owner"
                  onAction={handlePropertyAction}
                />
                {/* Owner Actions Overlay */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditProperty(property)}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    title="Editar"
                  >
                    <Icons.Settings className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(property)}
                    className={`p-2 rounded-full shadow-lg transition-colors ${
                      property.status === 'active'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                    title={property.status === 'active' ? 'Suspender' : 'Activar'}
                  >
                    {property.status === 'active' ? (
                      <Icons.Alert className="w-4 h-4" />
                    ) : (
                      <Icons.Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(property.id)}
                    className="p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors text-white"
                    title="Eliminar"
                  >
                    <Icons.Delete className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Icons.Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {filterStatus === 'all' ? 'No tienes propiedades aún' : `No hay propiedades ${filterStatus === 'active' ? 'activas' : 'suspendidas'}`}
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              {filterStatus === 'all' 
                ? 'Comienza a publicar propiedades para que los clientes las encuentren.'
                : 'No hay propiedades con este estado en tu cuenta.'}
            </p>
            {filterStatus === 'all' && (
              <Button 
                variant="brand" 
                onClick={() => {
                  setEditingProperty(null);
                  setIsUploadModalOpen(true);
                }}
              >
                <Icons.Plus className="w-4 h-4 mr-2" />
                Crear Primera Propiedad
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      {isUploadModalOpen && (
        <PropertyUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setEditingProperty(null);
          }}
          onSuccess={async () => {
            await refreshProperties();
            setIsUploadModalOpen(false);
            setEditingProperty(null);
          }}
          initialData={editingProperty}
        />
      )}
    </div>
  );
};

