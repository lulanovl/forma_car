const TOKEN_KEY = 'fc_token';
const TOKEN_TS_KEY = 'fc_token_ts';
const USER_KEY = 'fc_user';
const TOKEN_TTL = 24 * 60 * 60 * 1000; // 24h

export function saveToken(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_TS_KEY, Date.now().toString());
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
}

export function getRole() {
  return getUser()?.role || null;
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const ts = parseInt(localStorage.getItem(TOKEN_TS_KEY) || '0', 10);
  if (!token || Date.now() - ts > TOKEN_TTL) {
    clearToken();
    return null;
  }
  return token;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_TS_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}
