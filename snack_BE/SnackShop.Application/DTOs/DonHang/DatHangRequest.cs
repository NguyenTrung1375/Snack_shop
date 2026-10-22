namespace SnackShop.Application.DTOs.DonHang;

public class DatHangRequest
{
    public string TenNguoiNhan { get; set; } = null!;
    public string SdtNguoiNhan { get; set; } = null!;
    public string DiaChiGiaoHang { get; set; } = null!;
    public string? GhiChu { get; set; }
    public decimal? PhiVanChuyen { get; set; }
    public string? PhuongThucThanhToan { get; set; } = "cod";
    public string? MaVoucher { get; set; }
    public Guid? MaCtkm { get; set; }
    public List<ChiTietDatHangRequest>? ChiTiets { get; set; }
}
