using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class ChuongTrinhKhuyenMaiConfiguration : IEntityTypeConfiguration<ChuongTrinhKhuyenMai>
{
    public void Configure(EntityTypeBuilder<ChuongTrinhKhuyenMai> builder)
    {
        builder.ToTable("chuong_trinh_khuyen_mai");

        builder.HasKey(x => x.MaCtkm);

        builder.Property(x => x.MaCtkm)
            .HasColumnName("ma_ctkm")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.TenKm)
            .HasColumnName("ten_km")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.NgayBatDau)
            .HasColumnName("ngay_bat_dau")
            .IsRequired();

        builder.Property(x => x.NgayKetThuc)
            .HasColumnName("ngay_ket_thuc")
            .IsRequired();

        builder.Property(x => x.NgayTao)
            .HasColumnName("ngay_tao")
            .ValueGeneratedOnAdd();

        builder.HasOne(x => x.KhuyenMaiTheoHoaDon)
            .WithOne(x => x.ChuongTrinhKhuyenMai)
            .HasForeignKey<KhuyenMaiTheoHoaDon>(x => x.MaCtkm)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.KhuyenMaiTheoVoucher)
            .WithOne(x => x.ChuongTrinhKhuyenMai)
            .HasForeignKey<KhuyenMaiTheoVoucher>(x => x.MaCtkm)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.KhuyenMaiTheoSanPhams)
            .WithOne(x => x.ChuongTrinhKhuyenMai)
            .HasForeignKey(x => x.MaCtkm)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.DonHangs)
            .WithOne(x => x.ChuongTrinhKhuyenMai)
            .HasForeignKey(x => x.MaCtkm)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
