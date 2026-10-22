using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class DonNhapHangConfiguration : IEntityTypeConfiguration<DonNhapHang>
{
    public void Configure(EntityTypeBuilder<DonNhapHang> builder)
    {
        builder.ToTable("don_nhap_hang");

        builder.HasKey(x => x.MaDonNhap);

        builder.Property(x => x.MaDonNhap)
            .HasColumnName("ma_don_nhap")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaNhaCungCap)
            .HasColumnName("ma_nha_cung_cap")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.MaNhanVien)
            .HasColumnName("ma_nhan_vien")
            .HasColumnType("varchar(36)")
            .IsRequired();

        // tong_tien is calculated by trigger trg_ctnh_ai/au/ad, ignore after save
        builder.Property(x => x.TongTien)
            .HasColumnName("tong_tien")
            .HasPrecision(15, 2);
        builder.Property(x => x.TongTien)
            .Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);

        builder.Property(x => x.NgayNhapKho)
            .HasColumnName("ngay_nhap_kho");

        builder.Property(x => x.NgayTao)
            .HasColumnName("ngay_tao")
            .ValueGeneratedOnAdd();

        builder.HasIndex(x => x.MaNhaCungCap)
            .HasDatabaseName("idx_don_nhap_ncc");

        builder.HasIndex(x => x.MaNhanVien)
            .HasDatabaseName("idx_don_nhap_nv");

        builder.HasOne(x => x.NhaCungCap)
            .WithMany(x => x.DonNhapHangs)
            .HasForeignKey(x => x.MaNhaCungCap)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.NhanVien)
            .WithMany(x => x.DonNhapHangs)
            .HasForeignKey(x => x.MaNhanVien)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.ChiTietNhapHangs)
            .WithOne(x => x.DonNhapHang)
            .HasForeignKey(x => x.MaDonNhap)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
