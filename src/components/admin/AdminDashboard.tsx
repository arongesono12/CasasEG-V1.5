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
  const { properties, updateProperty } = useProperties();
  const { messages } = useMessaging();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'analytics'>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Analytics Data
  const userActivities = useMemo(() => 
    analyticsService.getUserActivities(users, properties, messages), 
    [users, properties, messages]
  );

  const ownerActivities = useMemo(() => 
    analyticsService.getOwnerActivities(users, properties, messages), 
    [users, properties, messages]
  );

  // Stats
  const stats = {
    totalUsers: users.length,
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.status === 'active').length,
    totalVisits: userActivities.reduce((acc, curr) => acc + curr.propertiesViewed, 0),
    owners: users.filter(u => u.role === 'owner').length,
    bounceRate: "32.53%", // Placeholder
    newSessions: "68.8", // Placeholder
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
        <div className="h-16 flex items-center px-6 bg-[#0f172a]">
          <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <img src={logo} alt="CasasEG Logo" className="h-14 w-auto object-contain" />
            <span>CasasEG</span>
          </div>
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

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Main Chart Section (Mock) */}
                          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                              <div className="flex items-center justify-between mb-6">
                                  <h3 className="font-bold text-gray-900 text-lg">Actividad de la Plataforma</h3>
                                  <div className="flex gap-2">
                                      <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                                          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Esta semana
                                      </span>
                                      <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                                          <span className="w-2 h-2 rounded-full bg-gray-300"></span> Anterior
                                      </span>
                                  </div>
                              </div>
                              
                              <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
                                  {/* Simple CSS Bar Chart Mock */}
                                  {[40, 65, 45, 80, 55, 70, 85].map((h, i) => (
                                      <div key={i} className="w-full bg-blue-50 rounded-t-lg relative group h-full flex items-end">
                                          <div style={{ height: `${h}%` }} className="w-full bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-600"></div>
                                      </div>
                                  ))}
                              </div>
                              <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium px-2">
                                  <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                              </div>
                          </div>

                          {/* Side Widget */}
                          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                              <h3 className="font-bold text-gray-900 text-lg mb-6">Resumen de Estado</h3>
                              <div className="bg-blue-600 rounded-xl p-6 text-white relative overflow-hidden mb-6">
                                  <div className="relative z-10">
                                      <p className="opacity-80 text-sm mb-1">Propiedades Verificadas</p>
                                      <h4 className="text-3xl font-bold">{stats.activeProperties}</h4>
                                  </div>
                                  <Icons.Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-10" />
                              </div>
                              
                              <h4 className="font-bold text-gray-900 mb-4">Actividad Reciente</h4>
                              <div className="space-y-4">
                                  {messages.slice(0, 3).map((msg) => (
                                      <div key={msg.id} className="flex gap-3 items-start">
                                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                              <Icons.Message className="w-4 h-4 text-gray-500" />
                                          </div>
                                          <div>
                                              <p className="text-sm font-medium text-gray-900 line-clamp-1">{msg.content}</p>
                                              <p className="text-xs text-gray-500">Hace un momento</p>
                                          </div>
                                      </div>
                                  ))}
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
                                {users.map(user => (
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
                                            <button className="text-gray-400 hover:text-black">
                                                <Icons.Settings className="w-4 h-4" />
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
