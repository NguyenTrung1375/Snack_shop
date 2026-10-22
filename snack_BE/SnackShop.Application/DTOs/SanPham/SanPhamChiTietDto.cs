using SnackShop.Application.DTOs.HinhAnh;

namespace SnackShop.Application.DTOs.SanPham;

public class SanPhamChiTietDto : SanPhamDto
{
    public List<HinhAnhSanPhamDto> HinhAnhs { get; set; } = new();
    public List<KhuyenMaiSanPhamDto> KhuyenMais { get; set; } = new();
    public List<SanPhamBienTheDto> BienThes { get; set; } = new();
}
