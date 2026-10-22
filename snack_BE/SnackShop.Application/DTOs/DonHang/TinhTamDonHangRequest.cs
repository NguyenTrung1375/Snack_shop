namespace SnackShop.Application.DTOs.DonHang;

public class TinhTamDonHangRequest
{
    public string? MaVoucher { get; set; }
    public Guid? MaCtkm { get; set; }
    public decimal? PhiVanChuyen { get; set; }
    public List<ChiTietDatHangRequest>? ChiTiets { get; set; }
}
