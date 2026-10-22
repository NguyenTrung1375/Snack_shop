using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;
using SnackShop.Infrastructure.Persistence.Converters;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class NguoiDungConfiguration : IEntityTypeConfiguration<NguoiDung>
{
    public void Configure(EntityTypeBuilder<NguoiDung> builder)
    {
        builder.ToTable("nguoi_dung");

        builder.HasKey(x => x.MaNguoiDung);

        builder.Property(x => x.MaNguoiDung)
            .HasColumnName("ma_nguoi_dung")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.HoLot)
            .HasColumnName("ho_lot")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Ten)
            .HasColumnName("ten")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Email)
            .HasColumnName("email")
            .HasMaxLength(150)
            .IsRequired();

        builder.HasIndex(x => x.Email)
            .IsUnique()
            .HasDatabaseName("uq_nguoi_dung_email");

        builder.Property(x => x.SoDienThoai)
            .HasColumnName("so_dien_thoai")
            .HasMaxLength(15);

        builder.Property(x => x.MatKhau)
            .HasColumnName("mat_khau")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.DiaChi)
            .HasColumnName("dia_chi")
            .HasMaxLength(255);

        builder.Property(x => x.VaiTro)
            .HasColumnName("vai_tro")
            .HasConversion(new SnakeCaseEnumConverter<VaiTro>())
            .IsRequired();

        builder.Property(x => x.TrangThai)
            .HasColumnName("trang_thai")
            .HasConversion(new SnakeCaseEnumConverter<TrangThaiNguoiDung>())
            .IsRequired();

        builder.Property(x => x.NgayTao)
            .HasColumnName("ngay_tao")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.NgayCapNhat)
            .HasColumnName("ngay_cap_nhat")
            .ValueGeneratedOnAddOrUpdate();

        // 1-1 relationships with NhanVien and KhachHang sharing PK
        builder.HasOne(x => x.NhanVien)
            .WithOne(x => x.NguoiDung)
            .HasForeignKey<NhanVien>(x => x.MaNguoiDung)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.KhachHang)
            .WithOne(x => x.NguoiDung)
            .HasForeignKey<KhachHang>(x => x.MaNguoiDung)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.ThongBaos)
            .WithOne(x => x.NguoiDung)
            .HasForeignKey(x => x.MaNguoiDung)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.LichSuDonHangs)
            .WithOne(x => x.NguoiDung)
            .HasForeignKey(x => x.NguoiThucHien)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
