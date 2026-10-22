namespace SnackShop.Application.DTOs.BaoCao;

public class SanPhamBanChayDto
{
    public Guid MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public long TongSoLuongBan { get; set; }
    public decimal TongDoanhThu { get; set; }
}
