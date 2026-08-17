import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 50;

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('auth/login', data),
  register: (data) => api.post('auth/register', data),
  me: () => api.get('auth/me'),
  changePassword: (data) => api.post('auth/change-password', data),
};

export const userAPI = {
  getAll: async (page = 0, size = 20) => {
    const key = `users_${page}_${size}`;
    const cached = getCached(key);
    if (cached) return cached;
    const res = await api.get(`users?page=${page}&size=${size}`);
    setCache(key, res);
    return res;
  },
  getByRole: (role, page = 0) => api.get(`users/role/${role}?page=${page}`),
  getById: (id) => api.get(`users/${id}`),
  update: (id, data) => api.put(`users/${id}`, data),
  toggleStatus: (id) => api.patch(`users/${id}/toggle-status`),
  delete: (id) => api.delete(`users/${id}`),
};

export const doctorAPI = {
  getAll: async (page = 0, size = 20) => {
    const key = `doctors_${page}_${size}`;
    const cached = getCached(key);
    if (cached) return cached;
    const res = await api.get(`doctors?page=${page}&size=${size}`);
    setCache(key, res);
    return res;
  },
  getById: (id) => api.get(`doctors/${id}`),
  getByUserId: (userId) => api.get(`doctors/user/${userId}`),
  getBySpecialization: (spec, page = 0) => api.get(`doctors/specialization/${spec}?page=${page}`),
  search: (name, page = 0) => api.get(`doctors/search?name=${name}&page=${page}`),
  getSpecializations: () => api.get('doctors/specializations'),
  create: (data) => api.post('doctors', data),
  update: (id, data) => api.put(`doctors/${id}`, data),
  updateStatus: (id, status) => api.patch(`doctors/${id}/status?status=${status}`),
};

// Patient APIs
export const patientAPI = {
  getAll: (page = 0, size = 20) => api.get(`patients?page=${page}&size=${size}`),
  getById: (id) => api.get(`patients/${id}`),
  getByUserId: (userId) => api.get(`patients/user/${userId}`),
  search: (name, page = 0) => api.get(`patients/search?name=${name}&page=${page}`),
  create: (data) => api.post('patients', data),
  update: (id, data) => api.put(`patients/${id}`, data),
  updateStatus: (id, status) => api.patch(`patients/${id}/status?status=${status}`),
};

// Appointment APIs
export const appointmentAPI = {
  getAll: (page = 0, size = 20) => api.get(`appointments?page=${page}&size=${size}`),
  getById: (id) => api.get(`appointments/${id}`),
  getByPatient: (patientId, page = 0) => api.get(`appointments/patient/${patientId}?page=${page}`),
  getByDoctor: (doctorId, page = 0) => api.get(`appointments/doctor/${doctorId}?page=${page}`),
  getDoctorSchedule: (doctorId, date) => api.get(`appointments/doctor/${doctorId}/date/${date}`),
  getByStatus: (status, page = 0) => api.get(`appointments/status/${status}?page=${page}`),
  create: (data) => api.post('appointments', data),
  updateStatus: (id, data) => api.patch(`appointments/${id}/status`, data),
  cancel: (id) => api.delete(`appointments/${id}`),
};

// Medical Record APIs
export const medicalRecordAPI = {
  getById: (id) => api.get(`medical-records/${id}`),
  getByAppointment: (appointmentId) => api.get(`medical-records/appointment/${appointmentId}`),
  getByPatient: (patientId, page = 0) => api.get(`medical-records/patient/${patientId}?page=${page}`),
  getByDoctor: (doctorId, page = 0) => api.get(`medical-records/doctor/${doctorId}?page=${page}`),
  create: (data) => api.post('medical-records', data),
  update: (id, data) => api.put(`medical-records/${id}`, data),
};

// Bill APIs
export const billAPI = {
  getAll: (page = 0, size = 20) => api.get(`bills?page=${page}&size=${size}`),
  getById: (id) => api.get(`bills/${id}`),
  getByPatient: (patientId, page = 0) => api.get(`bills/patient/${patientId}?page=${page}`),
  getByStatus: (status, page = 0) => api.get(`bills/status/${status}?page=${page}`),
  create: (data) => api.post('bills', data),
  addPayment: (billId, data) => api.post(`bills/${billId}/payments`, data),
};

// Dashboard APIs
export const dashboardAPI = {
  getAdmin: () => api.get('dashboard/admin'),
};

export default api;
