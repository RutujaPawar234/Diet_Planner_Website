import api from './api';

export const dashboardService = {
  get: (date) => api.get('/dashboard', { params: { date } }).then((res) => res.data),
};
