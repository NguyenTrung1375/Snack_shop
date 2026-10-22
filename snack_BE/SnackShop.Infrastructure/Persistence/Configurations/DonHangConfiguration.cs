using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;
using SnackShop.Infrastructure.Persistence.Converters;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class DonHangConfiguration : IEntityTypeConfiguration<DonHang>
{
    public void Configure(EntityTypeBuilder<DonHang> builder)
    {
        builder.ToTable("don_hang");

        builder.HasKey(x => x.MaDonHang);

        builder.Property(x => x.MaDonHang)
            .HasColumnName("ma_don_hang")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaCode)
            .HasColumnName("ma_code")
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(x => x.MaCode)
            .IsUnique()
            .HasDatabaseName("uq_don_hang_code");

        builder.Property(x => x.MaKhachHang)
            .HasColumnName("ma_khach_hang")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.MaCtkm)
            .HasColumnName("ma_ctkm")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.TenNguoiNhan)
            .HasColumnName("ten_nguoi_nhan")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.SdtNguoiNhan)
            .HasColumnName("sdt_nguoi_nhan")
            .HasMaxLength(15)
            .IsRequired();

        builder.Property(x => x.DiaChiGiaoHang)
            .HasColumnName("dia_chi_giao_hang")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.GhiChu)
            .HasColumnName("ghi_chu")
            .HasMaxLength(255);

        builder.Property(x => x.PhiVanChuyen)
            .HasColumnName("phi_van_chuyen")
            .HasPrecision(15, 2);

        // tien_hang is calculated by triggers, ignore after save
        builder.Property(x => x.TienHang)
            .HasColumnName("tien_hang")
            .HasPrecision(15, 2);
        builder.Property(x => x.TienHang)
            .Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);

        builder.Property(x => x.TienGiamGia)
            .HasColumnName("tien_giam_gia")
            .HasPrecision(15, 2);

        // tong_tien_thanh_toan is a generated column (STORED), ignore before and after save
        builder.Property(x => x.TongTienThanhToan)
            .HasColumnName("tong_tien_thanh_toan")
            .HasPrecision(15, 2)
            .ValueGeneratedOnAddOrUpdate();
        builder.Property(x => x.TongTienThanhToan)
            .Metadata.SetBeforeSaveBehavior(PropertySaveBehavior.Ignore);
        builder.Property(x => x.TongTienThanhToan)
            .Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);

        builder.Property(x => x.PhuongThucThanhToan)
            .HasColumnName("phuong_thuc_thanh_toan")
            .HasConversion(new SnakeCaseEnumConverter<PhuongThucThanhToan>())
            .IsRequired();

        builder.Property(x => x.TrangThaiThanhToan)
            .HasColumnName("trang_thai_thanh_toan")
            .HasConversion(new SnakeCaseEnumConverter<TrangThaiThanhToan>())
            .IsRequired();

        builder.Property(x => x.TrangThaiDonHang)
            .HasColumnName("trang_thai_don_hang")
            .HasConversion(new SnakeCaseEnumConverter<TrangThaiDonHang>())
            .IsRequired();

        builder.Property(x => x.NgayTao)
            .HasColumnName("ngay_tao")
            .ValueGeneratedOnAdd();

        builder.HasIndex(x => x.MaKhachHang)
            .HasDatabaseName("idx_don_hang_khach");

        builder.HasIndex(x => x.MaCtkm)
            .HasDatabaseName("idx_don_hang_ctkm");

        builder.HasIndex(x => x.TrangThaiDonHang)
            .HasDatabaseName("idx_don_hang_trang_thai");

        builder.HasIndex(x => x.NgayTao)
            .HasDatabaseName("idx_don_hang_ngay_tao");

        builder.HasOne(x => x.KhachHang)
            .WithMany(x => x.DonHangs)
            .HasForeignKey(x => x.MaKhachHang)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ChuongTrinhKhuyenMai)
            .WithMany(x => x.DonHangs)
            .HasForeignKey(x => x.MaCtkm)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.ChiTietDonHangs)
            .WithOne(x => x.DonHang)
            .HasForeignKey(x => x.MaDonHang)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.LichSuDonHangs)
            .WithOne(x => x.DonHang)
            .HasForeignKey(x => x.MaDonHang)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.HoaDon)
            .WithOne(x => x.DonHang)
            .HasForeignKey<HoaDon>(x => x.MaDonHang)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
