export const formatVnd = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
export const formatDate = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
export const buildImageUrl = (path) => path || '/favicon.svg';
