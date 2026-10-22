import apiClient from '../../shared/api/apiClient';

// Customer APIs
export const calculateTempOrder = (payload) => apiClient.post('/don-hang/tinh-tam', payload).then((response) => response.data);
export const calculateOrder = calculateTempOrder;

export const createOrder = (payload) => apiClient.post('/don-hang', payload).then((response) => response.data);

export const getMyOrders = (params) => apiClient.get('/don-hang/cua-toi', { params }).then((response) => response.data);

export const getOrderDetail = (id) => apiClient.get(`/don-hang/${id}`).then((response) => response.data);
export const getOrder = getOrderDetail;

export const cancelOrder = (id, payload) => {
  const body = typeof payload === 'string' ? { lyDoHuy: payload } : (payload || {});
  return apiClient.post(`/don-hang/${id}/huy`, body)
    .catch((err) => {
      if (err.response?.status === 405) {
        return apiClient.put(`/don-hang/${id}/huy`, body);
      }
      throw err;
    })
    .then((response) => response.data);
};

// Management APIs
export const getOrders = (params) => apiClient.get('/don-hang', { params }).then((response) => response.data);
export const updateOrderStatus = (id, status) => {
  const payload = typeof status === 'object' ? status : { trangThaiDonHang: status, trangThai: status };
  return apiClient.patch(`/don-hang/${id}/trang-thai`, payload).then((response) => response.data);
};
export const updateOrderPayment = (id, payload) => apiClient.patch(`/don-hang/${id}/thanh-toan`, payload).then((response) => response.data);
export const generateInvoice = (id) => apiClient.post(`/don-hang/${id}/hoa-don`).then((response) => response.data);

// Invoice APIs
export const getInvoices = (params) => apiClient.get('/hoa-don', { params }).then((response) => response.data);
export const getInvoice = (id) => apiClient.get(`/hoa-don/${encodeURIComponent(id)}`).then((response) => response.data);
