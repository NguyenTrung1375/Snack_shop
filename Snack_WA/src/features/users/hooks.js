import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useUsers = (params) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => api.getUsers(params),
    placeholderData: (prev) => prev,
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.getUserById(id),
    enabled: !!id,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.updateStatusUser(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['user', variables.id]);
    },
  });
};

export const useEmployees = (params) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => api.getEmployees(params),
    placeholderData: (prev) => prev,
  });
};

export const useEmployee = (id) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => api.getEmployeeById(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.updateEmployee(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['employee', variables.id]);
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['employees']);
    },
  });
};


export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.updateUser(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user', variables.id]);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};
