namespace SnackShop.Domain.Entities;

public class ChuongTrinhKhuyenMai
{
    public Guid MaCtkm { get; set; }
    public string TenKm { get; set; } = null!;
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public DateTime NgayTao { get; set; }

    public KhuyenMaiTheoHoaDon? KhuyenMaiTheoHoaDon { get; set; }
    public KhuyenMaiTheoVoucher? KhuyenMaiTheoVoucher { get; set; }
    public ICollection<KhuyenMaiTheoSanPham> KhuyenMaiTheoSanPhams { get; set; } = new List<KhuyenMaiTheoSanPham>();
    public ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();
}
