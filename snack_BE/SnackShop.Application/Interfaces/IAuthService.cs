using SnackShop.Application.DTOs.Auth;

namespace SnackShop.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> TaoTaiKhoanAsync(TaoTaiKhoanRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> RefreshSessionAsync(Guid userId, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
}
