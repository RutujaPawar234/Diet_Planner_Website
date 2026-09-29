import api from './api';

const plan = (res) => res.data.plan;

export const dietService = {
  list: (params) => api.get('/diet-plans', { params }).then((res) => res.data.plans),
  getByDate: (date) => api.get(`/diet-plans/date/${date}`).then(plan),
  create: (payload) => api.post('/diet-plans', payload).then(plan),
  generate: (date) => api.post('/diet-plans/generate', { date }).then(plan),
  update: (id, payload) => api.put(`/diet-plans/${id}`, payload).then(plan),
  remove: (id) => api.delete(`/diet-plans/${id}`),
  addEntry: (id, payload) => api.post(`/diet-plans/${id}/entries`, payload).then(plan),
  updateEntry: (id, entryId, payload) => api.patch(`/diet-plans/${id}/entries/${entryId}`, payload).then(plan),
  removeEntry: (id, entryId) => api.delete(`/diet-plans/${id}/entries/${entryId}`).then(plan),
};
