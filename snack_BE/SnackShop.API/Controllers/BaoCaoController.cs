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
}
