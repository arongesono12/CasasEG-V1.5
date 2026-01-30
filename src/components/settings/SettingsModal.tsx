import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

interface SettingsState {
  // Notificaciones
  emailNotifications: boolean;
  pushNotifications: boolean;
  propertyAlerts: boolean;
  messageNotifications: boolean;
  marketingEmails: boolean;
  
  // Privacidad
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  
  // Preferencias
  language: string;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  
  // Visualización
  propertiesPerPage: number;
  defaultView: 'grid' | 'list';
  showMapByDefault: boolean;
}

const ToggleSwitch: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}> = ({ enabled, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        enabled ? 'bg-indigo-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const { updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'privacy' | 'preferences' | 'display'>('notifications');
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    pushNotifications: true,
    propertyAlerts: true,
    messageNotifications: true,
    marketingEmails: false,
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    language: 'es',
    theme: 'light',
    currency: 'EUR',
    propertiesPerPage: 12,
    defaultView: 'grid',
    showMapByDefault: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar configuraciones guardadas del localStorage
  useEffect(() => {
    if (isOpen) {
      const savedSettings = localStorage.getItem(`casaseg_settings_${currentUser.id}`);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Error loading settings:', e);
        }
      }
    }
  }, [isOpen, currentUser.id]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Guardar en localStorage
      localStorage.setItem(`casaseg_settings_${currentUser.id}`, JSON.stringify(settings));
      
      // Aquí podrías guardar en la base de datos también
      // await updateProfile({ settings: settings });
      
      setSaveMessage({ type: 'success', text: 'Configuración guardada correctamente' });
      setTimeout(() => {
        setSaveMessage(null);
        setIsSaving(false);
      }, 2000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Error al guardar la configuración' });
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'notifications' as const, label: 'Notificaciones', icon: <Icons.Bell className="w-4 h-4" /> },
    { id: 'privacy' as const, label: 'Privacidad', icon: <Icons.Admin className="w-4 h-4" /> },
    { id: 'preferences' as const, label: 'Preferencias', icon: <Icons.Settings className="w-4 h-4" /> },
    { id: 'display' as const, label: 'Visualización', icon: <Icons.Grid className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
            <p className="text-sm text-gray-500 mt-1">Gestiona tus preferencias y configuraciones</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icons.Close className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Notificaciones */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                <h3 className="font-bold text-gray-900 text-lg">Preferencias de Notificaciones</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Notificaciones por Email</p>
                      <p className="text-sm text-gray-500 mt-1">Recibir actualizaciones importantes por correo</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.emailNotifications}
                      onChange={(val) => updateSetting('emailNotifications', val)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Notificaciones Push</p>
                      <p className="text-sm text-gray-500 mt-1">Recibir notificaciones en tiempo real</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.pushNotifications}
                      onChange={(val) => updateSetting('pushNotifications', val)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Alertas de Propiedades</p>
                      <p className="text-sm text-gray-500 mt-1">Notificaciones cuando hay propiedades nuevas que te interesan</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.propertyAlerts}
                      onChange={(val) => updateSetting('propertyAlerts', val)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Notificaciones de Mensajes</p>
                      <p className="text-sm text-gray-500 mt-1">Avisos cuando recibes nuevos mensajes</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.messageNotifications}
                      onChange={(val) => updateSetting('messageNotifications', val)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Emails de Marketing</p>
                      <p className="text-sm text-gray-500 mt-1">Recibir ofertas y promociones especiales</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.marketingEmails}
                      onChange={(val) => updateSetting('marketingEmails', val)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacidad */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                <h3 className="font-bold text-gray-900 text-lg">Configuración de Privacidad</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Visibilidad del Perfil
                    </label>
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => updateSetting('profileVisibility', e.target.value as 'public' | 'private')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="public">Público</option>
                      <option value="private">Privado</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {settings.profileVisibility === 'public' 
                        ? 'Tu perfil es visible para todos los usuarios'
                        : 'Tu perfil solo es visible para ti'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Mostrar Email</p>
                      <p className="text-sm text-gray-500 mt-1">Permitir que otros usuarios vean tu email</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.showEmail}
                      onChange={(val) => updateSetting('showEmail', val)}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Mostrar Teléfono</p>
                      <p className="text-sm text-gray-500 mt-1">Permitir que otros usuarios vean tu teléfono</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.showPhone}
                      onChange={(val) => updateSetting('showPhone', val)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferencias */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                <h3 className="font-bold text-gray-900 text-lg">Preferencias Generales</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Idioma
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tema
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) => updateSetting('theme', e.target.value as 'light' | 'dark' | 'auto')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="auto">Automático</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {settings.theme === 'auto' && 'El tema se ajustará según la configuración de tu sistema'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Moneda
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="MXN">MXN ($)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visualización */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                <h3 className="font-bold text-gray-900 text-lg">Preferencias de Visualización</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Propiedades por Página
                    </label>
                    <select
                      value={settings.propertiesPerPage}
                      onChange={(e) => updateSetting('propertiesPerPage', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="6">6</option>
                      <option value="12">12</option>
                      <option value="24">24</option>
                      <option value="48">48</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Vista por Defecto
                    </label>
                    <select
                      value={settings.defaultView}
                      onChange={(e) => updateSetting('defaultView', e.target.value as 'grid' | 'list')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="grid">Cuadrícula</option>
                      <option value="list">Lista</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Mostrar Mapa por Defecto</p>
                      <p className="text-sm text-gray-500 mt-1">Abrir la vista de mapa al cargar la página</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.showMapByDefault}
                      onChange={(val) => updateSetting('showMapByDefault', val)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          {saveMessage && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {saveMessage.text}
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

