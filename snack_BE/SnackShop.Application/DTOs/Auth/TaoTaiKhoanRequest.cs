using System.ComponentModel.DataAnnotations;
using SnackShop.Domain.Enums;

namespace SnackShop.Application.DTOs.Auth;

public class TaoTaiKhoanRequest
{
    [Required]
    [MaxLength(100)]
    public string HoLot { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Ten { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string MatKhau { get; set; } = string.Empty;

    public string? SoDienThoai { get; set; }
    public string? DiaChi { get; set; }

    /// <summary>Admin, QuanLy, NhanVien, KhachHang</summary>
    [Required]
    public VaiTro VaiTro { get; set; }

    // Thông tin nhân viên (dùng khi VaiTro = NhanVien hoặc QuanLy)
    public decimal MucLuong { get; set; }
    public DateOnly? NgayVaoLam { get; set; }
}
