namespace SnackShop.Domain.Entities;

public class DonNhapHang
{
    public Guid MaDonNhap { get; set; }
    public Guid MaNhaCungCap { get; set; }
    public Guid MaNhanVien { get; set; }
    public decimal TongTien { get; set; }
    public DateTime? NgayNhapKho { get; set; }
    public DateTime NgayTao { get; set; }

    public NhaCungCap NhaCungCap { get; set; } = null!;
    public NhanVien NhanVien { get; set; } = null!;
    public ICollection<ChiTietNhapHang> ChiTietNhapHangs { get; set; } = new List<ChiTietNhapHang>();
}
