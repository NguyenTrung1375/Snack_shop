using SnackShop.Application.DTOs.DonHang;

namespace SnackShop.Application.DTOs.HoaDon;

public class HoaDonDto
{
    public Guid MaHoaDon { get; set; }
    public Guid MaDonHang { get; set; }
    public string MaCodeDonHang { get; set; } = string.Empty;
    public Guid? MaNhanVien { get; set; }
    public string? TenNhanVien { get; set; }
    public string SoHoaDon { get; set; } = null!;
    public decimal TongTien { get; set; }
    public decimal TongTienThanhToan { get; set; }
    public decimal PhiVanChuyen { get; set; }
    public decimal TienGiamGia { get; set; }
    public DateTime NgayXuatHoaDon { get; set; }
    public string TenKhachHang { get; set; } = string.Empty;
    public string SdtKhachHang { get; set; } = string.Empty;
    public string DiaChiGiaoHang { get; set; } = string.Empty;
    public string PhuongThucThanhToan { get; set; } = string.Empty;
    public string TrangThaiThanhToan { get; set; } = string.Empty;
    public List<ChiTietDonHangDto> ChiTiets { get; set; } = new();
}
