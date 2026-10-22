import { useQuery } from '@tanstack/react-query';
import * as api from './api';

export const useRevenueReport = (params) => useQuery({ 
  queryKey: ['report-revenue', params], 
  queryFn: () => api.getRevenueReport(params) 
});

export const useTopProductsReport = (params) => useQuery({ 
  queryKey: ['report-top-products', params], 
  queryFn: () => api.getTopProductsReport(params) 
});
