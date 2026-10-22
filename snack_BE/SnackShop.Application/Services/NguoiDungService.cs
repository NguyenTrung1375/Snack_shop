using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.NguoiDung;
using SnackShop.Application.Interfaces;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;

namespace SnackShop.Application.Services;

public class NguoiDungService : INguoiDungService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICurrentUser _currentUser;

    public NguoiDungService(IAppDbContext db, IMapper mapper, IPasswordHasher passwordHasher, ICurrentUser currentUser)
    {
        _db = db;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _currentUser = currentUser;
    }

    private static VaiTro? ParseVaiTro(string? roleStr)
    {
        if (string.IsNullOrWhiteSpace(roleStr)) return null;
        var norm = roleStr.Trim().ToLowerInvariant().Replace("_", "").Replace("-", "");
        return norm switch
        {
            "admin" => VaiTro.Admin,
            "quanly" or "manager" => VaiTro.QuanLy,
            "nhanvien" or "staff" or "employee" => VaiTro.NhanVien,
            "khachhang" or "customer" or "user" => VaiTro.KhachHang,
            _ => Enum.TryParse<VaiTro>(roleStr, true, out var parsed) ? parsed : null
        };
    }

    private static TrangThaiNguoiDung? ParseTrangThai(string? statusStr)
    {
        if (string.IsNullOrWhiteSpace(statusStr)) return null;
        var norm = statusStr.Trim().ToLowerInvariant().Replace("_", "").Replace("-", "");
        return norm switch
        {
            "hoatdong" or "active" => TrangThaiNguoiDung.HoatDong,
            "ngunghoatdong" or "khoa" or "bikhoa" or "inactive" or "locked" => TrangThaiNguoiDung.NgungHoatDong,
            _ => Enum.TryParse<TrangThaiNguoiDung>(statusStr, true, out var parsed) ? parsed : null
        };
    }

    // ── Người dùng ─────────────────────────────────────────────────────────────

    public async Task<PagedResult<NguoiDungDto>> GetNguoiDungsAsync(NguoiDungFilterRequest filter, CancellationToken cancellationToken = default)
    {
        var pageIndex = filter.Page > 0 ? filter.Page : 1;
        var size = filter.PageSize > 0 ? filter.PageSize : 20;

        var query = _db.NguoiDungs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.Keyword))
        {
            var kw = filter.Keyword.Trim().ToLower();
            query = query.Where(u =>
                u.Ten.ToLower().Contains(kw) ||
                u.HoLot.ToLower().Contains(kw) ||
                u.Email.ToLower().Contains(kw) ||
                (u.SoDienThoai != null && u.SoDienThoai.Contains(kw)));
        }

        if (!string.IsNullOrWhiteSpace(filter.VaiTro))
        {
            var vaiTro = ParseVaiTro(filter.VaiTro);
            if (vaiTro.HasValue)
            {
                query = query.Where(u => u.VaiTro == vaiTro.Value);
            }
        }

        if (!string.IsNullOrWhiteSpace(filter.TrangThai))
        {
            var trangThai = ParseTrangThai(filter.TrangThai);
            if (trangThai.HasValue)
            {
                query = query.Where(u => u.TrangThai == trangThai.Value);
            }
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(u => u.NgayTao)
            .Skip((pageIndex - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return new PagedResult<NguoiDungDto>(_mapper.Map<List<NguoiDungDto>>(items), total, pageIndex, size);
    }

    public async Task<NguoiDungDto> GetNguoiDungByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.NguoiDungs.AsNoTracking()
            .FirstOrDefaultAsync(u => u.MaNguoiDung == id, cancellationToken)
            ?? throw new AppException("Không tìm thấy người dùng.", StatusCodes.Status404NotFound);

        return _mapper.Map<NguoiDungDto>(entity);
    }

    public async Task<NguoiDungDto> CreateNguoiDungAsync(CreateNguoiDungRequest req, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(req.Email))
            throw new AppException("Email không được để trống.", StatusCodes.Status400BadRequest);

        if (string.IsNullOrWhiteSpace(req.MatKhau) || req.MatKhau.Length < 6)
            throw new AppException("Mật khẩu phải từ 6 ký tự trở lên.", StatusCodes.Status400BadRequest);

        var hoLot = req.HoLot?.Trim();
        var ten = req.Ten?.Trim();

        if (string.IsNullOrWhiteSpace(ten) && !string.IsNullOrWhiteSpace(req.HoTen))
        {
            var trimmed = req.HoTen.Trim();
            var lastSpace = trimmed.LastIndexOf(' ');
            if (lastSpace > 0)
            {
                hoLot = trimmed[..lastSpace].Trim();
                ten = trimmed[(lastSpace + 1)..].Trim();
            }
            else
            {
                hoLot = "";
                ten = trimmed;
            }
        }

        if (string.IsNullOrWhiteSpace(ten))
            throw new AppException("Tên người dùng không được để trống.", StatusCodes.Status400BadRequest);

        hoLot ??= "";

        var normalizedEmail = req.Email.Trim().ToLowerInvariant();

        if (await _db.NguoiDungs.AnyAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken))
            throw new AppException("Email đã được sử dụng.", StatusCodes.Status409Conflict);

        var role = ParseVaiTro(req.VaiTro) ?? VaiTro.KhachHang;

        var userId = Guid.NewGuid();
        var nguoiDung = new NguoiDung
        {
            MaNguoiDung = userId,
            HoLot = hoLot,
            Ten = ten,
            Email = normalizedEmail,
            MatKhau = _passwordHasher.HashPassword(req.MatKhau),
            SoDienThoai = string.IsNullOrWhiteSpace(req.SoDienThoai) ? null : req.SoDienThoai.Trim(),
            DiaChi = string.IsNullOrWhiteSpace(req.DiaChi) ? null : req.DiaChi.Trim(),
            VaiTro = role,
            TrangThai = TrangThaiNguoiDung.HoatDong,
            NgayTao = DateTime.Now,
            NgayCapNhat = DateTime.Now
        };

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            _db.NguoiDungs.Add(nguoiDung);

            switch (role)
            {
                case VaiTro.KhachHang:
                    _db.KhachHangs.Add(new KhachHang
                    {
                        MaNguoiDung = userId,
                        NguoiDung = nguoiDung
                    });
                    break;

                case VaiTro.NhanVien:
                case VaiTro.QuanLy:
                    _db.NhanViens.Add(new NhanVien
                    {
                        MaNguoiDung = userId,
                        MucLuong = req.MucLuong ?? 0,
                        NgayVaoLam = req.NgayVaoLam ?? DateOnly.FromDateTime(DateTime.Today),
                        NguoiDung = nguoiDung
                    });
                    break;

                case VaiTro.Admin:
                    // Admin chỉ tạo NguoiDung
                    break;
            }

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return _mapper.Map<NguoiDungDto>(nguoiDung);
    }

    public async Task<NguoiDungDto> CapNhatTrangThaiAsync(Guid id, CapNhatTrangThaiNguoiDungRequest req, CancellationToken cancellationToken = default)
    {
        var entity = await _db.NguoiDungs
            .FirstOrDefaultAsync(u => u.MaNguoiDung == id, cancellationToken)
            ?? throw new AppException("Không tìm thấy người dùng.", StatusCodes.Status404NotFound);

        var currentRole = _currentUser.Role?.ToLowerInvariant();
        if (currentRole == "quan_ly")
        {
            if (entity.VaiTro == VaiTro.QuanLy || entity.VaiTro == VaiTro.Admin)
            {
                throw new AppException("Quản lý không có quyền khóa hoặc mở khóa tài khoản cùng cấp Quản lý hoặc Quản trị viên.", StatusCodes.Status403Forbidden);
            }
        }

        var parsedStatus = ParseTrangThai(req.TrangThai);
        if (!parsedStatus.HasValue)
        {
            throw new AppException($"Trạng thái '{req.TrangThai}' không hợp lệ. Chấp nhận: hoat_dong, khoa, ngung_hoat_dong.", StatusCodes.Status400BadRequest);
        }

        entity.TrangThai = parsedStatus.Value;
        entity.NgayCapNhat = DateTime.Now;
        await _db.SaveChangesAsync(cancellationToken);

        return _mapper.Map<NguoiDungDto>(entity);
    }

    // ── Nhân viên ──────────────────────────────────────────────────────────────

    public async Task<PagedResult<NhanVienDto>> GetNhanViensAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var pageIndex = page > 0 ? page : 1;
        var size = pageSize > 0 ? pageSize : 20;

        var total = await _db.NhanViens.AsNoTracking().CountAsync(cancellationToken);
        var items = await _db.NhanViens
            .AsNoTracking()
            .Include(nv => nv.NguoiDung)
            .OrderBy(nv => nv.NguoiDung.HoLot)
            .Skip((pageIndex - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return new PagedResult<NhanVienDto>(_mapper.Map<List<NhanVienDto>>(items), total, pageIndex, size);
    }

    public async Task<NhanVienDto> GetNhanVienByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.NhanViens
            .AsNoTracking()
            .Include(nv => nv.NguoiDung)
            .FirstOrDefaultAsync(nv => nv.MaNguoiDung == id, cancellationToken)
            ?? throw new AppException("Không tìm thấy nhân viên.", StatusCodes.Status404NotFound);

        return _mapper.Map<NhanVienDto>(entity);
    }

    public async Task<NhanVienDto> CreateNhanVienAsync(CreateNhanVienRequest req, CancellationToken cancellationToken = default)
    {
        // Kiểm tra email trùng
        if (await _db.NguoiDungs.AnyAsync(u => u.Email == req.Email, cancellationToken))
            throw new AppException("Email đã được sử dụng.", StatusCodes.Status400BadRequest);

        var nguoiDung = new NguoiDung
        {
            MaNguoiDung = Guid.NewGuid(),
            HoLot = req.HoLot.Trim(),
            Ten = req.Ten.Trim(),
            Email = req.Email.Trim().ToLower(),
            MatKhau = _passwordHasher.HashPassword(req.MatKhau),
            SoDienThoai = req.SoDienThoai?.Trim(),
            VaiTro = VaiTro.NhanVien,
            TrangThai = TrangThaiNguoiDung.HoatDong,
            NgayTao = DateTime.Now,
            NgayCapNhat = DateTime.Now
        };

        var nhanVien = new NhanVien
        {
            MaNguoiDung = nguoiDung.MaNguoiDung,
            MucLuong = req.MucLuong,
            NgayVaoLam = req.NgayVaoLam
        };

        _db.NguoiDungs.Add(nguoiDung);
        _db.NhanViens.Add(nhanVien);
        await _db.SaveChangesAsync(cancellationToken);

        nhanVien.NguoiDung = nguoiDung;
        return _mapper.Map<NhanVienDto>(nhanVien);
    }

    public async Task<NhanVienDto> UpdateNhanVienAsync(Guid id, UpdateNhanVienRequest req, CancellationToken cancellationToken = default)
    {
        var nhanVien = await _db.NhanViens
            .Include(nv => nv.NguoiDung)
            .FirstOrDefaultAsync(nv => nv.MaNguoiDung == id, cancellationToken)
            ?? throw new AppException("Không tìm thấy nhân viên.", StatusCodes.Status404NotFound);

        var currentRole = _currentUser.Role?.ToLowerInvariant();
        var currentId = _currentUser.Id;
        if (currentRole == "quan_ly")
        {
            if (nhanVien.NguoiDung.VaiTro == VaiTro.QuanLy && nhanVien.MaNguoiDung != currentId)
            {
                throw new AppException("Quản lý không được phép chỉnh sửa thông tin của tài khoản Quản lý khác.", StatusCodes.Status403Forbidden);
            }
            if (nhanVien.NguoiDung.VaiTro == VaiTro.Admin)
            {
                throw new AppException("Quản lý không có quyền chỉnh sửa tài khoản Quản trị viên.", StatusCodes.Status403Forbidden);
            }
        }

        nhanVien.NguoiDung.HoLot = req.HoLot.Trim();
        nhanVien.NguoiDung.Ten = req.Ten.Trim();
        nhanVien.NguoiDung.SoDienThoai = req.SoDienThoai?.Trim();
        nhanVien.NguoiDung.NgayCapNhat = DateTime.Now;
        nhanVien.MucLuong = req.MucLuong;
        nhanVien.NgayVaoLam = req.NgayVaoLam;

        await _db.SaveChangesAsync(cancellationToken);
        return _mapper.Map<NhanVienDto>(nhanVien);
    }

    public async Task<NguoiDungDto> UpdateNguoiDungAsync(Guid id, UpdateNguoiDungRequest req, CancellationToken cancellationToken = default)
    {
        var nguoiDung = await _db.NguoiDungs.FindAsync(new object[] { id }, cancellationToken);
        if (nguoiDung == null) throw new AppException("Không tìm thấy người dùng.", StatusCodes.Status404NotFound);

        nguoiDung.HoLot = req.HoLot.Trim();
        nguoiDung.Ten = req.Ten.Trim();
        nguoiDung.SoDienThoai = req.SoDienThoai?.Trim();
        nguoiDung.DiaChi = req.DiaChi?.Trim();
        nguoiDung.NgayCapNhat = DateTime.Now;

        if (!string.IsNullOrWhiteSpace(req.VaiTro))
        {
            var newRole = ParseVaiTro(req.VaiTro);
            if (newRole.HasValue && newRole.Value != nguoiDung.VaiTro)
            {
                nguoiDung.VaiTro = newRole.Value;

                // Đồng bộ bảng quan hệ con nếu chuyển đổi vai trò
                if (newRole.Value == VaiTro.KhachHang && !await _db.KhachHangs.AnyAsync(k => k.MaNguoiDung == id, cancellationToken))
                {
                    _db.KhachHangs.Add(new KhachHang { MaNguoiDung = id, NguoiDung = nguoiDung });
                }
                else if ((newRole.Value == VaiTro.NhanVien || newRole.Value == VaiTro.QuanLy) && !await _db.NhanViens.AnyAsync(n => n.MaNguoiDung == id, cancellationToken))
                {
                    _db.NhanViens.Add(new NhanVien { MaNguoiDung = id, MucLuong = 0, NgayVaoLam = DateOnly.FromDateTime(DateTime.Today), NguoiDung = nguoiDung });
                }
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        
        return _mapper.Map<NguoiDungDto>(nguoiDung);
    }

    public async Task<bool> DeleteNguoiDungAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var nguoiDung = await _db.NguoiDungs.FindAsync(new object[] { id }, cancellationToken);
        if (nguoiDung == null) throw new AppException("Không tìm thấy người dùng.", StatusCodes.Status404NotFound);

        var currentRole = _currentUser.Role?.ToLowerInvariant();
        if (currentRole == "quan_ly")
        {
            if (nguoiDung.VaiTro == VaiTro.QuanLy || nguoiDung.VaiTro == VaiTro.Admin)
            {
                throw new AppException("Quản lý không có quyền xóa tài khoản cùng cấp Quản lý hoặc Quản trị viên.", StatusCodes.Status403Forbidden);
            }
        }

        if (nguoiDung.VaiTro == VaiTro.Admin)
        {
            var adminCount = await _db.NguoiDungs.CountAsync(u => u.VaiTro == VaiTro.Admin, cancellationToken);
            if (adminCount <= 1)
            {
                throw new AppException("Không thể xóa tài khoản Quản trị viên duy nhất trong hệ thống.", StatusCodes.Status400BadRequest);
            }
        }

        try
        {
            _db.NguoiDungs.Remove(nguoiDung);
            await _db.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException)
        {
            throw new AppException("Không thể xóa người dùng này vì đã có dữ liệu ràng buộc liên quan (đơn hàng, hóa đơn, nhập hàng...). Hãy chọn chuyển trạng thái tài khoản sang Khóa.", StatusCodes.Status400BadRequest);
        }
    }
}
