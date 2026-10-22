using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.DonHang;
using SnackShop.Application.DTOs.HoaDon;
using SnackShop.Application.Interfaces;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api/don-hang")]
[Route("don-hang")]
public class DonHangController : ControllerBase
{
    private readonly IDonHangService _donHangService;
    private readonly ICurrentUser _currentUser;

    public DonHangController(IDonHangService donHangService, ICurrentUser currentUser)
    {
        _donHangService = donHangService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Tính tạm tiền hàng, giảm giá và phí vận chuyển trước khi đặt
    /// </summary>
    [HttpPost("tinh-tam")]
    [Authorize]
    [ProducesResponseType(typeof(TinhTamDonHangResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TinhTam([FromBody] TinhTamDonHangRequest request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        var result = await _donHangService.TinhTamAsync(userId, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Đặt hàng mới (checkout)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "khach_hang,admin,nhan_vien")]
    [ProducesResponseType(typeof(DonHangDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DatHang([FromBody] DatHangRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var result = await _donHangService.DatHangAsync(userId, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách đơn hàng của khách hàng hiện tại
    /// </summary>
    [HttpGet("cua-toi")]
    [Authorize(Roles = "khach_hang,admin,nhan_vien")]
    [ProducesResponseType(typeof(PagedResult<DonHangDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCuaToi([FromQuery] DonHangFilterRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var result = await _donHangService.GetCuaToiAsync(userId, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết đơn hàng kèm lịch sử trạng thái
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(DonHangDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        var role = _currentUser.Role;
        var result = await _donHangService.GetByIdAsync(id, userId, role, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Khách hàng hủy đơn hàng khi ở trạng thái 'cho_xac_nhan' hoặc 'da_xac_nhan'
    /// </summary>
    [HttpPost("{id}/huy")]
    [Authorize]
    [ProducesResponseType(typeof(DonHangDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> HuyDon(Guid id, [FromBody] HuyDonHangRequest? request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var role = _currentUser.Role;
        var result = await _donHangService.HuyDonAsync(id, userId, role, request?.LyDoHuy, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách tất cả đơn hàng có lọc và phân trang (Admin, Nhân viên)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "admin,quan_ly,nhan_vien")]
    [ProducesResponseType(typeof(PagedResult<DonHangDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] DonHangFilterRequest request, CancellationToken cancellationToken)
    {
        var result = await _donHangService.GetAllAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Chuyển trạng thái đơn hàng theo luồng hợp lệ (Admin, Nhân viên)
    /// </summary>
    [HttpPatch("{id}/trang-thai")]
    [Authorize(Roles = "admin,quan_ly,nhan_vien")]
    [ProducesResponseType(typeof(DonHangDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CapNhatTrangThai(Guid id, [FromBody] CapNhatTrangThaiDonHangRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var result = await _donHangService.CapNhatTrangThaiAsync(id, request, userId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật trạng thái thanh toán của đơn hàng (Admin, Nhân viên)
    /// </summary>
    [HttpPatch("{id}/thanh-toan")]
    [Authorize(Roles = "admin,quan_ly,nhan_vien")]
    [ProducesResponseType(typeof(DonHangDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CapNhatThanhToan(Guid id, [FromBody] CapNhatTrangThaiThanhToanRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var result = await _donHangService.CapNhatThanhToanAsync(id, request, userId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xuất hóa đơn cho đơn hàng đã giao (Admin, Nhân viên)
    /// </summary>
    [HttpPost("{id}/hoa-don")]
    [Authorize(Roles = "admin,quan_ly,nhan_vien")]
    [ProducesResponseType(typeof(HoaDonDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> XuatHoaDon(Guid id, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id;
        var result = await _donHangService.XuatHoaDonAsync(id, userId, cancellationToken);
        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        var userId = _currentUser.Id;
        if (!userId.HasValue || userId.Value == Guid.Empty)
        {
            throw new AppException("Không thể xác định thông tin người dùng từ token.", StatusCodes.Status401Unauthorized);
        }
        return userId.Value;
    }
}
