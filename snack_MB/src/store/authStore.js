import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@snackshop_auth';
export const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 phút phiên làm việc

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  sessionExpiresAt: null,
  isLoading: true,

  initAuth: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Kiểm tra phiên làm việc 15 phút khi mở ứng dụng
        if (parsed.sessionExpiresAt && Date.now() > parsed.sessionExpiresAt) {
          console.log('[Auth] Phiên làm việc 15 phút đã hết hạn, đăng xuất tự động.');
          await AsyncStorage.removeItem(STORAGE_KEY);
          set({ token: null, user: null, sessionExpiresAt: null, isLoading: false });
          return;
        }

        set({ 
          token: parsed.token, 
          user: parsed.user, 
          sessionExpiresAt: parsed.sessionExpiresAt || (Date.now() + SESSION_DURATION_MS), 
          isLoading: false 
        });
        return;
      }
    } catch (e) {
      console.warn('Failed to load auth state:', e);
    }
    set({ token: null, user: null, sessionExpiresAt: null, isLoading: false });
  },

  setAuth: async (token, user) => {
    try {
      const sessionExpiresAt = Date.now() + SESSION_DURATION_MS;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user, sessionExpiresAt }));
      set({ token, user, sessionExpiresAt });
    } catch (e) {
      console.warn('Failed to save auth state:', e);
    }
  },

  extendSession: async (newToken) => {
    try {
      const sessionExpiresAt = Date.now() + SESSION_DURATION_MS;
      const currentToken = newToken || get().token;
      const currentUser = get().user;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: currentToken, user: currentUser, sessionExpiresAt }));
      set({ token: currentToken, sessionExpiresAt });
    } catch (e) {
      console.warn('Failed to extend session:', e);
    }
  },

  isSessionExpired: () => {
    const { sessionExpiresAt, token } = get();
    if (!token) return false;
    return Boolean(sessionExpiresAt && Date.now() > sessionExpiresAt);
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ token: null, user: null, sessionExpiresAt: null });
    } catch (e) {
      console.warn('Failed to remove auth state:', e);
    }
  },

  updateUser: async (updatedUser) => {
    try {
      const currentToken = get().token;
      const sessionExpiresAt = get().sessionExpiresAt;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: currentToken, user: updatedUser, sessionExpiresAt }));
      set({ user: updatedUser });
    } catch (e) {
      console.warn('Failed to update user state:', e);
    }
  },
}));

