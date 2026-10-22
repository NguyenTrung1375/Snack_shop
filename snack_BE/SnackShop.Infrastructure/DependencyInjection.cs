using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SnackShop.Application.Interfaces;
using SnackShop.Infrastructure.Persistence;
using SnackShop.Infrastructure.Persistence.Interceptors;
using SnackShop.Infrastructure.Security;

namespace SnackShop.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' not found.");

        services.AddHttpContextAccessor();

        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<NguoiThucHienInterceptor>();

        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
                   .AddInterceptors(sp.GetRequiredService<NguoiThucHienInterceptor>());
        });

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        return services;
    }
}
