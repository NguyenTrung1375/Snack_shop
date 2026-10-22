import { create } from 'zustand';

const TOKEN_KEY = 'snack_token';
const USER_KEY = 'snack_user';
const readUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } };

export const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY), user: readUser(), isHydrating: Boolean(localStorage.getItem(TOKEN_KEY)),
  setSession: ({ token, ...user }) => { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); set({ token, user, isHydrating: false }); },
  setUser: (user) => { localStorage.setItem(USER_KEY, JSON.stringify(user)); set({ user }); },
  clearSession: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); set({ token: null, user: null, isHydrating: false }); },
  finishHydrating: () => set({ isHydrating: false }),
}));
