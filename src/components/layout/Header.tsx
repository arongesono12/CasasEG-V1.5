import React from 'react';
import { User } from '../../types';
import { Icons } from '../Icons';
import { Button } from '../ui';
import { UserDropdown } from './UserDropdown';
import logo from '../../assets/logo/logo.png';

interface HeaderProps {
  currentUser: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onMessagesClick: () => void;
  onCreatePropertyClick: () => void;
  onLogoClick: () => void;
  messageCount: number;
  onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLoginClick,
  onLogout,
  onMessagesClick,
  onCreatePropertyClick,
  onLogoClick,
  messageCount,
  onProfileClick
}) => {
  return (
    <header className="bg-gray-50 sticky top-0 z-40 border-b border-gray-100/50 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={onLogoClick}>
          <img 
            src={logo} 
            alt="CasasEG" 
            className="h-14 md:h-18 w-auto object-contain hover:opacity-90 transition-opacity" 
          />
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
             {currentUser.role === 'owner' && (
                <Button variant="ghost" onClick={onCreatePropertyClick} className="hidden md:flex text-sm">
                   Pon tu casa en Vesta
                </Button>
             )}
              <div className="flex items-center gap-3">
                <button 
                  onClick={onMessagesClick}
                  className="p-2.5 hover:bg-gray-100 rounded-full relative transition-colors"
                  title="Mensajes"
                >
                  <Icons.Message className="w-5 h-5 text-gray-600" />
                  {messageCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                <UserDropdown 
                  currentUser={currentUser} 
                  onLogout={onLogout} 
                  onProfileClick={onProfileClick} 
                />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
               <div 
                 onClick={onLoginClick}
                 className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 hover:shadow-md transition-shadow cursor-pointer"
                >
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

