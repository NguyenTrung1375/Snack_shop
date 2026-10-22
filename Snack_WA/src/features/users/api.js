import apiClient from '../../shared/api/apiClient';

// --- Users ---
export const getUsers = async (params) => {
  const { data } = await apiClient.get('/nguoi-dung', { params });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await apiClient.get(`/nguoi-dung/${id}`);
  return data;
};

export const updateStatusUser = async (id, payload) => {
  const { data } = await apiClient.patch(`/nguoi-dung/${id}/trang-thai`, payload);
  return data;
};

// --- Employees ---
export const getEmployees = async (params) => {
  const { data } = await apiClient.get('/nhan-vien', { params });
  return data;
};

export const getEmployeeById = async (id) => {
  const { data } = await apiClient.get(`/nhan-vien/${id}`);
  return data;
};

export const createEmployee = async (payload) => {
  const { data } = await apiClient.post('/nhan-vien', payload);
  return data;
};

export const updateEmployee = async (id, payload) => {
  const { data } = await apiClient.put(`/nhan-vien/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id) => {
  const { data } = await apiClient.delete(`/nhan-vien/${id}`);
  return data;
};

// --- Create Account (Admin) ---
export const createAccount = async (payload) => {
  const { data } = await apiClient.post('/nguoi-dung', payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await apiClient.put(`/nguoi-dung/${id}`, payload);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await apiClient.delete(`/nguoi-dung/${id}`);
  return data;
};
