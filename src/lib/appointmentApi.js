import axios from 'axios';

const appointmentApiClient = axios.create({
  baseURL: '/api/appointments',
  headers: {
    'Content-Type': 'application/json',
  },
});

appointmentApiClient.interceptors.request.use(
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


export const requestAppointment = (appointmentData) => {
  return appointmentApiClient.post('/book', appointmentData);
};

export const getUserAppointments = () => {
    return appointmentApiClient.get('/user/me');
};

export const getAvailableSlots = (date) => {
    return appointmentApiClient.get(`/available-slots?date=${date}`);
};
