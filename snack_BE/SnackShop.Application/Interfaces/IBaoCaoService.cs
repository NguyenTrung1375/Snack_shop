using SnackShop.Application.Common;
using SnackShop.Application.DTOs.BaoCao;

namespace SnackShop.Application.Interfaces;

public interface IBaoCaoService
{
    Task<List<DoanhThuTheoThangDto>> GetDoanhThuTheoThangAsync(int? nam, CancellationToken cancellationToken = default);
    Task<PagedResult<SanPhamBanChayDto>> GetSanPhamBanChayAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    
    // 4 dạng thống kê chuyên sâu theo yêu cầu của Giảng viên:
    // a) Thống kê tổng tiền hóa đơn từ ngày a đến ngày b
    Task<ThongKeTheoKhoangNgayDto> GetThongKeTheoKhoangNgayAsync(DateTime tuNgay, DateTime denNgay, CancellationToken cancellationToken = default);
    
    // b) Thống kê Thu - Chi - Lợi nhuận theo Quý và Năm
    Task<ThongKeThuChiLoiNhuanDto> GetThuChiLoiNhuanTheoQuyAsync(int nam, CancellationToken cancellationToken = default);
    
    // c) Thống kê tổng tiền HĐ theo Nhân viên & Năm (và tương tự cho Khách hàng)
    Task<ThongKeDoiTuongTheoNamDto> GetDoanhThuTheoNhanVienAsync(List<int>? danhSachNam = null, CancellationToken cancellationToken = default);
    Task<ThongKeDoiTuongTheoNamDto> GetDoanhThuTheoKhachHangAsync(List<int>? danhSachNam = null, CancellationToken cancellationToken = default);
    
    // d) Thống kê tổng tiền HĐ theo Sản phẩm & Quý - năm
    Task<ThongKeSanPhamTheoQuyDto> GetDoanhThuSanPhamTheoQuyAsync(int nam, CancellationToken cancellationToken = default);
}
