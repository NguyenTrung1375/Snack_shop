namespace SnackShop.Application.DTOs.DonHang;

public class ChiTietTinhTamDto
{
    public Guid MaSanPham { get; set; }
    public string TenSanPham { get; set; } = null!;
    public string? HinhAnhDaiDien { get; set; }
    public int SoLuong { get; set; }
    public decimal DonGiaGoc { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien { get; set; }
    public decimal TienGiam { get; set; }
}
