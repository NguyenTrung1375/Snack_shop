using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.GioHang;
using SnackShop.Application.Interfaces;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api/gio-hang")]
[Authorize]
public class GioHangController : ControllerBase
{
    private readonly IGioHangService _gioHangService;
    private readonly ICurrentUser _currentUser;

    public GioHangController(IGioHangService gioHangService, ICurrentUser currentUser)
    {
        _gioHangService = gioHangService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Xem giỏ hàng của khách hàng hiện tại
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ChiTietGioHangDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetGioHang(CancellationToken cancellationToken)
    {
        var maKhachHang = GetCurrentUserId();
        var result = await _gioHangService.GetGioHangAsync(maKhachHang, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Thêm sản phẩm vào giỏ hàng (nếu đã có trong giỏ thì cộng dồn số lượng)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ChiTietGioHangDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ThemGioHang([FromBody] ThemGioHangRequest request, CancellationToken cancellationToken)
    {
        var maKhachHang = GetCurrentUserId();
        var result = await _gioHangService.ThemGioHangAsync(maKhachHang, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật số lượng của một sản phẩm trong giỏ hàng (chỉ sửa của mình)
    /// </summary>
    [HttpPut("{maGioHang:guid}")]
    [ProducesResponseType(typeof(ChiTietGioHangDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CapNhatGioHang(Guid maGioHang, [FromBody] CapNhatGioHangRequest request, CancellationToken cancellationToken)
    {
        var maKhachHang = GetCurrentUserId();
        var result = await _gioHangService.CapNhatGioHangAsync(maKhachHang, maGioHang, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xóa một sản phẩm khỏi giỏ hàng (chỉ xóa của mình)
    /// </summary>
    [HttpDelete("{maGioHang:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> XoaGioHang(Guid maGioHang, CancellationToken cancellationToken)
    {
        var maKhachHang = GetCurrentUserId();
        await _gioHangService.XoaGioHangAsync(maKhachHang, maGioHang, cancellationToken);
        return Ok(new { message = "Xóa sản phẩm khỏi giỏ hàng thành công." });
    }

    private Guid GetCurrentUserId()
    {
        if (_currentUser.Id.HasValue)
        {
            return _currentUser.Id.Value;
        }

        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? User.FindFirst("sub")?.Value;

        if (Guid.TryParse(sub, out var userId))
        {
            return userId;
        }

        throw new AppException("Không tìm thấy danh tính người dùng trong token.", StatusCodes.Status401Unauthorized);
    }
}
