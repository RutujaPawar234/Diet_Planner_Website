import api from './api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
  logout: () => api.post('/auth/logout'),
  updateAccount: (payload) => api.patch('/users/me', payload).then((res) => res.data.user),
};
