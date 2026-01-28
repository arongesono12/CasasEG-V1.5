import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import * as supabaseService from '../services/supabaseService';
import { supabase } from '../services/supabaseClient';
import { Session } from '@supabase/supabase-js';

// Simplified Context Interface
interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  
  // Auth Actions
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (data: { email: string; password: string; name: string; role: UserRole }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Profile Actions
  updateProfile: (data: Partial<User>) => Promise<void>;
  
  // Legacy support (optional, can be removed if not used)
  users: User[]; // Keeping empty array to avoid breaking UI that maps this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);

  // Initialize Auth State
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Session found for:', session.user.email);
          await handleUserSession(session);
        } else {
          console.log('No active session found.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };
    
    // Fetch users for admin/public directories (simplified)
    const loadUsers = async () => {
        const allUsers = await supabaseService.getAllUsers();
        if (mounted && allUsers) setUsers(allUsers);
    };

    initializeAuth();
    loadUsers();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        await handleUserSession(session);
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Helper to process session and get/create user profile
  const handleUserSession = async (session: Session) => {
    try {
      if (!session.user.email) throw new Error('No email in session');

      // 1. Try to fetch existing user profile
      let userProfile = await supabaseService.getUserById(session.user.id);

      // 2. If no profile exists, create one (lazy creation)
      if (!userProfile) {
        console.log('Creating new profile for user...');
        
        // Determine role (check localStorage for pending role from registration flow)
        const pendingRole = localStorage.getItem('casaseg_pending_role') as UserRole;
        localStorage.removeItem('casaseg_pending_role');

        const isSpecificAdmin = session.user.email === 'arongesono@outlook.es';
        const finalRole: UserRole = isSpecificAdmin ? 'admin' : (pendingRole || 'client');
        
        const metadata = session.user.user_metadata || {};
        const newProfile: User = {
          id: session.user.id,
          email: session.user.email,
          name: metadata.full_name || metadata.name || session.user.email.split('@')[0],
          role: finalRole,
          avatar: metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email)}&background=random`
        };

        const createdUser = await supabaseService.createUser(newProfile);
        if (createdUser) {
          userProfile = createdUser;
        } else {
          // Fallback if DB insert fails but Auth succeeds (should rarely happen)
           userProfile = newProfile;
        }
      }

      console.log('User profile loaded:', userProfile);
      setCurrentUser(userProfile);
    } catch (error) {
      console.error('CRITICAL: Error handling user session:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, error } = await supabaseService.signInWithEmail(email, password);
      if (error) throw error;
      if (!user) throw new Error('Login failed');
      // onAuthStateChange will handle the rest
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const registerWithEmail = async ({ email, password, name, role }: { email: string; password: string; name: string; role: UserRole }) => {
    setIsLoading(true);
    try {
      // Store role in localStorage just in case, though we pass it directly to signUp options usually
      localStorage.setItem('casaseg_pending_role', role);
      
      const { user, error } = await supabaseService.signUpWithEmail(email, password, {
        full_name: name,
        role: role, // Metadata for triggers
      });
      
      if (error) throw error;
      
      // If auto-confirm is enabled, onAuthStateChange picks it up.
      // If email confirmation is required, we should notify user.
      if (user && !user.email_confirmed_at) {
        // Just return, UI should show "check your email"
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    // No set loading here, because redirect happens immediately
    await supabaseService.signInWithGoogle();
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabaseService.signOut();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    
    // Optimistic update
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);

    try {
      await supabaseService.updateUser(currentUser.id, data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Revert if needed, but usually fine to keep local state for UX
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoading,
      loginWithEmail,
      registerWithEmail,
      signInWithGoogle,
      logout,
      updateProfile,
      users,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
