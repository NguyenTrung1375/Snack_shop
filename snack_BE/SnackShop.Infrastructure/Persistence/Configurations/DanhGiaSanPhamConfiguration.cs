using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class DanhGiaSanPhamConfiguration : IEntityTypeConfiguration<DanhGiaSanPham>
{
    public void Configure(EntityTypeBuilder<DanhGiaSanPham> builder)
    {
        builder.ToTable("danh_gia_san_pham");

        builder.HasKey(x => x.MaDanhGia);

        builder.Property(x => x.MaDanhGia)
            .HasColumnName("ma_danh_gia")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaSanPham)
            .HasColumnName("ma_san_pham")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.MaKhachHang)
            .HasColumnName("ma_khach_hang")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.MaChiTietDonHang)
            .HasColumnName("ma_chi_tiet_don_hang")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.HasIndex(x => x.MaChiTietDonHang)
            .IsUnique()
            .HasDatabaseName("uq_danh_gia_ctdh");

        builder.Property(x => x.SoSao)
            .HasColumnName("so_sao")
            .HasColumnType("tinyint")
            .IsRequired();

        builder.Property(x => x.BinhLuan)
            .HasColumnName("binh_luan")
            .HasColumnType("text");

        builder.Property(x => x.NgayTao)
            .HasColumnName("ngay_tao")
            .ValueGeneratedOnAdd();

        builder.HasIndex(x => x.MaSanPham)
            .HasDatabaseName("idx_danh_gia_sp");

        builder.HasIndex(x => x.MaKhachHang)
            .HasDatabaseName("idx_danh_gia_kh");

        builder.HasOne(x => x.SanPham)
            .WithMany(x => x.DanhGiaSanPhams)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.KhachHang)
            .WithMany(x => x.DanhGiaSanPhams)
            .HasForeignKey(x => x.MaKhachHang)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.ChiTietDonHang)
            .WithOne(x => x.DanhGiaSanPham)
            .HasForeignKey<DanhGiaSanPham>(x => x.MaChiTietDonHang)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
