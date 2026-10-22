using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class ChiTietDonHangConfiguration : IEntityTypeConfiguration<ChiTietDonHang>
{
    public void Configure(EntityTypeBuilder<ChiTietDonHang> builder)
    {
        builder.ToTable("chi_tiet_don_hang");

        builder.HasKey(x => x.MaChiTietDonHang);

        builder.Property(x => x.MaChiTietDonHang)
            .HasColumnName("ma_chi_tiet_don_hang")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaDonHang)
            .HasColumnName("ma_don_hang")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.MaSanPham)
            .HasColumnName("ma_san_pham")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.SoLuong)
            .HasColumnName("so_luong");

        builder.Property(x => x.DonGia)
            .HasColumnName("don_gia")
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

        builder.HasIndex(x => new { x.MaDonHang, x.MaSanPham })
            .IsUnique()
            .HasDatabaseName("uq_ctdh_don_sp");

        builder.HasIndex(x => x.MaSanPham)
            .HasDatabaseName("idx_ctdh_san_pham");

        builder.HasOne(x => x.DonHang)
            .WithMany(x => x.ChiTietDonHangs)
            .HasForeignKey(x => x.MaDonHang)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SanPham)
            .WithMany(x => x.ChiTietDonHangs)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.DanhGiaSanPham)
            .WithOne(x => x.ChiTietDonHang)
            .HasForeignKey<DanhGiaSanPham>(x => x.MaChiTietDonHang)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
