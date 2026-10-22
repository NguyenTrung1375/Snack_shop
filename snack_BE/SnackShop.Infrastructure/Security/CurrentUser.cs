using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using SnackShop.Application.Interfaces;

namespace SnackShop.Infrastructure.Security;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? Id
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var sub = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? user?.FindFirst("sub")?.Value;

            return Guid.TryParse(sub, out var guid) ? guid : null;
        }
    }

    public string? Email
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            return user?.FindFirst(ClaimTypes.Email)?.Value
                ?? user?.FindFirst("email")?.Value;
        }
    }

    public string? Role
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            return user?.FindFirst(ClaimTypes.Role)?.Value
                ?? user?.FindFirst("role")?.Value;
        }
    }
}
