export function getErrorMessage(error) {
  const data = error?.response?.data;
  return typeof data === 'string' ? data : data?.message || data?.title || 'Có lỗi xảy ra. Vui lòng thử lại.';
}
