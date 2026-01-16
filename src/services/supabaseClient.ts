import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase config missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper for legacy manual fetch calls if needed, 
// though we should migrate to using the client directly.
export const supabaseFetch = async (path: string, opts: RequestInit = {}) => {
  const { data, error } = await supabase.functions.invoke(path, {
     method: (opts.method || 'GET') as any,
     headers: opts.headers as any, 
     body: opts.body
  });
  
  if (error) throw error;
  return data;
};

