using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.BaoCao;
using SnackShop.Application.Interfaces;

namespace SnackShop.Application.Services;

public class BaoCaoService : IBaoCaoService
{
    private readonly IAppDbContext _db;
    private readonly IMapper _mapper;

    public BaoCaoService(IAppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<DoanhThuTheoThangDto>> GetDoanhThuTheoThangAsync(int? nam, CancellationToken cancellationToken = default)
    {
        var query = _db.DoanhThuTheoThangViews.AsNoTracking();

        if (nam.HasValue)
        {
            var namStr = nam.Value.ToString();
            query = query.Where(v => v.Thang.StartsWith(namStr));
        }

        var items = await query
            .OrderBy(v => v.Thang)
            .ToListAsync(cancellationToken);

        return _mapper.Map<List<DoanhThuTheoThangDto>>(items);
    }

    public async Task<PagedResult<SanPhamBanChayDto>> GetSanPhamBanChayAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var pageIndex = page > 0 ? page : 1;
        var size = pageSize > 0 ? pageSize : 20;

        var total = await _db.SanPhamBanChayViews.AsNoTracking().CountAsync(cancellationToken);

        var items = await _db.SanPhamBanChayViews
            .AsNoTracking()
            .OrderByDescending(v => v.TongSoLuongBan)
            .Skip((pageIndex - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<SanPhamBanChayDto>>(items);
        return new PagedResult<SanPhamBanChayDto>(dtos, total, pageIndex, size);
    }

    // ==========================================
    // 4 DẠNG BÁO CÁO THEO YÊU CẦU GIẢNG VIÊN
    // ==========================================

    // a) Thống kê tổng tiền Hóa đơn từ ngày a đến ngày b
    public async Task<ThongKeTheoKhoangNgayDto> GetThongKeTheoKhoangNgayAsync(DateTime tuNgay, DateTime denNgay, CancellationToken cancellationToken = default)
    {
        var start = DateTime.SpecifyKind(tuNgay.Date, DateTimeKind.Utc);
        var end = DateTime.SpecifyKind(denNgay.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);

        var invoices = await _db.HoaDons
            .AsNoTracking()
            .Include(h => h.DonHang).ThenInclude(d => d.KhachHang).ThenInclude(k => k.NguoiDung)
            .Include(h => h.NhanVien).ThenInclude(nv => nv.NguoiDung)
            .Where(h => h.NgayXuatHoaDon >= start && h.NgayXuatHoaDon <= end)
            .OrderByDescending(h => h.NgayXuatHoaDon)
            .ToListAsync(cancellationToken);

        var result = new ThongKeTheoKhoangNgayDto
        {
            TuNgay = start,
            DenNgay = end,
            TongSoHoaDon = invoices.Count,
            TongDoanhThu = invoices.Sum(h => h.TongTien),
            DanhSachHoaDon = invoices.Select(h => new HoaDonThongKeItemDto
            {
                MaHoaDon = h.MaHoaDon,
                SoHoaDon = h.SoHoaDon,
                MaCodeDonHang = h.DonHang?.MaCode ?? "N/A",
                TenKhachHang = !string.IsNullOrWhiteSpace(h.DonHang?.TenNguoiNhan) 
                    ? h.DonHang.TenNguoiNhan 
                    : (h.DonHang?.KhachHang?.NguoiDung != null 
                        ? (h.DonHang.KhachHang.NguoiDung.HoLot + " " + h.DonHang.KhachHang.NguoiDung.Ten).Trim() 
                        : "Khách hàng"),
                TenNhanVien = h.NhanVien?.NguoiDung != null 
                    ? (h.NhanVien.NguoiDung.HoLot + " " + h.NhanVien.NguoiDung.Ten).Trim() 
                    : "Tự động (Hệ thống)",
                TongTien = h.TongTien,
                NgayXuatHoaDon = h.NgayXuatHoaDon
            }).ToList()
        };

        return result;
    }

    // b) Thống kê tổng tiền HĐ theo Tháng / Quý / Năm (Thu HĐ - Chi PNH = Lợi nhuận)
    public async Task<ThongKeThuChiLoiNhuanDto> GetThuChiLoiNhuanTheoQuyAsync(int nam, CancellationToken cancellationToken = default)
    {
        var start = new DateTime(nam, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = new DateTime(nam, 12, 31, 23, 59, 59, 999, DateTimeKind.Utc);

        // 1. Tổng thu từ Hóa đơn (hoặc đơn hàng hoàn thành)
        var hoaDons = await _db.HoaDons
            .AsNoTracking()
            .Where(h => h.NgayXuatHoaDon >= start && h.NgayXuatHoaDon <= end)
            .Select(h => new { h.NgayXuatHoaDon, h.TongTien })
            .ToListAsync(cancellationToken);

        decimal thuQ1 = hoaDons.Where(h => h.NgayXuatHoaDon.Month is >= 1 and <= 3).Sum(h => h.TongTien);
        decimal thuQ2 = hoaDons.Where(h => h.NgayXuatHoaDon.Month is >= 4 and <= 6).Sum(h => h.TongTien);
        decimal thuQ3 = hoaDons.Where(h => h.NgayXuatHoaDon.Month is >= 7 and <= 9).Sum(h => h.TongTien);
        decimal thuQ4 = hoaDons.Where(h => h.NgayXuatHoaDon.Month is >= 10 and <= 12).Sum(h => h.TongTien);
        decimal thuTC = thuQ1 + thuQ2 + thuQ3 + thuQ4;

        // 2. Tổng chi từ Đơn nhập hàng (Phiếu nhập hàng - PNH)
        var donNhaps = await _db.DonNhapHangs
            .AsNoTracking()
            .Where(d => (d.NgayNhapKho ?? d.NgayTao) >= start && (d.NgayNhapKho ?? d.NgayTao) <= end)
            .Select(d => new { Ngay = d.NgayNhapKho ?? d.NgayTao, d.TongTien })
            .ToListAsync(cancellationToken);

        decimal chiQ1 = donNhaps.Where(d => d.Ngay.Month is >= 1 and <= 3).Sum(d => d.TongTien);
        decimal chiQ2 = donNhaps.Where(d => d.Ngay.Month is >= 4 and <= 6).Sum(d => d.TongTien);
        decimal chiQ3 = donNhaps.Where(d => d.Ngay.Month is >= 7 and <= 9).Sum(d => d.TongTien);
        decimal chiQ4 = donNhaps.Where(d => d.Ngay.Month is >= 10 and <= 12).Sum(d => d.TongTien);
        decimal chiTC = chiQ1 + chiQ2 + chiQ3 + chiQ4;

        var result = new ThongKeThuChiLoiNhuanDto
        {
            Nam = nam,
            Rows = new List<ChiTieuThuChiRowDto>
            {
                new()
                {
                    ChiTieu = "HĐ (Tổng thu)",
                    MaChiTieu = "tong_thu",
                    Q1 = thuQ1,
                    Q2 = thuQ2,
                    Q3 = thuQ3,
                    Q4 = thuQ4,
                    TongCong = thuTC
                },
                new()
                {
                    ChiTieu = "PNH (Tổng chi)",
                    MaChiTieu = "tong_chi",
                    Q1 = chiQ1,
                    Q2 = chiQ2,
                    Q3 = chiQ3,
                    Q4 = chiQ4,
                    TongCong = chiTC
                },
                new()
                {
                    ChiTieu = "Lợi nhuận (Thu - Chi)",
                    MaChiTieu = "loi_nhuan",
                    Q1 = thuQ1 - chiQ1,
                    Q2 = thuQ2 - chiQ2,
                    Q3 = thuQ3 - chiQ3,
                    Q4 = thuQ4 - chiQ4,
                    TongCong = thuTC - chiTC
                }
            }
        };

        return result;
    }

    // c) Thống kê tổng tiền HĐ theo Nhân viên và năm
    public async Task<ThongKeDoiTuongTheoNamDto> GetDoanhThuTheoNhanVienAsync(List<int>? danhSachNam = null, CancellationToken cancellationToken = default)
    {
        var years = danhSachNam is { Count: > 0 } ? danhSachNam : new List<int> { 2024, 2025, 2026 };
        years.Sort();

        var nhanViens = await _db.NhanViens
            .AsNoTracking()
            .Include(nv => nv.NguoiDung)
            .ToListAsync(cancellationToken);

        var hoaDons = await _db.HoaDons
            .AsNoTracking()
            .Where(h => h.MaNhanVien.HasValue)
            .Select(h => new { h.MaNhanVien, h.NgayXuatHoaDon.Year, h.TongTien })
            .ToListAsync(cancellationToken);

        var rows = new List<DoiTuongDoanhThuRowDto>();
        int index = 1;

        foreach (var nv in nhanViens)
        {
            var row = new DoiTuongDoanhThuRowDto
            {
                MaDoiTuong = nv.MaNguoiDung,
                TenDoiTuong = nv.NguoiDung != null 
                    ? (nv.NguoiDung.HoLot + " " + nv.NguoiDung.Ten).Trim() 
                    : $"Nhân viên {index}",
                DoanhThuTheoNam = new Dictionary<string, decimal>()
            };

            decimal total = 0;
            foreach (var y in years)
            {
                decimal sum = hoaDons.Where(h => h.MaNhanVien == nv.MaNguoiDung && h.Year == y).Sum(h => h.TongTien);
                row.DoanhThuTheoNam[y.ToString()] = sum;
                total += sum;
            }
            row.TongCong = total;
            rows.Add(row);
            index++;
        }

        // Sắp xếp nhân viên theo tổng doanh thu giảm dần và đánh số tuần tự NV01, NV02,...
        rows = rows.OrderByDescending(r => r.TongCong).ToList();
        for (int i = 0; i < rows.Count; i++)
        {
            rows[i].MaDinhDanh = $"NV{(i + 1):D2}";
        }

        // Tính hàng Tổng cộng (TC)
        var tcRow = new DoiTuongDoanhThuRowDto
        {
            MaDoiTuong = Guid.Empty,
            TenDoiTuong = "Tổng cộng (TC)",
            MaDinhDanh = "TC",
            DoanhThuTheoNam = new Dictionary<string, decimal>()
        };
        decimal grandTotal = 0;
        foreach (var y in years)
        {
            decimal sumYear = rows.Sum(r => r.DoanhThuTheoNam.GetValueOrDefault(y.ToString(), 0));
            tcRow.DoanhThuTheoNam[y.ToString()] = sumYear;
            grandTotal += sumYear;
        }
        tcRow.TongCong = grandTotal;

        return new ThongKeDoiTuongTheoNamDto
        {
            LoaiDoiTuong = "nhan_vien",
            DanhSachNam = years,
            Items = rows,
            TongCongToanBo = tcRow
        };
    }

    // c2) Thống kê tổng tiền HĐ theo Khách hàng và năm (Group 100% theo ID duy nhất, lấy tên mới nhất)
    public async Task<ThongKeDoiTuongTheoNamDto> GetDoanhThuTheoKhachHangAsync(List<int>? danhSachNam = null, CancellationToken cancellationToken = default)
    {
        var years = danhSachNam is { Count: > 0 } ? danhSachNam : new List<int> { 2024, 2025, 2026 };
        years.Sort();

        var hoaDons = await _db.HoaDons
            .AsNoTracking()
            .Include(h => h.DonHang).ThenInclude(d => d.KhachHang).ThenInclude(k => k.NguoiDung)
            .Select(h => new
            {
                MaKhachHang = h.DonHang.MaKhachHang,
                TenNguoiNhan = h.DonHang.TenNguoiNhan,
                HoLot = h.DonHang.KhachHang != null && h.DonHang.KhachHang.NguoiDung != null ? h.DonHang.KhachHang.NguoiDung.HoLot : "",
                Ten = h.DonHang.KhachHang != null && h.DonHang.KhachHang.NguoiDung != null ? h.DonHang.KhachHang.NguoiDung.Ten : "",
                NgayXuatHoaDon = h.NgayXuatHoaDon,
                Year = h.NgayXuatHoaDon.Year,
                TongTien = h.TongTien
            })
            .ToListAsync(cancellationToken);

        // Group DUY NHẤT theo MaKhachHang để triệt tiêu hoàn toàn trùng lặp
        var customerGroups = hoaDons
            .GroupBy(h => h.MaKhachHang)
            .ToList();

        var rows = new List<DoiTuongDoanhThuRowDto>();

        foreach (var grp in customerGroups)
        {
            // Lấy thông tin từ đơn hàng/hóa đơn mới nhất của khách
            var latestOrder = grp.OrderByDescending(h => h.NgayXuatHoaDon).First();
            string tenChinhThuc = $"{latestOrder.HoLot} {latestOrder.Ten}".Trim();
            string tenHienThi = !string.IsNullOrWhiteSpace(tenChinhThuc)
                ? tenChinhThuc
                : (!string.IsNullOrWhiteSpace(latestOrder.TenNguoiNhan) ? latestOrder.TenNguoiNhan : "Khách hàng");

            var row = new DoiTuongDoanhThuRowDto
            {
                MaDoiTuong = grp.Key,
                TenDoiTuong = tenHienThi,
                DoanhThuTheoNam = new Dictionary<string, decimal>()
            };

            decimal total = 0;
            foreach (var y in years)
            {
                decimal sum = grp.Where(h => h.Year == y).Sum(h => h.TongTien);
                row.DoanhThuTheoNam[y.ToString()] = sum;
                total += sum;
            }
            row.TongCong = total;
            rows.Add(row);
        }

        // Sắp xếp theo tổng chi tiêu giảm dần
        rows = rows.OrderByDescending(r => r.TongCong).ToList();

        // Gán mã KH01, KH02, KH03... tuần tự theo thứ tự sau khi sắp xếp
        for (int i = 0; i < rows.Count; i++)
        {
            rows[i].MaDinhDanh = $"KH{(i + 1):D2}";
        }

        // Tính hàng Tổng cộng (TC)
        var tcRow = new DoiTuongDoanhThuRowDto
        {
            MaDoiTuong = Guid.Empty,
            TenDoiTuong = "Tổng cộng (TC)",
            MaDinhDanh = "TC",
            DoanhThuTheoNam = new Dictionary<string, decimal>()
        };
        decimal grandTotal = 0;
        foreach (var y in years)
        {
            decimal sumYear = rows.Sum(r => r.DoanhThuTheoNam.GetValueOrDefault(y.ToString(), 0));
            tcRow.DoanhThuTheoNam[y.ToString()] = sumYear;
            grandTotal += sumYear;
        }
        tcRow.TongCong = grandTotal;

        return new ThongKeDoiTuongTheoNamDto
        {
            LoaiDoiTuong = "khach_hang",
            DanhSachNam = years,
            Items = rows,
            TongCongToanBo = tcRow
        };
    }

    // d) Thống kê tổng tiền HĐ theo Sản phẩm & Quý - năm
    public async Task<ThongKeSanPhamTheoQuyDto> GetDoanhThuSanPhamTheoQuyAsync(int nam, CancellationToken cancellationToken = default)
    {
        var start = new DateTime(nam, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = new DateTime(nam, 12, 31, 23, 59, 59, 999, DateTimeKind.Utc);

        // Lấy chi tiết đơn hàng gắn với hóa đơn trong năm
        var items = await _db.ChiTietDonHangs
            .AsNoTracking()
            .Include(ct => ct.DonHang).ThenInclude(d => d.HoaDon)
            .Include(ct => ct.SanPham)
            .Where(ct => ct.DonHang.HoaDon != null && 
                         ct.DonHang.HoaDon.NgayXuatHoaDon >= start && 
                         ct.DonHang.HoaDon.NgayXuatHoaDon <= end)
            .Select(ct => new
            {
                ct.MaSanPham,
                TenSanPham = ct.SanPham.TenSanPham,
                ct.ThanhTien,
                Thang = ct.DonHang.HoaDon!.NgayXuatHoaDon.Month
            })
            .ToListAsync(cancellationToken);

        var productGroups = items
            .GroupBy(i => new { i.MaSanPham, i.TenSanPham })
            .ToList();

        var rows = new List<SanPhamQuyRowDto>();

        foreach (var grp in productGroups)
        {
            decimal q1 = grp.Where(i => i.Thang is >= 1 and <= 3).Sum(i => i.ThanhTien);
            decimal q2 = grp.Where(i => i.Thang is >= 4 and <= 6).Sum(i => i.ThanhTien);
            decimal q3 = grp.Where(i => i.Thang is >= 7 and <= 9).Sum(i => i.ThanhTien);
            decimal q4 = grp.Where(i => i.Thang is >= 10 and <= 12).Sum(i => i.ThanhTien);
            decimal tc = q1 + q2 + q3 + q4;

            rows.Add(new SanPhamQuyRowDto
            {
                MaSanPham = grp.Key.MaSanPham,
                TenSanPham = grp.Key.TenSanPham,
                Q1 = q1,
                Q2 = q2,
                Q3 = q3,
                Q4 = q4,
                TongCong = tc
            });
        }

        // Sắp xếp sản phẩm doanh thu cao lên trước
        rows = rows.OrderByDescending(r => r.TongCong).ToList();

        // Tính hàng Tổng cộng (TC)
        var tcRow = new SanPhamQuyRowDto
        {
            MaSanPham = null,
            TenSanPham = "Tổng cộng (TC)",
            Q1 = rows.Sum(r => r.Q1),
            Q2 = rows.Sum(r => r.Q2),
            Q3 = rows.Sum(r => r.Q3),
            Q4 = rows.Sum(r => r.Q4),
            TongCong = rows.Sum(r => r.TongCong)
        };

        return new ThongKeSanPhamTheoQuyDto
        {
            Nam = nam,
            Items = rows,
            TongCongToanBo = tcRow
        };
    }
}
