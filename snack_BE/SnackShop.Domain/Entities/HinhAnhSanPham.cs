namespace SnackShop.Domain.Entities;

public class HinhAnhSanPham
{
    public Guid MaHinhAnh { get; set; }
    public Guid MaSanPham { get; set; }
    public string DuongDanAnh { get; set; } = null!;
    public bool LaAnhChinh { get; set; }
    public int ThuTuHienThi { get; set; }

    public SanPham SanPham { get; set; } = null!;
}
