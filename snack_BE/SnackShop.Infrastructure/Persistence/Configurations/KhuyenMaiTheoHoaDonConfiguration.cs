using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;
using SnackShop.Infrastructure.Persistence.Converters;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class KhuyenMaiTheoHoaDonConfiguration : IEntityTypeConfiguration<KhuyenMaiTheoHoaDon>
{
    public void Configure(EntityTypeBuilder<KhuyenMaiTheoHoaDon> builder)
    {
        builder.ToTable("khuyen_mai_theo_hoa_don");

        builder.HasKey(x => x.MaCtkm);

        builder.Property(x => x.MaCtkm)
            .HasColumnName("ma_ctkm")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.TenKm)
            .HasColumnName("ten_km")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.GiaTriDonToiThieu)
            .HasColumnName("gia_tri_don_toi_thieu")
            .HasPrecision(15, 2);

        builder.Property(x => x.LoaiGiamGia)
            .HasColumnName("loai_giam_gia")
            .HasConversion(new SnakeCaseEnumConverter<LoaiGiamGia>())
            .IsRequired();

        builder.Property(x => x.GiaTriGiam)
            .HasColumnName("gia_tri_giam")
            .HasPrecision(15, 2);

        builder.Property(x => x.GiamToiDa)
            .HasColumnName("giam_toi_da")
            .HasPrecision(15, 2);

        builder.HasOne(x => x.ChuongTrinhKhuyenMai)
            .WithOne(x => x.KhuyenMaiTheoHoaDon)
            .HasForeignKey<KhuyenMaiTheoHoaDon>(x => x.MaCtkm)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
