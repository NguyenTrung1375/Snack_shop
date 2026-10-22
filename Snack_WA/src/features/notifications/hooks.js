import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useNotificationsQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => api.getNotifications(params),
    ...options,
  });
};

export const useUnreadCountQuery = (options = {}) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: api.getUnreadCount,
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
    ...options,
  });
};

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

