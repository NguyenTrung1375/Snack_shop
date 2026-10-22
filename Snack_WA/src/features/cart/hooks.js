import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useCartQuery = (options = {}) => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: api.getCart,
    ...options,
  });
};

export const useCart = useCartQuery;

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addToCart,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ maGioHang, soLuong }) => api.updateCartItem(maGioHang, { soLuong }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveFromCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (maGioHang) => api.removeFromCart(maGioHang),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
