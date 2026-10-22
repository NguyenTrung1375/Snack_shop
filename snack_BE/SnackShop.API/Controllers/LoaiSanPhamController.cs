using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SnackShop.Application.DTOs.LoaiSanPham;
using SnackShop.Application.Interfaces;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api/loai-san-pham")]
public class LoaiSanPhamController : ControllerBase
{
    private readonly ILoaiSanPhamService _loaiSanPhamService;

    public LoaiSanPhamController(ILoaiSanPhamService loaiSanPhamService)
    {
        _loaiSanPhamService = loaiSanPhamService;
    }

    /// <summary>
    /// Lấy danh sách cây phân cấp loại sản phẩm cha - con (public)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<LoaiSanPhamDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCayLoaiSanPham([FromQuery] bool? chiHoatDong, CancellationToken cancellationToken)
    {
        var result = await _loaiSanPhamService.GetCayLoaiSanPhamAsync(chiHoatDong, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết một loại sản phẩm theo mã (public)
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(LoaiSanPhamDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _loaiSanPhamService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Thêm loại sản phẩm mới (chỉ admin)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(LoaiSanPhamDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateLoaiSanPhamRequest request, CancellationToken cancellationToken)
    {
        var result = await _loaiSanPhamService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.MaLoaiSanPham }, result);
    }

    /// <summary>
    /// Cập nhật loại sản phẩm (chỉ admin)
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(LoaiSanPhamDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLoaiSanPhamRequest request, CancellationToken cancellationToken)
    {
        var result = await _loaiSanPhamService.UpdateAsync(id, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xóa loại sản phẩm (chỉ admin)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _loaiSanPhamService.DeleteAsync(id, cancellationToken);
        return Ok(new { message = "Xóa loại sản phẩm thành công." });
    }
}
