import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from './api';
import { useAuthStore } from '../../shared/auth/authStore';

export const useProfile = (options = {}) => {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      if (currentUser) {
        setUser({
          ...currentUser,
          ...updated,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};

