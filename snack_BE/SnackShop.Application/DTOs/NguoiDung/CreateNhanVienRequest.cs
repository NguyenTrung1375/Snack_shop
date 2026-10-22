using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.NguoiDung;

public class CreateNhanVienRequest
{
    [Required]
    [MaxLength(100)]
    public string HoLot { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string Ten { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string MatKhau { get; set; } = null!;

    [MaxLength(20)]
    public string? SoDienThoai { get; set; }

    [Range(0, double.MaxValue)]
    public decimal MucLuong { get; set; }

    public DateOnly? NgayVaoLam { get; set; }
}
