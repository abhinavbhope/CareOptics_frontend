import axios from 'axios';

const userApiClient = axios.create({
  baseURL: '/api/admin/users',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
userApiClient.interceptors.request.use(
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


export const getAllUsers = () => {
  return userApiClient.get('/');
};

export const getUserDetails = (userId) => {
    return userApiClient.get(`/${userId}/details`);
};

export const updateUserRole = (userId, role) => {
  return userApiClient.put(`/${userId}/role`, { role });
};

export const deleteUser = (userId) => {
  return userApiClient.delete(`/${userId}`);
};