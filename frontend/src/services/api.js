import axios from 'axios';

const TOKEN_KEY = 'nutriplan_token';
export const UNAUTHORIZED_EVENT = 'nutriplan:unauthorized';

/** localStorage can throw (private mode, blocked storage) — never let that crash the app. */
export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

/**
 * Shared Axios instance for every request to the Express API.
 * The base URL comes from the VITE_API_URL environment variable.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every outgoing request.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap the { success, message, data } envelope and normalise errors.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;
    const message =
      payload?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The server took too long to respond. Please try again.'
        : status === 0
          ? 'Cannot reach the server. Check your connection or that the API is running.'
          : 'Something went wrong. Please try again.');

    // An expired/invalid session anywhere in the app logs the user out.
    const isAuthCall = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/register');
    if (status === 401 && !isAuthCall && tokenStorage.get()) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    return Promise.reject({ status, message, details: payload?.details || [] });
  }
);

export default api;
