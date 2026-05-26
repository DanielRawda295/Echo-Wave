import axios from 'axios';

/**
 * Axios HTTP Client Configuration for REST API
 * 
 * This instance handles all REST API calls to the backend.
 * GraphQL can be added later as a separate client.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const tokenRaw = localStorage.getItem('token') || sessionStorage.getItem('token');
    const token = (tokenRaw || '').trim();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/google-login') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password');

    // Only redirect on 401s for protected requests (ones that carried a token)
    const hadAuthHeader =
      !!error.config?.headers?.Authorization ||
      !!localStorage.getItem('token') ||
      !!sessionStorage.getItem('token');

    if (status === 401 && hadAuthHeader && !isAuthEndpoint) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?next=${next}`;
    }
    return Promise.reject(error);
  }
);

/**
 * GraphQL client (for future implementation)
 * This can be enabled when you add GraphQL to backend
 */
export const graphqlClient = {
  query: async (query: string, variables?: any) => {
    try {
      const response = await api.post('/graphql', {
        query,
        variables,
      });
      return response.data;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  },
  
  mutate: async (mutation: string, variables?: any) => {
    try {
      const response = await api.post('/graphql', {
        query: mutation,
        variables,
      });
      return response.data;
    } catch (error) {
      console.error('GraphQL mutation error:', error);
      throw error;
    }
  },
};

export default api;
