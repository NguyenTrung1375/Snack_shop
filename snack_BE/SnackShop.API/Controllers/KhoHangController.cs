using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SnackShop.Application.DTOs.KhoHang;
using SnackShop.Application.Interfaces;
using System.Security.Claims;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api")]
[Route("")]
[Authorize(Roles = "admin,quan_ly")]
public class KhoHangController : ControllerBase
{
    private readonly IKhoHangService _khoHangService;

    public KhoHangController(IKhoHangService khoHangService)
    {
        _khoHangService = khoHangService;
    }

    // ── Nhà cung cấp ──────────────────────────────────────────────────────────

    [HttpGet("nha-cung-cap")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNhaCungCaps(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _khoHangService.GetNhaCungCapsAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    [HttpGet("nha-cung-cap/{id:guid}")]
    [ProducesResponseType(typeof(NhaCungCapDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNhaCungCapById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _khoHangService.GetNhaCungCapByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("nha-cung-cap")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(NhaCungCapDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateNhaCungCap([FromBody] CreateNhaCungCapRequest req, CancellationToken cancellationToken)
    {
        var result = await _khoHangService.CreateNhaCungCapAsync(req, cancellationToken);
        return CreatedAtAction(nameof(GetNhaCungCapById), new { id = result.MaNhaCungCap }, result);
    }

    [HttpPut("nha-cung-cap/{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(NhaCungCapDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateNhaCungCap(Guid id, [FromBody] UpdateNhaCungCapRequest req, CancellationToken cancellationToken)
    {
        var result = await _khoHangService.UpdateNhaCungCapAsync(id, req, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("nha-cung-cap/{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteNhaCungCap(Guid id, CancellationToken cancellationToken)
    {
        await _khoHangService.DeleteNhaCungCapAsync(id, cancellationToken);
        return NoContent();
    }

    // ── Đơn nhập hàng ─────────────────────────────────────────────────────────

    [HttpGet("don-nhap-hang")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDonNhapHangs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _khoHangService.GetDonNhapHangsAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    [HttpGet("don-nhap-hang/{id:guid}")]
    [ProducesResponseType(typeof(DonNhapHangDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDonNhapHangById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _khoHangService.GetDonNhapHangByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("don-nhap-hang")]
    [ProducesResponseType(typeof(DonNhapHangDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TaoDonNhapHang([FromBody] TaoDonNhapHangRequest req, CancellationToken cancellationToken)
    {
        var nhanVienId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _khoHangService.TaoDonNhapHangAsync(nhanVienId, req, cancellationToken);
        return CreatedAtAction(nameof(GetDonNhapHangById), new { id = result.MaDonNhap }, result);
    }

    // ── Tồn kho ───────────────────────────────────────────────────────────────

    [HttpGet("ton-kho/sap-het")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSanPhamSapHetHang(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _khoHangService.GetSanPhamSapHetHangAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }
}
