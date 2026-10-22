using SnackShop.Application.Common;
using SnackShop.Application.DTOs.KhuyenMai;

namespace SnackShop.Application.Interfaces;

public interface IKhuyenMaiService
{
    Task<List<ChuongTrinhKhuyenMaiDto>> GetDangChayAsync(CancellationToken cancellationToken = default);
    Task<KiemTraVoucherResponse> KiemTraVoucherAsync(Guid userId, string maCode, decimal tongTienHang, CancellationToken cancellationToken = default);
    Task<PagedResult<ChuongTrinhKhuyenMaiDto>> GetPagedListAsync(KhuyenMaiFilterRequest request, CancellationToken cancellationToken = default);
    Task<ChuongTrinhKhuyenMaiDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ChuongTrinhKhuyenMaiDto> CreateAsync(CreateKhuyenMaiRequest req, CancellationToken cancellationToken = default);
    Task<ChuongTrinhKhuyenMaiDto> UpdateAsync(Guid id, UpdateKhuyenMaiRequest req, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<decimal> TinhTienGiamGiaAsync(Guid maCtkm, decimal tongTienHang, Guid? userId = null, CancellationToken cancellationToken = default);
}
