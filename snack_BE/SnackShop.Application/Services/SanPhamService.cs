using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.HinhAnh;
using SnackShop.Application.DTOs.SanPham;
using SnackShop.Application.Interfaces;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;

namespace SnackShop.Application.Services;

public class SanPhamService : ISanPhamService
{
    private readonly IAppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly IMapper _mapper;

    public SanPhamService(IAppDbContext db, IWebHostEnvironment env, IMapper mapper)
    {
        _db = db;
        _env = env;
        _mapper = mapper;
    }

    public async Task<PagedResult<SanPhamDto>> GetPagedListAsync(SanPhamFilterRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.SanPhams
            .AsNoTracking()
            .Include(s => s.LoaiSanPham)
            .Include(s => s.DanhGiaSanPhams)
            .AsQueryable();

        // 1. Filter by keyword
        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var kw = request.Keyword.Trim();
            query = query.Where(s => s.TenSanPham.Contains(kw) || (s.MoTa != null && s.MoTa.Contains(kw)));
        }

        // 2. Filter by category (including children)
        if (request.MaLoai.HasValue)
        {
            var categoryIds = await _db.LoaiSanPhams
                .Where(l => l.MaLoaiSanPham == request.MaLoai.Value || l.MaLoaiCha == request.MaLoai.Value)
                .Select(l => l.MaLoaiSanPham)
                .ToListAsync(cancellationToken);

            query = query.Where(s => categoryIds.Contains(s.MaLoaiSanPham));
        }

        // 3. Filter by price
        if (request.GiaTu.HasValue)
        {
            query = query.Where(s => s.GiaBan >= request.GiaTu.Value);
        }

        if (request.GiaDen.HasValue)
        {
            query = query.Where(s => s.GiaBan <= request.GiaDen.Value);
        }

        // 4. Filter by status
        if (!string.IsNullOrWhiteSpace(request.TrangThai))
        {
            var status = ParseTrangThai(request.TrangThai);
            query = query.Where(s => s.TrangThai == status);
        }

        // 4.1 Filter root products only (for storefront catalog)
        if (request.ChiHienThiSanPhamGoc != false)
        {
            query = query.Where(s => s.MaSanPhamCha == null);
        }

        // 5. Sorting
        query = request.SapXep?.Trim().ToLowerInvariant() switch
        {
            "ban_chay" or "best_selling" or "pho_bien" => query.OrderByDescending(s => 
                _db.ChiTietDonHangs
                    .Where(ct => (ct.MaSanPham == s.MaSanPham || ct.SanPham.MaSanPhamCha == s.MaSanPham) && ct.DonHang.TrangThaiDonHang != TrangThaiDonHang.DaHuy)
                    .Sum(ct => (int?)ct.SoLuong) ?? 0),
            "gia_tang" or "price_asc" or "gia_asc" => query.OrderBy(s => s.GiaBan),
            "gia_giam" or "price_desc" or "gia_desc" => query.OrderByDescending(s => s.GiaBan),
            "ten_az" or "name_asc" => query.OrderBy(s => s.TenSanPham),
            "ten_za" or "name_desc" => query.OrderByDescending(s => s.TenSanPham),
            "danh_gia_cao" or "rating_desc" => query.OrderByDescending(s => s.DanhGiaSanPhams.Select(d => (double?)d.SoSao).Average() ?? 0),
            "moi_nhat" or "newest" => query.OrderByDescending(s => s.MaSanPham),
            _ => query.OrderBy(s => s.TenSanPham)
        };

        // 6. Pagination
        var totalCount = await query.CountAsync(cancellationToken);
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 20;

