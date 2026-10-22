import apiClient from './client';

/**
 * 1. ĐƠN HÀNG (Orders)
 */
export const getOrders = async (params) => {
  const response = await apiClient.get('/don-hang', { params });
  return response.data;
};

export const getOrderDetail = async (id) => {
  const response = await apiClient.get(`/don-hang/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const payload = typeof status === 'object' ? status : { trangThaiDonHang: status, trangThai: status };
  const response = await apiClient.patch(`/don-hang/${id}/trang-thai`, payload);
  return response.data;
};

export const updateOrderPayment = async (id, payload) => {
  const response = await apiClient.patch(`/don-hang/${id}/thanh-toan`, payload);
  return response.data;
};

export const generateInvoice = async (id) => {
  const response = await apiClient.post(`/don-hang/${id}/hoa-don`);
  return response.data;
};

export const cancelOrder = async (id, lyDoHuy) => {
  const body = typeof lyDoHuy === 'object' ? lyDoHuy : { lyDoHuy: lyDoHuy || 'Hủy theo yêu cầu quản lý' };
  try {
    const response = await apiClient.post(`/don-hang/${id}/huy`, body);
    return response.data;
  } catch (err) {
    if (err.response?.status === 405) {
      const response = await apiClient.put(`/don-hang/${id}/huy`, body);
      return response.data;
    }
    throw err;
  }
};

/**
 * 2. HÓA ĐƠN (Invoices)
 */
export const getInvoices = async (params) => {
  const response = await apiClient.get('/hoa-don', { params });
  return response.data;
};

export const getInvoiceDetail = async (id) => {
  const response = await apiClient.get(`/hoa-don/${encodeURIComponent(id)}`);
  return response.data;
};

/**
 * 3. SẢN PHẨM (Products)
 */
export const getProducts = async (params) => {
  const response = await apiClient.get('/san-pham', { params });
  return response.data;
};

export const getProductDetail = async (id) => {
  const response = await apiClient.get(`/san-pham/${id}`);
  return response.data;
};

export const createProduct = async (payload) => {
  const response = await apiClient.post('/san-pham', payload);
  return response.data;
};

export const updateProduct = async (id, payload) => {
  const response = await apiClient.put(`/san-pham/${id}`, payload);
  return response.data;
};

export const updateProductStatus = async (id, trangThai) => {
  const response = await apiClient.patch(`/san-pham/${id}/trang-thai`, { trangThai });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/san-pham/${id}`);
  return response.data;
};

/**
 * 4. LOẠI SẢN PHẨM (Categories)
 */
export const getCategories = async () => {
  const response = await apiClient.get('/loai-san-pham');
  return response.data;
};

export const createCategory = async (payload) => {
  const response = await apiClient.post('/loai-san-pham', payload);
  return response.data;
};

export const updateCategory = async (id, payload) => {
  const response = await apiClient.put(`/loai-san-pham/${id}`, payload);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/loai-san-pham/${id}`);
  return response.data;
};

/**
 * 5. KHUYẾN MÃI & VOUCHER (Promotions)
 */
export const getPromotions = async (params) => {
  const response = await apiClient.get('/khuyen-mai', { params });
  return response.data;
};

export const createPromotion = async (payload) => {
  const response = await apiClient.post('/khuyen-mai', payload);
  return response.data;
};

export const updatePromotion = async (id, payload) => {
  const response = await apiClient.put(`/khuyen-mai/${id}`, payload);
  return response.data;
};

export const deletePromotion = async (id) => {
  const response = await apiClient.delete(`/khuyen-mai/${id}`);
  return response.data;
};

/**
 * 6. NHÀ CUNG CẤP (Suppliers)
 */
export const getSuppliers = async (page = 1, pageSize = 20) => {
  const response = await apiClient.get('/nha-cung-cap', {
    params: { page, pageSize },
  });
  return response.data;
};

export const createSupplier = async (payload) => {
  const response = await apiClient.post('/nha-cung-cap', payload);
  return response.data;
};

export const updateSupplier = async (id, payload) => {
  const response = await apiClient.put(`/nha-cung-cap/${id}`, payload);
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await apiClient.delete(`/nha-cung-cap/${id}`);
  return response.data;
};

/**
 * 7. ĐƠN NHẬP HÀNG (Import Orders)
 */
export const getImportOrders = async (page = 1, pageSize = 20) => {
  const response = await apiClient.get('/don-nhap-hang', {
    params: { page, pageSize },
  });
  return response.data;
};

export const getImportOrderDetail = async (id) => {
  const response = await apiClient.get(`/don-nhap-hang/${id}`);
  return response.data;
};

export const createImportOrder = async (payload) => {
  const response = await apiClient.post('/don-nhap-hang', payload);
  return response.data;
};

/**
 * 8. CẢNH BÁO TỒN KHO (Low Stock)
 */
export const getLowStockReport = async (page = 1, pageSize = 20) => {
  const response = await apiClient.get('/ton-kho/sap-het', {
    params: { page, pageSize },
  });
  return response.data;
};

/**
 * 9. BÁO CÁO THỐNG KÊ (Reports)
 */
export const getMonthlyRevenueReport = async (nam) => {
  const params = nam ? { nam } : undefined;
  const response = await apiClient.get('/bao-cao/doanh-thu-theo-thang', { params });
  return response.data;
};

export const getTopProductsReport = async (page = 1, pageSize = 10) => {
  const response = await apiClient.get('/bao-cao/san-pham-ban-chay', {
    params: { page, pageSize },
  });
  return response.data;
};

/**
 * 10. NHÂN SỰ & NHÂN VIÊN (Employees)
 */
export const getEmployees = async (page = 1, pageSize = 20) => {
  const response = await apiClient.get('/nhan-vien', {
    params: { page, pageSize },
  });
  return response.data;
};

export const createEmployee = async (payload) => {
  const response = await apiClient.post('/nhan-vien', payload);
  return response.data;
};

export const updateEmployee = async (id, payload) => {
  const response = await apiClient.put(`/nhan-vien/${id}`, payload);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await apiClient.delete(`/nhan-vien/${id}`);
  return response.data;
};
