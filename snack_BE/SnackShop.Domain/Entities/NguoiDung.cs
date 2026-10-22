using SnackShop.Domain.Enums;

namespace SnackShop.Domain.Entities;

public class NguoiDung
{
    public Guid MaNguoiDung { get; set; }
    public string HoLot { get; set; } = null!;
    public string Ten { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? SoDienThoai { get; set; }
    public string MatKhau { get; set; } = null!;
    public string? DiaChi { get; set; }
    public VaiTro VaiTro { get; set; } = VaiTro.KhachHang;
    public TrangThaiNguoiDung TrangThai { get; set; } = TrangThaiNguoiDung.HoatDong;
    public DateTime NgayTao { get; set; }
    public DateTime NgayCapNhat { get; set; }

    public NhanVien? NhanVien { get; set; }
    public KhachHang? KhachHang { get; set; }
    public ICollection<ThongBao> ThongBaos { get; set; } = new List<ThongBao>();
    public ICollection<LichSuDonHang> LichSuDonHangs { get; set; } = new List<LichSuDonHang>();
}
