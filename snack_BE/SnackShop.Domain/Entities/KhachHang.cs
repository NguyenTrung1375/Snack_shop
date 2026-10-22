namespace SnackShop.Domain.Entities;

public class KhachHang
{
    public Guid MaNguoiDung { get; set; }

    public NguoiDung NguoiDung { get; set; } = null!;
    public ICollection<ChiTietGioHang> ChiTietGioHangs { get; set; } = new List<ChiTietGioHang>();
    public ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();
    public ICollection<DanhGiaSanPham> DanhGiaSanPhams { get; set; } = new List<DanhGiaSanPham>();
}
