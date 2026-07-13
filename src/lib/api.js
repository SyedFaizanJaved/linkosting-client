const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Auth is cookie-based (httpOnly). These endpoints ARE the auth handshake or
// are meant to fail as 401 without a session, so they must not trigger the
// refresh-then-retry flow (which would loop or mask the real result).
const NO_REFRESH = [
  '/api/auth/refresh', '/api/auth/login', '/api/auth/register',
  '/api/auth/forgot', '/api/auth/reset', '/api/auth/status', '/api/auth/logout',
];

function raw(path, { method = 'GET', body, headers } = {}) {
  return fetch(`${BASE}${path}`, {
    method,
    credentials: 'include', // send/receive the httpOnly auth cookies
    headers: { 'content-type': 'application/json', 'x-requested-with': 'fetch', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function toLogin() {
  if (window.location.pathname !== '/login') window.location.href = '/login';
}

export async function api(path, opts = {}) {
  let res = await raw(path, opts);

  // Access cookie expired → try one silent refresh, then replay the request.
  if (res.status === 401 && !NO_REFRESH.some(p => path.startsWith(p))) {
    const refreshed = await raw('/api/auth/refresh', { method: 'POST' });
    if (refreshed.ok) {
      res = await raw(path, opts);
    } else {
      if (path !== '/api/auth/me') toLogin(); // Guard handles /me itself
      throw new Error('Your session expired. Please sign in again.');
    }
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
