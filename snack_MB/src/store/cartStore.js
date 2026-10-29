import { create } from 'zustand';
import { getCart } from '../api/cart';
import { useAuthStore } from './authStore';

export const useCartStore = create((set, get) => ({
  cartItems: [],
  cartCount: 0,
  isLoading: false,
  appliedComboVouchers: [],

  addComboVoucher: (combo) => {
    if (!combo) return;
    const vouchers = get().appliedComboVouchers || [];
    const existingIndex = vouchers.findIndex((v) => v.comboId === combo.id);
    const voucherObj = {
      comboId: combo.id,
      comboName: combo.name,
      savedAmount: combo.savedAmount || 0,
      voucherCode: `COMBO_${combo.savedAmount || 0}`,
      originalPrice: combo.originalPrice || 0,
      comboPrice: combo.comboPrice || 0,
      itemIds: (combo.items || []).map((i) => i.maSanPham),
    };
    if (existingIndex >= 0) {
      const next = [...vouchers];
      next[existingIndex] = voucherObj;
      set({ appliedComboVouchers: next });
    } else {
      set({ appliedComboVouchers: [...vouchers, voucherObj] });
    }
  },

  removeComboVoucher: (comboId) => {
    set((state) => ({
      appliedComboVouchers: (state.appliedComboVouchers || []).filter((v) => v.comboId !== comboId),
    }));
  },

  clearComboVouchers: () => {
    set({ appliedComboVouchers: [] });
  },

  getTotalComboSavings: () => {
    return (get().appliedComboVouchers || []).reduce((sum, v) => sum + (v.savedAmount || 0), 0);
  },

  getPrimaryComboVoucherCode: () => {
    const list = get().appliedComboVouchers || [];
    if (list.length === 0) return null;
    const totalSavings = list.reduce((sum, v) => sum + (v.savedAmount || 0), 0);
    return `COMBO_${totalSavings}`;
  },

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

