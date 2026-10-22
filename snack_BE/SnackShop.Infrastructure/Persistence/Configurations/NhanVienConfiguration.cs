using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class NhanVienConfiguration : IEntityTypeConfiguration<NhanVien>
{
    public void Configure(EntityTypeBuilder<NhanVien> builder)
    {
        builder.ToTable("nhan_vien");

        builder.HasKey(x => x.MaNguoiDung);

        builder.Property(x => x.MaNguoiDung)
            .HasColumnName("ma_nguoi_dung")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MucLuong)
            .HasColumnName("muc_luong")
            .HasPrecision(15, 2);

        builder.Property(x => x.NgayVaoLam)
            .HasColumnName("ngay_vao_lam");

        builder.HasOne(x => x.NguoiDung)
            .WithOne(x => x.NhanVien)
            .HasForeignKey<NhanVien>(x => x.MaNguoiDung)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.DonNhapHangs)
            .WithOne(x => x.NhanVien)
            .HasForeignKey(x => x.MaNhanVien)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.HoaDons)
            .WithOne(x => x.NhanVien)
            .HasForeignKey(x => x.MaNhanVien)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
