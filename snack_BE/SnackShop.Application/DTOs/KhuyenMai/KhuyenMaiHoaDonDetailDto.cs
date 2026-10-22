namespace SnackShop.Application.DTOs.KhuyenMai;

public class KhuyenMaiHoaDonDetailDto
{
    public Guid MaCtkm { get; set; }
    public string TenKm { get; set; } = string.Empty;
    public decimal GiaTriDonToiThieu { get; set; }
    public string LoaiGiamGia { get; set; } = string.Empty;
    public decimal GiaTriGiam { get; set; }
    public decimal? GiamToiDa { get; set; }
}
