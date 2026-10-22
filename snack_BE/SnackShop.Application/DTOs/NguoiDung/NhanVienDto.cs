namespace SnackShop.Application.DTOs.NguoiDung;

public class NhanVienDto
{
    public Guid MaNguoiDung { get; set; }
    public string HoLot { get; set; } = string.Empty;
    public string Ten { get; set; } = string.Empty;
    public string HoTen => $"{HoLot} {Ten}".Trim();
    public string Email { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public decimal MucLuong { get; set; }
    public DateOnly? NgayVaoLam { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string VaiTro { get; set; } = string.Empty;
}
