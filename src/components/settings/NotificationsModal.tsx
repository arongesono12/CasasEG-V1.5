import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { User, Notification } from '../../types';
import { useMessaging } from '../../contexts/MessagingContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const { notifications, markAsRead, refreshNotifications } = useMessaging();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setIsLoading(true);
      refreshNotifications(currentUser.id).finally(() => setIsLoading(false));
    }
  }, [isOpen, currentUser, refreshNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = filteredNotifications.filter(n => !n.read);
    for (const notif of unreadNotifications) {
      await markAsRead(notif.id);
    }
  };

  const handleDelete = async (id: string) => {
    // Aquí podrías implementar la eliminación de notificaciones
    // Por ahora solo marcamos como leída
    await markAsRead(id);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  const formatDate = (timestamp: number | string) => {
    // Handle both timestamp (number) and created_at (string) from Supabase
    const date = typeof timestamp === 'string' 
      ? new Date(timestamp) 
      : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Helper to get timestamp from notification (handles both formats)
  const getNotificationTimestamp = (notification: any): number => {
    if (notification.timestamp) return notification.timestamp;
    if (notification.created_at) {
      return new Date(notification.created_at).getTime();
    }
    return Date.now();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Icons.Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notificaciones</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {unreadCount} {unreadCount === 1 ? 'notificación no leída' : 'notificaciones no leídas'}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar notificaciones"
          >
            <Icons.Close className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors relative ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              No Leídas
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setFilter('read')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                filter === 'read'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Leídas
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Icons.Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-center">
                {filter === 'unread' 
                  ? 'No tienes notificaciones no leídas'
                  : filter === 'read'
                  ? 'No tienes notificaciones leídas'
                  : 'No tienes notificaciones'}
              </p>
              <p className="text-sm text-gray-400 mt-2 text-center">
                Te notificaremos cuando haya actualizaciones importantes
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      !notification.read 
                        ? 'bg-indigo-100' 
                        : 'bg-gray-100'
                    }`}>
                      <Icons.Bell className={`w-4 h-4 ${
                        !notification.read 
                          ? 'text-indigo-600' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        !notification.read 
                          ? 'text-gray-900' 
                          : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(getNotificationTimestamp(notification))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Marcar como leída"
                        >
                          <Icons.Check className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(notification.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Icons.Delete className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Marcar todas como leídas
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

