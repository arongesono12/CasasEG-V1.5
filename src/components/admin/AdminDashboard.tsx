import React, { useState } from 'react';
import { User, Property, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useProperties } from '../../contexts/PropertyContext';
import { Button } from '../ui';
import { Icons } from '../Icons';
import * as supabaseService from '../../services/supabaseService';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { users, currentUser } = useAuth(); // Note: AuthContext might need a way to refresh users
  const { properties, updateProperty } = useProperties();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties'>('overview');
  
  // Local state for UI updates before refresh
  // In a real app we'd use a more robust state management or SWR/React Query
  
  const stats = {
    totalUsers: users.length,
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.status === 'active').length,
    suspendedProperties: properties.filter(p => p.status === 'suspended').length,
    owners: users.filter(u => u.role === 'owner').length,
    clients: users.filter(u => u.role === 'client').length,
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (confirm('¿Estás seguro de cambiar el rol de este usuario?')) {
        try {
            await supabaseService.updateUser(userId, { role: newRole });
            alert('Rol actualizado. Por favor recarga la página para ver los cambios reflejados en la lista (si no son automáticos).');
            // Ideally call a refreshUsers() from context here
        } catch (error) {
            console.error(error);
            alert('Error al actualizar rol');
        }
    }
  };

  const handlePropertyStatus = (property: Property) => {
    const newStatus = property.status === 'active' ? 'suspended' : 'active';
    updateProperty(property.id, { status: newStatus });
  };

  if (currentUser?.role !== 'admin') {
      return (
          <div className="p-10 text-center">
              <h1 className="text-2xl font-bold text-red-500">Acceso Denegado</h1>
              <Button onClick={onBack} className="mt-4">Volver</Button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">  
            <button 
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-black transition-colors"
            >
            <Icons.ChevronLeft className="w-5 h-5 mr-1" />
            Volver al Inicio
            </button>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'overview' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Resumen
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'users' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Usuarios
            </button>
            <button 
                onClick={() => setActiveTab('properties')}
                className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'properties' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Propiedades
            </button>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Usuarios</h3>
                        <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
                        <div className="mt-2 text-sm text-gray-600 flex gap-4">
                            <span>{stats.owners} Propietarios</span>
                            <span>{stats.clients} Clientes</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Propiedades</h3>
                        <p className="text-4xl font-bold text-gray-900">{stats.totalProperties}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Estado Propiedades</h3>
                        <div className="flex items-end gap-2">
                             <p className="text-4xl font-bold text-green-600">{stats.activeProperties}</p>
                             <span className="text-gray-500 mb-1">Activas</span>
                        </div>
                        <div className="flex items-end gap-2 mt-1">
                             <p className="text-2xl font-bold text-red-500">{stats.suspendedProperties}</p>
                             <span className="text-gray-500 mb-1">Suspendidas</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Usuario</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Rol Actual</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar || 'https://via.placeholder.com/40'} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                user.role === 'admin' ? 'bg-black text-white' : 
                                                user.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.role !== 'admin' && ( // Cannot change other admins for safety
                                                 <select 
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                    value={user.role}
                                                    className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                                                 >
                                                    <option value="client">Cliente</option>
                                                    <option value="owner">Propietario</option>
                                                 </select>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'properties' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Propiedad</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Propietario</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Precio</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Estado</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {properties.map(property => {
                                    const owner = users.find(u => u.id === property.ownerId);
                                    return (
                                        <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={property.imageUrls[0] || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{property.title}</span>
                                                        <span className="text-xs text-gray-500">{property.location}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">{owner?.name || 'Desconocido'}</td>
                                            <td className="p-4 text-sm font-bold">{property.price.toLocaleString()} FCA</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                    property.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {property.status === 'active' ? 'Activa' : 'Suspendida'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button 
                                                    onClick={() => handlePropertyStatus(property)}
                                                    variant={property.status === 'active' ? 'danger' : 'secondary'}
                                                    className="py-1 px-3 text-xs"
                                                >
                                                    {property.status === 'active' ? 'Suspender' : 'Activar'}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
