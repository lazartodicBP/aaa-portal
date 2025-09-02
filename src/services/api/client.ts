import axios from 'axios';
import { AuthService } from './auth.service';

export const apiClient = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const sessionId = await AuthService.ensureSession();
    if (sessionId) {
      config.headers!['sessionid'] = sessionId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  // Improved response handling - only unwrap if data exists
  (response) => {
    // If response.data exists and is not null/undefined, return it
    // Otherwise return the full response (for cases where the API doesn't wrap in .data)
    return response.data !== undefined && response.data !== null
      ? response.data
      : response;
  },
  async (error) => {
    const originalRequest = error.config;
    // on 401, clear and retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      AuthService.clearSession();
      try {
        const sessionId = await AuthService.ensureSession();
        if (sessionId) {
          originalRequest.headers['sessionid'] = sessionId;
          return apiClient(originalRequest);
        }
      } catch {
        console.error('Re-authentication failed');
      }
    }
    // on invalid session
    if (error.response?.data?.message === 'Invalid session ID') {
      console.error('Invalid session ID, will retry on next request');
      AuthService.clearSession();
    }
    return Promise.reject(error);
  }
);