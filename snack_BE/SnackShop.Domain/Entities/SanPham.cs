using SnackShop.Domain.Enums;

namespace SnackShop.Domain.Entities;

public class SanPham
{
    public Guid MaSanPham { get; set; }
    public Guid MaLoaiSanPham { get; set; }
    public string TenSanPham { get; set; } = null!;
    public string? MoTa { get; set; }
    public string DonViTinh { get; set; } = "gói";
    public decimal GiaBan { get; set; }
    public int SoLuongTon { get; set; }
    public Guid? MaSanPhamCha { get; set; }
    public string? KhoiLuong { get; set; }
    public string? HinhAnhDaiDien { get; set; }
    public TrangThaiSanPham TrangThai { get; set; } = TrangThaiSanPham.DangBan;

    public SanPham? SanPhamCha { get; set; }
    public ICollection<SanPham> BienThes { get; set; } = new List<SanPham>();
    public LoaiSanPham LoaiSanPham { get; set; } = null!;
    public ICollection<HinhAnhSanPham> HinhAnhSanPhams { get; set; } = new List<HinhAnhSanPham>();
    public ICollection<ChiTietNhapHang> ChiTietNhapHangs { get; set; } = new List<ChiTietNhapHang>();
    public ICollection<ChiTietGioHang> ChiTietGioHangs { get; set; } = new List<ChiTietGioHang>();
    public ICollection<KhuyenMaiTheoSanPham> KhuyenMaiTheoSanPhams { get; set; } = new List<KhuyenMaiTheoSanPham>();
    public ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();
    public ICollection<DanhGiaSanPham> DanhGiaSanPhams { get; set; } = new List<DanhGiaSanPham>();
}
