import axios from 'axios';
import { getMockResponse } from './mockResolver';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for injecting JWT token
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

// Response interceptor for handling 401 token expiration and offline mock fallback
api.interceptors.response.use(
  (response) => {
    // If response is HTML (e.g. Vercel SPA fallback rewrite when API endpoint doesn't exist), fallback to mock data
    if (typeof response.data === 'string' && (response.data.includes('<!doctype') || response.data.includes('<!DOCTYPE') || response.data.includes('<html'))) {
      const mockData = getMockResponse(response.config.url || '', response.config.method || 'get');
      return {
        ...response,
        data: mockData,
        status: 200,
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          if (res.data.accessToken) {
            localStorage.setItem('token', res.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }

    // Fallback to mock data if network error or 404
    if (originalRequest && (!error.response || error.response.status === 404 || error.response.status >= 500)) {
      const mockData = getMockResponse(originalRequest.url || '', originalRequest.method || 'get', originalRequest.data);
      return Promise.resolve({
        data: mockData,
        status: 200,
        statusText: 'OK (Mock Fallback)',
        headers: {},
        config: originalRequest,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
