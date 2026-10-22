using SnackShop.Application.DTOs.GioHang;

namespace SnackShop.Application.Interfaces;

public interface IGioHangService
{
    Task<List<ChiTietGioHangDto>> GetGioHangAsync(Guid maKhachHang, CancellationToken cancellationToken = default);
    Task<ChiTietGioHangDto> ThemGioHangAsync(Guid maKhachHang, ThemGioHangRequest request, CancellationToken cancellationToken = default);
    Task<ChiTietGioHangDto> CapNhatGioHangAsync(Guid maKhachHang, Guid maGioHang, CapNhatGioHangRequest request, CancellationToken cancellationToken = default);
    Task XoaGioHangAsync(Guid maKhachHang, Guid maGioHang, CancellationToken cancellationToken = default);
}
