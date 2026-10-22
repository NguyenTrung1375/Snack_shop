import apiClient from '../../shared/api/apiClient';

export const getRevenueReport = (params) => apiClient.get('/bao-cao/doanh-thu-theo-thang', { params }).then(r => r.data);
export const getTopProductsReport = (params) => apiClient.get('/bao-cao/san-pham-ban-chay', { params }).then(r => r.data);
