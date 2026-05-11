// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('p5_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('p5_token');
      localStorage.removeItem('p5_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login',    data),
  getMe:    ()     => api.get('/auth/me'),
};

export const feedbackAPI = {
  submit:           (data)   => api.post('/feedback',      data),
  getMySubmissions: (params) => api.get('/feedback/my',   { params }),
  getCategories:    ()       => api.get('/feedback/categories'),
  getDepartments:   ()       => api.get('/feedback/departments'),
};

export const adminAPI = {
  getSubmissions: (params)       => api.get('/admin/submissions',          { params }),
  updateStatus:   (id, status)   => api.put(`/admin/submissions/${id}/status`, { status }),
  getUsers:       ()             => api.get('/admin/users'),
};

export default api;