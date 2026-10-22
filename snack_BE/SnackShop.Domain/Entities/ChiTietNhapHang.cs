namespace SnackShop.Domain.Entities;

public class ChiTietNhapHang
{
    public Guid MaDonNhap { get; set; }
    public Guid MaSanPham { get; set; }
    public int SoLuong { get; set; }
    public decimal GiaNhap { get; set; }
    public decimal ThanhTien { get; set; }

    public DonNhapHang DonNhapHang { get; set; } = null!;
    public SanPham SanPham { get; set; } = null!;
}
