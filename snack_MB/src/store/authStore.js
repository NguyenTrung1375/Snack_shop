import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@snackshop_auth';

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  isLoading: true,

  initAuth: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({ token: parsed.token, user: parsed.user, isLoading: false });
        return;
      }
    } catch (e) {
      console.warn('Failed to load auth state:', e);
    }
    set({ token: null, user: null, isLoading: false });
  },

  setAuth: async (token, user) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
      set({ token, user });
    } catch (e) {
      console.warn('Failed to save auth state:', e);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ token: null, user: null });
    } catch (e) {
      console.warn('Failed to remove auth state:', e);
    }
  },

  updateUser: async (updatedUser) => {
    try {
      const currentToken = get().token;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: currentToken, user: updatedUser }));
      set({ user: updatedUser });
    } catch (e) {
      console.warn('Failed to update user state:', e);
    }
  },
}));

