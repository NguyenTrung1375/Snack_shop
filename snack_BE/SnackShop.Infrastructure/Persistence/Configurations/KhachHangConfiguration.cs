using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class KhachHangConfiguration : IEntityTypeConfiguration<KhachHang>
{
    public void Configure(EntityTypeBuilder<KhachHang> builder)
    {
        builder.ToTable("khach_hang");

        builder.HasKey(x => x.MaNguoiDung);

        builder.Property(x => x.MaNguoiDung)
            .HasColumnName("ma_nguoi_dung")
            .HasColumnType("varchar(36)");

        builder.HasOne(x => x.NguoiDung)
            .WithOne(x => x.KhachHang)
            .HasForeignKey<KhachHang>(x => x.MaNguoiDung)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.ChiTietGioHangs)
            .WithOne(x => x.KhachHang)
            .HasForeignKey(x => x.MaKhachHang)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.DonHangs)
            .WithOne(x => x.KhachHang)
            .HasForeignKey(x => x.MaKhachHang)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.DanhGiaSanPhams)
            .WithOne(x => x.KhachHang)
            .HasForeignKey(x => x.MaKhachHang)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
