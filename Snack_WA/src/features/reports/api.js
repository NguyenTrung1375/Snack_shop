import apiClient from '../../shared/api/apiClient';

export const getRevenueReport = (params) => apiClient.get('/bao-cao/doanh-thu-theo-thang', { params }).then(r => r.data);
export const getTopProductsReport = (params) => apiClient.get('/bao-cao/san-pham-ban-chay', { params }).then(r => r.data);

// 4 dạng thống kê chuyên sâu theo yêu cầu của Giảng viên:
// a) Thống kê tổng tiền hóa đơn từ ngày a đến ngày b
export const getDateRangeReport = (params) => apiClient.get('/bao-cao/theo-khoang-ngay', { params }).then(r => r.data);

// b) Thống kê Thu - Chi - Lợi nhuận theo Quý và Năm
export const getQuarterProfitReport = (params) => apiClient.get('/bao-cao/thu-chi-loi-nhuan-theo-quy', { params }).then(r => r.data);

// c) Thống kê tổng tiền HĐ theo Nhân viên & Năm / Khách hàng & Năm
export const getEmployeeReport = (params) => apiClient.get('/bao-cao/doanh-thu-theo-nhan-vien', { params }).then(r => r.data);
export const getCustomerReport = (params) => apiClient.get('/bao-cao/doanh-thu-theo-khach-hang', { params }).then(r => r.data);

// d) Thống kê tổng tiền HĐ theo Sản phẩm & Quý - năm
export const getProductQuarterReport = (params) => apiClient.get('/bao-cao/doanh-thu-theo-san-pham-quy', { params }).then(r => r.data);

