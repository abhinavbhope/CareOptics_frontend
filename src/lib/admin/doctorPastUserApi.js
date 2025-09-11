
import axios from 'axios';

// This client is for admin-specific actions on "past users" (patients)
const adminPastUserApiClient = axios.create({
    baseURL: '/api/doctor-past-users',
    headers: {
      'Content-Type': 'application/json',
    },
});

adminPastUserApiClient.interceptors.request.use(
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


// This client is for the centralized admin search/list functionality
const adminUserListApiClient = axios.create({
    baseURL: '/api/admin/users',
    headers: {
      'Content-Type': 'application/json',
    },
});

adminUserListApiClient.interceptors.request.use(
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

// --- Patient Record Management (Past Users) ---

// Gets all non-registered patient records
export const getAllPastUsers = () => {
    return adminUserListApiClient.get('/past');
};

// Creates a new non-registered patient record
export const createPastUser = (patientData) => {
    return adminPastUserApiClient.post('/', patientData);
};

export const updatePastUser = (pastUserId, patientData) => {
    return adminPastUserApiClient.put(`/${pastUserId}`, patientData);
};

export const deletePastUser = (pastUserId) => {
    return adminPastUserApiClient.delete(`/${pastUserId}`);
};


// --- Appointment Management for Patients ---

// Gets all appointments for a specific patient
export const getAppointmentsForPastUser = (pastUserId) => {
    return adminPastUserApiClient.get(`/${pastUserId}/appointments`);
};

// Adds a new appointment to an existing patient's record
export const addAppointmentToPastUser = (pastUserId, appointmentData) => {
    return adminPastUserApiClient.post(`/${pastUserId}/appointments`, appointmentData);
};

export const deletePastUserAppointment = (pastUserId, appointmentId) => {
    return adminPastUserApiClient.delete(`/${pastUserId}/appointments/${appointmentId}`);
}


// --- Walk-in Flow ---
const walkInApiClient = axios.create({
  baseURL: '/api/doctor-appointments',
  headers: {
    'Content-Type': 'application/json',
  },
});

walkInApiClient.interceptors.request.use(
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

export const createWalkInAppointment = (walkInData) => {
    return walkInApiClient.post('/walk-in', walkInData);
};
