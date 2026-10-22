namespace SnackShop.Application.DTOs.SanPham;

public class SanPhamDto
{
    public Guid MaSanPham { get; set; }
    public Guid MaLoaiSanPham { get; set; }
    public string? TenLoaiSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string DonViTinh { get; set; } = "gói";
    public decimal GiaBan { get; set; }
    public decimal? GiaSauGiam { get; set; }
    public int? PhanTramGiam { get; set; }
    public int SoLuongTon { get; set; }
    public string? HinhAnhDaiDien { get; set; }
    public Guid? MaSanPhamCha { get; set; }
    public string? KhoiLuong { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public double DiemTrungBinh { get; set; }
    public int SoDanhGia { get; set; }
    public int DaBan { get; set; }
    public bool LaBanChay { get; set; }
}
