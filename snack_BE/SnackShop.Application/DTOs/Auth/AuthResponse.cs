namespace SnackShop.Application.DTOs.Auth;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string AccessToken
    {
        get => Token;
        set => Token = value;
    }
    public Guid MaNguoiDung { get; set; }
    public string HoLot { get; set; } = string.Empty;
    public string Ten { get; set; } = string.Empty;
    public string HoTen => $"{HoLot} {Ten}".Trim();
    public string Email { get; set; } = string.Empty;
    public string VaiTro { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public string? DiaChi { get; set; }
}
