import { create } from 'zustand';
import api from '../api/axios.js';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('rojabiyyaah_user') || 'null'),
  accessToken: localStorage.getItem('rojabiyyaah_token') || null,
  isAuthenticated: !!localStorage.getItem('rojabiyyaah_token'),
  isLoading: true,

  setAccessToken: (token) => {
    localStorage.setItem('rojabiyyaah_token', token);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
    set({ accessToken: token, isAuthenticated: !!token });
  },

  setUser: (user) => {
    localStorage.setItem('rojabiyyaah_user', JSON.stringify(user));
    set({ user });
  },

  login: async ({ usernameOrEmail, password }) => {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    const { user, accessToken } = res.data.data;

    localStorage.setItem('rojabiyyaah_token', accessToken);
    localStorage.setItem('rojabiyyaah_user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });

    return user;
  },

  register: async (payload) => {
    const res = await api.post('/auth/register', payload);
    const { user, accessToken } = res.data.data;

    localStorage.setItem('rojabiyyaah_token', accessToken);
    localStorage.setItem('rojabiyyaah_user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });

    return user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('rojabiyyaah_token');
      localStorage.removeItem('rojabiyyaah_user');
      delete api.defaults.headers.common['Authorization'];
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('rojabiyyaah_token');
    if (!token) {
      delete api.defaults.headers.common['Authorization'];
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const res = await api.get('/auth/me');
      const user = res.data.data;
      localStorage.setItem('rojabiyyaah_user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('rojabiyyaah_token');
      localStorage.removeItem('rojabiyyaah_user');
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

