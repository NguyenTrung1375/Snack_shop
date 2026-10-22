import apiClient from './client';

export const getNotifications = async (params) => {
  const response = await apiClient.get('/thong-bao', { params });
  return response.data?.data || response.data;
};

export const getUnreadCount = async () => {
  const response = await apiClient.get('/thong-bao/chua-doc/so-luong');
  const val = response.data;
  if (typeof val === 'number') return val;
  if (typeof val?.data === 'number') return val.data;
  return val?.count ?? val?.data?.count ?? 0;
};

export const markAllAsRead = async () => {
  const response = await apiClient.patch('/thong-bao/da-doc-tat-ca');
  return response.data?.data || response.data;
};

export const markAsRead = async (id) => {
  const response = await apiClient.patch(`/thong-bao/${id}/da-doc`);
  return response.data?.data || response.data;
};

