using SnackShop.Domain.Enums;

namespace SnackShop.Domain.Entities;

public class KhuyenMaiTheoSanPham
{
    public Guid MaCtkm { get; set; }
    public Guid MaSanPham { get; set; }
    public string TenKm { get; set; } = null!;
    public LoaiGiamGia LoaiGiamGia { get; set; }
    public decimal GiaTriGiam { get; set; }

    public ChuongTrinhKhuyenMai ChuongTrinhKhuyenMai { get; set; } = null!;
    public SanPham SanPham { get; set; } = null!;
}
