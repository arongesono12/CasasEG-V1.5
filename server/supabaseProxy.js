import express from 'express';;

export const supabaseProxyFetch = async (path, method = 'GET', body = null, query = '') => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY required in server env');

  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/${path}${query ? '?' + query : ''}`;
  const res = await fetch(endpoint, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase proxy error ${res.status}: ${text}`);
  }
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return text;
  }
};
