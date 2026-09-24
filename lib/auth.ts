import { api, setAccessToken, clearAccessToken, setRefreshToken, clearRefreshToken, getRefreshToken } from './api';
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
    if (res.refresh) {
      setRefreshToken(res.refresh);
    }
    return res.user;
  },

  async login(credentials: {
    username_or_email: string;
    password: string;
  }): Promise<User> {
    const res = await api.post<AuthResponse>('/api/auth/login/', credentials, { skipAuth: true });
    setAccessToken(res.access);
    if (res.refresh) {
      setRefreshToken(res.refresh);
    }
    return res.user;
  },

  async refresh(): Promise<string | null> {
    try {
      const storedRefresh = getRefreshToken();
      const res = await api.post<RefreshResponse>('/api/auth/refresh/', { refresh: storedRefresh || undefined }, { skipAuth: true, retry: false });
      setAccessToken(res.access);
      if (res.refresh) {
        setRefreshToken(res.refresh);
      }
      return res.access;
    } catch {
      clearAccessToken();
      clearRefreshToken();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      const storedRefresh = getRefreshToken();
      await api.post('/api/auth/logout/', { refresh: storedRefresh || undefined }, { retry: false });
    } catch {
      // Ignore logout errors
    } finally {
      clearAccessToken();
      clearRefreshToken();
    }
  },

  async me(): Promise<User> {
    return api.get<User>('/api/auth/me/');
  },

  async changePassword(data: {
    old_password: string;
    new_password: string;
    confirm_password?: string;
  }): Promise<{ detail: string }> {
    const res = await api.post<{ detail: string; access?: string; refresh?: string }>('/api/auth/change-password/', data);
    if (res.access) {
      setAccessToken(res.access);
    }
    if (res.refresh) {
      setRefreshToken(res.refresh);
    }
    return { detail: res.detail };
  },
};
