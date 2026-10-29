import apiClient from './client';

// Thời hạn phiên lưu cache dữ liệu thực đơn/sản phẩm: 15 phút theo quy định phiên làm việc
export const SESSION_CACHE_MS = 15 * 60 * 1000;
const memoryCache = new Map();

/**
 * Lấy dữ liệu với cơ chế cache theo phiên 15 phút.
 * Trong 15 phút, người dùng chuyển màn hình, xem danh mục hay tìm kiếm đều tái sử dụng dữ liệu phiên.
 */
export const getCachedData = async (key, fetcher, forceRefresh = false) => {
  const now = Date.now();
  const cached = memoryCache.get(key);
  if (!forceRefresh && cached && (now - cached.timestamp < SESSION_CACHE_MS)) {
    return cached.data;
  }
  const freshData = await fetcher();
  memoryCache.set(key, { data: freshData, timestamp: now });
  return freshData;
};

export const clearProductsCache = () => {
  memoryCache.clear();
};

export const getProducts = async (params, forceRefresh = false) => {
  const cacheKey = `products_${JSON.stringify(params || {})}`;
  return getCachedData(cacheKey, async () => {
    const response = await apiClient.get('/san-pham', { params });
    return response.data;
  }, forceRefresh);
};

export const getProduct = async (id, forceRefresh = false) => {
  const cacheKey = `product_${id}`;
  return getCachedData(cacheKey, async () => {
    const response = await apiClient.get(`/san-pham/${id}`);
    return response.data;
  }, forceRefresh);
};

export const getCategories = async (forceRefresh = false) => {
  return getCachedData('categories_all', async () => {
    const response = await apiClient.get('/loai-san-pham');
    return response.data;
  }, forceRefresh);
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

