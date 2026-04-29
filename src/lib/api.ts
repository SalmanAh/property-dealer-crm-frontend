import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Auto-attach JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('propcrm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('propcrm_token');
      localStorage.removeItem('propcrm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  signup: (data: object) => api.post('/auth/signup', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ── Leads ─────────────────────────────────────────────
export const leadsAPI = {
  getAll: (params?: object) => api.get('/leads', { params }),
  getById: (id: string) => api.get(`/leads/${id}`),
  create: (data: object) => api.post('/leads', data),
  update: (id: string, data: object) => api.put(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  assign: (id: string, agentId: string) => api.post(`/leads/${id}/assign`, { agentId }),
  addNote: (id: string, notes: string) => api.post(`/leads/${id}/note`, { notes }),
  getWhatsApp: (id: string) => api.get(`/leads/${id}/whatsapp`),
};

// ── Users ─────────────────────────────────────────────
export const usersAPI = {
  getAll: () => api.get('/users'),
  getAgents: () => api.get('/users/agents'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: object) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ── Analytics ─────────────────────────────────────────
export const analyticsAPI = {
  getOverview: (params?: object) => api.get('/analytics/overview', { params }),
  getAgentPerformance: () => api.get('/analytics/agents'),
  getRecentActivity: () => api.get('/analytics/recent-activity'),
};

// ── Follow-Ups ────────────────────────────────────────
export const followUpsAPI = {
  create: (data: object) => api.post('/follow-ups', data),
  getMyFollowUps: (agentId?: string) => api.get('/follow-ups/my', { params: agentId ? { agentId } : {} }),
  getSuggestions: (agentId?: string) => api.get('/follow-ups/suggestions', { params: agentId ? { agentId } : {} }),
  complete: (id: string) => api.put(`/follow-ups/${id}/complete`),
};

export default api;
