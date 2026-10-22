using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class ChiTietGioHangConfiguration : IEntityTypeConfiguration<ChiTietGioHang>
{
    public void Configure(EntityTypeBuilder<ChiTietGioHang> builder)
    {
        builder.ToTable("chi_tiet_gio_hang");

        builder.HasKey(x => x.MaGioHang);

        builder.Property(x => x.MaGioHang)
            .HasColumnName("ma_gio_hang")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaKhachHang)
            .HasColumnName("ma_khach_hang")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.MaSanPham)
            .HasColumnName("ma_san_pham")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.SoLuong)
            .HasColumnName("so_luong");

        builder.Property(x => x.NgayTao)
            .HasColumnName("ngay_tao")
            .ValueGeneratedOnAdd();

        builder.HasIndex(x => new { x.MaKhachHang, x.MaSanPham })
            .IsUnique()
            .HasDatabaseName("uq_gio_hang_kh_sp");

        builder.HasIndex(x => x.MaSanPham)
            .HasDatabaseName("idx_gio_hang_sp");

        builder.HasOne(x => x.KhachHang)
            .WithMany(x => x.ChiTietGioHangs)
            .HasForeignKey(x => x.MaKhachHang)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SanPham)
            .WithMany(x => x.ChiTietGioHangs)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
