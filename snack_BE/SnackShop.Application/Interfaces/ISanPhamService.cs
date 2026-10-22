using Microsoft.AspNetCore.Http;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.HinhAnh;
using SnackShop.Application.DTOs.SanPham;

namespace SnackShop.Application.Interfaces;

public interface ISanPhamService
{
    Task<PagedResult<SanPhamDto>> GetPagedListAsync(SanPhamFilterRequest request, CancellationToken cancellationToken = default);
    Task<SanPhamChiTietDto> GetChiTietByIdAsync(Guid maSanPham, CancellationToken cancellationToken = default);
    Task<SanPhamDto> CreateAsync(CreateSanPhamRequest request, CancellationToken cancellationToken = default);
    Task<SanPhamDto> UpdateAsync(Guid maSanPham, UpdateSanPhamRequest request, CancellationToken cancellationToken = default);
    Task UpdateTrangThaiAsync(Guid maSanPham, string trangThai, CancellationToken cancellationToken = default);
    Task<HinhAnhSanPhamDto> UploadHinhAnhAsync(Guid maSanPham, IFormFile file, bool laAnhChinh = false, int thuTuHienThi = 0, CancellationToken cancellationToken = default);
    Task DeleteHinhAnhAsync(Guid maSanPham, Guid maHinhAnh, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid maSanPham, CancellationToken cancellationToken = default);
    Task<List<DanhGiaSanPhamDto>> GetDanhGiaBySanPhamIdAsync(Guid maSanPham, CancellationToken cancellationToken = default);
}
