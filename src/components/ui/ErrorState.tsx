import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../Icons';
import { Button } from './Button';

type ErrorType = 'offline' | 'limit' | 'error' | 'maintenance' | 'empty';

interface ErrorStateProps {
  type: ErrorType;
  title?: string;
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
  showHome?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type,
  title,
  message,
  onAction,
  actionLabel,
  showHome = true
}) => {
  const config = {
    offline: {
      icon: Icons.WifiOff,
      title: title || 'Sin conexión a internet',
      message: message || 'Parece que has perdido la conexión. Por favor, verifica tu red para continuar navegando.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: onAction || (() => window.location.reload()),
      label: actionLabel || 'Reintentar conexión'
    },
    limit: {
      icon: Icons.Clock,
      title: title || 'Límite de solicitudes superado',
      message: message || 'Has realizado demasiadas solicitudes en poco tiempo. Por seguridad, por favor espera unos momentos antes de continuar.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: onAction || (() => window.location.reload()),
      label: actionLabel || 'Intentar ahora'
    },
    error: {
      icon: Icons.Alert,
      title: title || 'Ups! Algo salió mal',
      message: message || 'Hemos encontrado un problema inesperado. Nuestro equipo técnico ha sido notificado.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      action: onAction || (() => window.location.reload()),
      label: actionLabel || 'Recargar página'
    },
    maintenance: {
      icon: Icons.Settings,
      title: title || 'Mantenimiento programado',
      message: message || 'Estamos mejorando la plataforma para ti. Estaremos de vuelta en unos minutos.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: onAction,
      label: actionLabel || 'Saber más'
    },
    empty: {
        icon: Icons.Search,
        title: title || 'No se encontraron resultados',
        message: message || 'No hemos podido encontrar lo que buscas. Prueba ajustando tus filtros.',
        color: 'text-gray-400',
        bgColor: 'bg-gray-50',
        action: onAction,
        label: actionLabel
    }
  }[type];

  // Fallback for missing icon in case of type mismatch or icon issue
  const Icon = config?.icon || Icons.Alert;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className={`w-24 h-24 ${config.bgColor} ${config.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-black/[0.02] border border-white/50 relative overflow-hidden group`}>
            <div className={`absolute inset-0 ${config.bgColor} opacity-50 blur-xl group-hover:scale-150 transition-transform duration-700`}></div>
            <Icon className="w-10 h-10 relative z-10" />
            
            {/* Decorative particles */}
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-current opacity-20"></div>
            <div className="absolute bottom-4 left-3 w-1 h-1 rounded-full bg-current opacity-30"></div>
        </div>

        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">
          {config.title}
        </h2>
        
        <p className="text-gray-500 font-medium leading-relaxed mb-10 px-4">
          {config.message}
        </p>

        <div className="flex flex-col gap-3 max-w-[240px] mx-auto">
          {config.action && (
            <Button 
                onClick={config.action} 
                variant="brand" 
                className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-black/5"
            >
              <div className="flex items-center justify-center gap-2">
                <Icons.Refresh className="w-4 h-4" />
                {config.label}
              </div>
            </Button>
          )}
          
          {showHome && (
            <Button 
                onClick={() => window.location.href = '/'} 
                variant="secondary" 
                className="w-full py-4 text-sm font-black uppercase tracking-widest bg-gray-50 border-gray-100 hover:bg-gray-100"
            >
              Ir al Inicio
            </Button>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 opacity-30">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">CasasEG Support Systems</span>
        </div>
      </motion.div>
    </div>
  );
};
