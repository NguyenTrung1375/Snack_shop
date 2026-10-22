using SnackShop.Domain.Enums;

namespace SnackShop.Domain.Entities;

public class DonHang
{
    public Guid MaDonHang { get; set; }
    public string MaCode { get; set; } = null!;
    public Guid MaKhachHang { get; set; }
    public Guid? MaCtkm { get; set; }
    public string TenNguoiNhan { get; set; } = null!;
    public string SdtNguoiNhan { get; set; } = null!;
    public string DiaChiGiaoHang { get; set; } = null!;
    public string? GhiChu { get; set; }
    public decimal PhiVanChuyen { get; set; }
    public decimal TienHang { get; set; }
    public decimal TienGiamGia { get; set; }
    public decimal TongTienThanhToan { get; set; }
    public PhuongThucThanhToan PhuongThucThanhToan { get; set; } = PhuongThucThanhToan.Cod;
    public TrangThaiThanhToan TrangThaiThanhToan { get; set; } = TrangThaiThanhToan.ChuaThanhToan;
    public TrangThaiDonHang TrangThaiDonHang { get; set; } = TrangThaiDonHang.ChoXacNhan;
    public DateTime NgayTao { get; set; }

    public KhachHang KhachHang { get; set; } = null!;
    public ChuongTrinhKhuyenMai? ChuongTrinhKhuyenMai { get; set; }
    public ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();
    public ICollection<LichSuDonHang> LichSuDonHangs { get; set; } = new List<LichSuDonHang>();
    public HoaDon? HoaDon { get; set; }
}
