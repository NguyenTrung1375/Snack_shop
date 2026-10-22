namespace SnackShop.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(Guid maNguoiDung, string email, string role);
}
