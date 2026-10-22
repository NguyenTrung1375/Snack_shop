namespace SnackShop.Application.DTOs.KhoHang;

public class DonNhapHangDto
{
    public Guid MaDonNhap { get; set; }
    public Guid MaNhaCungCap { get; set; }
    public string TenNhaCungCap { get; set; } = string.Empty;
    public Guid MaNhanVien { get; set; }
    public string TenNhanVien { get; set; } = string.Empty;
    public decimal TongTien { get; set; }
    public DateTime? NgayNhapKho { get; set; }
    public DateTime NgayTao { get; set; }
    public List<ChiTietNhapHangDto> ChiTiets { get; set; } = new();
}
