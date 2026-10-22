namespace SnackShop.Domain.Entities;

public class SanPhamSapHetHangView
{
    public Guid MaSanPham { get; set; }
    public string TenSanPham { get; set; } = null!;
    public string DonViTinh { get; set; } = null!;
    public int SoLuongTon { get; set; }
}
