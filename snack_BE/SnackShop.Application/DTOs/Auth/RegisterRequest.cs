namespace SnackShop.Application.DTOs.Auth;

public class RegisterRequest
{
    public string HoLot { get; set; } = string.Empty;
    public string Ten { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    private string _matKhau = string.Empty;
    public string MatKhau
    {
        get => _matKhau;
        set => _matKhau = value;
    }

    public string? Password
    {
        get => _matKhau;
        set
        {
            if (!string.IsNullOrEmpty(value))
                _matKhau = value;
        }
    }

    public string? SoDienThoai { get; set; }
    public string? DiaChi { get; set; }
}
