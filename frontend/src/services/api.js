/**
 * api.js — Base fetch utility used by services.
 *
 * All API calls should go through this module so that the base URL,
 * auth headers, and error normalisation are applied consistently.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * @param {string} path   - e.g. '/api/health'
 * @param {RequestInit} options - standard fetch options
 */
export async function apiFetch(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body.message || `HTTP error ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

