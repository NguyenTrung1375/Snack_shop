using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnackShop.Application.Interfaces;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api/bao-cao")]
[Route("bao-cao")]
[Authorize(Roles = "admin,quan_ly")]
public class BaoCaoController : ControllerBase
{
    private readonly IBaoCaoService _baoCaoService;

    public BaoCaoController(IBaoCaoService baoCaoService)
    {
        _baoCaoService = baoCaoService;
    }

    /// <summary>Doanh thu theo tháng (lọc theo năm tùy chọn)</summary>
    [HttpGet("doanh-thu-theo-thang")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDoanhThuTheoThang(
        [FromQuery] int? nam = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _baoCaoService.GetDoanhThuTheoThangAsync(nam, cancellationToken);
        return Ok(result);
    }

    /// <summary>Sản phẩm bán chạy nhất (phân trang)</summary>
    [HttpGet("san-pham-ban-chay")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSanPhamBanChay(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _baoCaoService.GetSanPhamBanChayAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>a) Thống kê tổng tiền Hóa đơn từ ngày A đến ngày B</summary>
    [HttpGet("theo-khoang-ngay")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetThongKeTheoKhoangNgay(
        [FromQuery] DateTime? tuNgay = null,
        [FromQuery] DateTime? denNgay = null,
        CancellationToken cancellationToken = default)
    {
        var start = tuNgay ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var end = denNgay ?? DateTime.UtcNow;
        var result = await _baoCaoService.GetThongKeTheoKhoangNgayAsync(start, end, cancellationToken);
        return Ok(result);
    }

    /// <summary>b) Thống kê Thu - Chi - Lợi nhuận theo Quý và Năm</summary>
    [HttpGet("thu-chi-loi-nhuan-theo-quy")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetThuChiLoiNhuanTheoQuy(
        [FromQuery] int? nam = null,
        CancellationToken cancellationToken = default)
    {
        var targetYear = nam ?? DateTime.UtcNow.Year;
        var result = await _baoCaoService.GetThuChiLoiNhuanTheoQuyAsync(targetYear, cancellationToken);
        return Ok(result);
    }

    /// <summary>c1) Thống kê tổng tiền HĐ theo Nhân viên và Năm</summary>
    [HttpGet("doanh-thu-theo-nhan-vien")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDoanhThuTheoNhanVien(
        [FromQuery] List<int>? danhSachNam = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _baoCaoService.GetDoanhThuTheoNhanVienAsync(danhSachNam, cancellationToken);
        return Ok(result);
    }

    /// <summary>c2) Thống kê tổng tiền HĐ theo Khách hàng và Năm</summary>
    [HttpGet("doanh-thu-theo-khach-hang")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDoanhThuTheoKhachHang(
        [FromQuery] List<int>? danhSachNam = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _baoCaoService.GetDoanhThuTheoKhachHangAsync(danhSachNam, cancellationToken);
        return Ok(result);
    }

    /// <summary>d) Thống kê tổng tiền HĐ theo Sản phẩm & Quý - năm</summary>
    [HttpGet("doanh-thu-theo-san-pham-quy")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDoanhThuSanPhamTheoQuy(
        [FromQuery] int? nam = null,
        CancellationToken cancellationToken = default)
    {
        var targetYear = nam ?? DateTime.UtcNow.Year;
        var result = await _baoCaoService.GetDoanhThuSanPhamTheoQuyAsync(targetYear, cancellationToken);
        return Ok(result);
    }
}
