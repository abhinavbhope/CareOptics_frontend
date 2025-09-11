
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/doctor-appointments',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
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

export const bookDoctorAppointment = (appointmentData) => {
  return apiClient.post('/my-booking', appointmentData);
};

export const getMyDoctorAppointments = () => {
    return apiClient.get('/my');
};

export default apiClient;
