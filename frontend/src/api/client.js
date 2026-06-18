import { getToken, clearToken } from '../utils/auth.js';
import { getCarwashSlug } from '../utils/tenant.js';

const BASE = '/api';

async function request(path, options = {}) {
  const token = getToken();
  // FormData (file uploads) must keep the browser-set multipart boundary, so we
  // don't force a JSON Content-Type in that case.
  const isForm = options.body instanceof FormData;
  const headers = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    // Tells the backend which carwash this site belongs to (public routes).
    // Admin routes still take the tenant from the JWT, so this is harmless there.
    'x-carwash-slug': getCarwashSlug(),
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (path, body)   => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
};
