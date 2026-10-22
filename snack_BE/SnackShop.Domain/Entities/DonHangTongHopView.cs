using SnackShop.Domain.Enums;

namespace SnackShop.Domain.Entities;

public class DonHangTongHopView
{
    public Guid MaDonHang { get; set; }
    public string MaCode { get; set; } = null!;
    public string TenKhachHang { get; set; } = null!;
    public string TenNguoiNhan { get; set; } = null!;
    public decimal TienHang { get; set; }
    public decimal PhiVanChuyen { get; set; }
    public decimal TienGiamGia { get; set; }
    public decimal TongTienThanhToan { get; set; }
    public PhuongThucThanhToan PhuongThucThanhToan { get; set; }
    public TrangThaiThanhToan TrangThaiThanhToan { get; set; }
    public TrangThaiDonHang TrangThaiDonHang { get; set; }
    public DateTime NgayTao { get; set; }
}
