namespace SnackShop.Application.DTOs.LoaiSanPham;

public class LoaiSanPhamDto
{
    public Guid MaLoaiSanPham { get; set; }
    public Guid? MaLoaiCha { get; set; }
    public string TenLoaiSanPham { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public List<LoaiSanPhamDto> LoaiCons { get; set; } = new();
}
