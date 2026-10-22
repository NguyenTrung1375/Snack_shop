namespace SnackShop.Domain.Entities;

public class DanhGiaSanPham
{
    public Guid MaDanhGia { get; set; }
    public Guid MaSanPham { get; set; }
    public Guid MaKhachHang { get; set; }
    public Guid MaChiTietDonHang { get; set; }
    public int SoSao { get; set; }
    public string? BinhLuan { get; set; }
    public DateTime NgayTao { get; set; }

    public SanPham SanPham { get; set; } = null!;
    public KhachHang KhachHang { get; set; } = null!;
    public ChiTietDonHang ChiTietDonHang { get; set; } = null!;
}
