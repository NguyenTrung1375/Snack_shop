namespace SnackShop.Domain.Entities;

public class HoaDon
{
    public Guid MaHoaDon { get; set; }
    public Guid MaDonHang { get; set; }
    public Guid? MaNhanVien { get; set; }
    public string SoHoaDon { get; set; } = null!;
    public decimal TongTien { get; set; }
    public DateTime NgayXuatHoaDon { get; set; }

    public DonHang DonHang { get; set; } = null!;
    public NhanVien? NhanVien { get; set; }
}
