using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.KhuyenMai;
using SnackShop.Application.Interfaces;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;

namespace SnackShop.Application.Services;

public class KhuyenMaiService : IKhuyenMaiService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;

    public KhuyenMaiService(IAppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<ChuongTrinhKhuyenMaiDto>> GetDangChayAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var list = await _db.ChuongTrinhKhuyenMais
            .AsNoTracking()
            .Include(c => c.KhuyenMaiTheoHoaDon)
            .Include(c => c.KhuyenMaiTheoVoucher)
            .Include(c => c.KhuyenMaiTheoSanPhams)
                .ThenInclude(km => km.SanPham)
            .Where(c => c.NgayBatDau <= now && now <= c.NgayKetThuc)
            .OrderByDescending(c => c.NgayBatDau)
            .ToListAsync(cancellationToken);

        return list.Select(MapToDto).ToList();
    }

    public async Task<KiemTraVoucherResponse> KiemTraVoucherAsync(Guid userId, string maCode, decimal tongTienHang, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(maCode))
        {
            throw new AppException("Mã voucher không được để trống.", StatusCodes.Status400BadRequest);
        }

        var code = maCode.Trim().ToUpperInvariant();

        var voucher = await _db.KhuyenMaiTheoVouchers
            .Include(v => v.ChuongTrinhKhuyenMai)
            .FirstOrDefaultAsync(v => v.MaCode == code, cancellationToken);

        if (voucher == null)
        {
            throw new AppException("Mã voucher không hợp lệ.", StatusCodes.Status404NotFound);
        }

        var now = DateTime.UtcNow;
        var ctkm = voucher.ChuongTrinhKhuyenMai;
        if (ctkm == null || now < ctkm.NgayBatDau || now > ctkm.NgayKetThuc)
        {
            throw new AppException("Chương trình khuyến mãi không tồn tại hoặc đã hết hạn", StatusCodes.Status400BadRequest);
        }

        if (voucher.GioiHanSuDung.HasValue && voucher.SoLuotDaDung >= voucher.GioiHanSuDung.Value)
        {
            throw new AppException("Voucher đã hết lượt sử dụng", StatusCodes.Status400BadRequest);
        }

        if (voucher.GioiHanMoiKhach.HasValue && userId != Guid.Empty)
        {
            var usedCount = await _db.DonHangs
                .CountAsync(d => d.MaKhachHang == userId &&
                                 d.MaCtkm == voucher.MaCtkm &&
                                 d.TrangThaiDonHang != TrangThaiDonHang.DaHuy, cancellationToken);

            if (usedCount >= voucher.GioiHanMoiKhach.Value)
            {
                throw new AppException("Khách hàng đã dùng hết số lần cho phép của voucher này", StatusCodes.Status400BadRequest);
            }
        }

        if (tongTienHang < voucher.GiaTriDonToiThieu)
        {
            throw new AppException($"Đơn hàng chưa đạt giá trị tối thiểu {voucher.GiaTriDonToiThieu:N0}đ để áp dụng voucher này.", StatusCodes.Status400BadRequest);
        }

        decimal tienGiamGia = 0;
        if (voucher.LoaiGiamGia == LoaiGiamGia.PhanTram)
        {
            tienGiamGia = tongTienHang * (voucher.GiaTriGiam / 100m);
            if (voucher.GiamToiDa.HasValue && tienGiamGia > voucher.GiamToiDa.Value)
            {
                tienGiamGia = voucher.GiamToiDa.Value;
            }
        }
        else if (voucher.LoaiGiamGia == LoaiGiamGia.SoTien)
        {
            tienGiamGia = Math.Min(voucher.GiaTriGiam, tongTienHang);
        }

        return new KiemTraVoucherResponse
        {
            HopLe = true,
            MaCtkm = voucher.MaCtkm,
            MaCode = voucher.MaCode,
            TenKm = voucher.TenKm,
            LoaiGiamGia = voucher.LoaiGiamGia.ToSnakeCase(),
            GiaTriGiam = voucher.GiaTriGiam,
            GiaTriDonToiThieu = voucher.GiaTriDonToiThieu,
            GiamToiDa = voucher.GiamToiDa,
            TienGiamGia = tienGiamGia,
            ThongBao = $"Áp dụng voucher thành công. Bạn được giảm {tienGiamGia:N0}đ."
        };
    }

    public async Task<PagedResult<ChuongTrinhKhuyenMaiDto>> GetPagedListAsync(KhuyenMaiFilterRequest request, CancellationToken cancellationToken = default)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : (request.PageSize > 100 ? 100 : request.PageSize);

        var query = _db.ChuongTrinhKhuyenMais
            .AsNoTracking()
            .Include(c => c.KhuyenMaiTheoHoaDon)
            .Include(c => c.KhuyenMaiTheoVoucher)
            .Include(c => c.KhuyenMaiTheoSanPhams)
                .ThenInclude(km => km.SanPham)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var kw = request.Keyword.Trim().ToLower();
            query = query.Where(c => c.TenKm.ToLower().Contains(kw) ||
                                     (c.KhuyenMaiTheoVoucher != null && c.KhuyenMaiTheoVoucher.MaCode.ToLower().Contains(kw)));
        }

        if (!string.IsNullOrWhiteSpace(request.LoaiKhuyenMai))
        {
            var loai = request.LoaiKhuyenMai.Trim().ToLowerInvariant();
            query = loai switch
            {
                "voucher" => query.Where(c => c.KhuyenMaiTheoVoucher != null),
                "hoa_don" => query.Where(c => c.KhuyenMaiTheoHoaDon != null),
                "san_pham" => query.Where(c => c.KhuyenMaiTheoSanPhams.Any()),
                _ => query
            };
        }

        var now = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(request.TrangThai))
        {
            var tt = request.TrangThai.Trim().ToLowerInvariant();
            query = tt switch
            {
                "dang_dien_ra" => query.Where(c => c.NgayBatDau <= now && now <= c.NgayKetThuc),
                "sap_dien_ra" => query.Where(c => c.NgayBatDau > now),
                "da_ket_thuc" => query.Where(c => c.NgayKetThuc < now),
                _ => query
            };
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(c => c.NgayTao)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(MapToDto).ToList();
        return new PagedResult<ChuongTrinhKhuyenMaiDto>(dtos, totalCount, page, pageSize);
    }

    public async Task<ChuongTrinhKhuyenMaiDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var ctkm = await _db.ChuongTrinhKhuyenMais
            .AsNoTracking()
            .Include(c => c.KhuyenMaiTheoHoaDon)
            .Include(c => c.KhuyenMaiTheoVoucher)
            .Include(c => c.KhuyenMaiTheoSanPhams)
                .ThenInclude(km => km.SanPham)
            .FirstOrDefaultAsync(c => c.MaCtkm == id, cancellationToken);

        if (ctkm == null)
        {
            throw new AppException("Không tìm thấy chương trình khuyến mãi.", StatusCodes.Status404NotFound);
        }

        return MapToDto(ctkm);
    }

    public async Task<ChuongTrinhKhuyenMaiDto> CreateAsync(CreateKhuyenMaiRequest req, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(req.TenKm))
        {
            throw new AppException("Tên chương trình khuyến mãi không được để trống.", StatusCodes.Status400BadRequest);
        }

        if (req.NgayKetThuc < req.NgayBatDau)
        {
            throw new AppException("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.", StatusCodes.Status400BadRequest);
        }

        var loaiKm = (req.LoaiKhuyenMai ?? string.Empty).Trim().ToLowerInvariant();
        if (loaiKm != "san_pham" && loaiKm != "hoa_don" && loaiKm != "voucher")
        {
            throw new AppException("Loại khuyến mãi không hợp lệ. Chỉ chấp nhận san_pham, hoa_don, hoặc voucher.", StatusCodes.Status400BadRequest);
        }

        var ctkm = new ChuongTrinhKhuyenMai
        {
            MaCtkm = Guid.NewGuid(),
            TenKm = req.TenKm.Trim(),
            NgayBatDau = req.NgayBatDau,
            NgayKetThuc = req.NgayKetThuc,
            NgayTao = DateTime.UtcNow
        };

        await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await _db.ChuongTrinhKhuyenMais.AddAsync(ctkm, cancellationToken);

            switch (loaiKm)
            {
                case "san_pham":
                    if (req.KhuyenMaiTheoSanPhams == null || !req.KhuyenMaiTheoSanPhams.Any())
                    {
                        throw new AppException("Danh sách sản phẩm khuyến mãi không được để trống.", StatusCodes.Status400BadRequest);
                    }

                    var distinctProductIds = req.KhuyenMaiTheoSanPhams.Select(p => p.MaSanPham).Distinct().ToList();
                    if (distinctProductIds.Count != req.KhuyenMaiTheoSanPhams.Count)
                    {
                        throw new AppException("Không được chọn trùng sản phẩm trong cùng một chương trình khuyến mãi.", StatusCodes.Status400BadRequest);
                    }

                    var existingProductIds = await _db.SanPhams
                        .Where(s => distinctProductIds.Contains(s.MaSanPham))
                        .Select(s => s.MaSanPham)
                        .ToListAsync(cancellationToken);

                    var missingIds = distinctProductIds.Except(existingProductIds).ToList();
                    if (missingIds.Any())
                    {
                        throw new AppException($"Sản phẩm với mã '{missingIds.First()}' không tồn tại.", StatusCodes.Status400BadRequest);
                    }

                    foreach (var item in req.KhuyenMaiTheoSanPhams)
                    {
                        var loaiGiam = ParseLoaiGiamGia(item.LoaiGiamGia);
                        ValidateGiaTriGiam(loaiGiam, item.GiaTriGiam);

                        var kmsp = new KhuyenMaiTheoSanPham
                        {
                            MaCtkm = ctkm.MaCtkm,
                            MaSanPham = item.MaSanPham,
                            TenKm = string.IsNullOrWhiteSpace(item.TenKm) ? ctkm.TenKm : item.TenKm.Trim(),
                            LoaiGiamGia = loaiGiam,
                            GiaTriGiam = item.GiaTriGiam
                        };
                        await _db.KhuyenMaiTheoSanPhams.AddAsync(kmsp, cancellationToken);
                    }
                    break;

                case "hoa_don":
                    if (req.KhuyenMaiTheoHoaDon == null)
                    {
                        throw new AppException("Thông tin chi tiết khuyến mãi theo hóa đơn không được để trống.", StatusCodes.Status400BadRequest);
                    }

                    var hdItem = req.KhuyenMaiTheoHoaDon;
                    var hdLoaiGiam = ParseLoaiGiamGia(hdItem.LoaiGiamGia);
                    ValidateGiaTriGiam(hdLoaiGiam, hdItem.GiaTriGiam);

                    if (hdItem.GiaTriDonToiThieu < 0)
                    {
                        throw new AppException("Giá trị đơn tối thiểu phải >= 0.", StatusCodes.Status400BadRequest);
                    }

                    var kmhd = new KhuyenMaiTheoHoaDon
                    {
                        MaCtkm = ctkm.MaCtkm,
                        TenKm = string.IsNullOrWhiteSpace(hdItem.TenKm) ? ctkm.TenKm : hdItem.TenKm.Trim(),
                        GiaTriDonToiThieu = hdItem.GiaTriDonToiThieu,
                        LoaiGiamGia = hdLoaiGiam,
                        GiaTriGiam = hdItem.GiaTriGiam,
                        GiamToiDa = hdItem.GiamToiDa
                    };
                    await _db.KhuyenMaiTheoHoaDons.AddAsync(kmhd, cancellationToken);
                    break;

                case "voucher":
                    if (req.KhuyenMaiTheoVoucher == null)
                    {
                        throw new AppException("Thông tin chi tiết voucher không được để trống.", StatusCodes.Status400BadRequest);
                    }

                    var vcItem = req.KhuyenMaiTheoVoucher;
                    if (string.IsNullOrWhiteSpace(vcItem.MaCode))
                    {
                        throw new AppException("Mã voucher không được để trống.", StatusCodes.Status400BadRequest);
                    }

                    var voucherCode = vcItem.MaCode.Trim().ToUpperInvariant();
                    var codeExists = await _db.KhuyenMaiTheoVouchers
                        .AnyAsync(v => v.MaCode == voucherCode, cancellationToken);

                    if (codeExists)
                    {
                        throw new AppException($"Mã voucher '{voucherCode}' đã tồn tại trong hệ thống.", StatusCodes.Status400BadRequest);
                    }

                    var vcLoaiGiam = ParseLoaiGiamGia(vcItem.LoaiGiamGia);
                    ValidateGiaTriGiam(vcLoaiGiam, vcItem.GiaTriGiam);

                    if (vcItem.GiaTriDonToiThieu < 0)
                    {
                        throw new AppException("Giá trị đơn tối thiểu phải >= 0.", StatusCodes.Status400BadRequest);
                    }

                    if (vcItem.GioiHanSuDung.HasValue && vcItem.GioiHanSuDung.Value <= 0)
                    {
                        throw new AppException("Giới hạn sử dụng phải lớn hơn 0.", StatusCodes.Status400BadRequest);
                    }

                    if (vcItem.GioiHanMoiKhach.HasValue && vcItem.GioiHanMoiKhach.Value <= 0)
                    {
                        throw new AppException("Giới hạn mỗi khách phải lớn hơn 0.", StatusCodes.Status400BadRequest);
                    }

                    var kmvc = new KhuyenMaiTheoVoucher
                    {
                        MaCtkm = ctkm.MaCtkm,
                        TenKm = string.IsNullOrWhiteSpace(vcItem.TenKm) ? ctkm.TenKm : vcItem.TenKm.Trim(),
                        MaCode = voucherCode,
                        LoaiGiamGia = vcLoaiGiam,
                        GiaTriGiam = vcItem.GiaTriGiam,
                        GiaTriDonToiThieu = vcItem.GiaTriDonToiThieu,
                        GiamToiDa = vcItem.GiamToiDa,
                        GioiHanSuDung = vcItem.GioiHanSuDung,
                        SoLuotDaDung = 0,
                        GioiHanMoiKhach = vcItem.GioiHanMoiKhach
                    };
                    await _db.KhuyenMaiTheoVouchers.AddAsync(kmvc, cancellationToken);
                    break;
            }

            await _db.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }

        return await GetByIdAsync(ctkm.MaCtkm, cancellationToken);
    }

    public async Task<ChuongTrinhKhuyenMaiDto> UpdateAsync(Guid id, UpdateKhuyenMaiRequest req, CancellationToken cancellationToken = default)
    {
        var ctkm = await _db.ChuongTrinhKhuyenMais
            .Include(c => c.KhuyenMaiTheoHoaDon)
            .Include(c => c.KhuyenMaiTheoVoucher)
            .Include(c => c.KhuyenMaiTheoSanPhams)
            .FirstOrDefaultAsync(c => c.MaCtkm == id, cancellationToken);

        if (ctkm == null)
        {
            throw new AppException("Không tìm thấy chương trình khuyến mãi.", StatusCodes.Status404NotFound);
        }

        if (string.IsNullOrWhiteSpace(req.TenKm))
        {
            throw new AppException("Tên chương trình khuyến mãi không được để trống.", StatusCodes.Status400BadRequest);
        }

        if (req.NgayKetThuc < req.NgayBatDau)
        {
            throw new AppException("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.", StatusCodes.Status400BadRequest);
        }

        ctkm.TenKm = req.TenKm.Trim();
        ctkm.NgayBatDau = req.NgayBatDau;
        ctkm.NgayKetThuc = req.NgayKetThuc;

        if (req.KhuyenMaiTheoHoaDon != null && ctkm.KhuyenMaiTheoHoaDon != null)
        {
            var hd = ctkm.KhuyenMaiTheoHoaDon;
            var loaiGiam = ParseLoaiGiamGia(req.KhuyenMaiTheoHoaDon.LoaiGiamGia);
            ValidateGiaTriGiam(loaiGiam, req.KhuyenMaiTheoHoaDon.GiaTriGiam);

            hd.TenKm = string.IsNullOrWhiteSpace(req.KhuyenMaiTheoHoaDon.TenKm) ? ctkm.TenKm : req.KhuyenMaiTheoHoaDon.TenKm.Trim();
            hd.GiaTriDonToiThieu = req.KhuyenMaiTheoHoaDon.GiaTriDonToiThieu;
            hd.LoaiGiamGia = loaiGiam;
            hd.GiaTriGiam = req.KhuyenMaiTheoHoaDon.GiaTriGiam;
            hd.GiamToiDa = req.KhuyenMaiTheoHoaDon.GiamToiDa;
        }

        if (req.KhuyenMaiTheoVoucher != null && ctkm.KhuyenMaiTheoVoucher != null)
        {
            var vc = ctkm.KhuyenMaiTheoVoucher;
            if (!string.IsNullOrWhiteSpace(req.KhuyenMaiTheoVoucher.MaCode))
            {
                var newCode = req.KhuyenMaiTheoVoucher.MaCode.Trim().ToUpperInvariant();
                if (newCode != vc.MaCode)
                {
                    var exists = await _db.KhuyenMaiTheoVouchers
                        .AnyAsync(v => v.MaCode == newCode && v.MaCtkm != id, cancellationToken);
                    if (exists)
                    {
                        throw new AppException($"Mã voucher '{newCode}' đã được sử dụng.", StatusCodes.Status400BadRequest);
                    }
                    vc.MaCode = newCode;
                }
            }

            var loaiGiam = ParseLoaiGiamGia(req.KhuyenMaiTheoVoucher.LoaiGiamGia);
            ValidateGiaTriGiam(loaiGiam, req.KhuyenMaiTheoVoucher.GiaTriGiam);

            vc.TenKm = string.IsNullOrWhiteSpace(req.KhuyenMaiTheoVoucher.TenKm) ? ctkm.TenKm : req.KhuyenMaiTheoVoucher.TenKm.Trim();
            vc.LoaiGiamGia = loaiGiam;
            vc.GiaTriGiam = req.KhuyenMaiTheoVoucher.GiaTriGiam;
            vc.GiaTriDonToiThieu = req.KhuyenMaiTheoVoucher.GiaTriDonToiThieu;
            vc.GiamToiDa = req.KhuyenMaiTheoVoucher.GiamToiDa;
            vc.GioiHanSuDung = req.KhuyenMaiTheoVoucher.GioiHanSuDung;
            vc.GioiHanMoiKhach = req.KhuyenMaiTheoVoucher.GioiHanMoiKhach;
        }

        if (req.KhuyenMaiTheoSanPhams != null)
        {
            _db.KhuyenMaiTheoSanPhams.RemoveRange(ctkm.KhuyenMaiTheoSanPhams);

            var distinctProductIds = req.KhuyenMaiTheoSanPhams.Select(p => p.MaSanPham).Distinct().ToList();
            if (distinctProductIds.Count != req.KhuyenMaiTheoSanPhams.Count)
            {
                throw new AppException("Không được chọn trùng sản phẩm trong cùng một chương trình khuyến mãi.", StatusCodes.Status400BadRequest);
            }

            var existingProductIds = await _db.SanPhams
                .Where(s => distinctProductIds.Contains(s.MaSanPham))
                .Select(s => s.MaSanPham)
                .ToListAsync(cancellationToken);

            var missingIds = distinctProductIds.Except(existingProductIds).ToList();
            if (missingIds.Any())
            {
                throw new AppException($"Sản phẩm với mã '{missingIds.First()}' không tồn tại.", StatusCodes.Status400BadRequest);
            }

            foreach (var item in req.KhuyenMaiTheoSanPhams)
            {
                var loaiGiam = ParseLoaiGiamGia(item.LoaiGiamGia);
                ValidateGiaTriGiam(loaiGiam, item.GiaTriGiam);

                var kmsp = new KhuyenMaiTheoSanPham
                {
                    MaCtkm = ctkm.MaCtkm,
                    MaSanPham = item.MaSanPham,
                    TenKm = string.IsNullOrWhiteSpace(item.TenKm) ? ctkm.TenKm : item.TenKm.Trim(),
                    LoaiGiamGia = loaiGiam,
                    GiaTriGiam = item.GiaTriGiam
                };
                await _db.KhuyenMaiTheoSanPhams.AddAsync(kmsp, cancellationToken);
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var ctkm = await _db.ChuongTrinhKhuyenMais
            .FirstOrDefaultAsync(c => c.MaCtkm == id, cancellationToken);

        if (ctkm == null)
        {
            throw new AppException("Không tìm thấy chương trình khuyến mãi.", StatusCodes.Status404NotFound);
        }

        _db.ChuongTrinhKhuyenMais.Remove(ctkm);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<decimal> TinhTienGiamGiaAsync(Guid maCtkm, decimal tongTienHang, Guid? userId = null, CancellationToken cancellationToken = default)
    {
        var ctkm = await _db.ChuongTrinhKhuyenMais
            .Include(c => c.KhuyenMaiTheoHoaDon)
            .Include(c => c.KhuyenMaiTheoVoucher)
            .FirstOrDefaultAsync(c => c.MaCtkm == maCtkm, cancellationToken);

        if (ctkm == null)
        {
            return 0;
        }

        var now = DateTime.UtcNow;
        if (now < ctkm.NgayBatDau || now > ctkm.NgayKetThuc)
        {
            return 0;
        }

        if (ctkm.KhuyenMaiTheoVoucher != null)
        {
            var vc = ctkm.KhuyenMaiTheoVoucher;
            if (vc.GioiHanSuDung.HasValue && vc.SoLuotDaDung >= vc.GioiHanSuDung.Value)
            {
                return 0;
            }

            if (vc.GioiHanMoiKhach.HasValue && userId.HasValue && userId.Value != Guid.Empty)
            {
                var used = await _db.DonHangs.CountAsync(d =>
                    d.MaKhachHang == userId.Value &&
                    d.MaCtkm == maCtkm &&
                    d.TrangThaiDonHang != TrangThaiDonHang.DaHuy, cancellationToken);
                if (used >= vc.GioiHanMoiKhach.Value)
                {
                    return 0;
                }
            }

            if (tongTienHang < vc.GiaTriDonToiThieu)
            {
                return 0;
            }

            decimal giam = 0;
            if (vc.LoaiGiamGia == LoaiGiamGia.PhanTram)
            {
                giam = tongTienHang * (vc.GiaTriGiam / 100m);
                if (vc.GiamToiDa.HasValue && giam > vc.GiamToiDa.Value)
                {
                    giam = vc.GiamToiDa.Value;
                }
            }
            else
            {
                giam = Math.Min(vc.GiaTriGiam, tongTienHang);
            }

            return giam;
        }

        if (ctkm.KhuyenMaiTheoHoaDon != null)
        {
            var hd = ctkm.KhuyenMaiTheoHoaDon;
            if (tongTienHang < hd.GiaTriDonToiThieu)
            {
                return 0;
            }

            decimal giam = 0;
            if (hd.LoaiGiamGia == LoaiGiamGia.PhanTram)
            {
                giam = tongTienHang * (hd.GiaTriGiam / 100m);
                if (hd.GiamToiDa.HasValue && giam > hd.GiamToiDa.Value)
                {
                    giam = hd.GiamToiDa.Value;
                }
            }
            else
            {
                giam = Math.Min(hd.GiaTriGiam, tongTienHang);
            }

            return giam;
        }

        return 0;
    }

    private static ChuongTrinhKhuyenMaiDto MapToDto(ChuongTrinhKhuyenMai c)
    {
        var now = DateTime.UtcNow;
        var loaiKm = c.KhuyenMaiTheoVoucher != null ? "voucher" :
                     c.KhuyenMaiTheoHoaDon != null ? "hoa_don" :
                     c.KhuyenMaiTheoSanPhams.Any() ? "san_pham" : "khac";

        var trangThai = now < c.NgayBatDau ? "sap_dien_ra" :
                        now > c.NgayKetThuc ? "da_ket_thuc" : "dang_dien_ra";

        var dto = new ChuongTrinhKhuyenMaiDto
        {
            MaCtkm = c.MaCtkm,
            TenKm = c.TenKm,
            NgayBatDau = c.NgayBatDau,
            NgayKetThuc = c.NgayKetThuc,
            NgayTao = c.NgayTao,
            LoaiKhuyenMai = loaiKm,
            TrangThai = trangThai
        };

        if (c.KhuyenMaiTheoHoaDon != null)
        {
            dto.KhuyenMaiTheoHoaDon = new KhuyenMaiHoaDonDetailDto
            {
                MaCtkm = c.KhuyenMaiTheoHoaDon.MaCtkm,
                TenKm = c.KhuyenMaiTheoHoaDon.TenKm,
                GiaTriDonToiThieu = c.KhuyenMaiTheoHoaDon.GiaTriDonToiThieu,
                LoaiGiamGia = c.KhuyenMaiTheoHoaDon.LoaiGiamGia.ToSnakeCase(),
                GiaTriGiam = c.KhuyenMaiTheoHoaDon.GiaTriGiam,
                GiamToiDa = c.KhuyenMaiTheoHoaDon.GiamToiDa
            };
        }

        if (c.KhuyenMaiTheoVoucher != null)
        {
            dto.KhuyenMaiTheoVoucher = new KhuyenMaiVoucherDetailDto
            {
                MaCtkm = c.KhuyenMaiTheoVoucher.MaCtkm,
                TenKm = c.KhuyenMaiTheoVoucher.TenKm,
                MaCode = c.KhuyenMaiTheoVoucher.MaCode,
                LoaiGiamGia = c.KhuyenMaiTheoVoucher.LoaiGiamGia.ToSnakeCase(),
                GiaTriGiam = c.KhuyenMaiTheoVoucher.GiaTriGiam,
                GiaTriDonToiThieu = c.KhuyenMaiTheoVoucher.GiaTriDonToiThieu,
                GiamToiDa = c.KhuyenMaiTheoVoucher.GiamToiDa,
                GioiHanSuDung = c.KhuyenMaiTheoVoucher.GioiHanSuDung,
                SoLuotDaDung = c.KhuyenMaiTheoVoucher.SoLuotDaDung,
                GioiHanMoiKhach = c.KhuyenMaiTheoVoucher.GioiHanMoiKhach
            };
        }

        if (c.KhuyenMaiTheoSanPhams != null && c.KhuyenMaiTheoSanPhams.Any())
        {
            dto.KhuyenMaiTheoSanPhams = c.KhuyenMaiTheoSanPhams.Select(km =>
            {
                var giaBan = km.SanPham?.GiaBan ?? 0;
                var giaSauGiam = giaBan;
                if (km.LoaiGiamGia == LoaiGiamGia.PhanTram)
                {
                    giaSauGiam = Math.Max(0, giaBan - (giaBan * km.GiaTriGiam / 100m));
                }
                else if (km.LoaiGiamGia == LoaiGiamGia.SoTien)
                {
                    giaSauGiam = Math.Max(0, giaBan - km.GiaTriGiam);
                }

                return new KhuyenMaiSanPhamDetailDto
                {
                    MaCtkm = km.MaCtkm,
                    MaSanPham = km.MaSanPham,
                    TenSanPham = km.SanPham?.TenSanPham,
                    GiaBan = giaBan,
                    TenKm = km.TenKm,
                    LoaiGiamGia = km.LoaiGiamGia.ToSnakeCase(),
                    GiaTriGiam = km.GiaTriGiam,
                    GiaSauGiam = giaSauGiam
                };
            }).ToList();
        }

        return dto;
    }

    private static LoaiGiamGia ParseLoaiGiamGia(string type)
    {
        var normalized = (type ?? string.Empty).Trim().ToLowerInvariant();
        return normalized switch
        {
            "phan_tram" or "phantram" or "percent" or "percentage" => LoaiGiamGia.PhanTram,
            "so_tien" or "sotien" or "amount" or "fixed" => LoaiGiamGia.SoTien,
            _ => throw new AppException($"Loại giảm giá '{type}' không hợp lệ. Chỉ chấp nhận phan_tram hoặc so_tien.", StatusCodes.Status400BadRequest)
        };
    }

    private static void ValidateGiaTriGiam(LoaiGiamGia loaiGiam, decimal giaTriGiam)
    {
        if (giaTriGiam < 0)
        {
            throw new AppException("Giá trị giảm phải >= 0.", StatusCodes.Status400BadRequest);
        }

        if (loaiGiam == LoaiGiamGia.PhanTram && giaTriGiam > 100)
        {
            throw new AppException("Giảm giá theo phần trăm không được vượt quá 100%.", StatusCodes.Status400BadRequest);
        }
    }
}
