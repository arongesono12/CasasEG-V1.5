import React from 'react';
import { Icons } from '../Icons';

interface ToastProps {
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in-up flex items-center gap-2">
      <Icons.Check className="w-4 h-4 text-green-400" />
      {message}
    </div>
  );
};

