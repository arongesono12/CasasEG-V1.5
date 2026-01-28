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
import { optimizeImageForUpload } from '../../utils/imageOptimizer';
import logo from '../../assets/logo/logo.png';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { users, currentUser, logout } = useAuth();
  const { properties, deleteProperty, refreshProperties, updateProperty } = useProperties();
  const { messages } = useMessaging();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'analytics'>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, markAsRead } = useMessaging();

  // Filter logic:
  // - Superadmin sees everyone (not self)
  // - Admin sees Clients and Owners (not other admins or superadmins)
  const filteredUsers = useMemo(() => {
    if (!currentUser) return [];
    return users.filter(u => {
      if (u.id === currentUser.id) return false;
      if (currentUser.role === 'superadmin') return true;
      if (currentUser.role === 'admin') return u.role !== 'admin' && u.role !== 'superadmin';
      return false;
    });
  }, [users, currentUser]);

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

  const handleUpdateStatus = async (userId: string, currentStatus: any) => {
    const nextStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
    try {
      await supabaseService.updateUserStatus(userId, nextStatus as any);
      alert(`Usuario ${nextStatus === 'active' ? 'activado' : 'desactivado'} correctamente.`);
      refreshProperties(); // Or refresh users if a generic refresh exists
    } catch (e) {
      alert('Error actualizando estado');
    }
  };

  const handlePromoteToOwner = async (userId: string) => {
    if (window.confirm('¿Deseas convertir este cliente en PROPIETARIO?')) {
      try {
        await supabaseService.promoteUserToOwner(userId);
        alert('Usuario ascendido a Propietario.');
      } catch (e) {
        alert('Error ascendiendo usuario');
      }
    }
  };

  const handleDeleteProperty = async (propertyId: string, propertyTitle: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${propertyTitle}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteProperty(propertyId);
        alert('Propiedad eliminada con éxito.');
      } catch (error) {
        console.error('Error deleting property:', error);
        alert(`Error al eliminar la propiedad.`);
      }
    }
  };

  const handleToggleStatus = async (property: Property) => {
    const newStatus = property.status === 'active' ? 'suspended' : 'active';
    try {
      await updateProperty(property.id, { status: newStatus as any });
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Error al cambiar el estado de la propiedad.');
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
                      <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      >
                          <Icons.Bell className="w-5 h-5" />
                          {notifications.some(n => !n.read) && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                          )}
                      </button>

                      {/* Notifications Dropdown */}
                      {isNotificationsOpen && (
                        <div className="absolute top-16 right-20 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-fade-in py-4">
                           <div className="px-6 pb-2 border-b border-gray-50 flex justify-between items-center">
                              <h4 className="font-bold text-gray-900 text-sm">Notificaciones</h4>
                              <button className="text-[10px] text-blue-600 font-bold uppercase">Marcar todas</button>
                           </div>
                           <div className="max-h-64 overflow-y-auto mt-2">
                              {notifications.length > 0 ? notifications.map(n => (
                                <div key={n.id} onClick={() => markAsRead(n.id)} className={`px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                                  <p className="text-xs text-gray-800 font-medium">{n.message}</p>
                                  <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">{new Date(n.created_at).toLocaleDateString()}</p>
                                </div>
                              )) : (
                                <div className="p-6 text-center text-gray-400 text-xs font-medium">No tienes notificaciones hoy</div>
                              )}
                           </div>
                        </div>
                      )}
                      
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
                                  <button onClick={() => refreshProperties()} className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all group mt-auto">
                                      <div className="p-2 bg-green-100 text-green-600 rounded-xl group-hover:bg-white/10 group-hover:text-white">
                                          <Icons.Check className="w-4 h-4" />
                                      </div>
                                      <span className="text-xs font-bold uppercase tracking-widest text-left">Refrescar Datos</span>
                                  </button>
                              </div>
                          </div>

                           {/* Technical Health - ONLY FOR SUPERADMIN */}
                           {currentUser?.role === 'superadmin' && (
                            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-black/[0.03] border border-white/40">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-bold text-gray-900 text-lg">Estado Técnico de DB</h3>
                                    <Icons.Settings className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
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
                           )}

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
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : null}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 line-clamp-1">{user.name}</p>
                                                    <p className="text-[10px] text-gray-500 line-clamp-1">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase
                                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                                  user.role === 'owner' ? 'bg-blue-100 text-blue-700' : 
                                                  user.role === 'superadmin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}
                                            `}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold uppercase ${
                                              (user as any).status === 'inactive' ? 'text-red-500' : 'text-green-600'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                  (user as any).status === 'inactive' ? 'bg-red-500' : 'bg-green-600'
                                                }`}></span>
                                                {(user as any).status || 'active'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                              <button 
                                                onClick={() => handleUpdateStatus(user.id, (user as any).status)}
                                                className={`text-xs font-bold uppercase transition-colors ${
                                                  (user as any).status === 'inactive' ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-red-600'
                                                }`}
                                              >
                                                {(user as any).status === 'inactive' ? 'Activar' : 'Cerrar'}
                                              </button>
                                              {user.role === 'client' && (
                                                <button 
                                                  onClick={() => handlePromoteToOwner(user.id)}
                                                  className="text-xs font-bold uppercase text-blue-600 hover:text-blue-700"
                                                >
                                                  Ascender
                                                </button>
                                              )}
                                            </div>
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
                                            <button 
                                              onClick={() => handleToggleStatus(property)}
                                              className={`${property.status === 'active' ? 'text-orange-400 hover:text-orange-600' : 'text-green-400 hover:text-green-600'}`} 
                                              title={property.status === 'active' ? "Suspender vivienda" : "Activar vivienda"}
                                            >
                                                {property.status === 'active' ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                                            </button>
                                            <button 
                                              onClick={() => setEditingProperty(property)}
                                              className="text-gray-400 hover:text-black" 
                                              title="Editar propiedad"
                                            >
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

      {editingProperty && (
        <PropertyEditModal 
          property={editingProperty} 
          onClose={() => setEditingProperty(null)} 
          onSave={async (updates) => {
            await updateProperty(editingProperty.id, updates);
            setEditingProperty(null);
          }}
        />
      )}
    </div>
  );
};

// --- SUBCOMPONENTS ---

interface PropertyEditModalProps {
  property: Property;
  onClose: () => void;
  onSave: (updates: Partial<Property>) => Promise<void>;
}

const PropertyEditModal: React.FC<PropertyEditModalProps> = ({ property, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...property });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setUploadProgress(0);
    try {
      const newUrls = [...formData.imageUrls];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(Math.round((i / files.length) * 100));
        const optimized = await optimizeImageForUpload(files[i], files[i].name);
        const url = await supabaseService.uploadPropertyImage(optimized);
        newUrls.push(url);
      }
      setFormData({ ...formData, imageUrls: newUrls });
    } catch (err) {
      alert('Error subiendo imágenes');
    } finally {
      setUploadProgress(null);
    }
  };

  const removeImage = (urlToRemove: string) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter(url => url !== urlToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      alert('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Editar Vivienda</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Icons.Close className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título de la Propiedad</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 ring-blue-500/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio (FCA)</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 ring-blue-500/20 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Imágenes de la Propiedad</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100">
                  <img src={url} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icons.Close className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                <input type="file" multiple onChange={handleImageUpload} className="hidden" accept="image/*" />
                <Icons.Plus className="w-6 h-6 text-gray-400" />
                <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Añadir</span>
              </label>
            </div>
            {uploadProgress !== null && (
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
            <textarea 
              rows={4}
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 ring-blue-500/20 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Camas</label>
              <input type="number" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm"/>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Baños</label>
              <input type="number" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm"/>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Área (m²)</label>
              <input type="number" value={formData.area} onChange={e => setFormData({...formData, area: Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm"/>
            </div>
             <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm">
                <option value="active">Activa (Pública)</option>
                <option value="suspended">Suspendida (Oculta)</option>
              </select>
            </div>
          </div>
        </form>

        <div className="px-8 py-6 border-t border-gray-100 flex gap-4 bg-gray-50/50">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all text-sm uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-[2] py-3 px-6 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
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
