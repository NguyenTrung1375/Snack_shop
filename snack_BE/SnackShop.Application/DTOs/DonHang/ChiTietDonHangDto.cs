namespace SnackShop.Application.DTOs.DonHang;

public class ChiTietDonHangDto
{
    public Guid MaChiTietDonHang { get; set; }
    public Guid MaDonHang { get; set; }
    public Guid MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string? HinhAnhDaiDien { get; set; }
    public int SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien { get; set; }
    public bool DaDanhGia { get; set; }
}
