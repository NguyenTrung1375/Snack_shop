using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.KhuyenMai;
using SnackShop.Application.Interfaces;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api/khuyen-mai")]
public class KhuyenMaiController : ControllerBase
{
    private readonly IKhuyenMaiService _khuyenMaiService;
    private readonly ICurrentUser _currentUser;

    public KhuyenMaiController(IKhuyenMaiService khuyenMaiService, ICurrentUser currentUser)
    {
        _khuyenMaiService = khuyenMaiService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Lấy danh sách các chương trình khuyến mãi đang chạy (public)
    /// </summary>
    [HttpGet("dang-chay")]
    [ProducesResponseType(typeof(List<ChuongTrinhKhuyenMaiDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDangChay(CancellationToken cancellationToken)
    {
        var result = await _khuyenMaiService.GetDangChayAsync(cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Kiểm tra voucher theo mã code và giá trị đơn hàng (chỉ khách hàng / admin)
    /// </summary>
    [HttpPost("kiem-tra-voucher")]
    [Authorize]
    [ProducesResponseType(typeof(KiemTraVoucherResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> KiemTraVoucher([FromBody] KiemTraVoucherRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var result = await _khuyenMaiService.KiemTraVoucherAsync(userId, request.MaCode, request.TongTienHang, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách tất cả chương trình khuyến mãi có lọc và phân trang (chỉ admin)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(PagedResult<ChuongTrinhKhuyenMaiDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll([FromQuery] KhuyenMaiFilterRequest request, CancellationToken cancellationToken)
    {
        var result = await _khuyenMaiService.GetPagedListAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết một chương trình khuyến mãi theo ID (chỉ admin)
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(ChuongTrinhKhuyenMaiDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _khuyenMaiService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Tạo mới chương trình khuyến mãi kèm bảng con theo loại (chỉ admin)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(ChuongTrinhKhuyenMaiDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateKhuyenMaiRequest request, CancellationToken cancellationToken)
    {
        var result = await _khuyenMaiService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.MaCtkm }, result);
    }

    /// <summary>
    /// Cập nhật thông tin chương trình khuyến mãi (chỉ admin)
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(ChuongTrinhKhuyenMaiDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateKhuyenMaiRequest request, CancellationToken cancellationToken)
    {
        var result = await _khuyenMaiService.UpdateAsync(id, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xóa chương trình khuyến mãi (chỉ admin)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _khuyenMaiService.DeleteAsync(id, cancellationToken);
        return Ok(new { message = "Xóa chương trình khuyến mãi thành công." });
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
