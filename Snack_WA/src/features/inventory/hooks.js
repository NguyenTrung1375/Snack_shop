import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useSuppliers = (filters) => useQuery({ queryKey: ['suppliers', filters], queryFn: () => api.getSuppliers(filters) });
export const useCreateSupplier = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.createSupplier, onSuccess: () => qc.invalidateQueries(['suppliers']) }); };
export const useUpdateSupplier = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({id, payload}) => api.updateSupplier(id, payload), onSuccess: () => qc.invalidateQueries(['suppliers']) }); };
export const useDeleteSupplier = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.deleteSupplier, onSuccess: () => qc.invalidateQueries(['suppliers']) }); };

export const useImportOrders = (filters) => useQuery({ queryKey: ['imports', filters], queryFn: () => api.getImportOrders(filters) });
export const useImportOrder = (id) => useQuery({ queryKey: ['import', id], queryFn: () => api.getImportOrder(id), enabled: !!id });
export const useCreateImportOrder = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.createImportOrder, onSuccess: () => { qc.invalidateQueries(['imports']); qc.invalidateQueries(['products']); qc.invalidateQueries(['low-stock']); } }); };

export const useLowStock = (params) => useQuery({ queryKey: ['low-stock', params], queryFn: () => api.getLowStock(params) });
