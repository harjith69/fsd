import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle errors uniformly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Auth endpoints
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Academic Years
export const academicYearsApi = {
  list: () => api.get('/academic-years'),
  getCurrent: () => api.get('/academic-years/current'),
};

// Departments
export const departmentsApi = {
  list: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
};

// Users
export const usersApi = {
  list: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Generic Activity Modules (teaching, publications, fdps, consultancy, patents)
export const activitiesApi = {
  list: (module, params) => api.get(`/${module}`, { params }),
  create: (module, data) => api.post(`/${module}`, data),
  update: (module, id, data) => api.put(`/${module}/${id}`, data),
  delete: (module, id) => api.delete(`/${module}/${id}`),
  submit: (module, id, remarks = '') => api.post(`/${module}/${id}/submit`, { remarks }),
  approve: (module, id, remarks = '') => api.post(`/${module}/${id}/approve`, { remarks }),
  reject: (module, id, remarks = '') => api.post(`/${module}/${id}/reject`, { remarks }),
};

// Upload
export const uploadApi = {
  uploadProof: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Analytics
export const analyticsApi = {
  getFaculty: (id, year) => api.get(`/analytics/faculty/${id}`, { params: { year } }),
  getDepartment: (id, year) => api.get(`/analytics/department/${id}`, { params: { year } }),
  getInstitution: (year) => api.get('/analytics/institution', { params: { year } }),
};

// Scoring Config
export const scoringApi = {
  getConfig: () => api.get('/scoring-config'),
  updateConfig: (data) => api.put('/scoring-config', data),
};
