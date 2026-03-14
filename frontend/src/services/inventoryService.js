import api from './api';

export const inventoryService = {
  getReceipts: async () => {
    try {
      const response = await api.get('/receipts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch receipts', error);
      throw error;
    }
  },
  
  createReceipt: async (data) => {
    try {
      const response = await api.post('/receipts', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create receipt', error);
      throw error;
    }
  },

  getDeliveries: async () => {
    try {
      const response = await api.get('/deliveries');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch deliveries', error);
      throw error;
    }
  },
  
  createDelivery: async (data) => {
    try {
      const response = await api.post('/deliveries', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create delivery', error);
      throw error;
    }
  },

  getTransfers: async () => {
    try {
      const response = await api.get('/transfers');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transfers', error);
      throw error;
    }
  },
  
  createTransfer: async (data) => {
    try {
      const response = await api.post('/transfers', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create transfer', error);
      throw error;
    }
  },

  getStockLedger: async () => {
    try {
      const response = await api.get('/stock/ledger');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stock ledger', error);
      throw error;
    }
  }
};
