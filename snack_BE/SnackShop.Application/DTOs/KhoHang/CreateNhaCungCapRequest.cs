using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.KhoHang;

public class CreateNhaCungCapRequest
{
    [Required]
    [MaxLength(200)]
    public string TenNhaCungCap { get; set; } = null!;

    [MaxLength(20)]
    public string? SoDienThoai { get; set; }

    [MaxLength(200)]
    [EmailAddress]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? DiaChi { get; set; }
}
