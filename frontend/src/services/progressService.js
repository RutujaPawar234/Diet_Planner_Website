import api from './api';

export const progressService = {
  list: (params) => api.get('/progress', { params }).then((res) => res.data.entries),
  create: (payload) => api.post('/progress', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/progress/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/progress/${id}`).then((res) => res.data),
};
