namespace SnackShop.Domain.Entities;

public class ChiTietGioHang
{
    public Guid MaGioHang { get; set; }
    public Guid MaKhachHang { get; set; }
    public Guid MaSanPham { get; set; }
    public int SoLuong { get; set; } = 1;
    public DateTime NgayTao { get; set; }

    public KhachHang KhachHang { get; set; } = null!;
    public SanPham SanPham { get; set; } = null!;
}
