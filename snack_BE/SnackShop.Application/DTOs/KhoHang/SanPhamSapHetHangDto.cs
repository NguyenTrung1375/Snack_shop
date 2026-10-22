namespace SnackShop.Application.DTOs.KhoHang;

public class SanPhamSapHetHangDto
{
    public Guid MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public string DonViTinh { get; set; } = string.Empty;
    public int SoLuongTon { get; set; }
}
