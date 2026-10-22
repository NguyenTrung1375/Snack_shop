using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.HoaDon;
using SnackShop.Application.Interfaces;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api/hoa-don")]
[Route("hoa-don")]
public class HoaDonController : ControllerBase
{
    private readonly IDonHangService _donHangService;
    private readonly ICurrentUser _currentUser;

    public HoaDonController(IDonHangService donHangService, ICurrentUser currentUser)
    {
        _donHangService = donHangService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Lấy danh sách hóa đơn có phân trang và tìm kiếm (Admin, Quản lý, Nhân viên)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "admin,quan_ly,nhan_vien")]
    [ProducesResponseType(typeof(PagedResult<HoaDonDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] HoaDonFilterRequest request, CancellationToken cancellationToken)
    {
        var result = await _donHangService.GetAllHoaDonAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xem thông tin hóa đơn theo mã hóa đơn, số hóa đơn hoặc mã đơn hàng (Admin, Quản lý, NV, Khách hàng)
    /// </summary>
    [HttpGet("{query}")]
    [Authorize]
    [ProducesResponseType(typeof(HoaDonDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByQuery(string query, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        var role = _currentUser.Role;
        var result = await _donHangService.TraCuuHoaDonAsync(query, userId, role, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xem thông tin hóa đơn theo mã đơn hàng
    /// </summary>
    [HttpGet("don-hang/{donHangId}")]
    [Authorize]
    [ProducesResponseType(typeof(HoaDonDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByDonHangId(string donHangId, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        var role = _currentUser.Role;
        var result = await _donHangService.TraCuuHoaDonAsync(donHangId, userId, role, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xuất hóa đơn cho đơn hàng (Admin, Nhân viên)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "admin,quan_ly,nhan_vien")]
    [ProducesResponseType(typeof(HoaDonDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> XuatHoaDon([FromBody] XuatHoaDonRequest request, CancellationToken cancellationToken)
    {
        if (!request.MaDonHang.HasValue)
        {
            throw new AppException("Mã đơn hàng không được để trống.", StatusCodes.Status400BadRequest);
        }

        var userId = _currentUser.Id;
        var result = await _donHangService.XuatHoaDonAsync(request.MaDonHang.Value, userId, cancellationToken);
        return Ok(result);
    }
}
