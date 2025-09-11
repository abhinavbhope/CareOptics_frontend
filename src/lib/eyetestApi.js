
import axios from 'axios';

const eyeTestApiClient = axios.create({
  baseURL: '/api/eye-tests',
  headers: {
    'Content-Type': 'application/json',
  },
});

eyeTestApiClient.interceptors.request.use(
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

// --- External User Flow ---

export const sendExternalOtp = (email) => {
    return eyeTestApiClient.post('/external/send-otp', { email });
};

export const verifyExternalOtp = (email, otp) => {
    return eyeTestApiClient.post('/external/verify-otp', { email, otp });
};

export const registerAndTestExternal = (formData) => {
    return eyeTestApiClient.post('/external/register-and-test', formData);
};


// --- Admin Flow ---

export const getTestsForUserByEmail = (email) => {
    return eyeTestApiClient.get(`/admin/user/${email}/tests`);
};

export const createTestForUser = (email, testData) => {
    return eyeTestApiClient.post(`/admin/user/${email}/tests`, testData);
};

export const updateTestForUser = (email, testId, testData) => {
    return eyeTestApiClient.put(`/admin/user/${email}/tests/${testId}`, testData);
};

export const deleteTestForUser = (email, testId) => {
    return eyeTestApiClient.delete(`/admin/user/${email}/tests/${testId}`);
};


// --- Registered User Flow ---

export const getMyTestHistory = () => {
    return eyeTestApiClient.get('/my-history');
};

export const getMyLatestTest = () => {
    return eyeTestApiClient.get('/my-latest');
};
export const getMyHistoryByDateRange = (startDate, endDate) => {
    return eyeTestApiClient.get('/my-history/date-range', {
        params: { startDate, endDate }
    });
};
