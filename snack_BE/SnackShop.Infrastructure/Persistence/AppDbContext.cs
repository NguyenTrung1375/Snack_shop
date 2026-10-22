using Microsoft.EntityFrameworkCore;
using SnackShop.Application.Interfaces;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;
using SnackShop.Infrastructure.Persistence.Converters;
using SnackShop.Infrastructure.Persistence.Interceptors;

namespace SnackShop.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    private readonly NguoiThucHienInterceptor? _interceptor;

    public AppDbContext(DbContextOptions<AppDbContext> options, NguoiThucHienInterceptor? interceptor = null)
        : base(options)
    {
        _interceptor = interceptor;
    }

    // 20 Table Entities
    public DbSet<NguoiDung> NguoiDungs => Set<NguoiDung>();
    public DbSet<NhanVien> NhanViens => Set<NhanVien>();
    public DbSet<KhachHang> KhachHangs => Set<KhachHang>();
    public DbSet<ThongBao> ThongBaos => Set<ThongBao>();
    public DbSet<NhaCungCap> NhaCungCaps => Set<NhaCungCap>();
    public DbSet<LoaiSanPham> LoaiSanPhams => Set<LoaiSanPham>();
    public DbSet<SanPham> SanPhams => Set<SanPham>();
    public DbSet<HinhAnhSanPham> HinhAnhSanPhams => Set<HinhAnhSanPham>();
    public DbSet<DonNhapHang> DonNhapHangs => Set<DonNhapHang>();
    public DbSet<ChiTietNhapHang> ChiTietNhapHangs => Set<ChiTietNhapHang>();
    public DbSet<ChiTietGioHang> ChiTietGioHangs => Set<ChiTietGioHang>();
    public DbSet<ChuongTrinhKhuyenMai> ChuongTrinhKhuyenMais => Set<ChuongTrinhKhuyenMai>();
    public DbSet<KhuyenMaiTheoSanPham> KhuyenMaiTheoSanPhams => Set<KhuyenMaiTheoSanPham>();
    public DbSet<KhuyenMaiTheoHoaDon> KhuyenMaiTheoHoaDons => Set<KhuyenMaiTheoHoaDon>();
    public DbSet<KhuyenMaiTheoVoucher> KhuyenMaiTheoVouchers => Set<KhuyenMaiTheoVoucher>();
    public DbSet<DonHang> DonHangs => Set<DonHang>();
    public DbSet<ChiTietDonHang> ChiTietDonHangs => Set<ChiTietDonHang>();
    public DbSet<HoaDon> HoaDons => Set<HoaDon>();
    public DbSet<LichSuDonHang> LichSuDonHangs => Set<LichSuDonHang>();
    public DbSet<DanhGiaSanPham> DanhGiaSanPhams => Set<DanhGiaSanPham>();

    // 5 View Entities
    public DbSet<SanPhamBanChayView> SanPhamBanChayViews => Set<SanPhamBanChayView>();
    public DbSet<DoanhThuTheoThangView> DoanhThuTheoThangViews => Set<DoanhThuTheoThangView>();
    public DbSet<SanPhamHienThiView> SanPhamHienThiViews => Set<SanPhamHienThiView>();
    public DbSet<DonHangTongHopView> DonHangTongHopViews => Set<DonHangTongHopView>();
    public DbSet<SanPhamSapHetHangView> SanPhamSapHetHangViews => Set<SanPhamSapHetHangView>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        if (_interceptor != null)
        {
            optionsBuilder.AddInterceptors(_interceptor);
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all 20 IEntityTypeConfiguration from current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // View entities configuration (HasNoKey().ToView())
        modelBuilder.Entity<SanPhamBanChayView>(b =>
        {
            b.HasNoKey();
            b.ToView("v_san_pham_ban_chay");
            b.Property(x => x.MaSanPham).HasColumnName("ma_san_pham").HasColumnType("varchar(36)");
            b.Property(x => x.TenSanPham).HasColumnName("ten_san_pham");
            b.Property(x => x.TongSoLuongBan).HasColumnName("tong_so_luong_ban");
            b.Property(x => x.TongDoanhThu).HasColumnName("tong_doanh_thu").HasPrecision(15, 2);
        });

        modelBuilder.Entity<DoanhThuTheoThangView>(b =>
        {
            b.HasNoKey();
            b.ToView("v_doanh_thu_theo_thang");
            b.Property(x => x.Thang).HasColumnName("thang");
            b.Property(x => x.SoDon).HasColumnName("so_don");
            b.Property(x => x.DoanhThu).HasColumnName("doanh_thu").HasPrecision(15, 2);
        });

        modelBuilder.Entity<SanPhamHienThiView>(b =>
        {
            b.HasNoKey();
            b.ToView("v_san_pham_hien_thi");
            b.Property(x => x.MaSanPham).HasColumnName("ma_san_pham").HasColumnType("varchar(36)");
            b.Property(x => x.TenSanPham).HasColumnName("ten_san_pham");
            b.Property(x => x.TenLoaiSanPham).HasColumnName("ten_loai_san_pham");
            b.Property(x => x.DonViTinh).HasColumnName("don_vi_tinh");
            b.Property(x => x.GiaBan).HasColumnName("gia_ban").HasPrecision(15, 2);
            b.Property(x => x.SoLuongTon).HasColumnName("so_luong_ton");
            b.Property(x => x.TrangThai)
                .HasColumnName("trang_thai")
                .HasConversion(new SnakeCaseEnumConverter<TrangThaiSanPham>());
            b.Property(x => x.DiemTrungBinh).HasColumnName("diem_trung_binh").HasPrecision(3, 1);
            b.Property(x => x.SoDanhGia).HasColumnName("so_danh_gia");
        });

        modelBuilder.Entity<DonHangTongHopView>(b =>
        {
            b.HasNoKey();
            b.ToView("v_don_hang_tong_hop");
            b.Property(x => x.MaDonHang).HasColumnName("ma_don_hang").HasColumnType("varchar(36)");
            b.Property(x => x.MaCode).HasColumnName("ma_code");
            b.Property(x => x.TenKhachHang).HasColumnName("ten_khach_hang");
            b.Property(x => x.TenNguoiNhan).HasColumnName("ten_nguoi_nhan");
            b.Property(x => x.TienHang).HasColumnName("tien_hang").HasPrecision(15, 2);
            b.Property(x => x.PhiVanChuyen).HasColumnName("phi_van_chuyen").HasPrecision(15, 2);
            b.Property(x => x.TienGiamGia).HasColumnName("tien_giam_gia").HasPrecision(15, 2);
            b.Property(x => x.TongTienThanhToan).HasColumnName("tong_tien_thanh_toan").HasPrecision(15, 2);
            b.Property(x => x.PhuongThucThanhToan)
                .HasColumnName("phuong_thuc_thanh_toan")
                .HasConversion(new SnakeCaseEnumConverter<PhuongThucThanhToan>());
            b.Property(x => x.TrangThaiThanhToan)
                .HasColumnName("trang_thai_thanh_toan")
                .HasConversion(new SnakeCaseEnumConverter<TrangThaiThanhToan>());
            b.Property(x => x.TrangThaiDonHang)
                .HasColumnName("trang_thai_don_hang")
                .HasConversion(new SnakeCaseEnumConverter<TrangThaiDonHang>());
            b.Property(x => x.NgayTao).HasColumnName("ngay_tao");
        });

        modelBuilder.Entity<SanPhamSapHetHangView>(b =>
        {
            b.HasNoKey();
            b.ToView("v_san_pham_sap_het_hang");
            b.Property(x => x.MaSanPham).HasColumnName("ma_san_pham").HasColumnType("varchar(36)");
            b.Property(x => x.TenSanPham).HasColumnName("ten_san_pham");
            b.Property(x => x.DonViTinh).HasColumnName("don_vi_tinh");
            b.Property(x => x.SoLuongTon).HasColumnName("so_luong_ton");
        });
    }
}
