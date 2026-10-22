import apiClient from '../../shared/api/apiClient';

export const getPromotions = (params) => apiClient.get('/khuyen-mai', { params }).then(r => r.data);
export const createPromotion = (payload) => apiClient.post('/khuyen-mai', payload).then(r => r.data);
export const updatePromotion = (id, payload) => apiClient.put(`/khuyen-mai/${id}`, payload).then(r => r.data);
export const deletePromotion = (id) => apiClient.delete(`/khuyen-mai/${id}`).then(r => r.data);
