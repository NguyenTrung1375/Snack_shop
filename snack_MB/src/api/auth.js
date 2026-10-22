import apiClient from './client';

export const login = async (payload) => {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
};

export const register = async (payload) => {
  const response = await apiClient.post('/auth/register', payload);
  return response.data;
};

export const getProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const updateProfile = async (payload) => {
  const response = await apiClient.put('/auth/me', payload);
  return response.data;
};

export const changePassword = async (payload) => {
  const response = await apiClient.put('/auth/change-password', payload);
  return response.data;
};

