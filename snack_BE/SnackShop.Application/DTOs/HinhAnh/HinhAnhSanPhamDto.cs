namespace SnackShop.Application.DTOs.HinhAnh;

public class HinhAnhSanPhamDto
{
    public Guid MaHinhAnh { get; set; }
    public Guid MaSanPham { get; set; }
    public string DuongDanAnh { get; set; } = string.Empty;
    public bool LaAnhChinh { get; set; }
    public int ThuTuHienThi { get; set; }
}
