using SnackShop.Application.DTOs.LoaiSanPham;

namespace SnackShop.Application.Interfaces;

public interface ILoaiSanPhamService
{
    Task<List<LoaiSanPhamDto>> GetCayLoaiSanPhamAsync(bool? chiHoatDong = null, CancellationToken cancellationToken = default);
    Task<LoaiSanPhamDto> GetByIdAsync(Guid maLoai, CancellationToken cancellationToken = default);
    Task<LoaiSanPhamDto> CreateAsync(CreateLoaiSanPhamRequest request, CancellationToken cancellationToken = default);
    Task<LoaiSanPhamDto> UpdateAsync(Guid maLoai, UpdateLoaiSanPhamRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid maLoai, CancellationToken cancellationToken = default);
}
