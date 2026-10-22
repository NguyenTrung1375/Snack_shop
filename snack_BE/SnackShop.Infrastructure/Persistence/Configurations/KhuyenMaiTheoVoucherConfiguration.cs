using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;
using SnackShop.Infrastructure.Persistence.Converters;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class KhuyenMaiTheoVoucherConfiguration : IEntityTypeConfiguration<KhuyenMaiTheoVoucher>
{
    public void Configure(EntityTypeBuilder<KhuyenMaiTheoVoucher> builder)
    {
        builder.ToTable("khuyen_mai_theo_voucher");

        builder.HasKey(x => x.MaCtkm);

        builder.Property(x => x.MaCtkm)
            .HasColumnName("ma_ctkm")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.TenKm)
            .HasColumnName("ten_km")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.MaCode)
            .HasColumnName("ma_code")
            .HasMaxLength(30)
            .IsRequired();

        builder.HasIndex(x => x.MaCode)
            .IsUnique()
            .HasDatabaseName("uq_voucher_code");

        builder.Property(x => x.LoaiGiamGia)
            .HasColumnName("loai_giam_gia")
            .HasConversion(new SnakeCaseEnumConverter<LoaiGiamGia>())
            .IsRequired();

        builder.Property(x => x.GiaTriGiam)
            .HasColumnName("gia_tri_giam")
            .HasPrecision(15, 2);

        builder.Property(x => x.GiaTriDonToiThieu)
            .HasColumnName("gia_tri_don_toi_thieu")
            .HasPrecision(15, 2);

        builder.Property(x => x.GiamToiDa)
            .HasColumnName("giam_toi_da")
            .HasPrecision(15, 2);

        builder.Property(x => x.GioiHanSuDung)
            .HasColumnName("gioi_han_su_dung");

        // so_luot_da_dung is updated by triggers, ignore after save
        builder.Property(x => x.SoLuotDaDung)
            .HasColumnName("so_luot_da_dung");
        builder.Property(x => x.SoLuotDaDung)
            .Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);

        builder.Property(x => x.GioiHanMoiKhach)
            .HasColumnName("gioi_han_moi_khach");

        builder.HasOne(x => x.ChuongTrinhKhuyenMai)
            .WithOne(x => x.KhuyenMaiTheoVoucher)
            .HasForeignKey<KhuyenMaiTheoVoucher>(x => x.MaCtkm)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
