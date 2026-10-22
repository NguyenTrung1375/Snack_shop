namespace SnackShop.Application.DTOs.KhoHang;

public class ChiTietNhapHangDto
{
    public Guid MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public int SoLuong { get; set; }
    public decimal GiaNhap { get; set; }
    public decimal ThanhTien { get; set; }
}
