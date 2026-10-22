namespace SnackShop.Application.DTOs.DonHang;

public class LichSuDonHangDto
{
    public Guid MaLichSu { get; set; }
    public Guid MaDonHang { get; set; }
    public Guid? NguoiThucHien { get; set; }
    public string? TenNguoiThucHien { get; set; }
    public string TrangThai { get; set; } = null!;
    public string? GhiChu { get; set; }
    public DateTime NgayTao { get; set; }
}
