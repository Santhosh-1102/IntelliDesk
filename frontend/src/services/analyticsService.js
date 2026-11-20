import api from './api';

export const analyticsService = {
  getAdminAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getSlaBreaches: async (page = 0, size = 20) => {
    const response = await api.get('/admin/analytics/sla-breaches', {
      params: { page, size },
    });
    return response.data;
  },
};
