using SnackShop.Domain.Enums;

namespace SnackShop.Domain.Entities;

public class LichSuDonHang
{
    public Guid MaLichSu { get; set; }
    public Guid MaDonHang { get; set; }
    public Guid? NguoiThucHien { get; set; }
    public TrangThaiDonHang TrangThai { get; set; }
    public string? GhiChu { get; set; }
    public DateTime NgayTao { get; set; }

    public DonHang DonHang { get; set; } = null!;
    public NguoiDung? NguoiDung { get; set; }
}
