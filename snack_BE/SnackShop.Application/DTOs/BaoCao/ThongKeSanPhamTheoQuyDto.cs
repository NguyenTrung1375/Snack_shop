namespace SnackShop.Application.DTOs.BaoCao;

public class ThongKeSanPhamTheoQuyDto
{
    public int Nam { get; set; }
    public List<SanPhamQuyRowDto> Items { get; set; } = new();
    public SanPhamQuyRowDto TongCongToanBo { get; set; } = new();
}

public class SanPhamQuyRowDto
{
    public Guid? MaSanPham { get; set; }
    public string TenSanPham { get; set; } = string.Empty;
    public decimal Q1 { get; set; }
    public decimal Q2 { get; set; }
    public decimal Q3 { get; set; }
    public decimal Q4 { get; set; }
    public decimal TongCong { get; set; }
}

