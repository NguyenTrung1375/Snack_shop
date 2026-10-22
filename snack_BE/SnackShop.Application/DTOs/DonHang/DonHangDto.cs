using SnackShop.Application.DTOs.HoaDon;

namespace SnackShop.Application.DTOs.DonHang;

public class DonHangDto
{
    public Guid MaDonHang { get; set; }
    public string MaCode { get; set; } = null!;
    public Guid MaKhachHang { get; set; }
    public string? TenKhachHang { get; set; }
    public Guid? MaCtkm { get; set; }
    public string? TenKm { get; set; }
    public string TenNguoiNhan { get; set; } = null!;
    public string SdtNguoiNhan { get; set; } = null!;
    public string DiaChiGiaoHang { get; set; } = null!;
    public string? GhiChu { get; set; }
    public decimal PhiVanChuyen { get; set; }
    public decimal TienHang { get; set; }
    public decimal TienGiamGia { get; set; }
    public decimal TongTienThanhToan { get; set; }
    public string PhuongThucThanhToan { get; set; } = null!;
    public string TrangThaiThanhToan { get; set; } = null!;
    public string TrangThaiDonHang { get; set; } = null!;
    public DateTime NgayTao { get; set; }

    public List<ChiTietDonHangDto> ChiTiets { get; set; } = new();
    public List<LichSuDonHangDto> LichSus { get; set; } = new();
    public HoaDonDto? HoaDon { get; set; }
}
