namespace SnackShop.Application.DTOs.GioHang;

public class ChiTietGioHangDto
{
    public Guid MaGioHang { get; set; }
    public Guid MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string? HinhAnhDaiDien { get; set; }
    public decimal GiaBan { get; set; }
    public int SoLuong { get; set; }
    public decimal ThanhTien { get; set; }
}
