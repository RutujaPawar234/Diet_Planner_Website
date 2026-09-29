import api from './api';

// Drop empty filters so the query string stays clean.
const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));

export const mealService = {
  list: (params = {}) => api.get('/meals', { params: clean(params) }).then((res) => res.data),
  get: (id) => api.get(`/meals/${id}`).then((res) => res.data.meal),
  create: (payload) => api.post('/meals', payload).then((res) => res.data.meal),
  update: (id, payload) => api.put(`/meals/${id}`, payload).then((res) => res.data.meal),
  remove: (id) => api.delete(`/meals/${id}`),
};
