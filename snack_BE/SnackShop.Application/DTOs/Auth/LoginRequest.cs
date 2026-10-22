namespace SnackShop.Application.DTOs.Auth;

public class LoginRequest
{
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
}
