import apiClient from '../../shared/api/apiClient';

export const getNotifications = (params) =>
  apiClient.get('/thong-bao', { params }).then((res) => res.data?.data || res.data);

export const getUnreadCount = () =>
  apiClient.get('/thong-bao/chua-doc/so-luong').then((res) => {
    const val = res.data;
    if (typeof val === 'number') return val;
    if (typeof val?.data === 'number') return val.data;
    return val?.count ?? val?.data?.count ?? 0;
  });

export const markAsRead = (id) =>
  apiClient.patch(`/thong-bao/${id}/da-doc`).then((res) => res.data?.data || res.data);

export const markAllAsRead = () =>
  apiClient.patch('/thong-bao/da-doc-tat-ca').then((res) => res.data?.data || res.data);

export const deleteNotification = (id) =>
  apiClient.delete(`/thong-bao/${id}`).then((res) => res.data?.data || res.data);

