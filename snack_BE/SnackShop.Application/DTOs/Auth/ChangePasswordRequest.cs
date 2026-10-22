namespace SnackShop.Application.DTOs.Auth;

public class ChangePasswordRequest
{
    private string _matKhauCu = string.Empty;
    public string MatKhauCu
    {
        get => _matKhauCu;
        set => _matKhauCu = value;
    }

    public string? OldPassword
    {
        get => _matKhauCu;
        set
        {
            if (!string.IsNullOrEmpty(value))
                _matKhauCu = value;
        }
    }

    private string _matKhauMoi = string.Empty;
    public string MatKhauMoi
    {
        get => _matKhauMoi;
        set => _matKhauMoi = value;
    }

    public string? NewPassword
    {
        get => _matKhauMoi;
        set
        {
            if (!string.IsNullOrEmpty(value))
                _matKhauMoi = value;
        }
    }
}
