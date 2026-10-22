import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

// Customer Hooks
export const useCalculateTempOrder = () => useMutation({ mutationFn: api.calculateTempOrder });
export const useCalculateOrder = useCalculateTempOrder;

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useMyOrdersQuery = (params) => {
  return useQuery({
    queryKey: ['my-orders', params],
    queryFn: () => api.getMyOrders(params),
  });
};
export const useMyOrders = useMyOrdersQuery;

export const useOrderDetailQuery = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => api.getOrderDetail(id),
    enabled: !!id,
  });
};
export const useOrder = useOrderDetailQuery;

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lyDoHuy }) => api.cancelOrder(id, lyDoHuy),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
  });
};

// Management Hooks
export const useOrders = (params) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => api.getOrders(params),
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => api.updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrderPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateOrderPayment(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useGenerateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.generateInvoice(id),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: ['order', id] }),
  });
};

// Invoice Hooks
export const useInvoices = (params) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => api.getInvoices(params),
  });
};

export const useInvoice = (id) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.getInvoice(id),
    enabled: !!id,
    retry: false,
  });
};
