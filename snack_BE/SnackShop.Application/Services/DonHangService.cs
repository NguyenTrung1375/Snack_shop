using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.DonHang;
using SnackShop.Application.DTOs.HoaDon;
using SnackShop.Application.Interfaces;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;

namespace SnackShop.Application.Services;

public class DonHangService : IDonHangService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;
    private readonly IKhuyenMaiService _khuyenMaiService;

    private static readonly Dictionary<TrangThaiDonHang, TrangThaiDonHang[]> Next = new()
    {
        [TrangThaiDonHang.ChoXacNhan] = new[] { TrangThaiDonHang.DaXacNhan, TrangThaiDonHang.DaHuy },
        [TrangThaiDonHang.DaXacNhan]  = new[] { TrangThaiDonHang.DangGiao,  TrangThaiDonHang.DaHuy },
        [TrangThaiDonHang.DangGiao]   = new[] { TrangThaiDonHang.DaGiao },
        [TrangThaiDonHang.DaGiao]     = Array.Empty<TrangThaiDonHang>(),
        [TrangThaiDonHang.DaHuy]      = Array.Empty<TrangThaiDonHang>(),
    };

    public DonHangService(IAppDbContext db, IMapper mapper, IKhuyenMaiService khuyenMaiService)
    {
        _db = db;
        _mapper = mapper;
        _khuyenMaiService = khuyenMaiService;
    }

    public async Task<TinhTamDonHangResponse> TinhTamAsync(Guid? khachHangId, TinhTamDonHangRequest req, CancellationToken cancellationToken = default)
    {
        var items = await ResolveOrderItemsAsync(khachHangId, req.ChiTiets, cancellationToken);
        var productDetails = await CalculateProductPricesAsync(items, cancellationToken);

        decimal tienGiamGia = 0;
        Guid? appliedCtkmId = null;
        string? appliedTenKm = null;
        string? appliedVoucherCode = null;

        if (!string.IsNullOrWhiteSpace(req.MaVoucher))
        {
            var voucherResult = await _khuyenMaiService.KiemTraVoucherAsync(khachHangId ?? Guid.Empty, req.MaVoucher, productDetails.TienHang, cancellationToken);
            tienGiamGia = voucherResult.TienGiamGia;
            appliedCtkmId = voucherResult.MaCtkm;
            appliedTenKm = voucherResult.TenKm;
            appliedVoucherCode = voucherResult.MaCode;
        }
        else if (req.MaCtkm.HasValue)
        {
            var discount = await _khuyenMaiService.TinhTienGiamGiaAsync(req.MaCtkm.Value, productDetails.TienHang, khachHangId, cancellationToken);
            var ctkm = await _db.ChuongTrinhKhuyenMais.FirstOrDefaultAsync(c => c.MaCtkm == req.MaCtkm.Value, cancellationToken);
            tienGiamGia = discount;
            appliedCtkmId = req.MaCtkm.Value;
            appliedTenKm = ctkm?.TenKm;
        }
        else
        {
            var autoPromo = await FindBestInvoicePromotionAsync(productDetails.TienHang, cancellationToken);
            if (autoPromo != null)
            {
                tienGiamGia = autoPromo.Value.Discount;
                appliedCtkmId = autoPromo.Value.Ctkm.MaCtkm;
                appliedTenKm = autoPromo.Value.Ctkm.TenKm;
            }
        }

        var phiVanChuyen = req.PhiVanChuyen ?? 20000m;
        // Miễn phí vận chuyển khi tiền hàng đạt từ 200.000đ trở lên
        if (productDetails.TienHang >= 200000m)
        {
            phiVanChuyen = 0m;
        }
        if (phiVanChuyen < 0) phiVanChuyen = 0;

        tienGiamGia = Math.Min(tienGiamGia, productDetails.TienHang);
        var tongTienThanhToan = productDetails.TienHang + phiVanChuyen - tienGiamGia;

        return new TinhTamDonHangResponse
        {
            TienHangChuaGiam = productDetails.TienHangChuaGiam,
            TienGiamSanPham = productDetails.TienGiamSanPham,
            TienHang = productDetails.TienHang,
            TienGiamGia = tienGiamGia,
            PhiVanChuyen = phiVanChuyen,
            TongTienThanhToan = tongTienThanhToan,
            MaCtkm = appliedCtkmId,
            TenKm = appliedTenKm,
            MaVoucher = appliedVoucherCode,
            ChiTiets = productDetails.Items
        };
    }

    public async Task<DonHangDto> DatHangAsync(Guid khachHangId, DatHangRequest req, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(req.TenNguoiNhan))
            throw new AppException("Tên người nhận không được để trống.", StatusCodes.Status400BadRequest);
        if (string.IsNullOrWhiteSpace(req.SdtNguoiNhan))
            throw new AppException("Số điện thoại người nhận không được để trống.", StatusCodes.Status400BadRequest);
        if (string.IsNullOrWhiteSpace(req.DiaChiGiaoHang))
            throw new AppException("Địa chỉ giao hàng không được để trống.", StatusCodes.Status400BadRequest);

        var phuongThucThanhToan = ParsePhuongThucThanhToan(req.PhuongThucThanhToan);

        // Đảm bảo thông tin khách hàng tồn tại trong bảng khach_hang
        var khachHangExists = await _db.KhachHangs.AnyAsync(k => k.MaNguoiDung == khachHangId, cancellationToken);
        if (!khachHangExists)
        {
            var nguoiDungExists = await _db.NguoiDungs.AnyAsync(u => u.MaNguoiDung == khachHangId, cancellationToken);
            if (!nguoiDungExists)
            {
                throw new AppException("Không tìm thấy thông tin người dùng.", StatusCodes.Status404NotFound);
            }
            _db.KhachHangs.Add(new KhachHang { MaNguoiDung = khachHangId });
            await _db.SaveChangesAsync(cancellationToken);
        }

        var items = await ResolveOrderItemsAsync(khachHangId, req.ChiTiets, cancellationToken);
        var productDetails = await CalculateProductPricesAsync(items, cancellationToken);

        decimal tienGiamGia = 0;
        Guid? appliedCtkmId = null;

        if (!string.IsNullOrWhiteSpace(req.MaVoucher))
        {
            var voucherResult = await _khuyenMaiService.KiemTraVoucherAsync(khachHangId, req.MaVoucher, productDetails.TienHang, cancellationToken);
            tienGiamGia = voucherResult.TienGiamGia;
            appliedCtkmId = voucherResult.MaCtkm;
        }
        else if (req.MaCtkm.HasValue)
        {
            var discount = await _khuyenMaiService.TinhTienGiamGiaAsync(req.MaCtkm.Value, productDetails.TienHang, khachHangId, cancellationToken);
            tienGiamGia = discount;
            appliedCtkmId = req.MaCtkm.Value;
        }
        else
        {
            var autoPromo = await FindBestInvoicePromotionAsync(productDetails.TienHang, cancellationToken);
            if (autoPromo != null)
            {
                tienGiamGia = autoPromo.Value.Discount;
                appliedCtkmId = autoPromo.Value.Ctkm.MaCtkm;
            }
        }

        var phiVanChuyen = req.PhiVanChuyen ?? 20000m;
        // Miễn phí vận chuyển khi tiền hàng đạt từ 200.000đ trở lên
        if (productDetails.TienHang >= 200000m)
        {
            phiVanChuyen = 0m;
        }
        if (phiVanChuyen < 0) phiVanChuyen = 0;

        tienGiamGia = Math.Min(tienGiamGia, productDetails.TienHang);

        var maCode = await GenerateMaCodeDonHangAsync(cancellationToken);

        await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // Thiết lập biến phiên cho trigger ghi lịch sử đơn hàng
            await _db.Database.ExecuteSqlRawAsync($"SET @nguoi_thuc_hien = '{khachHangId}';", cancellationToken);

            var donHang = new DonHang
            {
                MaDonHang = Guid.NewGuid(),
                MaCode = maCode,
                MaKhachHang = khachHangId,
                MaCtkm = appliedCtkmId,
                TenNguoiNhan = req.TenNguoiNhan.Trim(),
                SdtNguoiNhan = req.SdtNguoiNhan.Trim(),
                DiaChiGiaoHang = req.DiaChiGiaoHang.Trim(),
                GhiChu = req.GhiChu?.Trim(),
                PhiVanChuyen = phiVanChuyen,
                TienHang = productDetails.TienHang,
                TienGiamGia = tienGiamGia,
                PhuongThucThanhToan = phuongThucThanhToan,
                TrangThaiThanhToan = TrangThaiThanhToan.ChuaThanhToan,
                TrangThaiDonHang = TrangThaiDonHang.ChoXacNhan,
                NgayTao = DateTime.UtcNow
            };

            _db.DonHangs.Add(donHang);
            await _db.SaveChangesAsync(cancellationToken);

            foreach (var item in productDetails.Items)
            {
                var ctdh = new ChiTietDonHang
                {
                    MaChiTietDonHang = Guid.NewGuid(),
                    MaDonHang = donHang.MaDonHang,
                    MaSanPham = item.MaSanPham,
                    SoLuong = item.SoLuong,
                    DonGia = item.DonGia
                };
                _db.ChiTietDonHangs.Add(ctdh);
            }
            await _db.SaveChangesAsync(cancellationToken);

            var orderedProductIds = items.Select(i => i.MaSanPham).ToList();
            var cartItemsToRemove = await _db.ChiTietGioHangs
                .Where(c => c.MaKhachHang == khachHangId && orderedProductIds.Contains(c.MaSanPham))
                .ToListAsync(cancellationToken);

            if (cartItemsToRemove.Count > 0)
            {
                _db.ChiTietGioHangs.RemoveRange(cartItemsToRemove);
                await _db.SaveChangesAsync(cancellationToken);
            }

            await tx.CommitAsync(cancellationToken);

            return await GetByIdInternalAsync(donHang.MaDonHang, cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<PagedResult<DonHangDto>> GetCuaToiAsync(Guid khachHangId, DonHangFilterRequest req, CancellationToken cancellationToken = default)
    {
        req.MaKhachHang = khachHangId;
        return await GetAllAsync(req, cancellationToken);
    }

    public async Task<DonHangDto> GetByIdAsync(Guid id, Guid? currentUserId, string? currentUserRole, CancellationToken cancellationToken = default)
    {
        var donHang = await _db.DonHangs
            .AsNoTracking()
            .Include(d => d.KhachHang).ThenInclude(k => k.NguoiDung)
            .Include(d => d.ChuongTrinhKhuyenMai)
            .Include(d => d.ChiTietDonHangs).ThenInclude(ct => ct.SanPham)
            .Include(d => d.ChiTietDonHangs).ThenInclude(ct => ct.DanhGiaSanPham)
            .Include(d => d.LichSuDonHangs).ThenInclude(ls => ls.NguoiDung)
            .Include(d => d.HoaDon).ThenInclude(h => h.NhanVien).ThenInclude(nv => nv.NguoiDung)
            .FirstOrDefaultAsync(d => d.MaDonHang == id, cancellationToken);

        if (donHang == null)
        {
            throw new AppException("Không tìm thấy đơn hàng.", StatusCodes.Status404NotFound);
        }

        if (currentUserRole == "khach_hang" && currentUserId.HasValue && donHang.MaKhachHang != currentUserId.Value)
        {
            throw new AppException("Bạn không có quyền xem đơn hàng này.", StatusCodes.Status403Forbidden);
        }

        return _mapper.Map<DonHangDto>(donHang);
    }

    public async Task<PagedResult<DonHangDto>> GetAllAsync(DonHangFilterRequest req, CancellationToken cancellationToken = default)
    {
        var query = _db.DonHangs
            .AsNoTracking()
            .Include(d => d.KhachHang).ThenInclude(k => k.NguoiDung)
            .Include(d => d.ChuongTrinhKhuyenMai)
            .Include(d => d.ChiTietDonHangs).ThenInclude(ct => ct.SanPham)
            .Include(d => d.ChiTietDonHangs).ThenInclude(ct => ct.DanhGiaSanPham)
            .Include(d => d.LichSuDonHangs).ThenInclude(ls => ls.NguoiDung)
            .Include(d => d.HoaDon).ThenInclude(h => h.NhanVien).ThenInclude(nv => nv.NguoiDung)
            .AsQueryable();

        if (req.MaKhachHang.HasValue)
        {
            query = query.Where(d => d.MaKhachHang == req.MaKhachHang.Value);
        }

        if (!string.IsNullOrWhiteSpace(req.TrangThai))
        {
            var status = ParseTrangThaiDonHang(req.TrangThai);
            query = query.Where(d => d.TrangThaiDonHang == status);
        }

        if (req.TuNgay.HasValue)
        {
            query = query.Where(d => d.NgayTao >= req.TuNgay.Value);
        }

        if (req.DenNgay.HasValue)
        {
            query = query.Where(d => d.NgayTao <= req.DenNgay.Value);
        }

        if (!string.IsNullOrWhiteSpace(req.Keyword))
        {
            var kw = req.Keyword.Trim();
            query = query.Where(d => d.MaCode.Contains(kw) ||
                                     d.TenNguoiNhan.Contains(kw) ||
                                     d.SdtNguoiNhan.Contains(kw));
        }

        var total = await query.CountAsync(cancellationToken);
        var page = req.Page > 0 ? req.Page : 1;
        var pageSize = req.PageSize > 0 ? req.PageSize : 20;

        var items = await query
            .OrderByDescending(d => d.NgayTao)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<DonHangDto>>(items);
        return new PagedResult<DonHangDto>(dtos, total, page, pageSize);
    }

    public async Task<DonHangDto> CapNhatTrangThaiAsync(Guid id, CapNhatTrangThaiDonHangRequest req, Guid currentUserId, CancellationToken cancellationToken = default)
    {
        var donHang = await _db.DonHangs.FirstOrDefaultAsync(d => d.MaDonHang == id, cancellationToken);
        if (donHang == null)
        {
            throw new AppException("Không tìm thấy đơn hàng.", StatusCodes.Status404NotFound);
        }

        var newStatus = ParseTrangThaiDonHang(req.TrangThaiDonHang);

        if (!Next.TryGetValue(donHang.TrangThaiDonHang, out var validNextStates) || !validNextStates.Contains(newStatus))
        {
            throw new AppException($"Không thể chuyển trạng thái đơn hàng từ '{donHang.TrangThaiDonHang.ToSnakeCase()}' sang '{newStatus.ToSnakeCase()}'.", StatusCodes.Status400BadRequest);
        }

        if (newStatus == TrangThaiDonHang.DaGiao && donHang.PhuongThucThanhToan == PhuongThucThanhToan.Cod)
        {
            donHang.TrangThaiThanhToan = TrangThaiThanhToan.DaThanhToan;
        }

        await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await _db.Database.ExecuteSqlRawAsync($"SET @nguoi_thuc_hien = '{currentUserId}';", cancellationToken);
            donHang.TrangThaiDonHang = newStatus;

            if (newStatus == TrangThaiDonHang.DaGiao)
            {
                var existingInvoice = await _db.HoaDons.FirstOrDefaultAsync(h => h.MaDonHang == id, cancellationToken);
                if (existingInvoice == null)
                {
                    var soHoaDon = await GenerateSoHoaDonAsync(cancellationToken);
                    var isNv = await _db.NhanViens.AnyAsync(n => n.MaNguoiDung == currentUserId, cancellationToken);
                    var validNvId = isNv ? (Guid?)currentUserId : await _db.NhanViens.Select(n => (Guid?)n.MaNguoiDung).FirstOrDefaultAsync(cancellationToken);
                    var hoaDon = new HoaDon
                    {
                        MaHoaDon = Guid.NewGuid(),
                        MaDonHang = id,
                        MaNhanVien = validNvId,
                        SoHoaDon = soHoaDon,
                        TongTien = donHang.TongTienThanhToan,
                        NgayXuatHoaDon = DateTime.UtcNow
                    };
                    _db.HoaDons.Add(hoaDon);
                }
            }

            await _db.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }

        return await GetByIdInternalAsync(id, cancellationToken);
    }

    public async Task<DonHangDto> CapNhatThanhToanAsync(Guid id, CapNhatTrangThaiThanhToanRequest req, Guid currentUserId, CancellationToken cancellationToken = default)
    {
        var donHang = await _db.DonHangs.FirstOrDefaultAsync(d => d.MaDonHang == id, cancellationToken);
        if (donHang == null)
        {
            throw new AppException("Không tìm thấy đơn hàng.", StatusCodes.Status404NotFound);
        }

        var newStatus = ParseTrangThaiThanhToan(req.TrangThaiThanhToan);
        donHang.TrangThaiThanhToan = newStatus;

        await _db.SaveChangesAsync(cancellationToken);
        return await GetByIdInternalAsync(id, cancellationToken);
    }

    public async Task<DonHangDto> HuyDonAsync(Guid id, Guid currentUserId, string? currentUserRole, string? lyDo = null, CancellationToken cancellationToken = default)
    {
        var donHang = await _db.DonHangs.FirstOrDefaultAsync(d => d.MaDonHang == id, cancellationToken);
        if (donHang == null)
        {
            throw new AppException("Không tìm thấy đơn hàng.", StatusCodes.Status404NotFound);
        }

        if (currentUserRole == "khach_hang" && donHang.MaKhachHang != currentUserId)
        {
            throw new AppException("Bạn không có quyền thao tác trên đơn hàng này.", StatusCodes.Status403Forbidden);
        }

        if (donHang.TrangThaiDonHang != TrangThaiDonHang.ChoXacNhan && donHang.TrangThaiDonHang != TrangThaiDonHang.DaXacNhan)
        {
            throw new AppException("Chỉ có thể hủy đơn hàng khi đang ở trạng thái 'Chờ xác nhận' hoặc 'Đã xác nhận'.", StatusCodes.Status400BadRequest);
        }

        await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await _db.Database.ExecuteSqlRawAsync($"SET @nguoi_thuc_hien = '{currentUserId}';", cancellationToken);
            donHang.TrangThaiDonHang = TrangThaiDonHang.DaHuy;

            if (donHang.TrangThaiThanhToan == TrangThaiThanhToan.DaThanhToan)
            {
                donHang.TrangThaiThanhToan = TrangThaiThanhToan.DaHoanTien;
            }

            await _db.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }

        return await GetByIdInternalAsync(id, cancellationToken);
    }

    public async Task<HoaDonDto> XuatHoaDonAsync(Guid donHangId, Guid? nhanVienId, CancellationToken cancellationToken = default)
    {
        var donHang = await _db.DonHangs
            .Include(d => d.ChiTietDonHangs)
            .FirstOrDefaultAsync(d => d.MaDonHang == donHangId, cancellationToken);

        if (donHang == null)
        {
            throw new AppException("Không tìm thấy đơn hàng.", StatusCodes.Status404NotFound);
        }

        var existingInvoice = await _db.HoaDons.FirstOrDefaultAsync(h => h.MaDonHang == donHangId, cancellationToken);
        if (existingInvoice != null)
        {
            throw new AppException("Đơn hàng này đã được xuất hóa đơn.", StatusCodes.Status400BadRequest);
        }

        if (donHang.TrangThaiDonHang != TrangThaiDonHang.DaGiao)
        {
            throw new AppException("Chỉ có thể xuất hóa đơn cho đơn hàng đã giao thành công.", StatusCodes.Status400BadRequest);
        }

        var soHoaDon = await GenerateSoHoaDonAsync(cancellationToken);

        var isNv = nhanVienId.HasValue && await _db.NhanViens.AnyAsync(n => n.MaNguoiDung == nhanVienId.Value, cancellationToken);
        var validNvId = isNv ? nhanVienId : await _db.NhanViens.Select(n => (Guid?)n.MaNguoiDung).FirstOrDefaultAsync(cancellationToken);

        var hoaDon = new HoaDon
        {
            MaHoaDon = Guid.NewGuid(),
            MaDonHang = donHangId,
            MaNhanVien = validNvId,
            SoHoaDon = soHoaDon,
            TongTien = donHang.TongTienThanhToan,
            NgayXuatHoaDon = DateTime.UtcNow
        };

        _db.HoaDons.Add(hoaDon);
        await _db.SaveChangesAsync(cancellationToken);

        return await GetHoaDonByIdAsync(hoaDon.MaHoaDon, nhanVienId, "nhan_vien", cancellationToken);
    }

    public async Task<PagedResult<HoaDonDto>> GetAllHoaDonAsync(HoaDonFilterRequest req, CancellationToken cancellationToken = default)
    {
        var query = _db.HoaDons
            .AsNoTracking()
            .Include(h => h.NhanVien).ThenInclude(nv => nv.NguoiDung)
            .Include(h => h.DonHang).ThenInclude(d => d.KhachHang).ThenInclude(k => k.NguoiDung)
            .Include(h => h.DonHang).ThenInclude(d => d.ChiTietDonHangs).ThenInclude(ct => ct.SanPham)
            .AsQueryable();

        var search = (req.Search ?? req.Keyword)?.Trim();
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(h =>
                h.SoHoaDon.Contains(search) ||
                h.DonHang.MaCode.Contains(search) ||
                h.DonHang.TenNguoiNhan.Contains(search) ||
                h.DonHang.SdtNguoiNhan.Contains(search));
        }

        if (req.TuNgay.HasValue)
        {
            query = query.Where(h => h.NgayXuatHoaDon >= req.TuNgay.Value);
        }

        if (req.DenNgay.HasValue)
        {
            query = query.Where(h => h.NgayXuatHoaDon <= req.DenNgay.Value);
        }

        var total = await query.CountAsync(cancellationToken);

        var page = req.Page > 0 ? req.Page : 1;
        var pageSize = req.PageSize > 0 ? req.PageSize : 20;

        var items = await query
            .OrderByDescending(h => h.NgayXuatHoaDon)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<HoaDonDto>
        {
            Items = _mapper.Map<List<HoaDonDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<HoaDonDto> TraCuuHoaDonAsync(string query, Guid? currentUserId, string? currentUserRole, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            throw new AppException("Vui lòng cung cấp mã hóa đơn hoặc mã đơn hàng để tra cứu.", StatusCodes.Status400BadRequest);
        }

        var trimmed = query.Trim();
        var isGuid = Guid.TryParse(trimmed, out var guidValue);

        var hoaDon = await _db.HoaDons
            .AsNoTracking()
            .Include(h => h.NhanVien).ThenInclude(nv => nv.NguoiDung)
            .Include(h => h.DonHang).ThenInclude(d => d.KhachHang).ThenInclude(k => k.NguoiDung)
            .Include(h => h.DonHang).ThenInclude(d => d.ChiTietDonHangs).ThenInclude(ct => ct.SanPham)
            .FirstOrDefaultAsync(h =>
                (isGuid && (h.MaHoaDon == guidValue || h.MaDonHang == guidValue)) ||
                h.SoHoaDon == trimmed ||
                h.DonHang.MaCode == trimmed, cancellationToken);

        if (hoaDon == null)
        {
            throw new AppException($"Không tìm thấy hóa đơn khớp với '{query}'.", StatusCodes.Status404NotFound);
        }

        if (currentUserRole == "khach_hang" && currentUserId.HasValue && hoaDon.DonHang.MaKhachHang != currentUserId.Value)
        {
            throw new AppException("Bạn không có quyền xem hóa đơn này.", StatusCodes.Status403Forbidden);
        }

        return _mapper.Map<HoaDonDto>(hoaDon);
    }

    public async Task<HoaDonDto> GetHoaDonByIdAsync(Guid hoaDonOrDonHangId, Guid? currentUserId, string? currentUserRole, CancellationToken cancellationToken = default)
    {
        return await TraCuuHoaDonAsync(hoaDonOrDonHangId.ToString(), currentUserId, currentUserRole, cancellationToken);
    }

    #region Private Helper Methods

    private async Task<DonHangDto> GetByIdInternalAsync(Guid id, CancellationToken cancellationToken)
    {
        var donHang = await _db.DonHangs
            .AsNoTracking()
            .Include(d => d.KhachHang).ThenInclude(k => k.NguoiDung)
            .Include(d => d.ChuongTrinhKhuyenMai)
            .Include(d => d.ChiTietDonHangs).ThenInclude(ct => ct.SanPham)
            .Include(d => d.ChiTietDonHangs).ThenInclude(ct => ct.DanhGiaSanPham)
            .Include(d => d.LichSuDonHangs).ThenInclude(ls => ls.NguoiDung)
            .Include(d => d.HoaDon).ThenInclude(h => h.NhanVien).ThenInclude(nv => nv.NguoiDung)
            .FirstOrDefaultAsync(d => d.MaDonHang == id, cancellationToken);

        if (donHang == null)
        {
            throw new AppException("Không tìm thấy đơn hàng sau khi lưu.", StatusCodes.Status404NotFound);
        }

        return _mapper.Map<DonHangDto>(donHang);
    }

    private async Task<List<ChiTietDatHangRequest>> ResolveOrderItemsAsync(Guid? khachHangId, List<ChiTietDatHangRequest>? reqItems, CancellationToken cancellationToken)
    {
        if (reqItems != null && reqItems.Any())
        {
            foreach (var item in reqItems)
            {
                if (item.SoLuong <= 0)
                {
                    throw new AppException("Số lượng sản phẩm đặt hàng phải lớn hơn 0.", StatusCodes.Status400BadRequest);
                }
            }

            return reqItems
                .GroupBy(i => i.MaSanPham)
                .Select(g => new ChiTietDatHangRequest
                {
                    MaSanPham = g.Key,
                    SoLuong = g.Sum(x => x.SoLuong)
                })
                .ToList();
        }

        if (!khachHangId.HasValue || khachHangId.Value == Guid.Empty)
        {
            throw new AppException("Danh sách sản phẩm không được để trống.", StatusCodes.Status400BadRequest);
        }

        var cartItems = await _db.ChiTietGioHangs
            .AsNoTracking()
            .Where(c => c.MaKhachHang == khachHangId.Value)
            .ToListAsync(cancellationToken);

        if (cartItems.Count == 0)
        {
            throw new AppException("Giỏ hàng của bạn đang trống.", StatusCodes.Status400BadRequest);
        }

        return cartItems.Select(c => new ChiTietDatHangRequest
        {
            MaSanPham = c.MaSanPham,
            SoLuong = c.SoLuong
        }).ToList();
    }

    private async Task<(decimal TienHangChuaGiam, decimal TienGiamSanPham, decimal TienHang, List<ChiTietTinhTamDto> Items)> CalculateProductPricesAsync(
        List<ChiTietDatHangRequest> items, CancellationToken cancellationToken)
    {
        var productIds = items.Select(i => i.MaSanPham).Distinct().ToList();
        var products = await _db.SanPhams
            .AsNoTracking()
            .Include(s => s.KhuyenMaiTheoSanPhams)
                .ThenInclude(km => km.ChuongTrinhKhuyenMai)
            .Where(s => productIds.Contains(s.MaSanPham))
            .ToDictionaryAsync(s => s.MaSanPham, cancellationToken);

        var now = DateTime.UtcNow;
        var resultList = new List<ChiTietTinhTamDto>();
        decimal tienHangChuaGiam = 0;
        decimal tienHang = 0;

        foreach (var item in items)
        {
            if (!products.TryGetValue(item.MaSanPham, out var product))
            {
                throw new AppException($"Không tìm thấy sản phẩm với mã '{item.MaSanPham}'.", StatusCodes.Status404NotFound);
            }

            if (product.TrangThai != TrangThaiSanPham.DangBan)
            {
                throw new AppException($"Sản phẩm '{product.TenSanPham}' hiện đang ngừng bán.", StatusCodes.Status400BadRequest);
            }

            if (product.SoLuongTon < item.SoLuong)
            {
                throw new AppException($"Sản phẩm '{product.TenSanPham}' không đủ tồn kho (còn {product.SoLuongTon}, yêu cầu {item.SoLuong}).", StatusCodes.Status400BadRequest);
            }

            var donGiaGoc = product.GiaBan;
            var donGiaSauGiam = donGiaGoc;

            var activePromos = product.KhuyenMaiTheoSanPhams
                .Where(km => km.ChuongTrinhKhuyenMai != null &&
                             now >= km.ChuongTrinhKhuyenMai.NgayBatDau &&
                             now <= km.ChuongTrinhKhuyenMai.NgayKetThuc)
                .ToList();

            if (activePromos.Any())
            {
                decimal lowestPrice = donGiaGoc;
                foreach (var km in activePromos)
                {
                    decimal price = donGiaGoc;
                    if (km.LoaiGiamGia == LoaiGiamGia.PhanTram)
                    {
                        price = Math.Max(0, donGiaGoc - (donGiaGoc * km.GiaTriGiam / 100m));
                    }
                    else if (km.LoaiGiamGia == LoaiGiamGia.SoTien)
                    {
                        price = Math.Max(0, donGiaGoc - km.GiaTriGiam);
                    }
                    if (price < lowestPrice) lowestPrice = price;
                }
                donGiaSauGiam = lowestPrice;
            }

            var thanhTienGoc = donGiaGoc * item.SoLuong;
            var thanhTien = donGiaSauGiam * item.SoLuong;
            var tienGiam = thanhTienGoc - thanhTien;

            tienHangChuaGiam += thanhTienGoc;
            tienHang += thanhTien;

            resultList.Add(new ChiTietTinhTamDto
            {
                MaSanPham = product.MaSanPham,
                TenSanPham = product.TenSanPham,
                HinhAnhDaiDien = product.HinhAnhDaiDien,
                SoLuong = item.SoLuong,
                DonGiaGoc = donGiaGoc,
                DonGia = donGiaSauGiam,
                ThanhTien = thanhTien,
                TienGiam = tienGiam
            });
        }

        var tienGiamSanPham = tienHangChuaGiam - tienHang;
        return (tienHangChuaGiam, tienGiamSanPham, tienHang, resultList);
    }

    private async Task<(ChuongTrinhKhuyenMai Ctkm, decimal Discount)?> FindBestInvoicePromotionAsync(decimal tongTienHang, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var activeHoaDonPromos = await _db.ChuongTrinhKhuyenMais
            .AsNoTracking()
            .Include(c => c.KhuyenMaiTheoHoaDon)
            .Where(c => c.KhuyenMaiTheoHoaDon != null &&
                        now >= c.NgayBatDau && now <= c.NgayKetThuc &&
                        tongTienHang >= c.KhuyenMaiTheoHoaDon.GiaTriDonToiThieu)
            .ToListAsync(cancellationToken);

        ChuongTrinhKhuyenMai? bestCtkm = null;
        decimal maxDiscount = 0;

        foreach (var ctkm in activeHoaDonPromos)
        {
            var hd = ctkm.KhuyenMaiTheoHoaDon!;
            decimal discount = 0;
            if (hd.LoaiGiamGia == LoaiGiamGia.PhanTram)
            {
                discount = tongTienHang * (hd.GiaTriGiam / 100m);
                if (hd.GiamToiDa.HasValue && discount > hd.GiamToiDa.Value)
                {
                    discount = hd.GiamToiDa.Value;
                }
            }
            else
            {
                discount = Math.Min(hd.GiaTriGiam, tongTienHang);
            }

            if (discount > maxDiscount)
            {
                maxDiscount = discount;
                bestCtkm = ctkm;
            }
        }

        if (bestCtkm != null && maxDiscount > 0)
        {
            return (bestCtkm, maxDiscount);
        }

        return null;
    }

    private async Task<string> GenerateMaCodeDonHangAsync(CancellationToken cancellationToken)
    {
        var todayStr = DateTime.UtcNow.ToString("yyyyMMdd");
        var prefix = $"DH{todayStr}";

        var count = await _db.DonHangs
            .CountAsync(d => d.MaCode.StartsWith(prefix), cancellationToken);

        var maCode = $"{prefix}{(count + 1):D3}";
        while (await _db.DonHangs.AnyAsync(d => d.MaCode == maCode, cancellationToken))
        {
            count++;
            maCode = $"{prefix}{(count + 1):D3}";
        }

        return maCode;
    }

    private async Task<string> GenerateSoHoaDonAsync(CancellationToken cancellationToken)
    {
        var todayStr = DateTime.UtcNow.ToString("yyyyMMdd");
        var prefix = $"HD{todayStr}";

        var count = await _db.HoaDons
            .CountAsync(h => h.SoHoaDon.StartsWith(prefix), cancellationToken);

        var soHoaDon = $"{prefix}{(count + 1):D3}";
        while (await _db.HoaDons.AnyAsync(h => h.SoHoaDon == soHoaDon, cancellationToken))
        {
            count++;
            soHoaDon = $"{prefix}{(count + 1):D3}";
        }

        return soHoaDon;
    }

    private static PhuongThucThanhToan ParsePhuongThucThanhToan(string? value)
    {
        var normalized = (value ?? "cod").Trim().ToLowerInvariant();
        return normalized switch
        {
            "cod" => PhuongThucThanhToan.Cod,
            "chuyen_khoan" or "chuyenkhoan" or "bank_transfer" => PhuongThucThanhToan.ChuyenKhoan,
            "vi_dien_tu" or "vidientu" or "e_wallet" or "momo" or "zalopay" => PhuongThucThanhToan.ViDienTu,
            "the" or "card" or "credit_card" => PhuongThucThanhToan.The,
            _ => throw new AppException($"Phương thức thanh toán '{value}' không hợp lệ. Hỗ trợ: cod, chuyen_khoan, vi_dien_tu, the.", StatusCodes.Status400BadRequest)
        };
    }

    private static TrangThaiDonHang ParseTrangThaiDonHang(string? value)
    {
        var normalized = (value ?? string.Empty).Trim().ToLowerInvariant();
        return normalized switch
        {
            "cho_xac_nhan" or "choxacnhan" => TrangThaiDonHang.ChoXacNhan,
            "da_xac_nhan" or "daxacnhan" => TrangThaiDonHang.DaXacNhan,
            "dang_giao" or "danggiao" => TrangThaiDonHang.DangGiao,
            "da_giao" or "dagiao" => TrangThaiDonHang.DaGiao,
            "da_huy" or "dahuy" => TrangThaiDonHang.DaHuy,
            _ => throw new AppException($"Trạng thái đơn hàng '{value}' không hợp lệ. Hỗ trợ: cho_xac_nhan, da_xac_nhan, dang_giao, da_giao, da_huy.", StatusCodes.Status400BadRequest)
        };
    }

    private static TrangThaiThanhToan ParseTrangThaiThanhToan(string? value)
    {
        var normalized = (value ?? string.Empty).Trim().ToLowerInvariant();
        return normalized switch
        {
            "chua_thanh_toan" or "chuathanhtoan" => TrangThaiThanhToan.ChuaThanhToan,
            "da_thanh_toan" or "dathanhtoan" => TrangThaiThanhToan.DaThanhToan,
            "da_hoan_tien" or "dahoantien" => TrangThaiThanhToan.DaHoanTien,
            _ => throw new AppException($"Trạng thái thanh toán '{value}' không hợp lệ. Hỗ trợ: chua_thanh_toan, da_thanh_toan, da_hoan_tien.", StatusCodes.Status400BadRequest)
        };
    }

    #endregion
}
