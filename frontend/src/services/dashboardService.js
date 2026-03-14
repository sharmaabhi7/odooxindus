import api from './api';

export const dashboardService = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
      throw error;
    }
  },
  
  getInventoryTrend: async () => {
    try {
      const response = await api.get('/dashboard/inventory-trend');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch inventory trend', error);
      throw error;
    }
  }
};
