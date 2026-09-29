import api from './api';

export const adminService = {
  stats: () => api.get('/dashboard/admin').then((res) => res.data),
  users: (search) => api.get('/users', { params: search ? { search } : {} }).then((res) => res.data.users),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }).then((res) => res.data.user),
  deleteUser: (id) => api.delete(`/users/${id}`),
};
