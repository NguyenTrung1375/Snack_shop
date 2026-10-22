using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.DanhGia;
using SnackShop.Application.DTOs.SanPham;
using SnackShop.Application.Interfaces;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;

namespace SnackShop.Application.Services;

public class DanhGiaService : IDanhGiaService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;

    public DanhGiaService(IAppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<DanhGiaSanPhamDto> TaoDanhGiaAsync(Guid khachHangId, TaoDanhGiaRequest req, CancellationToken cancellationToken = default)
    {
        if (req.SoSao < 1 || req.SoSao > 5)
        {
            throw new AppException("Số sao đánh giá phải từ 1 đến 5.", StatusCodes.Status400BadRequest);
        }

        var ctdh = await _db.ChiTietDonHangs
            .Include(c => c.DonHang).ThenInclude(d => d.KhachHang)
            .Include(c => c.DanhGiaSanPham)
            .FirstOrDefaultAsync(c => c.MaChiTietDonHang == req.MaChiTietDonHang, cancellationToken);

        if (ctdh == null)
        {
            throw new AppException("Không tìm thấy chi tiết đơn hàng.", StatusCodes.Status404NotFound);
        }

        if (ctdh.DonHang.MaKhachHang != khachHangId)
        {
            throw new AppException("Bạn không có quyền đánh giá chi tiết đơn hàng này.", StatusCodes.Status400BadRequest);
        }

        if (ctdh.DonHang.TrangThaiDonHang != TrangThaiDonHang.DaGiao)
        {
            throw new AppException("Chỉ được đánh giá khi đơn hàng đã giao.", StatusCodes.Status400BadRequest);
        }

        if (ctdh.DanhGiaSanPham != null)
        {
            throw new AppException("Chi tiết đơn hàng này đã được đánh giá.", StatusCodes.Status400BadRequest);
        }

        var danhGia = new DanhGiaSanPham
        {
            MaDanhGia = Guid.NewGuid(),
            MaSanPham = ctdh.MaSanPham,
            MaKhachHang = khachHangId,
            MaChiTietDonHang = req.MaChiTietDonHang,
            SoSao = req.SoSao,
            BinhLuan = req.BinhLuan?.Trim(),
            NgayTao = DateTime.Now
        };

        _db.DanhGiaSanPhams.Add(danhGia);

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.GetBaseException() is MySqlException { SqlState: "45000" } mysqlEx)
        {
            throw new AppException(mysqlEx.Message, StatusCodes.Status400BadRequest);
        }

        var saved = await _db.DanhGiaSanPhams
            .AsNoTracking()
            .Include(d => d.KhachHang).ThenInclude(k => k.NguoiDung)
            .FirstAsync(d => d.MaDanhGia == danhGia.MaDanhGia, cancellationToken);

        return _mapper.Map<DanhGiaSanPhamDto>(saved);
    }
}
