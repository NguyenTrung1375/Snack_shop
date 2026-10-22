using BCrypt.Net;
using SnackShop.Application.Interfaces;

namespace SnackShop.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return password;
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        return password == passwordHash;
    }
}
