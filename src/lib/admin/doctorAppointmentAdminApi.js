
import axios from 'axios';

// This client is for admin-specific user actions
const adminApiClient = axios.create({
    baseURL: '/api/admin/users',
    headers: {
      'Content-Type': 'application/json',
    },
});

adminApiClient.interceptors.request.use(
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


// This client handles general appointment actions
const appointmentApiClient = axios.create({
  baseURL: '/api/doctor-appointments',
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


// --- Registered User Appointment Flow ---

export const getAllRegisteredUsers = () => {
    return adminApiClient.get('/registered');
}

export const searchRegisteredUsers = (keyword) => {
    return adminApiClient.get(`/registered/search`, { params: { keyword } });
}

export const getAppointmentsForRegisteredUser = (userId) => {
    return appointmentApiClient.get(`/user/${userId}`);
}

export const createAppointmentForRegisteredUser = (appointmentData) => {
    return appointmentApiClient.post('/admin', appointmentData);
};

export const updateAppointmentForUser = (appointmentId, appointmentData) => {
    return appointmentApiClient.put(`/${appointmentId}`, appointmentData);
}

export const deleteAppointmentForUser = (appointmentId) => {
    return appointmentApiClient.delete(`/${appointmentId}`);
}
