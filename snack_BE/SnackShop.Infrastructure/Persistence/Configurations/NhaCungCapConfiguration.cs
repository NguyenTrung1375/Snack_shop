using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class NhaCungCapConfiguration : IEntityTypeConfiguration<NhaCungCap>
{
    public void Configure(EntityTypeBuilder<NhaCungCap> builder)
    {
        builder.ToTable("nha_cung_cap");

        builder.HasKey(x => x.MaNhaCungCap);

        builder.Property(x => x.MaNhaCungCap)
            .HasColumnName("ma_nha_cung_cap")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.TenNhaCungCap)
            .HasColumnName("ten_nha_cung_cap")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.SoDienThoai)
            .HasColumnName("so_dien_thoai")
            .HasMaxLength(15);

        builder.Property(x => x.Email)
            .HasColumnName("email")
            .HasMaxLength(150);

        builder.Property(x => x.DiaChi)
            .HasColumnName("dia_chi")
            .HasMaxLength(255);

        builder.HasMany(x => x.DonNhapHangs)
            .WithOne(x => x.NhaCungCap)
            .HasForeignKey(x => x.MaNhaCungCap)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
