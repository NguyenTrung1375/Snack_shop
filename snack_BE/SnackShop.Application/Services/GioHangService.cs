using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.GioHang;
using SnackShop.Application.Interfaces;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;

namespace SnackShop.Application.Services;

public class GioHangService : IGioHangService
{
    private readonly IAppDbContext _db;

    public GioHangService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ChiTietGioHangDto>> GetGioHangAsync(Guid maKhachHang, CancellationToken cancellationToken = default)
    {
        return await _db.ChiTietGioHangs
            .AsNoTracking()
            .Include(c => c.SanPham)
            .Where(c => c.MaKhachHang == maKhachHang)
            .OrderByDescending(c => c.NgayTao)
            .Select(c => new ChiTietGioHangDto
            {
                MaGioHang = c.MaGioHang,
                MaSanPham = c.MaSanPham,
                TenSanPham = c.SanPham.TenSanPham,
                HinhAnhDaiDien = c.SanPham.HinhAnhDaiDien,
                GiaBan = c.SanPham.GiaBan,
                SoLuong = c.SoLuong,
                ThanhTien = c.SanPham.GiaBan * c.SoLuong
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ChiTietGioHangDto> ThemGioHangAsync(Guid maKhachHang, ThemGioHangRequest request, CancellationToken cancellationToken = default)
    {
        if (request.SoLuong <= 0)
        {
            throw new AppException("Số lượng phải lớn hơn 0.", StatusCodes.Status400BadRequest);
        }

        // Kiểm tra sản phẩm tồn tại và đang bán
        var sanPham = await _db.SanPhams
            .FirstOrDefaultAsync(s => s.MaSanPham == request.MaSanPham, cancellationToken);

        if (sanPham == null)
        {
            throw new AppException("Không tìm thấy sản phẩm.", StatusCodes.Status404NotFound);
        }

        if (sanPham.TrangThai != TrangThaiSanPham.DangBan)
        {
            throw new AppException("Sản phẩm hiện đang ngừng bán.", StatusCodes.Status400BadRequest);
        }

        // Đảm bảo thông tin khách hàng tồn tại trong bảng khach_hang
        var khachHangExists = await _db.KhachHangs.AnyAsync(k => k.MaNguoiDung == maKhachHang, cancellationToken);
        if (!khachHangExists)
        {
            var nguoiDungExists = await _db.NguoiDungs.AnyAsync(u => u.MaNguoiDung == maKhachHang, cancellationToken);
            if (!nguoiDungExists)
            {
                throw new AppException("Không tìm thấy thông tin người dùng.", StatusCodes.Status404NotFound);
            }

            var khachHang = new KhachHang { MaNguoiDung = maKhachHang };
            _db.KhachHangs.Add(khachHang);
            await _db.SaveChangesAsync(cancellationToken);
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa -> nếu có thì cộng dồn
        var existingItem = await _db.ChiTietGioHangs
            .FirstOrDefaultAsync(c => c.MaKhachHang == maKhachHang && c.MaSanPham == request.MaSanPham, cancellationToken);

        if (existingItem != null)
        {
            existingItem.SoLuong += request.SoLuong;
        }
        else
        {
            existingItem = new ChiTietGioHang
            {
                MaGioHang = Guid.NewGuid(),
                MaKhachHang = maKhachHang,
                MaSanPham = request.MaSanPham,
                SoLuong = request.SoLuong,
                NgayTao = DateTime.UtcNow
            };
            _db.ChiTietGioHangs.Add(existingItem);
        }

        await _db.SaveChangesAsync(cancellationToken);

        return new ChiTietGioHangDto
        {
            MaGioHang = existingItem.MaGioHang,
            MaSanPham = existingItem.MaSanPham,
            TenSanPham = sanPham.TenSanPham,
            HinhAnhDaiDien = sanPham.HinhAnhDaiDien,
            GiaBan = sanPham.GiaBan,
            SoLuong = existingItem.SoLuong,
            ThanhTien = sanPham.GiaBan * existingItem.SoLuong
        };
    }

    public async Task<ChiTietGioHangDto> CapNhatGioHangAsync(Guid maKhachHang, Guid maGioHang, CapNhatGioHangRequest request, CancellationToken cancellationToken = default)
    {
        if (request.SoLuong <= 0)
        {
            throw new AppException("Số lượng phải lớn hơn 0.", StatusCodes.Status400BadRequest);
        }

        var item = await _db.ChiTietGioHangs
            .Include(c => c.SanPham)
            .FirstOrDefaultAsync(c => c.MaGioHang == maGioHang, cancellationToken);

        if (item == null)
        {
            throw new AppException("Không tìm thấy mục trong giỏ hàng.", StatusCodes.Status404NotFound);
        }

        // Kiểm tra quyền sở hữu giỏ hàng
        if (item.MaKhachHang != maKhachHang)
        {
            throw new AppException("Bạn không có quyền chỉnh sửa mục giỏ hàng này.", StatusCodes.Status403Forbidden);
        }

        item.SoLuong = request.SoLuong;
        await _db.SaveChangesAsync(cancellationToken);

        return new ChiTietGioHangDto
        {
            MaGioHang = item.MaGioHang,
            MaSanPham = item.MaSanPham,
            TenSanPham = item.SanPham?.TenSanPham ?? string.Empty,
            HinhAnhDaiDien = item.SanPham?.HinhAnhDaiDien,
            GiaBan = item.SanPham?.GiaBan ?? 0,
            SoLuong = item.SoLuong,
            ThanhTien = (item.SanPham?.GiaBan ?? 0) * item.SoLuong
        };
    }

    public async Task XoaGioHangAsync(Guid maKhachHang, Guid maGioHang, CancellationToken cancellationToken = default)
    {
        var item = await _db.ChiTietGioHangs
            .FirstOrDefaultAsync(c => c.MaGioHang == maGioHang, cancellationToken);

        if (item == null)
        {
            throw new AppException("Không tìm thấy mục trong giỏ hàng.", StatusCodes.Status404NotFound);
        }

        // Kiểm tra quyền sở hữu giỏ hàng
        if (item.MaKhachHang != maKhachHang)
        {
            throw new AppException("Bạn không có quyền xóa mục giỏ hàng này.", StatusCodes.Status403Forbidden);
        }

        _db.ChiTietGioHangs.Remove(item);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
