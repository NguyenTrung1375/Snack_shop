using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.KhoHang;
using SnackShop.Application.Interfaces;
using SnackShop.Domain.Entities;

namespace SnackShop.Application.Services;

public class KhoHangService : IKhoHangService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;

    public KhoHangService(IAppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    // ── Nhà cung cấp ──────────────────────────────────────────────────────────

    public async Task<PagedResult<NhaCungCapDto>> GetNhaCungCapsAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var pageIndex = page > 0 ? page : 1;
        var size = pageSize > 0 ? pageSize : 20;

        var query = _db.NhaCungCaps.AsNoTracking();
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(n => n.TenNhaCungCap)
            .Skip((pageIndex - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return new PagedResult<NhaCungCapDto>(_mapper.Map<List<NhaCungCapDto>>(items), total, pageIndex, size);
    }

    public async Task<NhaCungCapDto> GetNhaCungCapByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.NhaCungCaps.AsNoTracking()
            .FirstOrDefaultAsync(n => n.MaNhaCungCap == id, cancellationToken)
            ?? throw new AppException("Không tìm thấy nhà cung cấp.", StatusCodes.Status404NotFound);

        return _mapper.Map<NhaCungCapDto>(entity);
    }

    public async Task<NhaCungCapDto> CreateNhaCungCapAsync(CreateNhaCungCapRequest req, CancellationToken cancellationToken = default)
    {
        var entity = new NhaCungCap
        {
            MaNhaCungCap = Guid.NewGuid(),
            TenNhaCungCap = req.TenNhaCungCap.Trim(),
            SoDienThoai = req.SoDienThoai?.Trim(),
            Email = req.Email?.Trim(),
            DiaChi = req.DiaChi?.Trim()
        };

        _db.NhaCungCaps.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return _mapper.Map<NhaCungCapDto>(entity);
    }

    public async Task<NhaCungCapDto> UpdateNhaCungCapAsync(Guid id, UpdateNhaCungCapRequest req, CancellationToken cancellationToken = default)
    {
        var entity = await _db.NhaCungCaps
            .FirstOrDefaultAsync(n => n.MaNhaCungCap == id, cancellationToken)
            ?? throw new AppException("Không tìm thấy nhà cung cấp.", StatusCodes.Status404NotFound);

        entity.TenNhaCungCap = req.TenNhaCungCap.Trim();
        entity.SoDienThoai = req.SoDienThoai?.Trim();
        entity.Email = req.Email?.Trim();
        entity.DiaChi = req.DiaChi?.Trim();

        await _db.SaveChangesAsync(cancellationToken);
        return _mapper.Map<NhaCungCapDto>(entity);
    }

    public async Task DeleteNhaCungCapAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.NhaCungCaps
            .FirstOrDefaultAsync(n => n.MaNhaCungCap == id, cancellationToken)
            ?? throw new AppException("Không tìm thấy nhà cung cấp.", StatusCodes.Status404NotFound);

        _db.NhaCungCaps.Remove(entity);

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.GetBaseException() is MySqlException { Number: 1451 })
        {
            throw new AppException("Không thể xóa nhà cung cấp đã có đơn nhập hàng.", StatusCodes.Status400BadRequest);
        }
    }

    // ── Đơn nhập hàng ─────────────────────────────────────────────────────────

    public async Task<PagedResult<DonNhapHangDto>> GetDonNhapHangsAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var pageIndex = page > 0 ? page : 1;
        var size = pageSize > 0 ? pageSize : 20;

        var query = _db.DonNhapHangs
            .AsNoTracking()
            .Include(d => d.NhaCungCap)
            .Include(d => d.NhanVien).ThenInclude(nv => nv.NguoiDung)
            .Include(d => d.ChiTietNhapHangs).ThenInclude(c => c.SanPham);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(d => d.NgayTao)
            .Skip((pageIndex - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return new PagedResult<DonNhapHangDto>(_mapper.Map<List<DonNhapHangDto>>(items), total, pageIndex, size);
    }

    public async Task<DonNhapHangDto> GetDonNhapHangByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _db.DonNhapHangs
            .AsNoTracking()
            .Include(d => d.NhaCungCap)
            .Include(d => d.NhanVien).ThenInclude(nv => nv.NguoiDung)
            .Include(d => d.ChiTietNhapHangs).ThenInclude(c => c.SanPham)
            .FirstOrDefaultAsync(d => d.MaDonNhap == id, cancellationToken)
            ?? throw new AppException("Không tìm thấy đơn nhập hàng.", StatusCodes.Status404NotFound);

        return _mapper.Map<DonNhapHangDto>(entity);
    }

    public async Task<DonNhapHangDto> TaoDonNhapHangAsync(Guid nhanVienId, TaoDonNhapHangRequest req, CancellationToken cancellationToken = default)
    {
        // Kiểm tra nhà cung cấp tồn tại
        var nhaCungCapExists = await _db.NhaCungCaps
            .AnyAsync(n => n.MaNhaCungCap == req.MaNhaCungCap, cancellationToken);
        if (!nhaCungCapExists)
            throw new AppException("Không tìm thấy nhà cung cấp.", StatusCodes.Status404NotFound);

        // Kiểm tra nhân viên tồn tại
        var nhanVienExists = await _db.NhanViens
            .AnyAsync(n => n.MaNguoiDung == nhanVienId, cancellationToken);
        if (!nhanVienExists)
            throw new AppException("Không tìm thấy nhân viên.", StatusCodes.Status404NotFound);

        // Kiểm tra các sản phẩm tồn tại
        var maSanPhams = req.ChiTiets.Select(c => c.MaSanPham).Distinct().ToList();
        var existingSanPhams = await _db.SanPhams
            .Where(s => maSanPhams.Contains(s.MaSanPham))
            .Select(s => s.MaSanPham)
            .ToListAsync(cancellationToken);

        var missing = maSanPhams.Except(existingSanPhams).ToList();
        if (missing.Any())
            throw new AppException($"Sản phẩm không tồn tại: {string.Join(", ", missing)}", StatusCodes.Status400BadRequest);

        var donNhap = new DonNhapHang
        {
            MaDonNhap = Guid.NewGuid(),
            MaNhaCungCap = req.MaNhaCungCap,
            MaNhanVien = nhanVienId,
            NgayNhapKho = DateTime.Now,
            NgayTao = DateTime.Now
        };

        // Tự động gộp các chi tiết nhập cùng sản phẩm (nếu nhập nhiều dòng trùng món)
        var groupedChiTiets = req.ChiTiets
            .GroupBy(c => c.MaSanPham)
            .Select(g =>
            {
                var totalSoLuong = g.Sum(x => x.SoLuong);
                var totalThanhTien = g.Sum(x => x.SoLuong * x.GiaNhap);
                var avgGia = totalSoLuong > 0 ? totalThanhTien / totalSoLuong : g.First().GiaNhap;
                return new ChiTietNhapHang
                {
                    MaDonNhap = donNhap.MaDonNhap,
                    MaSanPham = g.Key,
                    SoLuong = totalSoLuong,
                    GiaNhap = Math.Round(avgGia, 2),
                    ThanhTien = totalThanhTien
                };
            });

        foreach (var ct in groupedChiTiets)
        {
            donNhap.ChiTietNhapHangs.Add(ct);
        }

        donNhap.TongTien = donNhap.ChiTietNhapHangs.Sum(c => c.ThanhTien);

        _db.DonNhapHangs.Add(donNhap);

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.GetBaseException() is MySqlException { SqlState: "45000" } mysqlEx)
        {
            throw new AppException(mysqlEx.Message, StatusCodes.Status400BadRequest);
        }

        return await GetDonNhapHangByIdAsync(donNhap.MaDonNhap, cancellationToken);
    }

    // ── Tồn kho ───────────────────────────────────────────────────────────────

    public async Task<PagedResult<SanPhamSapHetHangDto>> GetSanPhamSapHetHangAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var pageIndex = page > 0 ? page : 1;
        var size = pageSize > 0 ? pageSize : 20;

        var query = _db.SanPhamSapHetHangViews.AsNoTracking();
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(v => v.SoLuongTon)
            .Skip((pageIndex - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return new PagedResult<SanPhamSapHetHangDto>(_mapper.Map<List<SanPhamSapHetHangDto>>(items), total, pageIndex, size);
    }
}
