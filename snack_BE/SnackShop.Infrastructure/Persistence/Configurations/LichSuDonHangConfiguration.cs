using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;
using SnackShop.Infrastructure.Persistence.Converters;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class LichSuDonHangConfiguration : IEntityTypeConfiguration<LichSuDonHang>
{
    public void Configure(EntityTypeBuilder<LichSuDonHang> builder)
    {
        builder.ToTable("lich_su_don_hang");

        builder.HasKey(x => x.MaLichSu);

        builder.Property(x => x.MaLichSu)
            .HasColumnName("ma_lich_su")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaDonHang)
            .HasColumnName("ma_don_hang")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.NguoiThucHien)
            .HasColumnName("nguoi_thuc_hien")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.TrangThai)
            .HasColumnName("trang_thai")
            .HasConversion(new SnakeCaseEnumConverter<TrangThaiDonHang>())
            .IsRequired();

        builder.Property(x => x.GhiChu)
            .HasColumnName("ghi_chu")
            .HasMaxLength(255);

        builder.Property(x => x.NgayTao)
            .HasColumnName("ngay_tao")
            .ValueGeneratedOnAdd();

        builder.HasIndex(x => x.MaDonHang)
            .HasDatabaseName("idx_lich_su_don_hang");

        builder.HasIndex(x => x.NguoiThucHien)
            .HasDatabaseName("idx_lich_su_nguoi");

        builder.HasOne(x => x.DonHang)
            .WithMany(x => x.LichSuDonHangs)
            .HasForeignKey(x => x.MaDonHang)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.NguoiDung)
            .WithMany(x => x.LichSuDonHangs)
            .HasForeignKey(x => x.NguoiThucHien)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
