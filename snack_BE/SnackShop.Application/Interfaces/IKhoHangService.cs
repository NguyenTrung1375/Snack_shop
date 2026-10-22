using SnackShop.Application.Common;
using SnackShop.Application.DTOs.KhoHang;

namespace SnackShop.Application.Interfaces;

public interface IKhoHangService
{
    Task<PagedResult<NhaCungCapDto>> GetNhaCungCapsAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<NhaCungCapDto> GetNhaCungCapByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<NhaCungCapDto> CreateNhaCungCapAsync(CreateNhaCungCapRequest req, CancellationToken cancellationToken = default);
    Task<NhaCungCapDto> UpdateNhaCungCapAsync(Guid id, UpdateNhaCungCapRequest req, CancellationToken cancellationToken = default);
    Task DeleteNhaCungCapAsync(Guid id, CancellationToken cancellationToken = default);

    Task<PagedResult<DonNhapHangDto>> GetDonNhapHangsAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<DonNhapHangDto> GetDonNhapHangByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DonNhapHangDto> TaoDonNhapHangAsync(Guid nhanVienId, TaoDonNhapHangRequest req, CancellationToken cancellationToken = default);

    Task<PagedResult<SanPhamSapHetHangDto>> GetSanPhamSapHetHangAsync(int page, int pageSize, CancellationToken cancellationToken = default);
}
