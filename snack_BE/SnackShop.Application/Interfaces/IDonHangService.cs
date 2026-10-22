using SnackShop.Application.Common;
using SnackShop.Application.DTOs.DonHang;
using SnackShop.Application.DTOs.HoaDon;

namespace SnackShop.Application.Interfaces;

public interface IDonHangService
{
    Task<TinhTamDonHangResponse> TinhTamAsync(Guid? khachHangId, TinhTamDonHangRequest req, CancellationToken cancellationToken = default);
    Task<DonHangDto> DatHangAsync(Guid khachHangId, DatHangRequest req, CancellationToken cancellationToken = default);
    Task<PagedResult<DonHangDto>> GetCuaToiAsync(Guid khachHangId, DonHangFilterRequest req, CancellationToken cancellationToken = default);
    Task<DonHangDto> GetByIdAsync(Guid id, Guid? currentUserId, string? currentUserRole, CancellationToken cancellationToken = default);
    Task<PagedResult<DonHangDto>> GetAllAsync(DonHangFilterRequest req, CancellationToken cancellationToken = default);
    Task<DonHangDto> CapNhatTrangThaiAsync(Guid id, CapNhatTrangThaiDonHangRequest req, Guid currentUserId, CancellationToken cancellationToken = default);
    Task<DonHangDto> CapNhatThanhToanAsync(Guid id, CapNhatTrangThaiThanhToanRequest req, Guid currentUserId, CancellationToken cancellationToken = default);
    Task<DonHangDto> HuyDonAsync(Guid id, Guid currentUserId, string? currentUserRole, string? lyDo = null, CancellationToken cancellationToken = default);
    Task<HoaDonDto> XuatHoaDonAsync(Guid donHangId, Guid? nhanVienId, CancellationToken cancellationToken = default);
    Task<HoaDonDto> GetHoaDonByIdAsync(Guid hoaDonOrDonHangId, Guid? currentUserId, string? currentUserRole, CancellationToken cancellationToken = default);
    Task<PagedResult<HoaDonDto>> GetAllHoaDonAsync(HoaDonFilterRequest req, CancellationToken cancellationToken = default);
    Task<HoaDonDto> TraCuuHoaDonAsync(string query, Guid? currentUserId, string? currentUserRole, CancellationToken cancellationToken = default);
}
