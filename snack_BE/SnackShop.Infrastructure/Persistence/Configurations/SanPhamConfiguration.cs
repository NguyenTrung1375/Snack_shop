using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SnackShop.Domain.Entities;
using SnackShop.Domain.Enums;
using SnackShop.Infrastructure.Persistence.Converters;

namespace SnackShop.Infrastructure.Persistence.Configurations;

public class SanPhamConfiguration : IEntityTypeConfiguration<SanPham>
{
    public void Configure(EntityTypeBuilder<SanPham> builder)
    {
        builder.ToTable("san_pham");

        builder.HasKey(x => x.MaSanPham);

        builder.Property(x => x.MaSanPham)
            .HasColumnName("ma_san_pham")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.MaLoaiSanPham)
            .HasColumnName("ma_loai_san_pham")
            .HasColumnType("varchar(36)")
            .IsRequired();

        builder.Property(x => x.TenSanPham)
            .HasColumnName("ten_san_pham")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.MoTa)
            .HasColumnName("mo_ta")
            .HasColumnType("text");

        builder.Property(x => x.DonViTinh)
            .HasColumnName("don_vi_tinh")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.GiaBan)
            .HasColumnName("gia_ban")
            .HasPrecision(15, 2);

        // so_luong_ton is updated by triggers, ignore after save
        builder.Property(x => x.SoLuongTon)
            .HasColumnName("so_luong_ton");
        builder.Property(x => x.SoLuongTon)
            .Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);

        builder.Property(x => x.MaSanPhamCha)
            .HasColumnName("ma_san_pham_cha")
            .HasColumnType("varchar(36)");

        builder.Property(x => x.KhoiLuong)
            .HasColumnName("khoi_luong")
            .HasMaxLength(50);

        builder.Property(x => x.HinhAnhDaiDien)
            .HasColumnName("hinh_anh_dai_dien")
            .HasMaxLength(255);

        builder.Property(x => x.TrangThai)
            .HasColumnName("trang_thai")
            .HasConversion(new SnakeCaseEnumConverter<TrangThaiSanPham>())
            .IsRequired();

        builder.HasIndex(x => x.MaLoaiSanPham)
            .HasDatabaseName("idx_san_pham_loai");

        builder.HasIndex(x => x.MaSanPhamCha)
            .HasDatabaseName("idx_san_pham_cha");

        builder.HasOne(x => x.SanPhamCha)
            .WithMany(x => x.BienThes)
            .HasForeignKey(x => x.MaSanPhamCha)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.TenSanPham)
            .HasDatabaseName("idx_san_pham_ten");

        builder.HasOne(x => x.LoaiSanPham)
            .WithMany(x => x.SanPhams)
            .HasForeignKey(x => x.MaLoaiSanPham)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.HinhAnhSanPhams)
            .WithOne(x => x.SanPham)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.ChiTietNhapHangs)
            .WithOne(x => x.SanPham)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.ChiTietGioHangs)
            .WithOne(x => x.SanPham)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.KhuyenMaiTheoSanPhams)
            .WithOne(x => x.SanPham)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.ChiTietDonHangs)
            .WithOne(x => x.SanPham)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.DanhGiaSanPhams)
            .WithOne(x => x.SanPham)
            .HasForeignKey(x => x.MaSanPham)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
