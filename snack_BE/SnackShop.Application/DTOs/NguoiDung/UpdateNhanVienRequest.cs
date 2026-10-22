using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.NguoiDung;

public class UpdateNhanVienRequest
{
    [Required]
    [MaxLength(100)]
    public string HoLot { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string Ten { get; set; } = null!;

    [MaxLength(20)]
    public string? SoDienThoai { get; set; }

    [Range(0, double.MaxValue)]
    public decimal MucLuong { get; set; }

    public DateOnly? NgayVaoLam { get; set; }
}
