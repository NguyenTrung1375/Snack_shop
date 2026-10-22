using SnackShop.Domain.Enums;

namespace SnackShop.Domain.Entities;

public class SanPhamHienThiView
{
    public Guid MaSanPham { get; set; }
    public string TenSanPham { get; set; } = null!;
    public string TenLoaiSanPham { get; set; } = null!;
    public string DonViTinh { get; set; } = null!;
    public decimal GiaBan { get; set; }
    public int SoLuongTon { get; set; }
    public TrangThaiSanPham TrangThai { get; set; }
    public decimal? DiemTrungBinh { get; set; }
    public long SoDanhGia { get; set; }
}
