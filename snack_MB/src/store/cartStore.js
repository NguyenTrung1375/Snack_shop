import { create } from 'zustand';
import { getCart } from '../api/cart';
import { useAuthStore } from './authStore';

export const useCartStore = create((set, get) => ({
  cartItems: [],
  cartCount: 0,
  isLoading: false,

  setCartItems: (items) => {
    const list = Array.isArray(items) ? items : [];
    const count = list.reduce((sum, item) => sum + (Number(item.soLuong) || 1), 0);
    set({ cartItems: list, cartCount: count });
  },

  fetchCart: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ cartItems: [], cartCount: 0 });
      return;
    }

    try {
      set({ isLoading: true });
      const data = await getCart();
      const list = Array.isArray(data) ? data : [];
      const count = list.reduce((sum, item) => sum + (Number(item.soLuong) || 1), 0);
      set({ cartItems: list, cartCount: count });
    } catch (e) {
      // Ignored if offline or unauthenticated
    } finally {
      set({ isLoading: false });
    }
  },

  incrementCount: (delta = 1) => {
    set((state) => ({ cartCount: Math.max(0, state.cartCount + delta) }));
  },
}));

