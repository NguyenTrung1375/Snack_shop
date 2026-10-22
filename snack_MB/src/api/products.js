import apiClient from './client';

export const getProducts = async (params) => {
  const response = await apiClient.get('/san-pham', { params });
  return response.data;
};

export const getProduct = async (id) => {
  const response = await apiClient.get(`/san-pham/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await apiClient.get('/loai-san-pham');
  return response.data;
};

export const createReview = async ({ maChiTietDonHang, maSanPham, soSao, binhLuan }) => {
  const response = await apiClient.post('/danh-gia', {
    maChiTietDonHang,
    maSanPham,
    soSao,
    binhLuan,
  });
  return response.data;
};

export const getProductReviews = async (productId) => {
  const response = await apiClient.get(`/san-pham/${productId}/danh-gia`);
  return response.data;
};

export const getFeaturedReviews = async (limit = 6) => {
  try {
    const response = await apiClient.get('/danh-gia/noi-bat', { params: { limit } });
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.warn('Lỗi lấy đánh giá nổi bật:', err);
    return [];
  }
};

