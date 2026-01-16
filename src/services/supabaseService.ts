import { supabase } from './supabaseClient';
import { Property, User, Message } from '../types';

// Auth Methods
export const signInWithGoogle = async (redirectTo?: string) => {
  const finalRedirect = redirectTo || `${window.location.origin}/`;
  console.log('Initiating Google Auth with redirect:', finalRedirect);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: finalRedirect,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  if (error) {
    console.error('Supabase Google Auth Error:', error);
    throw error;
  }
  return data;
};

export const signUpWithEmail = async (email: string, password: string, metadata: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/`
    }
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Data Methods
export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data as any[];
};

export const fetchProperties = async (): Promise<Property[]> => {
  const { data, error } = await supabase.from('properties').select('*');
  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
  // Ensure fields are arrays if they are null
  return (data as any[]).map(p => ({
    ...p,
    imageUrls: p.imageUrls || [],
    features: p.features || [],
    waitingList: p.waitingList || []
  }));
};

export const fetchMessages = async (): Promise<Message[]> => {
  const { data, error } = await supabase.from('messages').select('*');
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data as any[];
};

export const createUser = async (u: Partial<User>) => {
  const { data, error } = await supabase.from('users').insert(u).select();
  if (error) throw error;
  return data;
};

export const createProperty = async (p: Partial<Property>) => {
  const { data, error } = await supabase.from('properties').insert(p).select();
  if (error) throw error;
  return data;
};

export const createMessage = async (m: Partial<Message>) => {
  const { data, error } = await supabase.from('messages').insert(m).select();
  if (error) throw error;
  return data;
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const updateProperty = async (id: string, updates: Partial<Property>) => {
  const { data, error } = await supabase.from('properties').update(updates).eq('id', id).select();
  if (error) throw error;
  return data;
};

// Helper to keep auth user in sync if needed, though supabase client handles it internally.
export const setAuthUser = (user: User | null) => {
  // No-op for now as supabase client manages session state
};

