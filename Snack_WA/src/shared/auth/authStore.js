import { create } from 'zustand';

const TOKEN_KEY = 'snack_token';
const USER_KEY = 'snack_user';
const SESSION_EXPIRES_KEY = 'snack_session_expires_at';
export const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 phút

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

const readExpiresAt = () => {
  const val = localStorage.getItem(SESSION_EXPIRES_KEY);
  return val ? Number(val) : null;
};

// Kiểm tra xem phiên có bị quá hạn 15 phút lúc khởi động không
const getInitialToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = readExpiresAt();
  if (token && expiresAt && Date.now() > expiresAt) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_EXPIRES_KEY);
    return null;
  }
  return token;
};

export const useAuthStore = create((set) => ({
  token: getInitialToken(),
  user: getInitialToken() ? readUser() : null,
  sessionExpiresAt: getInitialToken() ? readExpiresAt() : null,
  isHydrating: Boolean(getInitialToken()),

  setSession: ({ token, ...user }) => {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt));
    set({ token, user, sessionExpiresAt: expiresAt, isHydrating: false });
  },

  extendSession: (newToken) => {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    }
    localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt));
    set((state) => ({
      token: newToken || state.token,
      sessionExpiresAt: expiresAt,
    }));
  },

  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_EXPIRES_KEY);
    set({ token: null, user: null, sessionExpiresAt: null, isHydrating: false });
  },

  finishHydrating: () => set({ isHydrating: false }),
}));
