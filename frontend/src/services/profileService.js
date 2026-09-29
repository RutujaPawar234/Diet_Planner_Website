import api from './api';

export const profileService = {
  /** Resolves to null when the user has not completed onboarding yet (404). */
  get: () =>
    api
      .get('/profile')
      .then((res) => res.data.profile)
      .catch((err) => {
        if (err.status === 404) return null;
        throw err;
      }),
  save: (payload) => api.put('/profile', payload).then((res) => res.data.profile),
};
