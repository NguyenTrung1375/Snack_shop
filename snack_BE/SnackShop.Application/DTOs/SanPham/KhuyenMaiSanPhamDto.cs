namespace SnackShop.Application.DTOs.SanPham;

public class KhuyenMaiSanPhamDto
{
    public Guid MaCtkm { get; set; }
    public string TenKm { get; set; } = string.Empty;
    public string LoaiGiamGia { get; set; } = string.Empty;
    public decimal GiaTriGiam { get; set; }
    public decimal GiaSauGiam { get; set; }
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
}
