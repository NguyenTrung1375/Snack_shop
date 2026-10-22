import apiClient from './client';

export const calculateTempOrder = async (payload) => {
  const response = await apiClient.post('/don-hang/tinh-tam', payload);
  return response.data;
};

export const createOrder = async (payload) => {
  const response = await apiClient.post('/don-hang', payload);
  return response.data;
};

export const getMyOrders = async (params) => {
  const response = await apiClient.get('/don-hang/cua-toi', { params });
  return response.data;
};

export const getOrderDetail = async (id) => {
  const response = await apiClient.get(`/don-hang/${id}`);
  return response.data;
};

