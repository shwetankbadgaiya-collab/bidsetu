import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE });

// JWT interceptor: attach token from localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: on 401, redirect to login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
};

export const tendersAPI = {
  create: (data) => api.post('/tenders', data),
  getAll: () => api.get('/tenders'),
  getById: (id) => api.get(`/tenders/${id}`),
};

export const bidsAPI = {
  create: (data) => api.post('/bids', data),
  getAll: () => api.get('/bids'),
  getById: (id) => api.get(`/bids/${id}`),
};

export const documentsAPI = {
  upload: (formData) => api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  process: (data) => api.post('/documents/process', data),
  getById: (id) => api.get(`/documents/${id}`),
};

export const verificationAPI = {
  run: (data) => api.post('/verification/run', data),
  getByBid: (bidId) => api.get(`/verification/${bidId}`),
};

export const complianceAPI = {
  analyze: (data) => api.post('/compliance/analyze', data),
  getByBid: (bidId) => api.get(`/compliance/${bidId}`),
};

export const riskAPI = {
  analyze: (data) => api.post('/risk/analyze', data),
  getByBid: (bidId) => api.get(`/risk/${bidId}`),
};

export const officerAPI = {
  submitDecision: (data) => api.post('/officer/decision', data),
  getDecisions: (bidId) => api.get(`/officer/decisions/${bidId}`),
};

export const auditAPI = {
  getByBid: (bidId) => api.get(`/audit/${bidId}`),
  getAll: () => api.get('/audit'),
};

export default api;
