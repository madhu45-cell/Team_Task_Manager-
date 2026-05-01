import axios from 'axios';

// IMPORTANT: Updated baseURL to include /api - DO NOT REMOVE
const API_BASE_URL = 'https://team-task-manager-3-i7i1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;