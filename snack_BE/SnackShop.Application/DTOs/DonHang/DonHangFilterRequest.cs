namespace SnackShop.Application.DTOs.DonHang;

public class DonHangFilterRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? TrangThai { get; set; }
    public DateTime? TuNgay { get; set; }
    public DateTime? DenNgay { get; set; }
    public string? Keyword { get; set; }
    public Guid? MaKhachHang { get; set; }
}
