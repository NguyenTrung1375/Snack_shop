using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnackShop.Application.DTOs.NguoiDung;
using SnackShop.Application.Interfaces;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api")]
[Route("")]
[Authorize(Roles = "admin,quan_ly")]
public class NguoiDungController : ControllerBase
{
    private readonly INguoiDungService _nguoiDungService;

    public NguoiDungController(INguoiDungService nguoiDungService)
    {
        _nguoiDungService = nguoiDungService;
    }

    // ── Người dùng ─────────────────────────────────────────────────────────────

    /// <summary>Danh sách người dùng (lọc keyword, vaiTro, trangThai)</summary>
    [HttpGet("nguoi-dung")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNguoiDungs([FromQuery] NguoiDungFilterRequest filter, CancellationToken cancellationToken)
    {
        var result = await _nguoiDungService.GetNguoiDungsAsync(filter, cancellationToken);
        return Ok(result);
    }

    /// <summary>Chi tiết người dùng</summary>
    [HttpGet("nguoi-dung/{id:guid}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(NguoiDungDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNguoiDungById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _nguoiDungService.GetNguoiDungByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>Tạo tài khoản người dùng mới (chỉ Admin)</summary>
    [HttpPost("nguoi-dung")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(NguoiDungDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateNguoiDung([FromBody] CreateNguoiDungRequest req, CancellationToken cancellationToken)
    {
        var result = await _nguoiDungService.CreateNguoiDungAsync(req, cancellationToken);
        return CreatedAtAction(nameof(GetNguoiDungById), new { id = result.MaNguoiDung }, result);
    }

    /// <summary>Khóa / mở tài khoản người dùng</summary>
    [HttpPatch("nguoi-dung/{id:guid}/trang-thai")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(NguoiDungDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CapNhatTrangThai(Guid id, [FromBody] CapNhatTrangThaiNguoiDungRequest req, CancellationToken cancellationToken)
    {
        var result = await _nguoiDungService.CapNhatTrangThaiAsync(id, req, cancellationToken);
        return Ok(result);
    }

    // ── Nhân viên ──────────────────────────────────────────────────────────────

    /// <summary>Danh sách nhân viên</summary>
    [HttpGet("nhan-vien")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNhanViens(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _nguoiDungService.GetNhanViensAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>Chi tiết nhân viên</summary>
    [HttpGet("nhan-vien/{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(NhanVienDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNhanVienById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _nguoiDungService.GetNhanVienByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>Tạo nhân viên mới (tạo NguoiDung + NhanVien)</summary>
    [HttpPost("nhan-vien")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(NhanVienDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateNhanVien([FromBody] CreateNhanVienRequest req, CancellationToken cancellationToken)
    {
        var result = await _nguoiDungService.CreateNhanVienAsync(req, cancellationToken);
        return CreatedAtAction(nameof(GetNhanVienById), new { id = result.MaNguoiDung }, result);
    }

    /// <summary>Cập nhật thông tin nhân viên</summary>
    [HttpPut("nhan-vien/{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(NhanVienDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateNhanVien(Guid id, [FromBody] UpdateNhanVienRequest req, CancellationToken cancellationToken)
    {
        var result = await _nguoiDungService.UpdateNhanVienAsync(id, req, cancellationToken);
        return Ok(result);
    }

    /// <summary>Xóa nhân viên</summary>
    [HttpDelete("nhan-vien/{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteNhanVien(Guid id, CancellationToken cancellationToken)
    {
        await _nguoiDungService.DeleteNguoiDungAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>Cập nhật thông tin người dùng</summary>
    [HttpPut("nguoi-dung/{id:guid}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(NguoiDungDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateNguoiDung(Guid id, [FromBody] UpdateNguoiDungRequest req, CancellationToken cancellationToken)
    {
        var result = await _nguoiDungService.UpdateNguoiDungAsync(id, req, cancellationToken);
        return Ok(result);
    }

    /// <summary>Xóa người dùng</summary>
    [HttpDelete("nguoi-dung/{id:guid}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteNguoiDung(Guid id, CancellationToken cancellationToken)
    {
        await _nguoiDungService.DeleteNguoiDungAsync(id, cancellationToken);
        return NoContent();
    }
}

