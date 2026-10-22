import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useProducts = (filters) => useQuery({ queryKey: ['products', filters], queryFn: () => api.getProducts(filters) });
export const useProductsQuery = useProducts;
export const useProduct = (id) => useQuery({ queryKey: ['product', id], queryFn: () => api.getProduct(id), enabled: !!id });
export const useCreateProduct = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.createProduct, onSuccess: () => qc.invalidateQueries(['products']) }); };
export const useUpdateProduct = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({id, payload}) => api.updateProduct(id, payload), onSuccess: () => qc.invalidateQueries(['products']) }); };
export const useUpdateProductStatus = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({id, status}) => api.updateProductStatus(id, status), onSuccess: () => qc.invalidateQueries(['products']) }); };
export const useDeleteProduct = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.deleteProduct, onSuccess: () => qc.invalidateQueries(['products']) }); };
export const useProductReviews = (id) => useQuery({ queryKey: ['product-reviews', id], queryFn: () => api.getProductReviews(id), enabled: !!id });

export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: api.getCategories });
export const useCreateCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.createCategory, onSuccess: () => qc.invalidateQueries(['categories']) }); };
export const useUpdateCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({id, payload}) => api.updateCategory(id, payload), onSuccess: () => qc.invalidateQueries(['categories']) }); };
export const useDeleteCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.deleteCategory, onSuccess: () => qc.invalidateQueries(['categories']) }); };
