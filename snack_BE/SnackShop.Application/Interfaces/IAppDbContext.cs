using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using SnackShop.Domain.Entities;

namespace SnackShop.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<NguoiDung> NguoiDungs { get; }
    DbSet<NhanVien> NhanViens { get; }
    DbSet<KhachHang> KhachHangs { get; }
    DbSet<ThongBao> ThongBaos { get; }
    DbSet<NhaCungCap> NhaCungCaps { get; }
    DbSet<LoaiSanPham> LoaiSanPhams { get; }
    DbSet<SanPham> SanPhams { get; }
    DbSet<HinhAnhSanPham> HinhAnhSanPhams { get; }
    DbSet<DonNhapHang> DonNhapHangs { get; }
    DbSet<ChiTietNhapHang> ChiTietNhapHangs { get; }
    DbSet<ChiTietGioHang> ChiTietGioHangs { get; }
    DbSet<ChuongTrinhKhuyenMai> ChuongTrinhKhuyenMais { get; }
    DbSet<KhuyenMaiTheoSanPham> KhuyenMaiTheoSanPhams { get; }
    DbSet<KhuyenMaiTheoHoaDon> KhuyenMaiTheoHoaDons { get; }
    DbSet<KhuyenMaiTheoVoucher> KhuyenMaiTheoVouchers { get; }
    DbSet<DonHang> DonHangs { get; }
    DbSet<ChiTietDonHang> ChiTietDonHangs { get; }
    DbSet<HoaDon> HoaDons { get; }
    DbSet<LichSuDonHang> LichSuDonHangs { get; }
    DbSet<DanhGiaSanPham> DanhGiaSanPhams { get; }

    // Views
    DbSet<SanPhamBanChayView> SanPhamBanChayViews { get; }
    DbSet<DoanhThuTheoThangView> DoanhThuTheoThangViews { get; }
    DbSet<SanPhamHienThiView> SanPhamHienThiViews { get; }
    DbSet<DonHangTongHopView> DonHangTongHopViews { get; }
    DbSet<SanPhamSapHetHangView> SanPhamSapHetHangViews { get; }

    DatabaseFacade Database { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
