import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/auth', // Use the proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendOtp = (emailData) => {
    return apiClient.post('/send-otp', emailData);
};

export const verifyOtp = (otpData) => {
    return apiClient.post('/verify-otp', otpData);
};

export const registerUser = (userData) => {
  return apiClient.post('/register', userData);
};

export const loginUser = (credentials) => {
  return apiClient.post('/login', credentials);
};

export const forgotPassword = (emailData) => {
    return apiClient.post('/forgot-password', emailData);
};

export const resetPassword = (passwordData) => {
    return apiClient.post('/reset-password', passwordData);
};

export const updatePassword = (passwordData) => {
    return apiClient.post('/update-password', passwordData);
};


// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
  (config) => {
    // safe-guard: only run in the browser
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

export default apiClient;
