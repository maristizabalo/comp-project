import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_COMPLEMENTARIO_API || "http://localhost:8000/api",
  timeout: 180000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  config.headers.Authorization = token ? `Bearer ${token}` : '';
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);