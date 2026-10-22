using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.LoaiSanPham;

public class CreateLoaiSanPhamRequest
{
    public Guid? MaLoaiCha { get; set; }

    [Required(ErrorMessage = "Tên loại sản phẩm không được để trống.")]
    [StringLength(100, ErrorMessage = "Tên loại sản phẩm không vượt quá 100 ký tự.")]
    public string TenLoaiSanPham { get; set; } = string.Empty;

    [StringLength(255, ErrorMessage = "Mô tả không vượt quá 255 ký tự.")]
    public string? MoTa { get; set; }

    public string? TrangThai { get; set; }
}
