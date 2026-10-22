namespace SnackShop.Application.DTOs.SanPham;

public class DanhGiaSanPhamDto
{
    public Guid MaDanhGia { get; set; }
    public Guid MaSanPham { get; set; }
    public string? TenSanPham { get; set; }
    public string? HinhAnhSanPham { get; set; }
    public Guid MaKhachHang { get; set; }
    public string TenKhachHang { get; set; } = string.Empty;
    public int SoSao { get; set; }
    public string? BinhLuan { get; set; }
    public DateTime NgayTao { get; set; }
}
