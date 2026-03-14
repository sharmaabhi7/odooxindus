import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data.data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });
};

export const useStocks = () => {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: async () => {
      const { data } = await api.get('/stock');
      return data.data;
    },
  });
};

export const useMoveHistory = (params = {}) => {
  return useQuery({
    queryKey: ['move-history', params],
    queryFn: async () => {
      const { data } = await api.get('/stock/ledger', { params });
      return data.data;
    },
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data.data.products;
    },
  });
};
export const useReceipts = () => {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      const { data } = await api.get('/receipts');
      return data.data.receipts;
    },
  });
};

export const useDeliveries = () => {
  return useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const { data } = await api.get('/deliveries');
      return data.data.deliveries;
    },
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data } = await api.get('/suppliers');
      return data.data;
    },
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await api.get('/locations');
      return data.data;
    },
  });
};

export const useAdjustments = () => {
  return useQuery({
    queryKey: ['adjustments'],
    queryFn: async () => {
      const { data } = await api.get('/stock/adjust');
      return data.data;
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    },
  });
};
