
import axios from 'axios';

const adminAppointmentApiClient = axios.create({
  baseURL: '/api/appointments',
  headers: {
    'Content-Type': 'application/json',
  },
});
adminAppointmentApiClient.interceptors.request.use(
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


export const getAppointmentSummary = () => {
    return adminAppointmentApiClient.get('/summary');
};

export const getAppointmentsByDate = (date) => {
    return adminAppointmentApiClient.get(`/by-date`, { params: { date } });
};

export const getAppointmentStats = () => {
    return adminAppointmentApiClient.get('/by-reason');
};
export const getRecentAppointments = () => {
    return adminAppointmentApiClient.get('/recent');
};

    