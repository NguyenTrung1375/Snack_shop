namespace SnackShop.Application.DTOs.Auth;

public class UpdateProfileRequest
{
    public string HoLot { get; set; } = string.Empty;
    public string Ten { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public string? DiaChi { get; set; }
}
