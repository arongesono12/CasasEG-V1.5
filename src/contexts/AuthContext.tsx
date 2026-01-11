import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import * as supabaseService from '../services/supabaseService';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (user: User) => void;
  logout: () => void;
  register: (newUser: User) => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Always attempt to fetch users if Supabase is configured, or just enable it by default now
    // Since we are moving to "real" data, we assume the backend is the source of truth.
    const useSupabase = import.meta.env.VITE_USE_SUPABASE !== 'false'; // Default to true if not explicitly false
    
    if (useSupabase) {
      (async () => {
        try {
          const remote = await supabaseService.fetchUsers();
          if (Array.isArray(remote)) setUsers(remote as User[]);
        } catch (e) {
          console.warn('Supabase users fetch failed', e);
        }
      })();
    }
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

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    
    // Optimistic update
    const updatedUser = { ...currentUser, ...data };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    // Persist
    const useSupabase = import.meta.env.VITE_USE_SUPABASE !== 'false';
    if (useSupabase) {
        try {
            await supabaseService.updateUser(currentUser.id, data);
        } catch (error) {
            console.error("Failed to update user profile", error);
        }
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, register, updateProfile }}>
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

