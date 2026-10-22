import apiClient from './client';

/**
 * Lấy danh sách người dùng (phân trang, lọc theo keyword, vaiTro, trangThai)
 * GET /api/nguoi-dung
 */
export const getUsers = async (params = {}) => {
  const response = await apiClient.get('/nguoi-dung', { params });
  return response.data;
};

/**
 * Lấy chi tiết người dùng theo ID
 * GET /api/nguoi-dung/{id}
 */
export const getUserById = async (id) => {
  const response = await apiClient.get(`/nguoi-dung/${id}`);
  return response.data;
};

/**
 * Cập nhật trạng thái người dùng (hoat_dong / khoa)
 * PATCH /api/nguoi-dung/{id}/trang-thai
 */
export const updateUserStatus = async (id, trangThai) => {
  const response = await apiClient.patch(`/nguoi-dung/${id}/trang-thai`, { trangThai });
  return response.data;
};

/**
 * Tạo tài khoản người dùng mới (chỉ Admin)
 * POST /api/nguoi-dung
 */
export const createAccount = async (payload) => {
  const response = await apiClient.post('/nguoi-dung', payload);
  return response.data;
};

/**
 * Cập nhật thông tin người dùng
 * PUT /api/nguoi-dung/{id}
 */
export const updateUser = async (id, payload) => {
  const response = await apiClient.put(`/nguoi-dung/${id}`, payload);
  return response.data;
};

/**
 * Xóa người dùng (chỉ Admin)
 * DELETE /api/nguoi-dung/{id}
 */
export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/nguoi-dung/${id}`);
  return response.data;
};

