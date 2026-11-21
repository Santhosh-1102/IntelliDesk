import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  // Fallback if Render Blueprint passed the internal docker hostname or if unset in production
  if (!envUrl || envUrl === 'intellidesk-backend' || !envUrl.includes('.')) {
    if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
      return 'https://intellidesk-backend-sbkn.onrender.com/api/v1';
    }
    return '/api/v1';
  }

  const formatted = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
  return `${formatted.replace(/\/$/, '')}/api/v1`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if already on login/register
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
