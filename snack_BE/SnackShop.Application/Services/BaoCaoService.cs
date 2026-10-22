using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.BaoCao;
using SnackShop.Application.Interfaces;

namespace SnackShop.Application.Services;

public class BaoCaoService : IBaoCaoService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;

    public BaoCaoService(IAppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<DoanhThuTheoThangDto>> GetDoanhThuTheoThangAsync(int? nam, CancellationToken cancellationToken = default)
    {
        var query = _db.DoanhThuTheoThangViews.AsNoTracking();

        if (nam.HasValue)
        {
            var namStr = nam.Value.ToString();
            query = query.Where(v => v.Thang.StartsWith(namStr));
        }

        var items = await query
            .OrderBy(v => v.Thang)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<DoanhThuTheoThangDto>>(items);
    }

    public async Task<PagedResult<SanPhamBanChayDto>> GetSanPhamBanChayAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var pageIndex = page > 0 ? page : 1;
        var size = pageSize > 0 ? pageSize : 20;

        var total = await _db.SanPhamBanChayViews.AsNoTracking().CountAsync(cancellationToken);

        var items = await _db.SanPhamBanChayViews
            .AsNoTracking()
            .OrderByDescending(v => v.TongSoLuongBan)
            .Skip((pageIndex - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<SanPhamBanChayDto>>(items);
        return new PagedResult<SanPhamBanChayDto>(dtos, total, pageIndex, size);
    }
}
