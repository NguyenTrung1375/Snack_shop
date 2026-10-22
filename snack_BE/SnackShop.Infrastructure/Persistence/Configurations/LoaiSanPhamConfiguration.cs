using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;
using SnackShop.Infrastructure.Persistence.Converters;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class LoaiSanPhamConfiguration : IEntityTypeConfiguration<LoaiSanPham>
{
    public void Configure(EntityTypeBuilder<LoaiSanPham> builder)
    {
        builder.ToTable("loai_san_pham");

        builder.HasKey(x => x.MaLoaiSanPham);

        builder.Property(x => x.MaLoaiSanPham)
            .HasColumnName("ma_loai_san_pham")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaLoaiCha)
            .HasColumnName("ma_loai_cha")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.TenLoaiSanPham)
            .HasColumnName("ten_loai_san_pham")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.MoTa)
            .HasColumnName("mo_ta")
            .HasMaxLength(255);

        builder.Property(x => x.TrangThai)
            .HasColumnName("trang_thai")
            .HasConversion(new SnakeCaseEnumConverter<TrangThaiNguoiDung>())
            .IsRequired();

        builder.HasIndex(x => x.MaLoaiCha)
            .HasDatabaseName("idx_loai_cha");

        builder.HasOne(x => x.LoaiCha)
            .WithMany(x => x.LoaiCons)
            .HasForeignKey(x => x.MaLoaiCha)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.SanPhams)
            .WithOne(x => x.LoaiSanPham)
            .HasForeignKey(x => x.MaLoaiSanPham)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
