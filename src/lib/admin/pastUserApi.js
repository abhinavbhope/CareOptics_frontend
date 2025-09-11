
import axios from 'axios';

const pastUserApiClient = axios.create({
  baseURL: '/api/admin/past-users',
  headers: {
    'Content-Type': 'application/json',
  },
});

pastUserApiClient.interceptors.request.use(
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

// --- Past User Record endpoints ---

export const createPastUser = (userData) => {
  return pastUserApiClient.post('/', userData);
};

export const updatePastUser = (publicId, userData) => {
  return pastUserApiClient.put(`/${publicId}`, userData);
};

export const deletePastUser = (publicId) => {
  return pastUserApiClient.delete(`/${publicId}`);
};

export const getPastUserById = (publicId) => {
    return pastUserApiClient.get(`/${publicId}`);
};

export const searchUsersByName = (name) => {
    return pastUserApiClient.get('/search', { params: { name } });
};

export const searchUserByPhone = (phone) => {
    return pastUserApiClient.get('/by-phone', { params: { phone } });
};

export const getAllPastUsers = () => {
    return pastUserApiClient.get('/');
}

// --- Eye Test endpoints for a specific past user ---

export const addEyeTestForPastUser = (publicId, testData) => {
  return pastUserApiClient.post(`/${publicId}/eye-tests`, testData);
};

export const updateEyeTestForPastUser = (testId, testData) => {
    return pastUserApiClient.put(`/eye-tests/${testId}`, testData);
};

export const deleteEyeTestForPastUser = (testId) => {
    return pastUserApiClient.delete(`/eye-tests/${testId}`);
};

export const getEyeTestsForPastUser = (publicId) => {
    return pastUserApiClient.get(`/${publicId}/eye-tests`);
};
