using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class HinhAnhSanPhamConfiguration : IEntityTypeConfiguration<HinhAnhSanPham>
{
    public void Configure(EntityTypeBuilder<HinhAnhSanPham> builder)
    {
        builder.ToTable("hinh_anh_san_pham");

        builder.HasKey(x => x.MaHinhAnh);

        builder.Property(x => x.MaHinhAnh)
            .HasColumnName("ma_hinh_anh")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaSanPham)
            .HasColumnName("ma_san_pham")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.DuongDanAnh)
            .HasColumnName("duong_dan_anh")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.LaAnhChinh)
            .HasColumnName("la_anh_chinh");

        builder.Property(x => x.ThuTuHienThi)
            .HasColumnName("thu_tu_hien_thi");

        builder.HasIndex(x => x.MaSanPham)
            .HasDatabaseName("idx_hinh_anh_san_pham");

        builder.HasOne(x => x.SanPham)
            .WithMany(x => x.HinhAnhSanPhams)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
