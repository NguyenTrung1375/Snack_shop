using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.LoaiSanPham;
using SnackShop.Application.Interfaces;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;

namespace SnackShop.Application.Services;

public class LoaiSanPhamService : ILoaiSanPhamService
{
    private readonly IAppDbContext _db;

    public LoaiSanPhamService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<List<LoaiSanPhamDto>> GetCayLoaiSanPhamAsync(bool? chiHoatDong = null, CancellationToken cancellationToken = default)
    {
        var query = _db.LoaiSanPhams.AsNoTracking();

        if (chiHoatDong.HasValue)
        {
            var trangThai = chiHoatDong.Value ? TrangThaiNguoiDung.HoatDong : TrangThaiNguoiDung.NgungHoatDong;
            query = query.Where(l => l.TrangThai == trangThai);
        }

        var list = await query.ToListAsync(cancellationToken);

        var dtoList = list.Select(l => new LoaiSanPhamDto
        {
            MaLoaiSanPham = l.MaLoaiSanPham,
            MaLoaiCha = l.MaLoaiCha,
            TenLoaiSanPham = l.TenLoaiSanPham,
            MoTa = l.MoTa,
            TrangThai = l.TrangThai.ToSnakeCase(),
            LoaiCons = new List<LoaiSanPhamDto>()
        }).ToList();

        var dict = dtoList.ToDictionary(x => x.MaLoaiSanPham);
        var rootNodes = new List<LoaiSanPhamDto>();

        foreach (var item in dtoList)
        {
            if (item.MaLoaiCha.HasValue && dict.TryGetValue(item.MaLoaiCha.Value, out var parent) && parent.MaLoaiSanPham != item.MaLoaiSanPham)
            {
                parent.LoaiCons.Add(item);
            }
            else
            {
                rootNodes.Add(item);
            }
        }

        return rootNodes;
    }

    public async Task<LoaiSanPhamDto> GetByIdAsync(Guid maLoai, CancellationToken cancellationToken = default)
    {
        var loai = await _db.LoaiSanPhams
            .AsNoTracking()
            .Include(l => l.LoaiCons)
            .FirstOrDefaultAsync(l => l.MaLoaiSanPham == maLoai, cancellationToken);

        if (loai == null)
        {
            throw new AppException("Không tìm thấy loại sản phẩm.", StatusCodes.Status404NotFound);
        }

        return new LoaiSanPhamDto
        {
            MaLoaiSanPham = loai.MaLoaiSanPham,
            MaLoaiCha = loai.MaLoaiCha,
            TenLoaiSanPham = loai.TenLoaiSanPham,
            MoTa = loai.MoTa,
            TrangThai = loai.TrangThai.ToSnakeCase(),
            LoaiCons = loai.LoaiCons.Select(c => new LoaiSanPhamDto
            {
                MaLoaiSanPham = c.MaLoaiSanPham,
                MaLoaiCha = c.MaLoaiCha,
                TenLoaiSanPham = c.TenLoaiSanPham,
                MoTa = c.MoTa,
                TrangThai = c.TrangThai.ToSnakeCase()
            }).ToList()
        };
    }

