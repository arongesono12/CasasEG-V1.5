export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return { url, key };
};

export const supabaseFetch = async (path: string, opts: RequestInit = {}) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) throw new Error('Supabase config missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');

  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/${path}`;
  const headers: Record<string, string> = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  const res = await fetch(endpoint, {
    ...opts,
    headers: { ...(opts.headers || {}), ...headers }
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase request failed ${res.status} ${res.statusText}: ${body}`);
  }

  // For insert/update that return no-body, return empty
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return text;
  }
};
