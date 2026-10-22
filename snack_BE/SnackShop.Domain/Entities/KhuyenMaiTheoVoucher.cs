using SnackShop.Domain.Enums;

namespace SnackShop.Domain.Entities;

public class KhuyenMaiTheoVoucher
{
    public Guid MaCtkm { get; set; }
    public string TenKm { get; set; } = null!;
    public string MaCode { get; set; } = null!;
    public LoaiGiamGia LoaiGiamGia { get; set; }
    public decimal GiaTriGiam { get; set; }
    public decimal GiaTriDonToiThieu { get; set; }
    public decimal? GiamToiDa { get; set; }
    public int? GioiHanSuDung { get; set; }
    public int SoLuotDaDung { get; set; }
    public int? GioiHanMoiKhach { get; set; }

    public ChuongTrinhKhuyenMai ChuongTrinhKhuyenMai { get; set; } = null!;
}
