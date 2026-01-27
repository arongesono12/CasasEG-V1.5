import { supabase } from '../lib/supabase';
import { Property, User, Message } from '../types';

/**
 * UTILITIES
 */
const handleError = (error: any) => {
  if (error?.status === 429 || error?.code === '429') {
     window.dispatchEvent(new CustomEvent('app:rate-limit'));
  }
  console.error("Supabase Operation Error:", error);
  // Don't throw if it's just a 'PostgrestError', return null/empty in caller
  // But for Auth we generally want to throw.
};

/**
 * AUTHENTICATION
 */

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { user: data.user, session: data.session, error };
};

export const signUpWithEmail = async (email: string, password: string, metadata: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata // stored in user_metadata
    }
  });
  return { user: data.user, session: data.session, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Sign out error:', error);
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

/**
 * USER PROFILES (Database 'users' table)
 */

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116 is "Row not found" - ignore log for this
      console.warn('Error fetching user profile:', error);
    }
    return null;
  }
  return data as User;
};

// Renamed from createUser for clarity, but keeping alias if needed or just using this
export const createUser = async (user: User): Promise<User | null> => {
  const { data, error } = await supabase.from('users').upsert(user).select().single();
  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
  return data as User;
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data as User[];
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const { error } = await supabase.from('users').update(updates).eq('id', id);
  if (error) throw error;
};

// Legacy shim if something calls it, though we refactored AuthContext
export const setAuthUser = (_user: User | null) => {};

/**
 * PROPERTIES
 */

export const fetchProperties = async (): Promise<Property[]> => {
  const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
  return data || [];
};

export const createProperty = async (property: Partial<Property>): Promise<Property[]> => {
  const { data, error } = await supabase.from('properties').insert([property]).select();
  if (error) throw error;
  return data || [];
};

export const deleteProperty = async (id: string): Promise<void> => {
  const { error } = await supabase.from('properties').delete().match({ id });
  if (error) throw error;
};

export const updateProperty = async (id: string, updates: Partial<Property>): Promise<void> => {
  const { error } = await supabase.from('properties').update(updates).eq('id', id);
  if (error) throw error;
};

export const updatePropertyResource = updateProperty; // Alias for compatibility

/**
 * MESSAGES
 */

export const fetchMessages = async (): Promise<Message[]> => {
    const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
    return data || [];
};