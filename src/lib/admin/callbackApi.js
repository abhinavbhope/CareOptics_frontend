
import axios from 'axios';

const adminCallbackApiClient = axios.create({
  baseURL: '/api/admin/callbacks',
});

adminCallbackApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getCallbacks = () => {
    return adminCallbackApiClient.get('/');
};

export const getCallbackStats = () => {
    return adminCallbackApiClient.get('/stats');
};

export const markCallbackAsCompleted = (id) => {
    return adminCallbackApiClient.patch(`/${id}/complete`);
};

export const deleteCallback = (id) => {
    return adminCallbackApiClient.delete(`/${id}`);
};

export const getRevenueStats = (year) => {
    return adminCallbackApiClient.get('/revenue', { params: { year } });
};

export const getRecentCallbacks = () => {
    return adminCallbackApiClient.get('/recent');
};

    