using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class ThongBaoConfiguration : IEntityTypeConfiguration<ThongBao>
{
    public void Configure(EntityTypeBuilder<ThongBao> builder)
    {
        builder.ToTable("thong_bao");

        builder.HasKey(x => x.MaThongBao);

        builder.Property(x => x.MaThongBao)
            .HasColumnName("ma_thong_bao")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaNguoiDung)
            .HasColumnName("ma_nguoi_dung")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.TieuDe)
            .HasColumnName("tieu_de")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.NoiDung)
            .HasColumnName("noi_dung")
            .HasColumnType("text");

        builder.Property(x => x.DaDoc)
            .HasColumnName("da_doc");

        builder.Property(x => x.NgayTao)
            .HasColumnName("ngay_tao")
            .ValueGeneratedOnAdd();

        builder.HasIndex(x => new { x.MaNguoiDung, x.DaDoc })
            .HasDatabaseName("idx_thong_bao_nguoi_dung");

        builder.HasOne(x => x.NguoiDung)
            .WithMany(x => x.ThongBaos)
            .HasForeignKey(x => x.MaNguoiDung)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
