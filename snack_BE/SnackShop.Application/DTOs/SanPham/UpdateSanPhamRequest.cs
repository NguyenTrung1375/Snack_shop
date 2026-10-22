using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.SanPham;

public class UpdateSanPhamRequest
{
    [Required(ErrorMessage = "Mã loại sản phẩm không được để trống.")]
    public Guid MaLoaiSanPham { get; set; }

    [Required(ErrorMessage = "Tên sản phẩm không được để trống.")]
    [StringLength(200, ErrorMessage = "Tên sản phẩm không vượt quá 200 ký tự.")]
    public string TenSanPham { get; set; } = string.Empty;

    public string? MoTa { get; set; }

    [StringLength(30, ErrorMessage = "Đơn vị tính không vượt quá 30 ký tự.")]
    public string DonViTinh { get; set; } = "gói";

    [Range(0, double.MaxValue, ErrorMessage = "Giá bán phải lớn hơn hoặc bằng 0.")]
    public decimal GiaBan { get; set; }

    [StringLength(255, ErrorMessage = "Đường dẫn hình ảnh đại diện không vượt quá 255 ký tự.")]
    public string? HinhAnhDaiDien { get; set; }

    public Guid? MaSanPhamCha { get; set; }

    [StringLength(50, ErrorMessage = "Khối lượng không vượt quá 50 ký tự.")]
    public string? KhoiLuong { get; set; }

    public string? TrangThai { get; set; }
}
