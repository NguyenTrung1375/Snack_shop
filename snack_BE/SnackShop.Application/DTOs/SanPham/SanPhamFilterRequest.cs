namespace SnackShop.Application.DTOs.SanPham;

public class SanPhamFilterRequest
{
    public string? Keyword { get; set; }
    public Guid? MaLoai { get; set; }
    public decimal? GiaTu { get; set; }
    public decimal? GiaDen { get; set; }
    public string? SapXep { get; set; }
    public string? TrangThai { get; set; }
    public bool? ChiHienThiSanPhamGoc { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
