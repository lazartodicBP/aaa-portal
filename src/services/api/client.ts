import axios from 'axios';
import { AuthService } from './auth.service';

export const apiClient = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add session ID
apiClient.interceptors.request.use(
  async (config) => {
    // Ensure we have a session
    const sessionId = await AuthService.ensureSession();

    if (sessionId) {
      config.headers['sessionid'] = sessionId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401, try to re-authenticate once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear the old session
        AuthService.clearSession();

        // Get a new session
        const sessionId = await AuthService.ensureSession();

        if (sessionId) {
          // Retry the original request with new session
          originalRequest.headers['sessionid'] = sessionId;
          return apiClient(originalRequest);
        }
      } catch (authError) {
        console.error('Re-authentication failed:', authError);
      }
    }

    // Log the error but don't redirect
    if (error.response?.data?.message === 'Invalid session ID') {
      console.error('Invalid session ID, will retry on next request');
      AuthService.clearSession();
    }

    return Promise.reject(error);
  }
);