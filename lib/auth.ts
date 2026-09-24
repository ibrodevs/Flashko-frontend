import { api, setAccessToken, clearAccessToken } from './api';
import { User, AuthResponse, RefreshResponse } from '@/types';

export const auth = {
  async register(data: {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
  }): Promise<User> {
    const res = await api.post<AuthResponse>('/api/auth/register/', data, { skipAuth: true });
    setAccessToken(res.access);
    return res.user;
  },

  async login(credentials: {
    username_or_email: string;
    password: string;
  }): Promise<User> {
    const res = await api.post<AuthResponse>('/api/auth/login/', credentials, { skipAuth: true });
    setAccessToken(res.access);
    return res.user;
  },

  async refresh(): Promise<string | null> {
    try {
      const res = await api.post<RefreshResponse>('/api/auth/refresh/', {}, { skipAuth: true, retry: false });
      setAccessToken(res.access);
      return res.access;
    } catch {
      clearAccessToken();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout/', {}, { retry: false });
    } catch {
      // Ignore logout errors
    } finally {
      clearAccessToken();
    }
  },

  async me(): Promise<User> {
    return api.get<User>('/api/auth/me/');
  },
};
