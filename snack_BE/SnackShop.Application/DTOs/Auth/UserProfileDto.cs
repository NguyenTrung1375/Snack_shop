namespace SnackShop.Application.DTOs.Auth;

public class UserProfileDto
{
    public Guid MaNguoiDung { get; set; }
    public string HoLot { get; set; } = string.Empty;
    public string Ten { get; set; } = string.Empty;
    public string HoTen => $"{HoLot} {Ten}".Trim();
    public string Email { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public string? DiaChi { get; set; }
    public string VaiTro { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public DateTime NgayTao { get; set; }
    public DateTime NgayCapNhat { get; set; }
}
