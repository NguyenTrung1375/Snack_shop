namespace SnackShop.Application.DTOs.KhuyenMai;

public class KhuyenMaiVoucherDetailDto
{
    public Guid MaCtkm { get; set; }
    public string TenKm { get; set; } = string.Empty;
    public string MaCode { get; set; } = string.Empty;
    public string LoaiGiamGia { get; set; } = string.Empty;
    public decimal GiaTriGiam { get; set; }
    public decimal GiaTriDonToiThieu { get; set; }
    public decimal? GiamToiDa { get; set; }
    public int? GioiHanSuDung { get; set; }
    public int SoLuotDaDung { get; set; }
    public int? GioiHanMoiKhach { get; set; }
    public int? SoLuotConLai => GioiHanSuDung.HasValue ? Math.Max(0, GioiHanSuDung.Value - SoLuotDaDung) : null;
}
