const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getToken = () => localStorage.getItem('token');
export const setToken = t => localStorage.setItem('token', t);
export const clearToken = () => localStorage.removeItem('token');

export async function api(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(getToken() ? { authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 && !path.startsWith('/api/auth')) {
    clearToken();
    window.location.href = '/login';
    throw new Error('session expired');
  }
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function qs(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj || {})) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : '';
}
