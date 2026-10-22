namespace SnackShop.Application.DTOs.KhuyenMai;

public class KhuyenMaiSanPhamDetailDto
{
    public Guid MaCtkm { get; set; }
    public Guid MaSanPham { get; set; }
    public string? TenSanPham { get; set; }
    public decimal GiaBan { get; set; }
    public string TenKm { get; set; } = string.Empty;
    public string LoaiGiamGia { get; set; } = string.Empty;
    public decimal GiaTriGiam { get; set; }
    public decimal GiaSauGiam { get; set; }
}
