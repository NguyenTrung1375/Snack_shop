using SnackShop.Application.DTOs.DanhGia;
using SnackShop.Application.DTOs.SanPham;

namespace SnackShop.Application.Interfaces;

public interface IDanhGiaService
{
    Task<DanhGiaSanPhamDto> TaoDanhGiaAsync(Guid khachHangId, TaoDanhGiaRequest req, CancellationToken cancellationToken = default);
}
