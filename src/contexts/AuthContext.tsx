import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import * as supabaseService from '../services/supabaseService';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  login: (user: User) => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (user: User) => void;
  registerWithEmail: (user: Partial<User>, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Users are now fetched only when needed (e.g. searching or admin)
  // to avoid loading thousands of records on every app mount.


  // Listen for Supabase Auth changes
  useEffect(() => {
    // Initial session check
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
      }
    };
    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // If email is not confirmed, we don't set the local user
        if (session.user.app_metadata.provider === 'email' && !session.user.email_confirmed_at) {
          console.log('AuthContext: User email not confirmed yet');
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        const email = session.user.email;
        if (!email) {
          setIsLoading(false);
          return;
        }

        // Check if user exists in our DB
        let existingUser = users.find(u => u.email === email);
        
        // If users list not loaded yet, fetch from DB by email
        if (!existingUser) {
           const { data } = await supabase.from('users').select('*').eq('email', email).single();
           if (data) existingUser = data;
        }

        if (existingUser) {
          // Check if there's a pending role change (e.g. from owner selection)
          const pendingRole = localStorage.getItem('casaseg_pending_role') as any;
          localStorage.removeItem('casaseg_pending_role');

          const isSpecificAdmin = email === 'arongesono@outlook.es';
          const targetRole = isSpecificAdmin ? 'admin' : (pendingRole || existingUser.role);

          if (existingUser.role !== targetRole) {
            const updatedUser = { ...existingUser, role: targetRole };
            setCurrentUser(updatedUser);
            await supabaseService.updateUser(existingUser.id, { role: targetRole });
          } else {
            setCurrentUser(existingUser);
          }
        } else {
          // User doesn't exist in public.users, create them now.
          // This serves as a fallback for the database trigger.
          const isSpecificAdmin = email === 'arongesono@outlook.es';
          const pendingRole = localStorage.getItem('casaseg_pending_role') as any;
          localStorage.removeItem('casaseg_pending_role');
          
          const finalRole = isSpecificAdmin ? 'admin' : (pendingRole || 'client');
          const metadata = session.user.user_metadata || {};
          const fullName = metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'Usuario';
          const avatar = metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

          const newUser: User = {
            id: session.user.id,
            email: email,
            name: fullName,
            role: finalRole,
            avatar: avatar
          };

          try {
             // We use insert().select() with onConflict to be safe
             const { error: insertError } = await supabase.from('users').upsert(newUser, { onConflict: 'id' });
             if (insertError) {
               console.warn('Silent warning: Could not upsert user profile (it might already exist via trigger)', insertError);
             }
             setCurrentUser(newUser);
          } catch (createErr) {
             console.error('Error creating user profile fallback:', createErr);
             setCurrentUser(newUser);
          }
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // Handle specifically if session is checked but no change happened
        if (!session) setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [users]); // Re-run if users list changes (though logic handles missing users)

  // Update auth user in supabaseService whenever currentUser changes
  useEffect(() => {
    supabaseService.setAuthUser(currentUser);
  }, [currentUser]);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const { user } = await supabaseService.signInWithEmail(email, password);
      if (user && !user.email_confirmed_at) {
        throw new Error('VERIFY_EMAIL');
      }
    } catch (error: any) {
      if (error.message?.includes('Email not confirmed')) {
        throw new Error('VERIFY_EMAIL');
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    await supabaseService.signInWithGoogle();
  };

  const logout = async () => {
    await supabaseService.signOut();
    setCurrentUser(null);
  };

  const register = (user: User) => {
    setUsers(prev => [...prev, user]);
    setCurrentUser(user);
    supabaseService.createUser(user).catch(console.error);
  };

  const registerWithEmail = async (user: Partial<User>, password: string) => {
    await supabaseService.signUpWithEmail(user.email!, password, {
      full_name: user.name,
      role: user.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '')}&background=random`
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;

    try {
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

      try {
        await supabaseService.updateUser(currentUser.id, data);
      } catch (error) {
        console.error('Error updating user in backend:', error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      users, 
      isLoading,
      login, 
      loginWithEmail,
      signInWithGoogle, 
      logout, 
      register, 
      registerWithEmail,
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

