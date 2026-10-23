const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const K = 'ew_session';

// Pilot choice: tokens in localStorage. Move to httpOnly cookies before a wider rollout.
export const session = {
  get() { try { return JSON.parse(localStorage.getItem(K)); } catch { return null; } },
  set(s) { localStorage.setItem(K, JSON.stringify(s)); },
  clear() { localStorage.removeItem(K); },
};

async function send(path, { method = 'GET', body, form }, token) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  return fetch(`${BASE}${path}`, { method, headers, body: form || (body && JSON.stringify(body)) });
}

export async function api(path, opts = {}) {
  let s = session.get();
  let res = await send(path, opts, s?.accessToken);

  if (res.status === 401 && s?.refreshToken && path !== '/auth/login') {
    const r = await send('/auth/refresh', { method: 'POST', body: { refreshToken: s.refreshToken } });
    if (r.ok) {
      s = { ...s, ...(await r.json()).data };
      session.set(s);
      res = await send(path, opts, s.accessToken);
    } else {
      session.clear();
      window.location.href = '/';
    }
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = json.details?.map((d) => `${d.path}: ${d.message}`).join('; ');
    throw new Error(detail || json.message || `Request failed (${res.status})`);
  }
  return json;
}