    public async Task<LoaiSanPhamDto> CreateAsync(CreateLoaiSanPhamRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.TenLoaiSanPham))
        {
            throw new AppException("Tên loại sản phẩm không được để trống.", StatusCodes.Status400BadRequest);
        }

        if (request.MaLoaiCha.HasValue)
        {
            var parentExists = await _db.LoaiSanPhams.AnyAsync(l => l.MaLoaiSanPham == request.MaLoaiCha.Value, cancellationToken);
            if (!parentExists)
            {
                throw new AppException("Loại sản phẩm cha không tồn tại.", StatusCodes.Status400BadRequest);
            }
        }

        var trangThai = TrangThaiNguoiDung.HoatDong;
        if (!string.IsNullOrWhiteSpace(request.TrangThai))
        {
            trangThai = ParseTrangThai(request.TrangThai);
        }

        var entity = new LoaiSanPham
        {
            MaLoaiSanPham = Guid.NewGuid(),
            MaLoaiCha = request.MaLoaiCha,
            TenLoaiSanPham = request.TenLoaiSanPham.Trim(),
            MoTa = request.MoTa?.Trim(),
            TrangThai = trangThai
        };

        _db.LoaiSanPhams.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return new LoaiSanPhamDto
        {
            MaLoaiSanPham = entity.MaLoaiSanPham,
            MaLoaiCha = entity.MaLoaiCha,
            TenLoaiSanPham = entity.TenLoaiSanPham,
            MoTa = entity.MoTa,
            TrangThai = entity.TrangThai.ToSnakeCase()
        };
    }

    public async Task<LoaiSanPhamDto> UpdateAsync(Guid maLoai, UpdateLoaiSanPhamRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _db.LoaiSanPhams.FirstOrDefaultAsync(l => l.MaLoaiSanPham == maLoai, cancellationToken);
        if (entity == null)
        {
            throw new AppException("Không tìm thấy loại sản phẩm.", StatusCodes.Status404NotFound);
        }

        if (string.IsNullOrWhiteSpace(request.TenLoaiSanPham))
        {
            throw new AppException("Tên loại sản phẩm không được để trống.", StatusCodes.Status400BadRequest);
        }

        if (request.MaLoaiCha.HasValue)
        {
            if (request.MaLoaiCha.Value == maLoai)
            {
                throw new AppException("Loại sản phẩm không thể là con của chính nó.", StatusCodes.Status400BadRequest);
            }

            var parentExists = await _db.LoaiSanPhams.AnyAsync(l => l.MaLoaiSanPham == request.MaLoaiCha.Value, cancellationToken);
            if (!parentExists)
            {
                throw new AppException("Loại sản phẩm cha không tồn tại.", StatusCodes.Status400BadRequest);
            }
        }

        entity.MaLoaiCha = request.MaLoaiCha;
        entity.TenLoaiSanPham = request.TenLoaiSanPham.Trim();
        entity.MoTa = request.MoTa?.Trim();

        if (!string.IsNullOrWhiteSpace(request.TrangThai))
        {
            entity.TrangThai = ParseTrangThai(request.TrangThai);
        }

        await _db.SaveChangesAsync(cancellationToken);

        return new LoaiSanPhamDto
        {
            MaLoaiSanPham = entity.MaLoaiSanPham,
            MaLoaiCha = entity.MaLoaiCha,
            TenLoaiSanPham = entity.TenLoaiSanPham,
            MoTa = entity.MoTa,
            TrangThai = entity.TrangThai.ToSnakeCase()
        };
    }

    public async Task DeleteAsync(Guid maLoai, CancellationToken cancellationToken = default)
    {
        var entity = await _db.LoaiSanPhams.FirstOrDefaultAsync(l => l.MaLoaiSanPham == maLoai, cancellationToken);
        if (entity == null)
        {
            throw new AppException("Không tìm thấy loại sản phẩm.", StatusCodes.Status404NotFound);
        }

        var hasProducts = await _db.SanPhams.AnyAsync(p => p.MaLoaiSanPham == maLoai, cancellationToken);
        if (hasProducts)
        {
            throw new AppException("Không thể xóa loại sản phẩm vì vẫn còn sản phẩm thuộc loại này.", StatusCodes.Status400BadRequest);
        }

        var hasChildren = await _db.LoaiSanPhams.AnyAsync(l => l.MaLoaiCha == maLoai, cancellationToken);
        if (hasChildren)
        {
            throw new AppException("Không thể xóa loại sản phẩm vì vẫn còn loại sản phẩm con.", StatusCodes.Status400BadRequest);
        }

        _db.LoaiSanPhams.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private static TrangThaiNguoiDung ParseTrangThai(string status)
    {
        var normalized = status.Trim().ToLowerInvariant();
        return normalized switch
        {
            "hoat_dong" or "hoatdong" or "active" => TrangThaiNguoiDung.HoatDong,
            "ngung_hoat_dong" or "ngunghoatdong" or "inactive" => TrangThaiNguoiDung.NgungHoatDong,
            _ => throw new AppException($"Trạng thái '{status}' không hợp lệ. Chỉ chấp nhận hoat_dong hoặc ngung_hoat_dong.", StatusCodes.Status400BadRequest)
        };
    }
}
