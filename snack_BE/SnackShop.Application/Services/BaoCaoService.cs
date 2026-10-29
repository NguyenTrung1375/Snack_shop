using System.Data;
using System.Data.Common;
using AutoMapper;
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

    /// <summary>
    /// Helper: Mở kết nối Database ADO.NET thuần túy để thực thi truy vấn SQL trực tiếp
    /// </summary>
    private async Task<DbConnection> GetOpenConnectionAsync(CancellationToken cancellationToken)
    {
        var conn = _db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open)
        {
            await conn.OpenAsync(cancellationToken);
        }
        return conn;
    }

    // =========================================================================
    // 1. DOANH THU THEO THÁNG (TRUY VẤN SQL THUẦN TÚY)
    // =========================================================================
    public async Task<List<DoanhThuTheoThangDto>> GetDoanhThuTheoThangAsync(int? nam, CancellationToken cancellationToken = default)
    {
        var conn = await GetOpenConnectionAsync(cancellationToken);
        using var cmd = conn.CreateCommand();

        string sql = @"
            SELECT 
                DATE_FORMAT(ngay_tao, '%Y-%m') AS thang,
                COUNT(0) AS so_don,
                COALESCE(SUM(tong_tien_thanh_toan), 0) AS doanh_thu
            FROM don_hang
            WHERE trang_thai_don_hang = 'da_giao' ";

        if (nam.HasValue)
        {
            sql += " AND YEAR(ngay_tao) = @nam ";
            var param = cmd.CreateParameter();
            param.ParameterName = "@nam";
            param.Value = nam.Value;
            cmd.Parameters.Add(param);
        }

        sql += " GROUP BY DATE_FORMAT(ngay_tao, '%Y-%m') ORDER BY thang ASC;";
        cmd.CommandText = sql;

        var items = new List<DoanhThuTheoThangDto>();
        using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new DoanhThuTheoThangDto
            {
                Thang = reader.GetString(reader.GetOrdinal("thang")),
                SoDon = reader.GetInt64(reader.GetOrdinal("so_don")),
                DoanhThu = reader.GetDecimal(reader.GetOrdinal("doanh_thu"))
            });
        }

        return items;
    }

    // =========================================================================
    // 2. SẢN PHẨM BÁN CHẠY NHẤT (TRUY VẤN SQL THUẦN TÚY)
    // =========================================================================
    public async Task<PagedResult<SanPhamBanChayDto>> GetSanPhamBanChayAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var pageIndex = page > 0 ? page : 1;
        var size = pageSize > 0 ? pageSize : 20;
        var offset = (pageIndex - 1) * size;

        var conn = await GetOpenConnectionAsync(cancellationToken);

        // SQL đếm tổng số sản phẩm đã phát sinh doanh số
        using var countCmd = conn.CreateCommand();
        countCmd.CommandText = @"
            SELECT COUNT(DISTINCT ct.ma_san_pham) 
            FROM chi_tiet_don_hang ct
            INNER JOIN don_hang dh ON dh.ma_don_hang = ct.ma_don_hang
            WHERE dh.trang_thai_don_hang <> 'da_huy';";
        var totalObj = await countCmd.ExecuteScalarAsync(cancellationToken);
        int total = Convert.ToInt32(totalObj ?? 0);

        // SQL phân trang lấy top sản phẩm bán chạy nhất
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            SELECT 
                sp.ma_san_pham,
                sp.ten_san_pham,
                CAST(COALESCE(SUM(ct.so_luong), 0) AS SIGNED) AS tong_so_luong_ban,
                COALESCE(SUM(ct.thanh_tien), 0) AS tong_doanh_thu
            FROM chi_tiet_don_hang ct
            INNER JOIN don_hang dh ON dh.ma_don_hang = ct.ma_don_hang AND dh.trang_thai_don_hang <> 'da_huy'
            INNER JOIN san_pham sp ON sp.ma_san_pham = ct.ma_san_pham
            GROUP BY sp.ma_san_pham, sp.ten_san_pham
            ORDER BY tong_so_luong_ban DESC
            LIMIT @size OFFSET @offset;";

        var pSize = cmd.CreateParameter();
        pSize.ParameterName = "@size";
        pSize.Value = size;
        cmd.Parameters.Add(pSize);

        var pOffset = cmd.CreateParameter();
        pOffset.ParameterName = "@offset";
        pOffset.Value = offset;
        cmd.Parameters.Add(pOffset);

        var items = new List<SanPhamBanChayDto>();
        using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new SanPhamBanChayDto
            {
                MaSanPham = Guid.Parse(reader.GetString(reader.GetOrdinal("ma_san_pham"))),
                TenSanPham = reader.GetString(reader.GetOrdinal("ten_san_pham")),
                TongSoLuongBan = reader.GetInt64(reader.GetOrdinal("tong_so_luong_ban")),
                TongDoanhThu = reader.GetDecimal(reader.GetOrdinal("tong_doanh_thu"))
            });
        }

        return new PagedResult<SanPhamBanChayDto>(items, total, pageIndex, size);
    }

    // =========================================================================
    // 3. THỐNG KÊ TỔNG TIỀN HÓA ĐƠN THEO KHOẢNG NGÀY (TRUY VẤN SQL THUẦN TÚY)
    // =========================================================================
    public async Task<ThongKeTheoKhoangNgayDto> GetThongKeTheoKhoangNgayAsync(DateTime tuNgay, DateTime denNgay, CancellationToken cancellationToken = default)
    {
        var start = DateTime.SpecifyKind(tuNgay.Date, DateTimeKind.Utc);
        var end = DateTime.SpecifyKind(denNgay.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);

        var conn = await GetOpenConnectionAsync(cancellationToken);
        using var cmd = conn.CreateCommand();

        cmd.CommandText = @"
            SELECT 
                h.ma_hoa_don,
                h.so_hoa_don,
                COALESCE(d.ma_code, 'N/A') AS ma_code_don_hang,
                COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u_kh.ho_lot, ''), ' ', COALESCE(u_kh.ten, ''))), ''), d.ten_nguoi_nhan, 'Khách hàng') AS ten_khach_hang,
                COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u_nv.ho_lot, ''), ' ', COALESCE(u_nv.ten, ''))), ''), 'Tự động (Hệ thống)') AS ten_nhan_vien,
                h.tong_tien,
                h.ngay_xuat_hoa_don
            FROM hoa_don h
            INNER JOIN don_hang d ON h.ma_don_hang = d.ma_don_hang
            LEFT JOIN khach_hang k ON d.ma_khach_hang = k.ma_nguoi_dung
            LEFT JOIN nguoi_dung u_kh ON k.ma_nguoi_dung = u_kh.ma_nguoi_dung
            LEFT JOIN nhan_vien nv ON h.ma_nhan_vien = nv.ma_nguoi_dung
            LEFT JOIN nguoi_dung u_nv ON nv.ma_nguoi_dung = u_nv.ma_nguoi_dung
            WHERE h.ngay_xuat_hoa_don >= @start AND h.ngay_xuat_hoa_don <= @end
            ORDER BY h.ngay_xuat_hoa_don DESC;";

        var pStart = cmd.CreateParameter();
        pStart.ParameterName = "@start";
        pStart.Value = start;
        cmd.Parameters.Add(pStart);

        var pEnd = cmd.CreateParameter();
        pEnd.ParameterName = "@end";
        pEnd.Value = end;
        cmd.Parameters.Add(pEnd);

        var list = new List<HoaDonThongKeItemDto>();
        decimal grandTotal = 0;

        using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            var total = reader.GetDecimal(reader.GetOrdinal("tong_tien"));
            grandTotal += total;

            list.Add(new HoaDonThongKeItemDto
            {
                MaHoaDon = Guid.Parse(reader.GetString(reader.GetOrdinal("ma_hoa_don"))),
                SoHoaDon = reader.GetString(reader.GetOrdinal("so_hoa_don")),
                MaCodeDonHang = reader.GetString(reader.GetOrdinal("ma_code_don_hang")),
                TenKhachHang = reader.GetString(reader.GetOrdinal("ten_khach_hang")),
                TenNhanVien = reader.GetString(reader.GetOrdinal("ten_nhan_vien")),
                TongTien = total,
                NgayXuatHoaDon = reader.GetDateTime(reader.GetOrdinal("ngay_xuat_hoa_don"))
            });
        }

        return new ThongKeTheoKhoangNgayDto
        {
            TuNgay = start,
            DenNgay = end,
            TongSoHoaDon = list.Count,
            TongDoanhThu = grandTotal,
            DanhSachHoaDon = list
        };
    }

    // =========================================================================
    // 4. THỐNG KÊ THU - CHI - LỢI NHUẬN THEO QUÝ & NĂM (TRUY VẤN SQL THUẦN TÚY)
    // =========================================================================
    public async Task<ThongKeThuChiLoiNhuanDto> GetThuChiLoiNhuanTheoQuyAsync(int nam, CancellationToken cancellationToken = default)
    {
        var conn = await GetOpenConnectionAsync(cancellationToken);

        // 1. Câu truy vấn SQL lấy tổng thu Hóa đơn (Thu) theo từng Quý trong năm
        using var cmdThu = conn.CreateCommand();
        cmdThu.CommandText = @"
            SELECT 
                QUARTER(ngay_xuat_hoa_don) AS quy,
                COALESCE(SUM(tong_tien), 0) AS tong_thu
            FROM hoa_don
            WHERE YEAR(ngay_xuat_hoa_don) = @nam
            GROUP BY QUARTER(ngay_xuat_hoa_don);";

        var pNamThu = cmdThu.CreateParameter();
        pNamThu.ParameterName = "@nam";
        pNamThu.Value = nam;
        cmdThu.Parameters.Add(pNamThu);

        decimal thuQ1 = 0, thuQ2 = 0, thuQ3 = 0, thuQ4 = 0;
        using (var readerThu = await cmdThu.ExecuteReaderAsync(cancellationToken))
        {
            while (await readerThu.ReadAsync(cancellationToken))
            {
                int q = readerThu.GetInt32(readerThu.GetOrdinal("quy"));
                decimal val = readerThu.GetDecimal(readerThu.GetOrdinal("tong_thu"));
                if (q == 1) thuQ1 = val;
                else if (q == 2) thuQ2 = val;
                else if (q == 3) thuQ3 = val;
                else if (q == 4) thuQ4 = val;
            }
        }
        decimal thuTC = thuQ1 + thuQ2 + thuQ3 + thuQ4;

        // 2. Câu truy vấn SQL lấy tổng chi Phiếu nhập hàng (Chi) theo từng Quý trong năm
        using var cmdChi = conn.CreateCommand();
        cmdChi.CommandText = @"
            SELECT 
                QUARTER(COALESCE(ngay_nhap_kho, ngay_tao)) AS quy,
                COALESCE(SUM(tong_tien), 0) AS tong_chi
            FROM don_nhap_hang
            WHERE YEAR(COALESCE(ngay_nhap_kho, ngay_tao)) = @nam
            GROUP BY QUARTER(COALESCE(ngay_nhap_kho, ngay_tao));";

        var pNamChi = cmdChi.CreateParameter();
        pNamChi.ParameterName = "@nam";
        pNamChi.Value = nam;
        cmdChi.Parameters.Add(pNamChi);

        decimal chiQ1 = 0, chiQ2 = 0, chiQ3 = 0, chiQ4 = 0;
        using (var readerChi = await cmdChi.ExecuteReaderAsync(cancellationToken))
        {
            while (await readerChi.ReadAsync(cancellationToken))
            {
                int q = readerChi.GetInt32(readerChi.GetOrdinal("quy"));
                decimal val = readerChi.GetDecimal(readerChi.GetOrdinal("tong_chi"));
                if (q == 1) chiQ1 = val;
                else if (q == 2) chiQ2 = val;
                else if (q == 3) chiQ3 = val;
                else if (q == 4) chiQ4 = val;
            }
        }
        decimal chiTC = chiQ1 + chiQ2 + chiQ3 + chiQ4;

        return new ThongKeThuChiLoiNhuanDto
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
    }

    // =========================================================================
    // 5. THỐNG KÊ DOANH THU THEO NHÂN VIÊN QUA CÁC NĂM (TRUY VẤN SQL THUẦN TÚY)
    // =========================================================================
    public async Task<ThongKeDoiTuongTheoNamDto> GetDoanhThuTheoNhanVienAsync(List<int>? danhSachNam = null, CancellationToken cancellationToken = default)
    {
        var years = danhSachNam is { Count: > 0 } ? danhSachNam : new List<int> { 2024, 2025, 2026 };
        years.Sort();

        var conn = await GetOpenConnectionAsync(cancellationToken);
        using var cmd = conn.CreateCommand();

        cmd.CommandText = @"
            SELECT 
                nv.ma_nguoi_dung AS ma_nhan_vien,
                TRIM(CONCAT(COALESCE(u.ho_lot, ''), ' ', COALESCE(u.ten, ''))) AS ten_nhan_vien,
                YEAR(h.ngay_xuat_hoa_don) AS nam,
                COALESCE(SUM(h.tong_tien), 0) AS doanh_thu
            FROM nhan_vien nv
            INNER JOIN nguoi_dung u ON nv.ma_nguoi_dung = u.ma_nguoi_dung
            LEFT JOIN hoa_don h ON nv.ma_nguoi_dung = h.ma_nhan_vien
            GROUP BY nv.ma_nguoi_dung, u.ho_lot, u.ten, YEAR(h.ngay_xuat_hoa_don);";

        var tempRows = new Dictionary<string, (string Ten, Dictionary<string, decimal> TheoNam)>();

        using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            string maNv = reader.GetString(reader.GetOrdinal("ma_nhan_vien"));
            string tenNv = reader.GetString(reader.GetOrdinal("ten_nhan_vien"));
            int? nam = reader.IsDBNull(reader.GetOrdinal("nam")) ? null : reader.GetInt32(reader.GetOrdinal("nam"));
            decimal rev = reader.GetDecimal(reader.GetOrdinal("doanh_thu"));

            if (!tempRows.ContainsKey(maNv))
            {
                tempRows[maNv] = (tenNv, new Dictionary<string, decimal>());
                foreach (var y in years) tempRows[maNv].TheoNam[y.ToString()] = 0;
            }

            if (nam.HasValue && tempRows[maNv].TheoNam.ContainsKey(nam.Value.ToString()))
            {
                tempRows[maNv].TheoNam[nam.Value.ToString()] = rev;
            }
        }

        var rows = new List<DoiTuongDoanhThuRowDto>();
        foreach (var kvp in tempRows)
        {
            decimal total = kvp.Value.TheoNam.Values.Sum();
            rows.Add(new DoiTuongDoanhThuRowDto
            {
                MaDoiTuong = Guid.Parse(kvp.Key),
                TenDoiTuong = kvp.Value.Ten,
                DoanhThuTheoNam = kvp.Value.TheoNam,
                TongCong = total
            });
        }

        // Sắp xếp doanh thu giảm dần và đánh số tuần tự NV01, NV02,...
        rows = rows.OrderByDescending(r => r.TongCong).ToList();
        for (int i = 0; i < rows.Count; i++)
        {
            rows[i].MaDinhDanh = $"NV{(i + 1):D2}";
        }

        // Dòng Tổng cộng toàn bộ (TC)
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

    // =========================================================================
    // 6. THỐNG KÊ DOANH THU THEO KHÁCH HÀNG QUA CÁC NĂM (TRUY VẤN SQL THUẦN TÚY)
    // =========================================================================
    public async Task<ThongKeDoiTuongTheoNamDto> GetDoanhThuTheoKhachHangAsync(List<int>? danhSachNam = null, CancellationToken cancellationToken = default)
    {
        var years = danhSachNam is { Count: > 0 } ? danhSachNam : new List<int> { 2024, 2025, 2026 };
        years.Sort();

        var conn = await GetOpenConnectionAsync(cancellationToken);
        using var cmd = conn.CreateCommand();

        // SQL: Gom theo đúng ID khách hàng (d.ma_khach_hang) và lấy tên mới nhất
        cmd.CommandText = @"
            SELECT 
                d.ma_khach_hang,
                COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.ho_lot, ''), ' ', COALESCE(u.ten, ''))), ''), d.ten_nguoi_nhan, 'Khách hàng') AS ten_khach_hang,
                YEAR(h.ngay_xuat_hoa_don) AS nam,
                COALESCE(SUM(h.tong_tien), 0) AS doanh_thu
            FROM hoa_don h
            INNER JOIN don_hang d ON h.ma_don_hang = d.ma_don_hang
            LEFT JOIN khach_hang k ON d.ma_khach_hang = k.ma_nguoi_dung
            LEFT JOIN nguoi_dung u ON k.ma_nguoi_dung = u.ma_nguoi_dung
            GROUP BY d.ma_khach_hang, u.ho_lot, u.ten, d.ten_nguoi_nhan, YEAR(h.ngay_xuat_hoa_don);";

        var tempRows = new Dictionary<string, (string Ten, Dictionary<string, decimal> TheoNam)>();

        using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            string maKh = reader.GetString(reader.GetOrdinal("ma_khach_hang"));
            string tenKh = reader.GetString(reader.GetOrdinal("ten_khach_hang"));
            int nam = reader.GetInt32(reader.GetOrdinal("nam"));
            decimal rev = reader.GetDecimal(reader.GetOrdinal("doanh_thu"));

            if (!tempRows.ContainsKey(maKh))
            {
                tempRows[maKh] = (tenKh, new Dictionary<string, decimal>());
                foreach (var y in years) tempRows[maKh].TheoNam[y.ToString()] = 0;
            }

            if (tempRows[maKh].TheoNam.ContainsKey(nam.ToString()))
            {
                tempRows[maKh].TheoNam[nam.ToString()] = rev;
            }
        }

        var rows = new List<DoiTuongDoanhThuRowDto>();
        foreach (var kvp in tempRows)
        {
            decimal total = kvp.Value.TheoNam.Values.Sum();
            rows.Add(new DoiTuongDoanhThuRowDto
            {
                MaDoiTuong = Guid.Parse(kvp.Key),
                TenDoiTuong = kvp.Value.Ten,
                DoanhThuTheoNam = kvp.Value.TheoNam,
                TongCong = total
            });
        }

        // Sắp xếp chi tiêu giảm dần và gán mã KH01, KH02,...
        rows = rows.OrderByDescending(r => r.TongCong).ToList();
        for (int i = 0; i < rows.Count; i++)
        {
            rows[i].MaDinhDanh = $"KH{(i + 1):D2}";
        }

        // Dòng Tổng cộng toàn bộ (TC)
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

    // =========================================================================
    // 7. THỐNG KÊ DOANH THU SẢN PHẨM THEO QUÝ (TRUY VẤN SQL THUẦN TÚY)
    // =========================================================================
    public async Task<ThongKeSanPhamTheoQuyDto> GetDoanhThuSanPhamTheoQuyAsync(int nam, CancellationToken cancellationToken = default)
    {
        var conn = await GetOpenConnectionAsync(cancellationToken);
        using var cmd = conn.CreateCommand();

        // SQL: Gom doanh thu từng món ăn vặt theo từng Quý trong năm
        cmd.CommandText = @"
            SELECT 
                sp.ma_san_pham,
                sp.ten_san_pham,
                QUARTER(h.ngay_xuat_hoa_don) AS quy,
                COALESCE(SUM(ct.thanh_tien), 0) AS doanh_thu
            FROM chi_tiet_don_hang ct
            INNER JOIN don_hang d ON ct.ma_don_hang = d.ma_don_hang
            INNER JOIN hoa_don h ON d.ma_don_hang = h.ma_don_hang
            INNER JOIN san_pham sp ON ct.ma_san_pham = sp.ma_san_pham
            WHERE YEAR(h.ngay_xuat_hoa_don) = @nam
            GROUP BY sp.ma_san_pham, sp.ten_san_pham, QUARTER(h.ngay_xuat_hoa_don)
            ORDER BY sp.ten_san_pham ASC;";

        var pNam = cmd.CreateParameter();
        pNam.ParameterName = "@nam";
        pNam.Value = nam;
        cmd.Parameters.Add(pNam);

        var tempDict = new Dictionary<string, (string Ten, decimal Q1, decimal Q2, decimal Q3, decimal Q4)>();

        using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            string maSp = reader.GetString(reader.GetOrdinal("ma_san_pham"));
            string tenSp = reader.GetString(reader.GetOrdinal("ten_san_pham"));
            int quy = reader.GetInt32(reader.GetOrdinal("quy"));
            decimal rev = reader.GetDecimal(reader.GetOrdinal("doanh_thu"));

            if (!tempDict.ContainsKey(maSp))
            {
                tempDict[maSp] = (tenSp, 0, 0, 0, 0);
            }

            var curr = tempDict[maSp];
            if (quy == 1) curr.Q1 = rev;
            else if (quy == 2) curr.Q2 = rev;
            else if (quy == 3) curr.Q3 = rev;
            else if (quy == 4) curr.Q4 = rev;
            tempDict[maSp] = curr;
        }

        var rows = new List<SanPhamQuyRowDto>();
        foreach (var kvp in tempDict)
        {
            decimal total = kvp.Value.Q1 + kvp.Value.Q2 + kvp.Value.Q3 + kvp.Value.Q4;
            rows.Add(new SanPhamQuyRowDto
            {
                MaSanPham = Guid.Parse(kvp.Key),
                TenSanPham = kvp.Value.Ten,
                Q1 = kvp.Value.Q1,
                Q2 = kvp.Value.Q2,
                Q3 = kvp.Value.Q3,
                Q4 = kvp.Value.Q4,
                TongCong = total
            });
        }

        // Sắp xếp món có doanh thu cao lên trước
        rows = rows.OrderByDescending(r => r.TongCong).ToList();

        // Dòng Tổng cộng toàn bộ (TC)
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
