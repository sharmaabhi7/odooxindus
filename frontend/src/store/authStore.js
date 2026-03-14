import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (email, password, slug) => {
    try {
      const response = await api.post('/auth/login', { email, password, slug });
      const { user, token } = response.data.data || response.data;
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data || response.data;
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      console.error('Signup failed', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    
    try {
      // In a real app, there might be a /auth/me endpoint. Assumed here.
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));

export default useAuthStore;
