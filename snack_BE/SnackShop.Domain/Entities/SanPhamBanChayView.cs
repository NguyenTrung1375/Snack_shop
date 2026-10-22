namespace SnackShop.Domain.Entities;

public class SanPhamBanChayView
{
    public Guid MaSanPham { get; set; }
    public string TenSanPham { get; set; } = null!;
    public long TongSoLuongBan { get; set; }
    public decimal TongDoanhThu { get; set; }
}
