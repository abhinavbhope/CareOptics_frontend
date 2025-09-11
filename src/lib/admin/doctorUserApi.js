
import axios from 'axios';

const adminUserApiClient = axios.create({
  baseURL: '/api/admin/users',
  headers: {
    'Content-Type': 'application/json',
  },
});

adminUserApiClient.interceptors.request.use(
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


const pastUserApiClient = axios.create({
  baseURL: '/api/doctor-past-users',
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


// --- Registered User Endpoints ---

export const getAllRegisteredUsersWithAppointments = () => {
    return adminUserApiClient.get('/registered');
};

export const searchRegisteredUsers = (keyword) => {
    return adminUserApiClient.get('/registered/search', { params: { keyword } });
};


// --- Past User Endpoints ---

export const listAllPastUsers = () => {
    return pastUserApiClient.get('/');
};

export const searchPastUsers = (keyword) => {
    return pastUserApiClient.get('/search', { params: { keyword } });
};

export const getPastUserAppointments = (pastUserId) => {
    return pastUserApiClient.get(`/${pastUserId}/appointments`);
};

export const createAppointmentForPastUser = (pastUserId, appointmentData) => {
    return pastUserApiClient.post(`/${pastUserId}/appointments`, appointmentData);
}

export const updatePastUserAppointment = (appointmentId, appointmentData) => {
    return pastUserApiClient.put(`/appointments/${appointmentId}`, appointmentData);
};

export const deletePastUserAppointment = (appointmentId) => {
    return pastUserApiClient.delete(`/appointments/${appointmentId}`);
};
