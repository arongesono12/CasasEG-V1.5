import React from 'react';
import { User } from '../../types';
import { Icons } from '../Icons';

interface MobileNavigationProps {
  currentUser: User | null;
  onHomeClick: () => void;
  onMessagesClick: () => void;
  onProfileClick: () => void;
  messageCount: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentUser,
  onHomeClick,
  onMessagesClick,
  onProfileClick,
  messageCount
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-40 pb-safe">
      <button onClick={onHomeClick} className="flex flex-col items-center text-black">
        <Icons.Home className="w-6 h-6" />
        <span className="text-[10px] font-medium mt-1">Explorar</span>
      </button>
      <button 
        onClick={onMessagesClick} 
        className="flex flex-col items-center text-gray-400 relative"
      >
        <Icons.Message className="w-6 h-6" />
        {messageCount > 0 && currentUser && <span className="absolute top-0 right-3 w-2 h-2 bg-red-500 rounded-full"></span>}
        <span className="text-[10px] font-medium mt-1">Mensajes</span>
      </button>
      <button onClick={onProfileClick} className="flex flex-col items-center text-gray-400">
        {currentUser ? (
           <img src={currentUser.avatar} className="w-6 h-6 rounded-full" alt="Profile" />
        ) : (
           <Icons.User className="w-6 h-6" />
        )}
        <span className="text-[10px] font-medium mt-1">{currentUser ? 'Perfil' : 'Acceder'}</span>
      </button>
    </div>
  );
};

