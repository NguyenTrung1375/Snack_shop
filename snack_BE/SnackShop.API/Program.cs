using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SnackShop.API.Middlewares;
using SnackShop.Application.Interfaces;
using SnackShop.Application.Mappings;
using SnackShop.Application.Services;
using SnackShop.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5000");

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// ── Swagger / OpenAPI ─────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "SnackShop API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập JWT token. Ví dụ: Bearer {token}"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ── Infrastructure (DbContext, Interceptors, CurrentUser, PasswordHasher, JwtTokenService) ──
builder.Services.AddInfrastructure(builder.Configuration);

// ── HttpContextAccessor ───────────────────────────────────────────────────────
builder.Services.AddHttpContextAccessor();

// ── Authentication / JWT ─────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"]
    ?? throw new InvalidOperationException("JWT Key is not configured in appsettings.");
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        RoleClaimType = ClaimTypes.Role,
        ClockSkew = TimeSpan.Zero
    };
});

// ── Authorization ────────────────────────────────────────────────────────────
builder.Services.AddAuthorization();

// ── AutoMapper ───────────────────────────────────────────────────────────────
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// ── Application Services ──────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ILoaiSanPhamService, LoaiSanPhamService>();
builder.Services.AddScoped<ISanPhamService, SanPhamService>();
builder.Services.AddScoped<IGioHangService, GioHangService>();
builder.Services.AddScoped<IKhuyenMaiService, KhuyenMaiService>();
builder.Services.AddScoped<IDonHangService, DonHangService>();
builder.Services.AddScoped<IDanhGiaService, DanhGiaService>();
builder.Services.AddScoped<IThongBaoService, ThongBaoService>();
builder.Services.AddScoped<IKhoHangService, KhoHangService>();
builder.Services.AddScoped<IBaoCaoService, BaoCaoService>();
builder.Services.AddScoped<INguoiDungService, NguoiDungService>();

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// ── Exception Handling Middleware ─────────────────────────────────────────────
app.UseMiddleware<ExceptionHandlingMiddleware>();

// ── Middleware pipeline ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapPost("/api/kho-hang/nhap-toan-bo-hang", async (SnackShop.Infrastructure.Persistence.AppDbContext db, int soLuong = 100) =>
{
    var nhaCungCap = await db.NhaCungCaps.FirstOrDefaultAsync();
    if (nhaCungCap == null) return Results.BadRequest("Chưa có nhà cung cấp nào trong hệ thống.");

    var nhanVien = await db.NhanViens.FirstOrDefaultAsync();
    if (nhanVien == null) return Results.BadRequest("Chưa có nhân viên nào trong hệ thống.");

    var sanPhams = await db.SanPhams.ToListAsync();
    if (!sanPhams.Any()) return Results.BadRequest("Không có sản phẩm nào.");

    var donNhap = new SnackShop.Domain.Entities.DonNhapHang
    {
        MaDonNhap = Guid.NewGuid(),
        MaNhaCungCap = nhaCungCap.MaNhaCungCap,
        MaNhanVien = nhanVien.MaNguoiDung,
        NgayNhapKho = DateTime.Now,
        NgayTao = DateTime.Now
    };

    foreach (var sp in sanPhams)
    {
        var giaNhap = sp.GiaBan > 0 ? Math.Round(sp.GiaBan * 0.6m, 2) : 20000m;
        donNhap.ChiTietNhapHangs.Add(new SnackShop.Domain.Entities.ChiTietNhapHang
        {
            MaDonNhap = donNhap.MaDonNhap,
            MaSanPham = sp.MaSanPham,
            SoLuong = soLuong,
            GiaNhap = giaNhap,
            ThanhTien = soLuong * giaNhap
        });
    }

    donNhap.TongTien = donNhap.ChiTietNhapHangs.Sum(c => c.ThanhTien);
    db.DonNhapHangs.Add(donNhap);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = $"Đã nhập kho thành công {sanPhams.Count} sản phẩm, mỗi sản phẩm {soLuong} món!",
        maDonNhap = donNhap.MaDonNhap,
        tongTien = donNhap.TongTien,
        soSanPham = sanPhams.Count,
        soLuongMoiMon = soLuong
    });
});

app.Run();
