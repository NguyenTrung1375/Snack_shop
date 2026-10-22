namespace SnackShop.Application.DTOs.KhuyenMai;

public class KiemTraVoucherResponse
{
    public bool HopLe { get; set; } = true;
    public Guid MaCtkm { get; set; }
    public string MaCode { get; set; } = string.Empty;
    public string TenKm { get; set; } = string.Empty;
    public string LoaiGiamGia { get; set; } = string.Empty;
    public decimal GiaTriGiam { get; set; }
    public decimal GiaTriDonToiThieu { get; set; }
    public decimal? GiamToiDa { get; set; }
    public decimal TienGiamGia { get; set; }
    public string ThongBao { get; set; } = string.Empty;
}
