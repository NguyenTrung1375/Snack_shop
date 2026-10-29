import { create } from 'zustand';

const COMBO_STORAGE_KEY = 'snack_applied_combo_vouchers';

const loadSavedVouchers = () => {
  try {
    const data = localStorage.getItem(COMBO_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveVouchers = (vouchers) => {
  try {
    localStorage.setItem(COMBO_STORAGE_KEY, JSON.stringify(vouchers));
  } catch (err) {
    console.warn('Failed to save combo vouchers to localStorage:', err);
  }
};

export const useComboCartStore = create((set, get) => ({
  appliedComboVouchers: loadSavedVouchers(),

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
      discountPercent: combo.discountPercent || 0,
      itemIds: (combo.items || []).map((i) => i.maSanPham),
      items: combo.items || [],
    };

    let next;
    if (existingIndex >= 0) {
      next = [...vouchers];
      next[existingIndex] = voucherObj;
    } else {
      next = [...vouchers, voucherObj];
    }
    saveVouchers(next);
    set({ appliedComboVouchers: next });
  },

  removeComboVoucher: (comboId) => {
    const next = (get().appliedComboVouchers || []).filter((v) => v.comboId !== comboId);
    saveVouchers(next);
    set({ appliedComboVouchers: next });
  },

  clearComboVouchers: () => {
    saveVouchers([]);
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

  getComboForItem: (maSanPham) => {
    const list = get().appliedComboVouchers || [];
    return list.find((v) => v.itemIds && v.itemIds.includes(maSanPham)) || null;
  },
}));

