using SnackShop.Domain.Enums;

namespace SnackShop.Domain.Entities;

public class KhuyenMaiTheoHoaDon
{
    public Guid MaCtkm { get; set; }
    public string TenKm { get; set; } = null!;
    public decimal GiaTriDonToiThieu { get; set; }
    public LoaiGiamGia LoaiGiamGia { get; set; }
    public decimal GiaTriGiam { get; set; }
    public decimal? GiamToiDa { get; set; }

    public ChuongTrinhKhuyenMai ChuongTrinhKhuyenMai { get; set; } = null!;
}
