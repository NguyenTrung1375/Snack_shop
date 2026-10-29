namespace SnackShop.Application.DTOs.BaoCao;

public class ThongKeTheoKhoangNgayDto
{
    public DateTime TuNgay { get; set; }
    public DateTime DenNgay { get; set; }
    public int TongSoHoaDon { get; set; }
    public decimal TongDoanhThu { get; set; }
    public List<HoaDonThongKeItemDto> DanhSachHoaDon { get; set; } = new();
}

public class HoaDonThongKeItemDto
{
    public Guid MaHoaDon { get; set; }
    public string SoHoaDon { get; set; } = string.Empty;
    public string MaCodeDonHang { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string? TenNhanVien { get; set; }
    public decimal TongTien { get; set; }
    public DateTime NgayXuatHoaDon { get; set; }
}

