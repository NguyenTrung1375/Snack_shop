using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.Auth;
using SnackShop.Application.Interfaces;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;

namespace SnackShop.Application.Services;

public class AuthService : IAuthService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IMapper _mapper;

    public AuthService(
        IAppDbContext db,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IMapper mapper)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _mapper = mapper;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new AppException("Email không được để trống.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.MatKhau))
        {
            throw new AppException("Mật khẩu không được để trống.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.Ten))
        {
            throw new AppException("Tên không được để trống.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.HoLot))
        {
            throw new AppException("Họ lót không được để trống.", 400);
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var emailExists = await _db.NguoiDungs
            .AnyAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

        if (emailExists)
        {
            throw new AppException("Email đã được sử dụng.", 409);
        }

        var userId = Guid.NewGuid();

        var nguoiDung = new NguoiDung
        {
            MaNguoiDung = userId,
            HoLot = request.HoLot.Trim(),
            Ten = request.Ten.Trim(),
            Email = normalizedEmail,
            MatKhau = _passwordHasher.HashPassword(request.MatKhau),
            SoDienThoai = string.IsNullOrWhiteSpace(request.SoDienThoai) ? null : request.SoDienThoai.Trim(),
            DiaChi = string.IsNullOrWhiteSpace(request.DiaChi) ? null : request.DiaChi.Trim(),
            VaiTro = VaiTro.KhachHang,
            TrangThai = TrangThaiNguoiDung.HoatDong,
            NgayTao = DateTime.Now,
            NgayCapNhat = DateTime.Now
        };

        var khachHang = new KhachHang
        {
            MaNguoiDung = userId,
            NguoiDung = nguoiDung
        };

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            _db.NguoiDungs.Add(nguoiDung);
            _db.KhachHangs.Add(khachHang);
            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        var roleSnakeCase = nguoiDung.VaiTro.ToSnakeCase();
        var token = _jwtTokenService.GenerateToken(nguoiDung.MaNguoiDung, nguoiDung.Email, roleSnakeCase);

        var response = _mapper.Map<AuthResponse>(nguoiDung);
        response.Token = token;
        return response;
    }

    public async Task<AuthResponse> TaoTaiKhoanAsync(TaoTaiKhoanRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new AppException("Email không được để trống.", 400);

        if (string.IsNullOrWhiteSpace(request.MatKhau))
            throw new AppException("Mật khẩu không được để trống.", 400);

        if (string.IsNullOrWhiteSpace(request.Ten))
            throw new AppException("Tên không được để trống.", 400);

        if (string.IsNullOrWhiteSpace(request.HoLot))
            throw new AppException("Họ lót không được để trống.", 400);

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await _db.NguoiDungs.AnyAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken))
            throw new AppException("Email đã được sử dụng.", 409);

        var userId = Guid.NewGuid();

        var nguoiDung = new NguoiDung
        {
            MaNguoiDung = userId,
            HoLot = request.HoLot.Trim(),
            Ten = request.Ten.Trim(),
            Email = normalizedEmail,
            MatKhau = _passwordHasher.HashPassword(request.MatKhau),
            SoDienThoai = string.IsNullOrWhiteSpace(request.SoDienThoai) ? null : request.SoDienThoai.Trim(),
            DiaChi = string.IsNullOrWhiteSpace(request.DiaChi) ? null : request.DiaChi.Trim(),
            VaiTro = request.VaiTro,
            TrangThai = TrangThaiNguoiDung.HoatDong,
            NgayTao = DateTime.Now,
            NgayCapNhat = DateTime.Now
        };

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            _db.NguoiDungs.Add(nguoiDung);

            switch (request.VaiTro)
            {
                case VaiTro.KhachHang:
                    _db.KhachHangs.Add(new KhachHang { MaNguoiDung = userId, NguoiDung = nguoiDung });
                    break;
                case VaiTro.NhanVien:
                case VaiTro.QuanLy:
                    _db.NhanViens.Add(new NhanVien
                    {
                        MaNguoiDung = userId,
                        MucLuong = request.MucLuong,
                        NgayVaoLam = request.NgayVaoLam
                    });
                    break;
                // Admin: chỉ tạo NguoiDung, không tạo entity con
            }

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        var roleSnakeCase = nguoiDung.VaiTro.ToSnakeCase();
        var token = _jwtTokenService.GenerateToken(nguoiDung.MaNguoiDung, nguoiDung.Email, roleSnakeCase);

        var response = _mapper.Map<AuthResponse>(nguoiDung);
        response.Token = token;
        return response;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.MatKhau))
        {
            throw new AppException("Email và mật khẩu không được để trống.", 400);
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _db.NguoiDungs
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

        if (user == null || !_passwordHasher.VerifyPassword(request.MatKhau, user.MatKhau))
        {
            throw new AppException("Email hoặc mật khẩu không chính xác.", 401);
        }

        if (user.TrangThai == TrangThaiNguoiDung.NgungHoatDong)
        {
            throw new AppException("Tài khoản đã bị ngừng hoạt động.", 401);
        }

        var roleSnakeCase = user.VaiTro.ToSnakeCase();
        var token = _jwtTokenService.GenerateToken(user.MaNguoiDung, user.Email, roleSnakeCase);

        var response = _mapper.Map<AuthResponse>(user);
        response.Token = token;
        return response;
    }

    public async Task<AuthResponse> RefreshSessionAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.NguoiDungs
            .FirstOrDefaultAsync(u => u.MaNguoiDung == userId, cancellationToken);

        if (user == null)
        {
            throw new AppException("Không tìm thấy người dùng để làm mới phiên làm việc.", 404);
        }

        if (user.TrangThai == TrangThaiNguoiDung.NgungHoatDong)
        {
            throw new AppException("Tài khoản đã bị ngừng hoạt động, không thể duy trì phiên làm việc.", 401);
        }

        var roleSnakeCase = user.VaiTro.ToSnakeCase();
        var token = _jwtTokenService.GenerateToken(user.MaNguoiDung, user.Email, roleSnakeCase);

        var response = _mapper.Map<AuthResponse>(user);
        response.Token = token;
        return response;
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.NguoiDungs
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.MaNguoiDung == userId, cancellationToken);

        if (user == null)
        {
            throw new AppException("Không tìm thấy người dùng.", 404);
        }

        return _mapper.Map<UserProfileDto>(user);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Ten))
        {
            throw new AppException("Tên không được để trống.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.HoLot))
        {
            throw new AppException("Họ lót không được để trống.", 400);
        }

        var user = await _db.NguoiDungs
            .FirstOrDefaultAsync(u => u.MaNguoiDung == userId, cancellationToken);

        if (user == null)
        {
            throw new AppException("Không tìm thấy người dùng.", 404);
        }

        user.HoLot = request.HoLot.Trim();
        user.Ten = request.Ten.Trim();
        user.SoDienThoai = string.IsNullOrWhiteSpace(request.SoDienThoai) ? null : request.SoDienThoai.Trim();
        user.DiaChi = string.IsNullOrWhiteSpace(request.DiaChi) ? null : request.DiaChi.Trim();
        user.NgayCapNhat = DateTime.Now;

        await _db.SaveChangesAsync(cancellationToken);

        return _mapper.Map<UserProfileDto>(user);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.MatKhauCu))
        {
            throw new AppException("Vui lòng nhập mật khẩu cũ.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.MatKhauMoi))
        {
            throw new AppException("Vui lòng nhập mật khẩu mới.", 400);
        }

        if (request.MatKhauCu == request.MatKhauMoi)
        {
            throw new AppException("Mật khẩu mới không được trùng với mật khẩu cũ.", 400);
        }

        var user = await _db.NguoiDungs
            .FirstOrDefaultAsync(u => u.MaNguoiDung == userId, cancellationToken);

        if (user == null)
        {
            throw new AppException("Không tìm thấy người dùng.", 404);
        }

        if (!_passwordHasher.VerifyPassword(request.MatKhauCu, user.MatKhau))
        {
            throw new AppException("Mật khẩu cũ không chính xác.", 400);
        }

        user.MatKhau = _passwordHasher.HashPassword(request.MatKhauMoi);
        user.NgayCapNhat = DateTime.Now;

        await _db.SaveChangesAsync(cancellationToken);
    }
}
