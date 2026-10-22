using SnackShop.Application.Common;
using SnackShop.Application.DTOs.NguoiDung;

namespace SnackShop.Application.Interfaces;

public interface INguoiDungService
{
    Task<PagedResult<NguoiDungDto>> GetNguoiDungsAsync(NguoiDungFilterRequest filter, CancellationToken cancellationToken = default);
    Task<NguoiDungDto> GetNguoiDungByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<NguoiDungDto> CreateNguoiDungAsync(CreateNguoiDungRequest req, CancellationToken cancellationToken = default);
    Task<NguoiDungDto> CapNhatTrangThaiAsync(Guid id, CapNhatTrangThaiNguoiDungRequest req, CancellationToken cancellationToken = default);
    Task<NguoiDungDto> UpdateNguoiDungAsync(Guid id, UpdateNguoiDungRequest req, CancellationToken cancellationToken = default);
    Task<bool> DeleteNguoiDungAsync(Guid id, CancellationToken cancellationToken = default);

    Task<PagedResult<NhanVienDto>> GetNhanViensAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<NhanVienDto> GetNhanVienByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<NhanVienDto> CreateNhanVienAsync(CreateNhanVienRequest req, CancellationToken cancellationToken = default);
    Task<NhanVienDto> UpdateNhanVienAsync(Guid id, UpdateNhanVienRequest req, CancellationToken cancellationToken = default);
}
