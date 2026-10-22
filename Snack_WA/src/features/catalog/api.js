import apiClient from '../../shared/api/apiClient';

// Products
export const getProducts = (params) => apiClient.get('/san-pham', { params }).then(r => r.data);
export const getProduct = (id) => apiClient.get(`/san-pham/${id}`).then(r => r.data);
export const createProduct = (payload) => apiClient.post('/san-pham', payload).then(r => r.data);
export const updateProduct = (id, payload) => apiClient.put(`/san-pham/${id}`, payload).then(r => r.data);
export const updateProductStatus = (id, trangThai) => apiClient.patch(`/san-pham/${id}/trang-thai`, { trangThai }).then(r => r.data);
export const deleteProduct = (id) => apiClient.delete(`/san-pham/${id}`).then(r => r.data);
export const getProductReviews = (id) => apiClient.get(`/san-pham/${id}/danh-gia`).then(r => r.data);

// Categories
export const getCategories = () => apiClient.get('/loai-san-pham').then(r => r.data);
export const createCategory = (payload) => apiClient.post('/loai-san-pham', payload).then(r => r.data);
export const updateCategory = (id, payload) => apiClient.put(`/loai-san-pham/${id}`, payload).then(r => r.data);
export const deleteCategory = (id) => apiClient.delete(`/loai-san-pham/${id}`).then(r => r.data);
