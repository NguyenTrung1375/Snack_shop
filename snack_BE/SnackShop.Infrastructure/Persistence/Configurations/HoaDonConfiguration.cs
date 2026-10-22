using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class HoaDonConfiguration : IEntityTypeConfiguration<HoaDon>
{
    public void Configure(EntityTypeBuilder<HoaDon> builder)
    {
        builder.ToTable("hoa_don");

        builder.HasKey(x => x.MaHoaDon);

        builder.Property(x => x.MaHoaDon)
            .HasColumnName("ma_hoa_don")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaDonHang)
            .HasColumnName("ma_don_hang")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.HasIndex(x => x.MaDonHang)
            .IsUnique()
            .HasDatabaseName("uq_hoa_don_don_hang");

        builder.Property(x => x.MaNhanVien)
            .HasColumnName("ma_nhan_vien")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.SoHoaDon)
            .HasColumnName("so_hoa_don")
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(x => x.SoHoaDon)
            .IsUnique()
            .HasDatabaseName("uq_hoa_don_so");

        // tong_tien is calculated by trigger trg_hoa_don_bi, ignore after save
        builder.Property(x => x.TongTien)
            .HasColumnName("tong_tien")
            .HasPrecision(15, 2);
        builder.Property(x => x.TongTien)
            .Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);

        builder.Property(x => x.NgayXuatHoaDon)
            .HasColumnName("ngay_xuat_hoa_don")
            .ValueGeneratedOnAdd();

        builder.HasIndex(x => x.MaNhanVien)
            .HasDatabaseName("idx_hoa_don_nv");

        builder.HasOne(x => x.DonHang)
            .WithOne(x => x.HoaDon)
            .HasForeignKey<HoaDon>(x => x.MaDonHang)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.NhanVien)
            .WithMany(x => x.HoaDons)
            .HasForeignKey(x => x.MaNhanVien)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
