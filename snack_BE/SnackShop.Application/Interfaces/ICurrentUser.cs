namespace SnackShop.Application.Interfaces;

public interface ICurrentUser
{
    Guid? Id { get; }
    string? Email { get; }
    string? Role { get; }
}
