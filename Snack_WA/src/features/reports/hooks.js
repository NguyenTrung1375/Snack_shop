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

// a) Báo cáo theo khoảng ngày
export const useDateRangeReport = (params) => useQuery({
  queryKey: ['report-date-range', params],
  queryFn: () => api.getDateRangeReport(params)
});

// b) Báo cáo Thu - Chi - Lợi nhuận theo Quý và Năm
export const useQuarterProfitReport = (params) => useQuery({
  queryKey: ['report-quarter-profit', params],
  queryFn: () => api.getQuarterProfitReport(params)
});

// c) Báo cáo theo Nhân viên & Năm / Khách hàng & Năm
export const useEmployeeReport = (params) => useQuery({
  queryKey: ['report-employee-yearly', params],
  queryFn: () => api.getEmployeeReport(params)
});

export const useCustomerReport = (params) => useQuery({
  queryKey: ['report-customer-yearly', params],
  queryFn: () => api.getCustomerReport(params)
});

// d) Báo cáo Sản phẩm theo Quý và Năm
export const useProductQuarterReport = (params) => useQuery({
  queryKey: ['report-product-quarter', params],
  queryFn: () => api.getProductQuarterReport(params)
});
