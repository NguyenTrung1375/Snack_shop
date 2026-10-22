using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.ThongBao;
using SnackShop.Application.Interfaces;

namespace SnackShop.Application.Services;

public class ThongBaoService : IThongBaoService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;

    public ThongBaoService(IAppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<ThongBaoDto>> GetThongBaoCuaToiAsync(Guid nguoiDungId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var pageIndex = page > 0 ? page : 1;
        var size = pageSize > 0 ? pageSize : 20;

        var query = _db.ThongBaos
            .AsNoTracking()
            .Where(t => t.MaNguoiDung == nguoiDungId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.NgayTao)
            .Skip((pageIndex - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<ThongBaoDto>>(items);
        foreach (var dto in dtos)
        {
            dto.NoiDung = FormatThongBaoNoiDung(dto.NoiDung);
        }
        return new PagedResult<ThongBaoDto>(dtos, total, pageIndex, size);
    }

    private static string FormatThongBaoNoiDung(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return string.Empty;

        var text = raw;
        text = text.Replace("chuyen sang trang thai: da_xac_nhan", "đã được xác nhận thành công! Bếp đang chuẩn bị món.")
                   .Replace("chuyển sang trạng thái: da_xac_nhan", "đã được xác nhận thành công! Bếp đang chuẩn bị món.")
                   .Replace("chuyen sang trang thai: dang_giao", "đang trên đường giao đến bạn. Vui lòng chú ý điện thoại!")
                   .Replace("chuyển sang trạng thái: dang_giao", "đang trên đường giao đến bạn. Vui lòng chú ý điện thoại!")
                   .Replace("chuyen sang trang thai: da_giao", "đã được giao thành công. Chúc bạn ngon miệng!")
                   .Replace("chuyển sang trạng thái: da_giao", "đã được giao thành công. Chúc bạn ngon miệng!")
                   .Replace("chuyen sang trang thai: da_huy", "đã bị hủy.")
                   .Replace("chuyển sang trạng thái: da_huy", "đã bị hủy.")
                   .Replace("da_xac_nhan", "Đã xác nhận")
                   .Replace("dang_giao", "Đang giao hàng")
                   .Replace("da_giao", "Đã giao hàng")
                   .Replace("da_huy", "Đã hủy")
                   .Replace("cho_xac_nhan", "Chờ xác nhận");

        return text;
    }

    public async Task<int> DemThongBaoChuaDocAsync(Guid nguoiDungId, CancellationToken cancellationToken = default)
    {
        return await _db.ThongBaos
            .AsNoTracking()
            .Where(t => t.MaNguoiDung == nguoiDungId && !t.DaDoc)
            .CountAsync(cancellationToken);
    }

    public async Task DanhDauDaDocAsync(Guid maThongBao, Guid nguoiDungId, CancellationToken cancellationToken = default)
    {
        var thongBao = await _db.ThongBaos.FirstOrDefaultAsync(t => t.MaThongBao == maThongBao, cancellationToken);
        if (thongBao == null)
        {
            throw new AppException("Không tìm thấy thông báo.", StatusCodes.Status404NotFound);
        }

        if (thongBao.MaNguoiDung != nguoiDungId)
        {
            throw new AppException("Bạn không có quyền thao tác trên thông báo này.", StatusCodes.Status403Forbidden);
        }

        thongBao.DaDoc = true;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DanhDauTatCaDaDocAsync(Guid nguoiDungId, CancellationToken cancellationToken = default)
    {
        var unreadItems = await _db.ThongBaos
            .Where(t => t.MaNguoiDung == nguoiDungId && !t.DaDoc)
            .ToListAsync(cancellationToken);

        if (unreadItems.Any())
        {
            foreach (var item in unreadItems)
            {
                item.DaDoc = true;
            }
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task XoaThongBaoAsync(Guid maThongBao, Guid nguoiDungId, CancellationToken cancellationToken = default)
    {
        var thongBao = await _db.ThongBaos.FirstOrDefaultAsync(t => t.MaThongBao == maThongBao, cancellationToken);
        if (thongBao == null)
        {
            throw new AppException("Không tìm thấy thông báo.", StatusCodes.Status404NotFound);
        }

        if (thongBao.MaNguoiDung != nguoiDungId)
        {
            throw new AppException("Bạn không có quyền thao tác trên thông báo này.", StatusCodes.Status403Forbidden);
        }

        _db.ThongBaos.Remove(thongBao);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
