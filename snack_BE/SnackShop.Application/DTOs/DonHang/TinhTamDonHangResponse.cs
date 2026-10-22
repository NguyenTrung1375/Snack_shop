namespace SnackShop.Application.DTOs.DonHang;

public class TinhTamDonHangResponse
{
    public decimal TienHangChuaGiam { get; set; }
    public decimal TienGiamSanPham { get; set; }
    public decimal TienHang { get; set; }
    public decimal TienGiamGia { get; set; }
    public decimal PhiVanChuyen { get; set; }
    public decimal TongTienThanhToan { get; set; }
    public Guid? MaCtkm { get; set; }
    public string? TenKm { get; set; }
    public string? MaVoucher { get; set; }
    public List<ChiTietTinhTamDto> ChiTiets { get; set; } = new();
}
