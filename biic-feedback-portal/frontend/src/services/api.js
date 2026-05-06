// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT from localStorage to every request ────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('biic_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-logout on 401 ───────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('biic_token');
      localStorage.removeItem('biic_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ══ Auth ═════════════════════════════════════════════════════
export const authAPI = {
  register: (data)   => api.post('/auth/register', data),
  login:    (data)   => api.post('/auth/login',    data),
  getMe:    ()       => api.get('/auth/me'),
};

// ══ Feedback (user) ══════════════════════════════════════════
export const feedbackAPI = {
  submit:          (data)   => api.post('/feedback', data),
  getCategories:   ()       => api.get('/feedback/categories'),
  getDepartments:  ()       => api.get('/feedback/departments'),
};

// ══ Admin ════════════════════════════════════════════════════
export const adminAPI = {
  getSubmissions: (params) => api.get('/admin/submissions', { params }),
  getSubmission:  (id)     => api.get(`/admin/submissions/${id}`),
  updateStatus:   (id, status) => api.put(`/admin/submissions/${id}/status`, { status }),
  getUsers:       ()       => api.get('/admin/users'),
};

export default api;
