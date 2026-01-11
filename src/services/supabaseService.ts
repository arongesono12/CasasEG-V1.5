import { supabaseFetch } from './supabaseClient';
import { Property, User, Message } from '../types';

const useApiProxy = import.meta.env.VITE_USE_API === 'true';

const apiFetch = async (path: string, opts: RequestInit = {}) => {
  if (useApiProxy) {
    const method = opts.method || 'GET';
    const headers = opts.headers || {};
    const body = opts.body || null;
    const res = await fetch(`/api/${path}`, {
      method,
      headers: { ...(headers as any), 'Content-Type': 'application/json' },
      body
    });
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    try { return text ? JSON.parse(text) : null; } catch { return text; }
  }
  return supabaseFetch(path, opts);
};

export const fetchUsers = async (): Promise<User[]> => {
  return (await apiFetch('users?select=*')) as User[];
};

export const fetchProperties = async (): Promise<Property[]> => {
  return (await apiFetch('properties?select=*')) as Property[];
};

export const fetchMessages = async (): Promise<Message[]> => {
  return (await apiFetch('messages?select=*')) as Message[];
};

export const createUser = async (u: Partial<User>) => {
  return await apiFetch('users', { method: 'POST', body: JSON.stringify(u) });
};

export const createProperty = async (p: Partial<Property>) => {
  return await apiFetch('properties', { method: 'POST', body: JSON.stringify(p) });
};

export const createMessage = async (m: Partial<Message>) => {
  return await apiFetch('messages', { method: 'POST', body: JSON.stringify(m) });
};
