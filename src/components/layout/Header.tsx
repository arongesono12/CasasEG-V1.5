import React from 'react';
import { User } from '../../types';
import { Icons } from '../Icons';
import { Button } from '../ui';

interface HeaderProps {
  currentUser: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onMessagesClick: () => void;
  onCreatePropertyClick: () => void;
  onLogoClick: () => void;
  messageCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLoginClick,
  onLogout,
  onMessagesClick,
  onCreatePropertyClick,
  onLogoClick,
  messageCount
}) => {
  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
          <Icons.Home className="w-8 h-8 text-black" />
          <span className="font-bold text-xl tracking-tight text-black hidden sm:block">CasasEG</span>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
             {currentUser.role === 'owner' && (
                <Button variant="ghost" onClick={onCreatePropertyClick} className="hidden md:flex text-sm">
                   Pon tu casa en Vesta
                </Button>
             )}
              <div className="flex items-center gap-2 border border-gray-200 rounded-full p-1 pl-4 hover:shadow-md transition-shadow cursor-pointer">
                <button 
                  onClick={onMessagesClick}
                  className="p-1 hover:bg-gray-100 rounded-full mr-2 relative"
                  title="Mensajes"
                >
                  <Icons.Message className="w-5 h-5 text-gray-600" />
                  {messageCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
                <Icons.Menu className="w-4 h-4 text-gray-500" />
                <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full bg-gray-200" />
                <button onClick={onLogout} className="ml-2 mr-2 text-gray-400 hover:text-black">
                  <Icons.Logout className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
               <div 
                 onClick={onLoginClick}
                 className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 hover:shadow-md transition-shadow cursor-pointer"
                >
                 <Icons.Menu className="w-4 h-4 text-gray-500" />
                 <div className="bg-gray-500 rounded-full p-1">
                    <Icons.User className="w-4 h-4 text-white" />
                 </div>
                 <span className="text-sm font-medium text-gray-700">Acceder</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

