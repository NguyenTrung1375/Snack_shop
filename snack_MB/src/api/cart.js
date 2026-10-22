import apiClient from './client';

export const getCart = async () => {
  const response = await apiClient.get('/gio-hang');
  return response.data;
};

export const addToCart = async (payload) => {
  const response = await apiClient.post('/gio-hang', payload);
  return response.data;
};

export const updateCartItem = async (maGioHang, payload) => {
  const body = typeof payload === 'number' ? { soLuong: payload } : payload;
  const response = await apiClient.put(`/gio-hang/${maGioHang}`, body);
  return response.data;
};

export const removeFromCart = async (maGioHang) => {
  const response = await apiClient.delete(`/gio-hang/${maGioHang}`);
  return response.data;
};

