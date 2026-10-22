using SnackShop.Application.Common;
using SnackShop.Application.DTOs.BaoCao;

namespace SnackShop.Application.Interfaces;

public interface IBaoCaoService
{
    Task<List<DoanhThuTheoThangDto>> GetDoanhThuTheoThangAsync(int? nam, CancellationToken cancellationToken = default);
    Task<PagedResult<SanPhamBanChayDto>> GetSanPhamBanChayAsync(int page, int pageSize, CancellationToken cancellationToken = default);
}
