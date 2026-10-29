using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.DTOs.DanhGia;
using SnackShop.Application.DTOs.SanPham;
using SnackShop.Application.Interfaces;
using System.Security.Claims;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api/danh-gia")]
[Route("danh-gia")]
public class DanhGiaController : ControllerBase
{
    private readonly IDanhGiaService _danhGiaService;
    private readonly IAppDbContext _db;

    public DanhGiaController(IDanhGiaService danhGiaService, IAppDbContext db)
    {
        _danhGiaService = danhGiaService;
        _db = db;
    }

    /// <summary>Lấy danh sách đánh giá thực tế từ database cho trang chủ (ưu tiên mới nhất)</summary>
    [HttpGet("noi-bat")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<DanhGiaSanPhamDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDanhGiaNoiBat(
        [FromQuery] int limit = 12, 
        [FromQuery] string? sapXep = "moi_nhat", 
        CancellationToken cancellationToken = default)
    {
        var size = limit > 0 && limit <= 50 ? limit : 12;

        var query = _db.DanhGiaSanPhams
            .AsNoTracking()
            .Include(d => d.KhachHang)
                .ThenInclude(k => k.NguoiDung)
            .Include(d => d.SanPham)
            .Where(d => !string.IsNullOrEmpty(d.BinhLuan));

        if (sapXep == "moi_nhat")
        {
            var items = await query
                .OrderByDescending(d => d.NgayTao)
                .Take(size)
                .Select(d => new DanhGiaSanPhamDto
                {
                    MaDanhGia = d.MaDanhGia,
                    MaSanPham = d.MaSanPham,
                    TenSanPham = d.SanPham.TenSanPham,
                    HinhAnhSanPham = d.SanPham.HinhAnhDaiDien,
                    MaKhachHang = d.MaKhachHang,
                    TenKhachHang = d.KhachHang.NguoiDung != null ? $"{d.KhachHang.NguoiDung.HoLot} {d.KhachHang.NguoiDung.Ten}".Trim() : "Khách hàng",
                    SoSao = d.SoSao,
                    BinhLuan = d.BinhLuan,
                    NgayTao = d.NgayTao
                })
                .ToListAsync(cancellationToken);

            return Ok(items);
        }
        else
        {
            var items = await query
                .OrderByDescending(d => d.NgayTao)
                .Take(size * 3)
                .Select(d => new DanhGiaSanPhamDto
                {
                    MaDanhGia = d.MaDanhGia,
                    MaSanPham = d.MaSanPham,
                    TenSanPham = d.SanPham.TenSanPham,
                    HinhAnhSanPham = d.SanPham.HinhAnhDaiDien,
                    MaKhachHang = d.MaKhachHang,
                    TenKhachHang = d.KhachHang.NguoiDung != null ? $"{d.KhachHang.NguoiDung.HoLot} {d.KhachHang.NguoiDung.Ten}".Trim() : "Khách hàng",
                    SoSao = d.SoSao,
                    BinhLuan = d.BinhLuan,
                    NgayTao = d.NgayTao
                })
                .ToListAsync(cancellationToken);

            var rng = new Random();
            var randomized = items.OrderBy(_ => rng.Next()).Take(size).ToList();

            return Ok(randomized);
        }
    }

    /// <summary>Đánh giá sản phẩm (sau khi đơn đã giao)</summary>
    [HttpPost]
    [Authorize(Roles = "khach_hang")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TaoDanhGia([FromBody] TaoDanhGiaRequest req, CancellationToken cancellationToken)
    {
        var khachHangId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _danhGiaService.TaoDanhGiaAsync(khachHangId, req, cancellationToken);
        return CreatedAtAction(nameof(TaoDanhGia), result);
    }
}
