using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnackShop.Application.Interfaces;
using System.Security.Claims;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api/thong-bao")]
[Route("thong-bao")]
[Authorize]
public class ThongBaoController : ControllerBase
{
    private readonly IThongBaoService _thongBaoService;

    public ThongBaoController(IThongBaoService thongBaoService)
    {
        _thongBaoService = thongBaoService;
    }

    private Guid GetCurrentUserId()
    {
        var val = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.Parse(val!);
    }

    /// <summary>Lấy thông báo của tôi (phân trang)</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetThongBaoCuaToi(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var nguoiDungId = GetCurrentUserId();
        var result = await _thongBaoService.GetThongBaoCuaToiAsync(nguoiDungId, page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>Đếm số thông báo chưa đọc</summary>
    [HttpGet("chua-doc/so-luong")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DemChuaDoc(CancellationToken cancellationToken)
    {
        var nguoiDungId = GetCurrentUserId();
        var count = await _thongBaoService.DemThongBaoChuaDocAsync(nguoiDungId, cancellationToken);
        return Ok(new { count });
    }

    /// <summary>Đánh dấu thông báo đã đọc</summary>
    [HttpPatch("{id:guid}/da-doc")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DanhDauDaDoc(Guid id, CancellationToken cancellationToken)
    {
        var nguoiDungId = GetCurrentUserId();
        await _thongBaoService.DanhDauDaDocAsync(id, nguoiDungId, cancellationToken);
        return NoContent();
    }

    /// <summary>Đánh dấu tất cả thông báo là đã đọc</summary>
    [HttpPatch("da-doc-tat-ca")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DanhDauTatCaDaDoc(CancellationToken cancellationToken)
    {
        var nguoiDungId = GetCurrentUserId();
        await _thongBaoService.DanhDauTatCaDaDocAsync(nguoiDungId, cancellationToken);
        return NoContent();
    }

    /// <summary>Xóa thông báo</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> XoaThongBao(Guid id, CancellationToken cancellationToken)
    {
        var nguoiDungId = GetCurrentUserId();
        await _thongBaoService.XoaThongBaoAsync(id, nguoiDungId, cancellationToken);
        return NoContent();
    }
}
