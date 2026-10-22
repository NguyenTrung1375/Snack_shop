const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
};

// 1. CATALOG
write('src/features/catalog/api.js', `
import apiClient from '../../shared/api/apiClient';

// Products
export const getProducts = (params) => apiClient.get('/san-pham', { params }).then(r => r.data);
export const getProduct = (id) => apiClient.get(\`/san-pham/\${id}\`).then(r => r.data);
export const createProduct = (payload) => apiClient.post('/san-pham', payload).then(r => r.data);
export const updateProduct = (id, payload) => apiClient.put(\`/san-pham/\${id}\`, payload).then(r => r.data);
export const updateProductStatus = (id, trangThai) => apiClient.patch(\`/san-pham/\${id}/trang-thai\`, { trangThai }).then(r => r.data);
export const deleteProduct = (id) => apiClient.delete(\`/san-pham/\${id}\`).then(r => r.data);

// Categories
export const getCategories = () => apiClient.get('/loai-san-pham').then(r => r.data);
export const createCategory = (payload) => apiClient.post('/loai-san-pham', payload).then(r => r.data);
export const updateCategory = (id, payload) => apiClient.put(\`/loai-san-pham/\${id}\`, payload).then(r => r.data);
export const deleteCategory = (id) => apiClient.delete(\`/loai-san-pham/\${id}\`).then(r => r.data);
`);

write('src/features/catalog/hooks.js', `
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useProducts = (filters) => useQuery({ queryKey: ['products', filters], queryFn: () => api.getProducts(filters) });
export const useProduct = (id) => useQuery({ queryKey: ['product', id], queryFn: () => api.getProduct(id), enabled: !!id });
export const useCreateProduct = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.createProduct, onSuccess: () => qc.invalidateQueries(['products']) }); };
export const useUpdateProduct = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({id, payload}) => api.updateProduct(id, payload), onSuccess: () => qc.invalidateQueries(['products']) }); };
export const useUpdateProductStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({id, status}) => api.updateProductStatus(id, status), onSuccess: () => qc.invalidateQueries(['products']) }); };

export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: api.getCategories });
export const useCreateCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.createCategory, onSuccess: () => qc.invalidateQueries(['categories']) }); };
export const useUpdateCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({id, payload}) => api.updateCategory(id, payload), onSuccess: () => qc.invalidateQueries(['categories']) }); };
export const useDeleteCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.deleteCategory, onSuccess: () => qc.invalidateQueries(['categories']) }); };
`);

// 2. PROMOTIONS
write('src/features/promotions/api.js', `
import apiClient from '../../shared/api/apiClient';

export const getPromotions = (params) => apiClient.get('/khuyen-mai', { params }).then(r => r.data);
export const createPromotion = (payload) => apiClient.post('/khuyen-mai', payload).then(r => r.data);
export const updatePromotion = (id, payload) => apiClient.put(\`/khuyen-mai/\${id}\`, payload).then(r => r.data);
export const deletePromotion = (id) => apiClient.delete(\`/khuyen-mai/\${id}\`).then(r => r.data);
`);

write('src/features/promotions/hooks.js', `
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const usePromotions = (filters) => useQuery({ queryKey: ['promotions', filters], queryFn: () => api.getPromotions(filters) });
export const useCreatePromotion = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.createPromotion, onSuccess: () => qc.invalidateQueries(['promotions']) }); };
export const useUpdatePromotion = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({id, payload}) => api.updatePromotion(id, payload), onSuccess: () => qc.invalidateQueries(['promotions']) }); };
export const useDeletePromotion = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.deletePromotion, onSuccess: () => qc.invalidateQueries(['promotions']) }); };
`);

// 3. INVENTORY
write('src/features/inventory/api.js', `
import apiClient from '../../shared/api/apiClient';

// Suppliers
export const getSuppliers = (params) => apiClient.get('/nha-cung-cap', { params }).then(r => r.data);
export const createSupplier = (payload) => apiClient.post('/nha-cung-cap', payload).then(r => r.data);
export const updateSupplier = (id, payload) => apiClient.put(\`/nha-cung-cap/\${id}\`, payload).then(r => r.data);
export const deleteSupplier = (id) => apiClient.delete(\`/nha-cung-cap/\${id}\`).then(r => r.data);

// Import Orders
export const getImportOrders = (params) => apiClient.get('/don-nhap-hang', { params }).then(r => r.data);
export const getImportOrder = (id) => apiClient.get(\`/don-nhap-hang/\${id}\`).then(r => r.data);
export const createImportOrder = (payload) => apiClient.post('/don-nhap-hang', payload).then(r => r.data);

// Low Stock
export const getLowStock = () => apiClient.get('/ton-kho/sap-het').then(r => r.data);
`);

write('src/features/inventory/hooks.js', `
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useSuppliers = (filters) => useQuery({ queryKey: ['suppliers', filters], queryFn: () => api.getSuppliers(filters) });
export const useCreateSupplier = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.createSupplier, onSuccess: () => qc.invalidateQueries(['suppliers']) }); };
export const useUpdateSupplier = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({id, payload}) => api.updateSupplier(id, payload), onSuccess: () => qc.invalidateQueries(['suppliers']) }); };
export const useDeleteSupplier = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.deleteSupplier, onSuccess: () => qc.invalidateQueries(['suppliers']) }); };

export const useImportOrders = (filters) => useQuery({ queryKey: ['imports', filters], queryFn: () => api.getImportOrders(filters) });
export const useImportOrder = (id) => useQuery({ queryKey: ['import', id], queryFn: () => api.getImportOrder(id), enabled: !!id });
export const useCreateImportOrder = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.createImportOrder, onSuccess: () => { qc.invalidateQueries(['imports']); qc.invalidateQueries(['products']); qc.invalidateQueries(['low-stock']); } }); };

export const useLowStock = () => useQuery({ queryKey: ['low-stock'], queryFn: api.getLowStock });
`);

// 4. REPORTS
write('src/features/reports/api.js', `
import apiClient from '../../shared/api/apiClient';

export const getRevenueReport = () => apiClient.get('/bao-cao/doanh-thu-theo-thang').then(r => r.data);
export const getTopProductsReport = () => apiClient.get('/bao-cao/san-pham-ban-chay').then(r => r.data);
`);

write('src/features/reports/hooks.js', `
import { useQuery } from '@tanstack/react-query';
import * as api from './api';

export const useRevenueReport = () => useQuery({ queryKey: ['report-revenue'], queryFn: api.getRevenueReport });
export const useTopProductsReport = () => useQuery({ queryKey: ['report-top-products'], queryFn: api.getTopProductsReport });
`);
