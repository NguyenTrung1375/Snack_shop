import apiClient from '../../shared/api/apiClient';

export const getCart = () => apiClient.get('/gio-hang').then((response) => response.data);

export const addToCart = (payload) => apiClient.post('/gio-hang', payload).then((response) => response.data);

export const updateCartItem = (maGioHang, payload) => {
  const body = typeof payload === 'number' ? { soLuong: payload } : payload;
  return apiClient.put(`/gio-hang/${maGioHang}`, body).then((response) => response.data);
};

export const removeFromCart = (maGioHang) => apiClient.delete(`/gio-hang/${maGioHang}`).then((response) => response.data);
