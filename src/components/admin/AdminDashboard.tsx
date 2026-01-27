import React, { useState, useMemo } from 'react';
import { User, Property, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useProperties } from '../../contexts/PropertyContext';
import { useMessaging } from '../../contexts/MessagingContext';
import { Icons } from '../Icons';
import { UserDropdown } from '../layout/UserDropdown';
import { useNavigate } from 'react-router-dom';
import * as supabaseService from '../../services/supabaseService';
import * as analyticsService from '../../services/analyticsService';
import logo from '../../assets/logo/logo.png';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { users, currentUser, logout } = useAuth();
  const { properties, deleteProperty } = useProperties();
  const { messages } = useMessaging();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'analytics'>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Filter out admins from the display list (only show Clients and Owners)
  const nonAdminUsers = useMemo(() => {
     return users.filter(u => u.role !== 'admin');
  }, [users]);

  // Analytics Data
  const userActivities = useMemo(() => 
    analyticsService.getUserActivities(nonAdminUsers, properties, messages), 
    [nonAdminUsers, properties, messages]
  );
  
  const ownerActivities = useMemo(() => 
    analyticsService.getOwnerActivities(nonAdminUsers, properties, messages), 
    [nonAdminUsers, properties, messages]
  );

  // Stats
  const stats = {
    totalUsers: nonAdminUsers.length,
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.status === 'active').length,
    totalVisits: userActivities.reduce((acc, curr) => acc + curr.propertiesViewed, 0),
    owners: nonAdminUsers.filter(u => u.role === 'owner').length,
    bounceRate: "32.53%", // Placeholder
    newSessions: "68.8", // Placeholder
  };

  const handleDeleteProperty = async (propertyId: string, propertyTitle: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${propertyTitle}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteProperty(propertyId);
        // Ideally, show a toast notification on success
        alert('Propiedad eliminada con éxito.');
      } catch (error) {
        console.error('Error deleting property:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
        alert(`Error al eliminar la propiedad: ${errorMessage}`);
      }
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-4 px-6 py-3 transition-colors ${
        activeTab === id 
          ? 'text-white bg-white/10 border-l-4 border-blue-500' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans overflow-hidden">
      
      {/* Dark Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-[#1e293b] z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 mb-2">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group transition-all"
          >
            <div className="bg-white/10 p-2 rounded-2xl group-hover:bg-white/20 transition-colors">
              <img src={logo} alt="CasasEG Logo" className="h-10 w-auto object-contain" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-white font-black text-lg tracking-tighter leading-none">DASHBOARD</span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-0.5">Control Panel</span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1">
          <NavItem id="overview" icon={Icons.Dashboard} label="Dashboard" />
          <NavItem id="analytics" icon={Icons.TrendingUp} label="Analíticas" />
          
          <div className="px-6 py-4">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gestión</p>
          </div>
          
          <NavItem id="users" icon={Icons.Users} label="Usuarios" />
          <NavItem id="properties" icon={Icons.Building} label="Propiedades" />
        </nav>

        {/* Footer / User Mini Profile in Sidebar */}
        <div className="p-4 bg-[#0f172a]">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-600 overflow-hidden">
                    {currentUser?.avatar ? (
                        <img src={currentUser.avatar} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-white font-bold">
                            {currentUser?.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
                    <p className="text-xs text-gray-400 truncate">Admin</p>
                </div>
                <button onClick={onBack} className="text-gray-400 hover:text-white">
                    <Icons.Logout className="w-5 h-5" />
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
              <div className="flex items-center gap-4">
                  <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
                      <Icons.Menu className="w-6 h-6" />
                  </button>
                  <div>
                      <h2 className="text-xl font-bold text-gray-800">
                          Bienvenido, {currentUser?.name.split(' ')[0]}
                      </h2>
                      <p className="text-xs text-gray-500 hidden sm:block">
                          Aquí tienes el resumen de hoy.
                      </p>
                  </div>
              </div>

              <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                      <Icons.History className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                      <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                          <Icons.Bell className="w-5 h-5" />
                          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                      </button>
                      
                      {currentUser && (
                        <UserDropdown 
                          currentUser={currentUser}
                          onLogout={logout}
                          onProfileClick={() => navigate('/profile')}
                        />
                      )}
                  </div>
              </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-8">
              
              {/* CONTENT: OVERVIEW */}
              {activeTab === 'overview' && (
                  <div className="space-y-8 animate-fade-in">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <StatCard 
                             title="Usuarios Totales" 
                             value={stats.totalUsers.toString()} 
                             trend="+12%" 
                             trendUp={true}
                             icon={Icons.Users}
                             color="primary"
                          />
                          <StatCard 
                             title="Propiedades Activas" 
                             value={stats.activeProperties.toString()} 
                             trend="+5.2%" 
                             trendUp={true}
                             icon={Icons.Building}
                             color="success"
                          />
                          <StatCard 
                             title="Visitas Totales" 
                             value={stats.totalVisits.toString()} 
                             trend="-0.5%" 
                             trendUp={false}
                             icon={Icons.Activity}
                             color="warning"
                          />
                          <StatCard 
                             title="Nuevos Dueños" 
                             value={stats.owners.toString()} 
                             trend="+2" 
                             trendUp={true}
                             icon={Icons.User}
                             color="info"
                          />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Main Chart Section */}
                           <div className="lg:col-span-3 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-black/[0.03] border border-white/40">
                              <div className="flex items-center justify-between mb-8">
                                  <div>
                                      <h3 className="font-bold text-gray-900 text-lg">Actividad de la Plataforma</h3>
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Interacciones y Crecimiento Semanal</p>
                                  </div>
                                  <div className="flex gap-4">
                                      <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tráfico Hoy</span>
                                      </div>
                                      <select className="bg-gray-50 border-none text-[10px] font-bold uppercase tracking-widest rounded-xl px-3 py-1.5 focus:ring-2 ring-blue-500/20 outline-none">
                                          <option>Ultimos 7 días</option>
                                          <option>Ultimos 30 días</option>
                                      </select>
                                  </div>
                              </div>
                              
                              <div className="h-72 w-full flex items-end justify-between gap-4 px-2">
                                  {[35, 50, 42, 90, 65, 75, 85].map((h, i) => (
                                      <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                                          <div className="w-full relative group h-full flex items-end">
                                              {/* Background bar */}
                                              <div className="absolute inset-x-0 bottom-0 top-0 bg-blue-50/50 rounded-2xl"></div>
                                              {/* Actual data bar */}
                                              <div 
                                                style={{ height: `${h}%` }} 
                                                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-2xl transition-all duration-700 relative group-hover:from-blue-700 group-hover:to-blue-500 shadow-lg shadow-blue-500/20"
                                              >
                                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                      +{h}% crecimiento
                                                  </div>
                                              </div>
                                          </div>
                                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* Quick Actions Panel */}
                          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-black/[0.03] border border-white/40 flex flex-col">
                              <h3 className="font-bold text-gray-900 text-lg mb-6">Acciones Rápidas</h3>
                              <div className="grid grid-cols-1 gap-3">
                                  <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all group">
                                      <div className="p-2 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-white/10 group-hover:text-white">
                                          <Icons.Plus className="w-4 h-4" />
                                      </div>
                                      <span className="text-xs font-bold uppercase tracking-widest text-left">Nueva Propiedad</span>
                                  </button>
                                  <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all group">
                                      <div className="p-2 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-white/10 group-hover:text-white">
                                          <Icons.Message className="w-4 h-4" />
                                      </div>
                                      <span className="text-xs font-bold uppercase tracking-widest text-left">Chat de Soporte</span>
                                  </button>
                                  <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all group">
                                      <div className="p-2 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-white/10 group-hover:text-white">
                                          <Icons.TrendingUp className="w-4 h-4" />
                                      </div>
                                      <span className="text-xs font-bold uppercase tracking-widest text-left">Exportar Reporte</span>
                                  </button>
                                  <button onClick={() => window.location.reload()} className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all group mt-auto">
                                      <div className="p-2 bg-green-100 text-green-600 rounded-xl group-hover:bg-white/10 group-hover:text-white">
                                          <Icons.Check className="w-4 h-4" />
                                      </div>
                                      <span className="text-xs font-bold uppercase tracking-widest text-left">Refrescar Datos</span>
                                  </button>
                              </div>
                          </div>

                          {/* Platform Performance metrics */}
                          <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-black/[0.03] border border-white/40">
                              <h3 className="font-bold text-gray-900 text-lg mb-8">Rendimiento del Sistema</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                      <div className="flex justify-between items-end">
                                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uso de Base de Datos</p>
                                          <span className="text-xs font-bold text-blue-600">65%</span>
                                      </div>
                                      <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                                          <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                                      </div>
                                      
                                      <div className="flex justify-between items-end mt-6">
                                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Latencia Media (ms)</p>
                                          <span className="text-xs font-bold text-green-600">24ms</span>
                                      </div>
                                      <div className="h-2 bg-green-50 rounded-full overflow-hidden">
                                          <div className="h-full bg-green-500 w-[24%] rounded-full"></div>
                                      </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                          <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Estado API</p>
                                          <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                              <span className="text-sm font-bold text-blue-900 uppercase">Óptimo</span>
                                          </div>
                                      </div>
                                      <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                          <p className="text-[10px] font-black text-purple-400 uppercase mb-2">Servidores</p>
                                          <div className="flex items-center gap-2">
                                              <span className="text-sm font-bold text-purple-900 uppercase">3 Activos</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Recent Activity Timeline */}
                          <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-black/[0.03] border border-white/40">
                              <div className="flex items-center justify-between mb-8">
                                  <h3 className="font-bold text-gray-900 text-lg">Actividad en Tiempo Real</h3>
                                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Ver Historial</button>
                              </div>
                              <div className="space-y-6">
                                  {/* Activity Item */}
                                  <div className="flex gap-4 relative">
                                      <div className="absolute top-8 bottom-0 left-4 w-[2px] bg-gray-100"></div>
                                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center relative z-10 shrink-0 border-4 border-white shadow-sm">
                                          <Icons.User className="w-3 h-3 text-blue-600" />
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-gray-900">Nuevo Cliente Registrado</p>
                                          <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Hace 5 minutos • Sistema de Auth</p>
                                      </div>
                                  </div>
                                  {/* Activity Item */}
                                  <div className="flex gap-4 relative">
                                      <div className="absolute top-8 bottom-0 left-4 w-[2px] bg-gray-100"></div>
                                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center relative z-10 shrink-0 border-4 border-white shadow-sm">
                                          <Icons.Building className="w-3 h-3 text-green-600" />
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-gray-900">Propiedad Validada por el Sistema</p>
                                          <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Hace 12 minutos • Moderación</p>
                                      </div>
                                  </div>
                                  {/* Activity Item */}
                                  <div className="flex gap-4 relative">
                                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center relative z-10 shrink-0 border-4 border-white shadow-sm">
                                          <Icons.Message className="w-3 h-3 text-orange-600" />
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-gray-900">Alerta de Seguridad: Login Fallido</p>
                                          <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Hace 45 minutos • Security Logs</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* CONTENT: MANAGEMENT TABLES */}
              {activeTab === 'users' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6 border-b border-gray-100">
                          <h3 className="font-bold text-lg text-gray-900">Gestión de Usuarios</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Usuario</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Rol</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Estado</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {nonAdminUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <div className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : null}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase
                                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                                  user.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
                                            `}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Activo
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.role !== 'admin' && (
                                                <button className="text-gray-400 hover:text-blue-600" title="Editar">
                                                    <Icons.Settings className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  </div>
              )}

              {/* CONTENT: PROPERTIES */}
              {activeTab === 'properties' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                       <div className="p-6 border-b border-gray-100">
                          <h3 className="font-bold text-lg text-gray-900">Gestión de Propiedades</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Propiedad</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Precio</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Ubicación</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Estado</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map(property => (
                                    <tr key={property.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                                                    <img src={property.imageUrls[0]} className="w-full h-full object-cover" />
                                                </div>
                                                <p className="font-medium text-gray-900 text-sm line-clamp-1 max-w-[200px]">{property.title}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-gray-700">
                                            {property.price.toLocaleString()} FCA
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {property.location}
                                        </td>
                                        <td className="p-4">
                                             <span className={`px-2 py-1 rounded-full text-xs font-bold
                                                ${property.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                            `}>
                                                {property.status === 'active' ? 'Publicado' : 'Suspendido'}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button className="text-gray-400 hover:text-black" title="Editar propiedad">
                                                <Icons.Settings className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteProperty(property.id, property.title)}
                                              className="text-gray-400 hover:text-red-600"
                                              title="Eliminar propiedad">
                                                <Icons.Delete className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  </div>
              )}

              {/* CONTENT: ANALYTICS */}
              {activeTab === 'analytics' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                          <h3 className="font-bold text-gray-900 mb-4">Actividad de Usuarios</h3>
                          <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                  <thead>
                                      <tr className="text-left text-gray-400 border-b border-gray-100">
                                          <th className="pb-2">Usuario</th>
                                          <th className="pb-2">Vistas</th>
                                          <th className="pb-2">Msjs</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                      {userActivities.slice(0, 5).map((ua, i) => (
                                          <tr key={i}>
                                              <td className="py-3 font-medium text-gray-900">{ua.userName}</td>
                                              <td className="py-3 text-gray-600">{ua.propertiesViewed}</td>
                                              <td className="py-3 text-gray-600">{ua.messagesSent}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>

                       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                          <h3 className="font-bold text-gray-900 mb-4">Top Propietarios</h3>
                           <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                  <thead>
                                      <tr className="text-left text-gray-400 border-b border-gray-100">
                                          <th className="pb-2">Propietario</th>
                                          <th className="pb-2">Props</th>
                                          <th className="pb-2">Rating</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                      {ownerActivities.slice(0, 5).map((oa, i) => (
                                          <tr key={i}>
                                              <td className="py-3 font-medium text-gray-900">{oa.ownerName}</td>
                                              <td className="py-3 text-gray-600">{oa.propertiesPublished}</td>
                                              <td className="py-3 text-gray-600 flex items-center gap-1">
                                                  <Icons.Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                  {oa.averageRating.toFixed(1)}
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              )}

          </main>
      </div>
    </div>
  );
};

// Subcomponent for Stats
const StatCard = ({ title, value, trend, trendUp, icon: Icon, color }: any) => {
    const colors = {
        primary: 'bg-blue-600',
        success: 'bg-green-500',
        warning: 'bg-orange-500',
        info: 'bg-purple-500'
    };
    
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className={`text-xs font-bold mt-2 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
                    {trend} <span className="text-gray-400 font-normal ml-1">vs mes anterior</span>
                </p>
            </div>
            <div className={`p-3 rounded-xl text-white shadow-lg shadow-gray-200 ${(colors as any)[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
};
