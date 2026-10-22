export const orderStatuses = {
  cho_xac_nhan: { label: 'Chờ xác nhận', color: 'gold', next: ['da_xac_nhan', 'da_huy'] },
  da_xac_nhan: { label: 'Đã xác nhận', color: 'blue', next: ['dang_giao', 'da_huy'] },
  dang_giao: { label: 'Đang giao', color: 'cyan', next: ['da_giao'] },
  da_giao: { label: 'Đã giao', color: 'green', next: [] }, da_huy: { label: 'Đã hủy', color: 'red', next: [] },
};
export const paymentStatuses = { chua_thanh_toan: { label: 'Chưa thanh toán', color: 'gold' }, da_thanh_toan: { label: 'Đã thanh toán', color: 'green' }, da_hoan_tien: { label: 'Đã hoàn tiền', color: 'purple' } };
