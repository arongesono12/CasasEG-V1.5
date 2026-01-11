import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../constants/mockData';
import * as supabaseService from '../services/supabaseService';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (user: User) => void;
  logout: () => void;
  register: (newUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  useEffect(() => {
    const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
    if (!useSupabase) return;

    (async () => {
      try {
        const remote = await supabaseService.fetchUsers();
        if (Array.isArray(remote) && remote.length) setUsers(remote as User[]);
      } catch (e) {
        console.warn('Supabase users fetch failed', e);
      }
    })();
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

