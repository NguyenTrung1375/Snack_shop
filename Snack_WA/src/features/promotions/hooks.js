import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const usePromotions = (filters) => useQuery({ queryKey: ['promotions', filters], queryFn: () => api.getPromotions(filters) });
export const useCreatePromotion = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.createPromotion, onSuccess: () => qc.invalidateQueries(['promotions']) }); };
export const useUpdatePromotion = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({id, payload}) => api.updatePromotion(id, payload), onSuccess: () => qc.invalidateQueries(['promotions']) }); };
export const useDeletePromotion = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.deletePromotion, onSuccess: () => qc.invalidateQueries(['promotions']) }); };
