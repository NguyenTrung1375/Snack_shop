import apiClient from '../../shared/api/apiClient';

export const login = (payload) => apiClient.post('/auth/login', payload).then((response) => response.data);
export const register = (payload) => apiClient.post('/auth/register', payload).then((response) => response.data);

export const getProfile = () => apiClient.get('/auth/me').then((response) => response.data);
export const updateProfile = (payload) => apiClient.put('/auth/me', payload).then((response) => response.data);
export const changePassword = (payload) => apiClient.put('/auth/change-password', payload).then((response) => response.data);
