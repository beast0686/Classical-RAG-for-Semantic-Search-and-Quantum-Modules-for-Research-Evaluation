import axios from 'axios';

// Default to FastAPI's uvicorn port unless overridden via env.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL,
  timeout: 1000000_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalise error shape a bit
    if (error.response) {
      // eslint-disable-next-line no-console
      console.error('API error', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  },
);


