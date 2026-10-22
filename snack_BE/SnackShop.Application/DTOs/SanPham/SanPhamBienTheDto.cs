namespace SnackShop.Application.DTOs.SanPham;

public class SanPhamBienTheDto
{
    public Guid MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string? KhoiLuong { get; set; }
    public decimal GiaBan { get; set; }
    public decimal? GiaSauGiam { get; set; }
    public int? PhanTramGiam { get; set; }
    public int SoLuongTon { get; set; }
    public string DonViTinh { get; set; } = "gói";
    public string? HinhAnhDaiDien { get; set; }
    public string TrangThai { get; set; } = string.Empty;
}

