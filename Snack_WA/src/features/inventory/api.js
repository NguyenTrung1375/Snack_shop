import apiClient from '../../shared/api/apiClient';

// Suppliers
export const getSuppliers = (params) => apiClient.get('/nha-cung-cap', { params }).then(r => r.data);
export const createSupplier = (payload) => apiClient.post('/nha-cung-cap', payload).then(r => r.data);
export const updateSupplier = (id, payload) => apiClient.put(`/nha-cung-cap/${id}`, payload).then(r => r.data);
export const deleteSupplier = (id) => apiClient.delete(`/nha-cung-cap/${id}`).then(r => r.data);

// Import Orders
export const getImportOrders = (params) => apiClient.get('/don-nhap-hang', { params }).then(r => r.data);
export const getImportOrder = (id) => apiClient.get(`/don-nhap-hang/${id}`).then(r => r.data);
export const createImportOrder = (payload) => apiClient.post('/don-nhap-hang', payload).then(r => r.data);

// Low Stock
export const getLowStock = (params) => apiClient.get('/ton-kho/sap-het', { params }).then(r => r.data);
