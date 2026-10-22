using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.HinhAnh;
using SnackShop.Application.DTOs.SanPham;
using SnackShop.Application.Interfaces;

namespace SnackShop.API.Controllers;

[ApiController]
[Route("api/san-pham")]
public class SanPhamController : ControllerBase
{
    private readonly ISanPhamService _sanPhamService;

    public SanPhamController(ISanPhamService sanPhamService)
    {
        _sanPhamService = sanPhamService;
    }

    /// <summary>
    /// Lấy danh sách sản phẩm có phân trang, lọc theo từ khóa, danh mục, khoảng giá, sắp xếp (public)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<SanPhamDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPagedList([FromQuery] SanPhamFilterRequest request, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.GetPagedListAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy thông tin chi tiết sản phẩm kèm danh sách ảnh, khuyến mãi đang chạy, điểm đánh giá trung bình (public)
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SanPhamChiTietDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetChiTiet(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.GetChiTietByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Thêm sản phẩm mới (chỉ admin - không bao gồm số lượng tồn)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(SanPhamDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateSanPhamRequest request, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetChiTiet), new { id = result.MaSanPham }, result);
    }

    /// <summary>
    /// Cập nhật thông tin sản phẩm (chỉ admin - không cho sửa số lượng tồn)
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(typeof(SanPhamDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSanPhamRequest request, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.UpdateAsync(id, request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật trạng thái sản phẩm dang_ban / ngung_ban (chỉ admin)
    /// </summary>
    [HttpPatch("{id:guid}/trang-thai")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTrangThai(Guid id, [FromBody] UpdateTrangThaiSanPhamRequest request, CancellationToken cancellationToken)
    {
        await _sanPhamService.UpdateTrangThaiAsync(id, request.TrangThai, cancellationToken);
        return Ok(new { message = "Cập nhật trạng thái sản phẩm thành công." });
    }

    /// <summary>
    /// Xóa sản phẩm (chỉ quản lý / admin)
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
        await _sanPhamService.DeleteAsync(id, cancellationToken);
        return Ok(new { message = "Xóa sản phẩm thành công." });
    }

    /// <summary>
    /// Tải lên hình ảnh cho sản phẩm (chỉ admin)
    /// </summary>
    [HttpPost("{id:guid}/hinh-anh")]
    [Authorize(Roles = "admin,quan_ly")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(HinhAnhSanPhamDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadHinhAnh(
        Guid id,
        IFormFile file,
        [FromForm] bool laAnhChinh = false,
        [FromForm] int thuTuHienThi = 0,
        CancellationToken cancellationToken = default)
    {
        var result = await _sanPhamService.UploadHinhAnhAsync(id, file, laAnhChinh, thuTuHienThi, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Xóa hình ảnh của sản phẩm (chỉ admin)
    /// </summary>
    [HttpDelete("{id:guid}/hinh-anh/{maHinh:guid}")]
    [Authorize(Roles = "admin,quan_ly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteHinhAnh(Guid id, Guid maHinh, CancellationToken cancellationToken)
    {
        await _sanPhamService.DeleteHinhAnhAsync(id, maHinh, cancellationToken);
        return Ok(new { message = "Xóa hình ảnh thành công." });
    }

    /// <summary>
    /// Lấy danh sách đánh giá của sản phẩm (public)
    /// </summary>
    [HttpGet("{id:guid}/danh-gia")]
    [ProducesResponseType(typeof(List<DanhGiaSanPhamDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDanhGia(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sanPhamService.GetDanhGiaBySanPhamIdAsync(id, cancellationToken);
        return Ok(result);
    }
}
