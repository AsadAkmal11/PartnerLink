/**
 * api.js — Base fetch utility used by services.
 */

// Empty by default: requests go to /api on the same origin and the Vite proxy forwards them.
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'partnerlink_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * @param {string} path   - e.g. '/api/health'
 * @param {RequestInit} options - standard fetch options
 */
export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    const error = new Error(
      'Cannot reach the PartnerLink API. Make sure the backend is running (cd backend && npm run dev).',
    );
    error.status = 0;
    throw error;
  }

  // The proxy answers 502/503/504 when the backend is down.
  if ([502, 503, 504].includes(response.status)) {
    const error = new Error(
      'The PartnerLink API is not responding. Make sure the backend is running on port 4000.',
    );
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    if (body === null && response.status >= 500) {
      const error = new Error(
        'The PartnerLink API is not responding. Make sure the backend is running on port 4000.',
      );
      error.status = response.status;
      throw error;
    }
    const message = body?.detail
      ? Array.isArray(body.detail)
        ? body.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
        : body.detail
      : body?.message || `HTTP error ${response.status}`;
    const error = new Error(typeof message === 'string' ? message : 'Request failed');
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  health: () => apiFetch('/api/health'),
  login: (email, password) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  registerStudent: (payload) =>
    apiFetch('/api/auth/register/student', { method: 'POST', body: JSON.stringify(payload) }),
  registerProfessor: (payload) =>
    apiFetch('/api/auth/register/professor', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiFetch('/api/auth/me'),
  domains: (kind) => apiFetch(`/api/domains${kind ? `?kind=${encodeURIComponent(kind)}` : ''}`),
  updateStudentProfile: (payload) =>
    apiFetch('/api/profiles/student/me', { method: 'PUT', body: JSON.stringify(payload) }),
  updateProfessorProfile: (payload) =>
    apiFetch('/api/profiles/professor/me', { method: 'PUT', body: JSON.stringify(payload) }),
  students: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    const qs = q.toString();
    return apiFetch(`/api/students${qs ? `?${qs}` : ''}`);
  },
  professors: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    const qs = q.toString();
    return apiFetch(`/api/professors${qs ? `?${qs}` : ''}`);
  },
  projects: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    const qs = q.toString();
    return apiFetch(`/api/projects${qs ? `?${qs}` : ''}`);
  },
  createProject: (payload) => apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(payload) }),
  updateProject: (id, payload) =>
    apiFetch(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProject: (id) => apiFetch(`/api/projects/${id}`, { method: 'DELETE' }),
  recommendations: (limit = 12) => apiFetch(`/api/matches/recommendations?limit=${limit}`),
  approvals: (status) =>
    apiFetch(`/api/admin/approvals${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  approve: (id, note) =>
    apiFetch(`/api/admin/approvals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ note: note || null }),
    }),
  reject: (id, note) =>
    apiFetch(`/api/admin/approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ note: note || null }),
    }),
};
