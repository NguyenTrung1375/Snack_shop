using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;
using SnackShop.Infrastructure.Persistence.Converters;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class KhuyenMaiTheoSanPhamConfiguration : IEntityTypeConfiguration<KhuyenMaiTheoSanPham>
{
    public void Configure(EntityTypeBuilder<KhuyenMaiTheoSanPham> builder)
    {
        builder.ToTable("khuyen_mai_theo_san_pham");

        builder.HasKey(x => new { x.MaCtkm, x.MaSanPham });

        builder.Property(x => x.MaCtkm)
            .HasColumnName("ma_ctkm")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaSanPham)
            .HasColumnName("ma_san_pham")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.TenKm)
            .HasColumnName("ten_km")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.LoaiGiamGia)
            .HasColumnName("loai_giam_gia")
            .HasConversion(new SnakeCaseEnumConverter<LoaiGiamGia>())
            .IsRequired();

        builder.Property(x => x.GiaTriGiam)
            .HasColumnName("gia_tri_giam")
            .HasPrecision(15, 2);

        builder.HasIndex(x => x.MaSanPham)
            .HasDatabaseName("idx_kmsp_san_pham");

        builder.HasOne(x => x.ChuongTrinhKhuyenMai)
            .WithMany(x => x.KhuyenMaiTheoSanPhams)
            .HasForeignKey(x => x.MaCtkm)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SanPham)
            .WithMany(x => x.KhuyenMaiTheoSanPhams)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
