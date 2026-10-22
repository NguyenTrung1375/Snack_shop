namespace SnackShop.Domain.Entities;

public class NhanVien
{
    public Guid MaNguoiDung { get; set; }
    public decimal MucLuong { get; set; }
    public DateOnly? NgayVaoLam { get; set; }

    public NguoiDung NguoiDung { get; set; } = null!;
    public ICollection<DonNhapHang> DonNhapHangs { get; set; } = new List<DonNhapHang>();
    public ICollection<HoaDon> HoaDons { get; set; } = new List<HoaDon>();
}
