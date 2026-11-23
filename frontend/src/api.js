const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')
  .replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(status) {
    super(`La API devolvió HTTP ${status}.`);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, access, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (access) headers.Authorization = `Bearer ${access}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    signal,
  });
  if (!response.ok) throw new ApiError(response.status);
  return response;
}

export async function obtainTokens(credentials) {
  const response = await request('/api/token/', { method: 'POST', body: credentials });
  return response.json();
}

export async function getPrivateAccount(access, signal) {
  const response = await request('/api/privado', { access, signal });
  return response.json();
}

export async function refreshTokens(refresh, signal) {
  const response = await request('/api/token/refresh/', {
    method: 'POST',
    body: { refresh },
    signal,
  });
  return response.json();
}

export function revokeRefreshToken(refresh) {
  return request('/api/token/logout/', { method: 'POST', body: { refresh } });
}