        var isStorefront = request.ChiHienThiSanPhamGoc != false;

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SanPhamDto
            {
                MaSanPham = s.MaSanPham,
                MaLoaiSanPham = s.MaLoaiSanPham,
                TenLoaiSanPham = s.LoaiSanPham.TenLoaiSanPham,
                TenSanPham = s.TenSanPham,
                MoTa = s.MoTa,
                DonViTinh = s.DonViTinh,
                GiaBan = s.GiaBan,
                SoLuongTon = isStorefront
                    ? s.SoLuongTon + (s.BienThes.Where(b => b.TrangThai == TrangThaiSanPham.DangBan).Sum(b => (int?)b.SoLuongTon) ?? 0)
                    : s.SoLuongTon,
                MaSanPhamCha = s.MaSanPhamCha,
                KhoiLuong = s.KhoiLuong,
                HinhAnhDaiDien = s.HinhAnhDaiDien,
                TrangThai = s.TrangThai.ToSnakeCase(),
                DiemTrungBinh = _db.DanhGiaSanPhams
                    .Where(d => d.MaSanPham == s.MaSanPham || d.SanPham.MaSanPhamCha == s.MaSanPham)
                    .Select(d => (double?)d.SoSao)
                    .Average() ?? 0,
                SoDanhGia = _db.DanhGiaSanPhams
                    .Count(d => d.MaSanPham == s.MaSanPham || d.SanPham.MaSanPhamCha == s.MaSanPham),
                DaBan = _db.ChiTietDonHangs
                    .Where(ct => (ct.MaSanPham == s.MaSanPham || ct.SanPham.MaSanPhamCha == s.MaSanPham) && ct.DonHang.TrangThaiDonHang != TrangThaiDonHang.DaHuy)
                    .Sum(ct => (int?)ct.SoLuong) ?? 0
            })
            .ToListAsync(cancellationToken);

        if (items.Count > 0)
        {
            var now = DateTime.UtcNow;
            var itemIds = items.Select(x => x.MaSanPham).ToList();
            var activePromos = await _db.KhuyenMaiTheoSanPhams
                .AsNoTracking()
                .Include(km => km.ChuongTrinhKhuyenMai)
                .Where(km => itemIds.Contains(km.MaSanPham) &&
                             km.ChuongTrinhKhuyenMai != null &&
                             now >= km.ChuongTrinhKhuyenMai.NgayBatDau &&
                             now <= km.ChuongTrinhKhuyenMai.NgayKetThuc)
                .ToListAsync(cancellationToken);

            // Xác định top 3 sản phẩm bán nhiều nhất có lượt bán > 0
            var top3BestSellerIds = await _db.ChiTietDonHangs
                .AsNoTracking()
                .Where(ct => ct.DonHang.TrangThaiDonHang != TrangThaiDonHang.DaHuy)
                .Select(ct => new { RootId = ct.SanPham.MaSanPhamCha ?? ct.MaSanPham, ct.SoLuong })
                .GroupBy(x => x.RootId)
                .Select(g => new { Id = g.Key, TotalSold = g.Sum(x => x.SoLuong) })
                .Where(x => x.TotalSold > 0)
                .OrderByDescending(x => x.TotalSold)
                .Take(3)
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);

            var top3Set = top3BestSellerIds.ToHashSet();

            foreach (var item in items)
            {
                item.DiemTrungBinh = Math.Round(item.DiemTrungBinh, 1);
                item.LaBanChay = top3Set.Contains(item.MaSanPham);

                var directPromos = activePromos.Where(km => km.MaSanPham == item.MaSanPham).ToList();

                if (directPromos.Count > 0)
                {
                    decimal bestGiaSauGiam = item.GiaBan;
                    int bestPhanTram = 0;
                    bool hasDiscount = false;

                    foreach (var km in directPromos)
                    {
                        decimal giaGiam = item.GiaBan;
                        int pct = 0;
                        if (km.LoaiGiamGia == LoaiGiamGia.PhanTram)
                        {
                            giaGiam = Math.Max(0, item.GiaBan - (item.GiaBan * km.GiaTriGiam / 100m));
                            pct = (int)Math.Round(km.GiaTriGiam);
                        }
                        else if (km.LoaiGiamGia == LoaiGiamGia.SoTien)
                        {
                            giaGiam = Math.Max(0, item.GiaBan - km.GiaTriGiam);
                            pct = item.GiaBan > 0 ? (int)Math.Round((km.GiaTriGiam / item.GiaBan) * 100m) : 0;
                        }

                        if (giaGiam < bestGiaSauGiam)
                        {
                            bestGiaSauGiam = giaGiam;
                            bestPhanTram = pct;
                            hasDiscount = true;
                        }
                    }

                    if (hasDiscount && bestGiaSauGiam < item.GiaBan)
                    {
                        item.GiaSauGiam = bestGiaSauGiam;
                        item.PhanTramGiam = bestPhanTram;
                    }
                }
            }
        }

        return new PagedResult<SanPhamDto>(items, totalCount, page, pageSize);
    }

    public async Task<SanPhamChiTietDto> GetChiTietByIdAsync(Guid maSanPham, CancellationToken cancellationToken = default)
    {
        var product = await _db.SanPhams
            .AsNoTracking()
            .Include(s => s.LoaiSanPham)
            .Include(s => s.HinhAnhSanPhams)
            .Include(s => s.DanhGiaSanPhams)
            .Include(s => s.KhuyenMaiTheoSanPhams)
                .ThenInclude(km => km.ChuongTrinhKhuyenMai)
            .FirstOrDefaultAsync(s => s.MaSanPham == maSanPham, cancellationToken);

        if (product == null)
        {
            throw new AppException("Không tìm thấy sản phẩm.", StatusCodes.Status404NotFound);
        }

        var now = DateTime.UtcNow;

        var khuyenMais = product.KhuyenMaiTheoSanPhams
            .Where(km => km.ChuongTrinhKhuyenMai != null &&
                         now >= km.ChuongTrinhKhuyenMai.NgayBatDau &&
                         now <= km.ChuongTrinhKhuyenMai.NgayKetThuc)
            .Select(km =>
            {
                var giaSauGiam = product.GiaBan;
                if (km.LoaiGiamGia == LoaiGiamGia.PhanTram)
                {
                    giaSauGiam = Math.Max(0, product.GiaBan - (product.GiaBan * km.GiaTriGiam / 100m));
                }
                else if (km.LoaiGiamGia == LoaiGiamGia.SoTien)
                {
                    giaSauGiam = Math.Max(0, product.GiaBan - km.GiaTriGiam);
                }

                return new KhuyenMaiSanPhamDto
                {
                    MaCtkm = km.MaCtkm,
                    TenKm = km.TenKm,
                    LoaiGiamGia = km.LoaiGiamGia.ToSnakeCase(),
                    GiaTriGiam = km.GiaTriGiam,
                    GiaSauGiam = giaSauGiam,
                    NgayBatDau = km.ChuongTrinhKhuyenMai.NgayBatDau,
                    NgayKetThuc = km.ChuongTrinhKhuyenMai.NgayKetThuc
                };
            }).ToList();

        var hinhAnhs = product.HinhAnhSanPhams
            .OrderBy(h => h.ThuTuHienThi)
            .Select(h => new HinhAnhSanPhamDto
            {
                MaHinhAnh = h.MaHinhAnh,
                MaSanPham = h.MaSanPham,
                DuongDanAnh = h.DuongDanAnh,
                LaAnhChinh = h.LaAnhChinh,
                ThuTuHienThi = h.ThuTuHienThi
            }).ToList();

        var parentId = product.MaSanPhamCha ?? product.MaSanPham;

        var familyReviewStats = await _db.DanhGiaSanPhams
            .AsNoTracking()
            .Where(d => d.MaSanPham == parentId || d.SanPham.MaSanPhamCha == parentId)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Count = g.Count(),
                Avg = g.Average(d => (double)d.SoSao)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var diemTrungBinh = familyReviewStats != null ? Math.Round(familyReviewStats.Avg, 1) : 0;
        var soDanhGia = familyReviewStats != null ? familyReviewStats.Count : 0;

        var siblingVariants = await _db.SanPhams
            .AsNoTracking()
            .Where(s => (s.MaSanPham == parentId || s.MaSanPhamCha == parentId) && s.TrangThai == TrangThaiSanPham.DangBan)
            .OrderBy(s => s.GiaBan)
            .Select(s => new SanPhamBienTheDto
            {
                MaSanPham = s.MaSanPham,
                TenSanPham = s.TenSanPham,
                KhoiLuong = s.KhoiLuong,
                GiaBan = s.GiaBan,
                SoLuongTon = s.SoLuongTon,
                DonViTinh = s.DonViTinh,
                HinhAnhDaiDien = s.HinhAnhDaiDien,
                TrangThai = s.TrangThai.ToSnakeCase()
            })
            .ToListAsync(cancellationToken);

        var siblingIds = siblingVariants.Select(s => s.MaSanPham).ToList();
        var allRelatedIds = siblingIds.Concat(new[] { parentId, product.MaSanPham }).Distinct().ToList();

        var allPromos = await _db.KhuyenMaiTheoSanPhams
            .AsNoTracking()
            .Include(km => km.ChuongTrinhKhuyenMai)
            .Where(km => allRelatedIds.Contains(km.MaSanPham) &&
                         km.ChuongTrinhKhuyenMai != null &&
                         now >= km.ChuongTrinhKhuyenMai.NgayBatDau &&
                         now <= km.ChuongTrinhKhuyenMai.NgayKetThuc)
            .ToListAsync(cancellationToken);

        decimal? bestProductGiaSauGiam = null;
        int? bestProductPhanTram = null;

        var productPromos = allPromos.Where(km => km.MaSanPham == product.MaSanPham).ToList();

        foreach (var km in productPromos)
        {
            decimal giaGiam = product.GiaBan;
            int pct = 0;
            if (km.LoaiGiamGia == LoaiGiamGia.PhanTram)
            {
                giaGiam = Math.Max(0, product.GiaBan - (product.GiaBan * km.GiaTriGiam / 100m));
                pct = (int)Math.Round(km.GiaTriGiam);
            }
            else if (km.LoaiGiamGia == LoaiGiamGia.SoTien)
            {
                giaGiam = Math.Max(0, product.GiaBan - km.GiaTriGiam);
                pct = product.GiaBan > 0 ? (int)Math.Round((km.GiaTriGiam / product.GiaBan) * 100m) : 0;
            }

            if (giaGiam < (bestProductGiaSauGiam ?? product.GiaBan))
            {
                bestProductGiaSauGiam = giaGiam;
                bestProductPhanTram = pct;
            }
        }

        foreach (var v in siblingVariants)
        {
            var vPromos = allPromos.Where(km => km.MaSanPham == v.MaSanPham).ToList();

            decimal? bestVGiaSauGiam = null;
            int? bestVPct = null;

            foreach (var km in vPromos)
            {
                decimal giaGiam = v.GiaBan;
                int pct = 0;
                if (km.LoaiGiamGia == LoaiGiamGia.PhanTram)
                {
                    giaGiam = Math.Max(0, v.GiaBan - (v.GiaBan * km.GiaTriGiam / 100m));
                    pct = (int)Math.Round(km.GiaTriGiam);
                }
                else if (km.LoaiGiamGia == LoaiGiamGia.SoTien)
                {
                    giaGiam = Math.Max(0, v.GiaBan - km.GiaTriGiam);
                    pct = v.GiaBan > 0 ? (int)Math.Round((km.GiaTriGiam / v.GiaBan) * 100m) : 0;
                }

                if (giaGiam < (bestVGiaSauGiam ?? v.GiaBan))
                {
                    bestVGiaSauGiam = giaGiam;
                    bestVPct = pct;
                }
            }

            if (bestVGiaSauGiam.HasValue && bestVGiaSauGiam.Value < v.GiaBan)
            {
                v.GiaSauGiam = bestVGiaSauGiam;
                v.PhanTramGiam = bestVPct;
            }
        }

        var parentMoTa = product.MaSanPhamCha == null
            ? product.MoTa
            : (await _db.SanPhams.Where(p => p.MaSanPham == product.MaSanPhamCha.Value).Select(p => p.MoTa).FirstOrDefaultAsync(cancellationToken)) ?? product.MoTa;

        var daBan = await _db.ChiTietDonHangs
            .Where(ct => (ct.MaSanPham == parentId || ct.SanPham.MaSanPhamCha == parentId) && ct.DonHang.TrangThaiDonHang != TrangThaiDonHang.DaHuy)
            .SumAsync(ct => (int?)ct.SoLuong, cancellationToken) ?? 0;

        var isTopSeller = await _db.ChiTietDonHangs
            .AsNoTracking()
            .Where(ct => ct.DonHang.TrangThaiDonHang != TrangThaiDonHang.DaHuy)
            .Select(ct => new { RootId = ct.SanPham.MaSanPhamCha ?? ct.MaSanPham, ct.SoLuong })
            .GroupBy(x => x.RootId)
            .Select(g => new { Id = g.Key, TotalSold = g.Sum(x => x.SoLuong) })
            .Where(x => x.TotalSold > 0)
            .OrderByDescending(x => x.TotalSold)
            .Take(3)
            .AnyAsync(x => x.Id == parentId, cancellationToken);

        return new SanPhamChiTietDto
        {
            MaSanPham = product.MaSanPham,
            MaLoaiSanPham = product.MaLoaiSanPham,
            TenLoaiSanPham = product.LoaiSanPham.TenLoaiSanPham,
            TenSanPham = product.TenSanPham,
            MoTa = parentMoTa,
            DonViTinh = product.DonViTinh,
            GiaBan = product.GiaBan,
            GiaSauGiam = bestProductGiaSauGiam < product.GiaBan ? bestProductGiaSauGiam : null,
            PhanTramGiam = bestProductGiaSauGiam < product.GiaBan ? bestProductPhanTram : null,
            SoLuongTon = product.SoLuongTon,
            MaSanPhamCha = product.MaSanPhamCha,
            KhoiLuong = product.KhoiLuong,
            HinhAnhDaiDien = product.HinhAnhDaiDien,
            TrangThai = product.TrangThai.ToSnakeCase(),
            DiemTrungBinh = diemTrungBinh,
            SoDanhGia = soDanhGia,
            DaBan = daBan,
            LaBanChay = isTopSeller,
            HinhAnhs = hinhAnhs,
            KhuyenMais = khuyenMais,
            BienThes = siblingVariants
        };
    }

    public async Task<SanPhamDto> CreateAsync(CreateSanPhamRequest request, CancellationToken cancellationToken = default)
    {
        var loaiExists = await _db.LoaiSanPhams.AnyAsync(l => l.MaLoaiSanPham == request.MaLoaiSanPham, cancellationToken);
        if (!loaiExists)
        {
            throw new AppException("Loại sản phẩm không tồn tại.", StatusCodes.Status400BadRequest);
        }

        var trangThai = TrangThaiSanPham.DangBan;
        if (!string.IsNullOrWhiteSpace(request.TrangThai))
        {
            trangThai = ParseTrangThai(request.TrangThai);
        }

        var entity = new SanPham
        {
            MaSanPham = Guid.NewGuid(),
            MaLoaiSanPham = request.MaLoaiSanPham,
            TenSanPham = request.TenSanPham.Trim(),
            MoTa = request.MoTa?.Trim(),
            DonViTinh = string.IsNullOrWhiteSpace(request.DonViTinh) ? "gói" : request.DonViTinh.Trim(),
            GiaBan = request.GiaBan,
            SoLuongTon = 0, // Managed only via import/orders, not via Create
            MaSanPhamCha = request.MaSanPhamCha,
            KhoiLuong = request.KhoiLuong?.Trim(),
            HinhAnhDaiDien = request.HinhAnhDaiDien?.Trim(),
            TrangThai = trangThai
        };

        _db.SanPhams.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        var loai = await _db.LoaiSanPhams.FirstOrDefaultAsync(l => l.MaLoaiSanPham == entity.MaLoaiSanPham, cancellationToken);

        return new SanPhamDto
        {
            MaSanPham = entity.MaSanPham,
            MaLoaiSanPham = entity.MaLoaiSanPham,
            TenLoaiSanPham = loai?.TenLoaiSanPham,
            TenSanPham = entity.TenSanPham,
            MoTa = entity.MoTa,
            DonViTinh = entity.DonViTinh,
            GiaBan = entity.GiaBan,
            SoLuongTon = entity.SoLuongTon,
            MaSanPhamCha = entity.MaSanPhamCha,
            KhoiLuong = entity.KhoiLuong,
            HinhAnhDaiDien = entity.HinhAnhDaiDien,
            TrangThai = entity.TrangThai.ToSnakeCase(),
            DiemTrungBinh = 0,
            SoDanhGia = 0
        };
    }

    public async Task<SanPhamDto> UpdateAsync(Guid maSanPham, UpdateSanPhamRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _db.SanPhams
            .Include(s => s.LoaiSanPham)
            .Include(s => s.DanhGiaSanPhams)
            .FirstOrDefaultAsync(s => s.MaSanPham == maSanPham, cancellationToken);

        if (entity == null)
        {
            throw new AppException("Không tìm thấy sản phẩm.", StatusCodes.Status404NotFound);
        }

        var loaiExists = await _db.LoaiSanPhams.AnyAsync(l => l.MaLoaiSanPham == request.MaLoaiSanPham, cancellationToken);
        if (!loaiExists)
        {
            throw new AppException("Loại sản phẩm không tồn tại.", StatusCodes.Status400BadRequest);
        }

        entity.MaLoaiSanPham = request.MaLoaiSanPham;
        entity.TenSanPham = request.TenSanPham.Trim();
        entity.MoTa = request.MoTa?.Trim();
        entity.DonViTinh = string.IsNullOrWhiteSpace(request.DonViTinh) ? "gói" : request.DonViTinh.Trim();
        entity.GiaBan = request.GiaBan;
        entity.MaSanPhamCha = request.MaSanPhamCha;
        entity.KhoiLuong = request.KhoiLuong?.Trim();
        // Do NOT modify entity.SoLuongTon

        if (request.HinhAnhDaiDien != null)
        {
            entity.HinhAnhDaiDien = string.IsNullOrWhiteSpace(request.HinhAnhDaiDien) ? null : request.HinhAnhDaiDien.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.TrangThai))
        {
            entity.TrangThai = ParseTrangThai(request.TrangThai);
        }

        await _db.SaveChangesAsync(cancellationToken);

        var loai = await _db.LoaiSanPhams.FirstOrDefaultAsync(l => l.MaLoaiSanPham == entity.MaLoaiSanPham, cancellationToken);

        return new SanPhamDto
        {
            MaSanPham = entity.MaSanPham,
            MaLoaiSanPham = entity.MaLoaiSanPham,
            TenLoaiSanPham = loai?.TenLoaiSanPham,
            TenSanPham = entity.TenSanPham,
            MoTa = entity.MoTa,
            DonViTinh = entity.DonViTinh,
            GiaBan = entity.GiaBan,
            SoLuongTon = entity.SoLuongTon,
            MaSanPhamCha = entity.MaSanPhamCha,
            KhoiLuong = entity.KhoiLuong,
            HinhAnhDaiDien = entity.HinhAnhDaiDien,
            TrangThai = entity.TrangThai.ToSnakeCase(),
            DiemTrungBinh = entity.DanhGiaSanPhams.Any() ? Math.Round(entity.DanhGiaSanPhams.Average(d => (double)d.SoSao), 1) : 0,
            SoDanhGia = entity.DanhGiaSanPhams.Count
        };
    }

    public async Task UpdateTrangThaiAsync(Guid maSanPham, string trangThai, CancellationToken cancellationToken = default)
    {
        var entity = await _db.SanPhams.FirstOrDefaultAsync(s => s.MaSanPham == maSanPham, cancellationToken);
        if (entity == null)
        {
            throw new AppException("Không tìm thấy sản phẩm.", StatusCodes.Status404NotFound);
        }

        entity.TrangThai = ParseTrangThai(trangThai);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<HinhAnhSanPhamDto> UploadHinhAnhAsync(Guid maSanPham, IFormFile file, bool laAnhChinh = false, int thuTuHienThi = 0, CancellationToken cancellationToken = default)
    {
        var product = await _db.SanPhams
            .Include(s => s.HinhAnhSanPhams)
            .FirstOrDefaultAsync(s => s.MaSanPham == maSanPham, cancellationToken);

        if (product == null)
        {
            throw new AppException("Không tìm thấy sản phẩm.", StatusCodes.Status404NotFound);
        }

        if (file == null || file.Length == 0)
        {
            throw new AppException("Vui lòng chọn file hình ảnh hợp lệ.", StatusCodes.Status400BadRequest);
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        if (!allowedExtensions.Contains(ext))
        {
            throw new AppException("Định dạng file không được hỗ trợ. Chỉ chấp nhận jpg, jpeg, png, webp, gif.", StatusCodes.Status400BadRequest);
        }

        var webRoot = _env.WebRootPath;
        if (string.IsNullOrEmpty(webRoot))
        {
            webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
        }

        var uploadDir = Path.Combine(webRoot, "uploads", "san-pham");
        if (!Directory.Exists(uploadDir))
        {
            Directory.CreateDirectory(uploadDir);
        }

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadDir, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var duongDanAnh = $"/uploads/san-pham/{fileName}";

        // If explicitly set as main or it is the first image
        var shouldBeMain = laAnhChinh || !product.HinhAnhSanPhams.Any();

        if (shouldBeMain)
        {
            foreach (var h in product.HinhAnhSanPhams)
            {
                h.LaAnhChinh = false;
            }
            product.HinhAnhDaiDien = duongDanAnh;
        }

        var hinhAnh = new HinhAnhSanPham
        {
            MaHinhAnh = Guid.NewGuid(),
            MaSanPham = maSanPham,
            DuongDanAnh = duongDanAnh,
            LaAnhChinh = shouldBeMain,
            ThuTuHienThi = thuTuHienThi
        };

        _db.HinhAnhSanPhams.Add(hinhAnh);
        await _db.SaveChangesAsync(cancellationToken);

        return new HinhAnhSanPhamDto
        {
            MaHinhAnh = hinhAnh.MaHinhAnh,
            MaSanPham = hinhAnh.MaSanPham,
            DuongDanAnh = hinhAnh.DuongDanAnh,
            LaAnhChinh = hinhAnh.LaAnhChinh,
            ThuTuHienThi = hinhAnh.ThuTuHienThi
        };
    }

    public async Task DeleteHinhAnhAsync(Guid maSanPham, Guid maHinhAnh, CancellationToken cancellationToken = default)
    {
        var hinhAnh = await _db.HinhAnhSanPhams
            .FirstOrDefaultAsync(h => h.MaHinhAnh == maHinhAnh && h.MaSanPham == maSanPham, cancellationToken);

        if (hinhAnh == null)
        {
            throw new AppException("Không tìm thấy hình ảnh của sản phẩm.", StatusCodes.Status404NotFound);
        }

        // Delete physical file
        var webRoot = _env.WebRootPath;
        if (string.IsNullOrEmpty(webRoot))
        {
            webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
        }

        var relativePath = hinhAnh.DuongDanAnh.TrimStart('/', '\\');
        var filePath = Path.Combine(webRoot, relativePath);
        if (File.Exists(filePath))
        {
            try
            {
                File.Delete(filePath);
            }
            catch
            {
                // Silently ignore if file deletion fails
            }
        }

        var wasMain = hinhAnh.LaAnhChinh;
        _db.HinhAnhSanPhams.Remove(hinhAnh);

        if (wasMain)
        {
            var nextImage = await _db.HinhAnhSanPhams
                .Where(h => h.MaSanPham == maSanPham && h.MaHinhAnh != maHinhAnh)
                .OrderBy(h => h.ThuTuHienThi)
                .FirstOrDefaultAsync(cancellationToken);

            var product = await _db.SanPhams.FirstOrDefaultAsync(s => s.MaSanPham == maSanPham, cancellationToken);
            if (product != null)
            {
                if (nextImage != null)
                {
                    nextImage.LaAnhChinh = true;
                    product.HinhAnhDaiDien = nextImage.DuongDanAnh;
                }
                else
                {
                    product.HinhAnhDaiDien = null;
                }
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid maSanPham, CancellationToken cancellationToken = default)
    {
        var entity = await _db.SanPhams.FirstOrDefaultAsync(s => s.MaSanPham == maSanPham, cancellationToken);
        if (entity == null)
        {
            throw new AppException("Không tìm thấy sản phẩm.", StatusCodes.Status404NotFound);
        }

        var hasOrders = await _db.ChiTietDonHangs.AnyAsync(c => c.MaSanPham == maSanPham, cancellationToken);
        if (hasOrders)
        {
            throw new AppException("Không thể xóa sản phẩm đã có trong đơn hàng. Vui lòng chuyển trạng thái sang 'Ngừng bán' để lưu trữ lịch sử.", StatusCodes.Status400BadRequest);
        }

        var hasImports = await _db.ChiTietNhapHangs.AnyAsync(c => c.MaSanPham == maSanPham, cancellationToken);
        if (hasImports)
        {
            throw new AppException("Không thể xóa sản phẩm đã có trong phiếu nhập hàng. Vui lòng chuyển trạng thái sang 'Ngừng bán' để lưu trữ lịch sử.", StatusCodes.Status400BadRequest);
        }

        var cartItems = await _db.ChiTietGioHangs.Where(c => c.MaSanPham == maSanPham).ToListAsync(cancellationToken);
        if (cartItems.Count != 0) _db.ChiTietGioHangs.RemoveRange(cartItems);

        var promoItems = await _db.KhuyenMaiTheoSanPhams.Where(k => k.MaSanPham == maSanPham).ToListAsync(cancellationToken);
        if (promoItems.Count != 0) _db.KhuyenMaiTheoSanPhams.RemoveRange(promoItems);

        var reviews = await _db.DanhGiaSanPhams.Where(d => d.MaSanPham == maSanPham).ToListAsync(cancellationToken);
        if (reviews.Count != 0) _db.DanhGiaSanPhams.RemoveRange(reviews);

        var images = await _db.HinhAnhSanPhams.Where(h => h.MaSanPham == maSanPham).ToListAsync(cancellationToken);
        if (images.Count != 0) _db.HinhAnhSanPhams.RemoveRange(images);

        _db.SanPhams.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<DanhGiaSanPhamDto>> GetDanhGiaBySanPhamIdAsync(Guid maSanPham, CancellationToken cancellationToken = default)
    {
        var product = await _db.SanPhams.AsNoTracking().FirstOrDefaultAsync(s => s.MaSanPham == maSanPham, cancellationToken);
        if (product == null)
        {
            throw new AppException("Không tìm thấy sản phẩm.", StatusCodes.Status404NotFound);
        }

        var familyId = product.MaSanPhamCha ?? product.MaSanPham;

        var danhGias = await _db.DanhGiaSanPhams
            .AsNoTracking()
            .Include(d => d.KhachHang)
                .ThenInclude(k => k.NguoiDung)
            .Where(d => d.MaSanPham == familyId || d.SanPham.MaSanPhamCha == familyId)
            .OrderByDescending(d => d.NgayTao)
            .Select(d => new DanhGiaSanPhamDto
            {
                MaDanhGia = d.MaDanhGia,
                MaSanPham = d.MaSanPham,
                MaKhachHang = d.MaKhachHang,
                TenKhachHang = d.KhachHang.NguoiDung != null ? $"{d.KhachHang.NguoiDung.HoLot} {d.KhachHang.NguoiDung.Ten}".Trim() : string.Empty,
                SoSao = d.SoSao,
                BinhLuan = d.BinhLuan,
                NgayTao = d.NgayTao
            })
            .ToListAsync(cancellationToken);

        return danhGias;
    }

    private static TrangThaiSanPham ParseTrangThai(string status)
    {
        var normalized = status.Trim().ToLowerInvariant();
        return normalized switch
        {
            "dang_ban" or "dangban" or "active" => TrangThaiSanPham.DangBan,
            "ngung_ban" or "ngungban" or "inactive" => TrangThaiSanPham.NgungBan,
            _ => throw new AppException($"Trạng thái '{status}' không hợp lệ. Chỉ chấp nhận dang_ban hoặc ngung_ban.", StatusCodes.Status400BadRequest)
        };
    }
}
