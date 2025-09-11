import axios from 'axios';

const callbackApiClient = axios.create({
  baseURL: '/api/callbacks',
  headers: { 'Content-Type': 'application/json' }
});

callbackApiClient.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const requestCallback = (payload) =>
  callbackApiClient.post('/request', payload);