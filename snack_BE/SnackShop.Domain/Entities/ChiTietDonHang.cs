namespace SnackShop.Domain.Entities;

public class ChiTietDonHang
{
    public Guid MaChiTietDonHang { get; set; }
    public Guid MaDonHang { get; set; }
    public Guid MaSanPham { get; set; }
    public int SoLuong { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien { get; set; }

    public DonHang DonHang { get; set; } = null!;
    public SanPham SanPham { get; set; } = null!;
    public DanhGiaSanPham? DanhGiaSanPham { get; set; }
}
