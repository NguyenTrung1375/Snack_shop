using SnackShop.Application.Common;
using SnackShop.Application.DTOs.ThongBao;

namespace SnackShop.Application.Interfaces;

public interface IThongBaoService
{
    Task<PagedResult<ThongBaoDto>> GetThongBaoCuaToiAsync(Guid nguoiDungId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> DemThongBaoChuaDocAsync(Guid nguoiDungId, CancellationToken cancellationToken = default);
    Task DanhDauDaDocAsync(Guid maThongBao, Guid nguoiDungId, CancellationToken cancellationToken = default);
    Task DanhDauTatCaDaDocAsync(Guid nguoiDungId, CancellationToken cancellationToken = default);
    Task XoaThongBaoAsync(Guid maThongBao, Guid nguoiDungId, CancellationToken cancellationToken = default);
}
