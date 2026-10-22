using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class ChiTietNhapHangConfiguration : IEntityTypeConfiguration<ChiTietNhapHang>
{
    public void Configure(EntityTypeBuilder<ChiTietNhapHang> builder)
    {
        builder.ToTable("chi_tiet_nhap_hang");

        builder.HasKey(x => new { x.MaDonNhap, x.MaSanPham });

        builder.Property(x => x.MaDonNhap)
            .HasColumnName("ma_don_nhap")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaSanPham)
            .HasColumnName("ma_san_pham")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.SoLuong)
            .HasColumnName("so_luong");

        builder.Property(x => x.GiaNhap)
            .HasColumnName("gia_nhap")
            .HasPrecision(15, 2);

        // thanh_tien is a generated column (STORED), ignore before and after save
        builder.Property(x => x.ThanhTien)
            .HasColumnName("thanh_tien")
            .HasPrecision(15, 2)
            .ValueGeneratedOnAddOrUpdate();
        builder.Property(x => x.ThanhTien)
            .Metadata.SetBeforeSaveBehavior(PropertySaveBehavior.Ignore);
        builder.Property(x => x.ThanhTien)
            .Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);

        builder.HasIndex(x => x.MaSanPham)
            .HasDatabaseName("idx_ctnh_san_pham");

        builder.HasOne(x => x.DonNhapHang)
            .WithMany(x => x.ChiTietNhapHangs)
            .HasForeignKey(x => x.MaDonNhap)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SanPham)
            .WithMany(x => x.ChiTietNhapHangs)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
