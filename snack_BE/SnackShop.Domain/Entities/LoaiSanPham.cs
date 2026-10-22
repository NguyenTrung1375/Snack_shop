using SnackShop.Domain.Enums;

namespace SnackShop.Domain.Entities;

public class LoaiSanPham
{
    public Guid MaLoaiSanPham { get; set; }
    public Guid? MaLoaiCha { get; set; }
    public string TenLoaiSanPham { get; set; } = null!;
    public string? MoTa { get; set; }
    public TrangThaiNguoiDung TrangThai { get; set; } = TrangThaiNguoiDung.HoatDong;

    public LoaiSanPham? LoaiCha { get; set; }
    public ICollection<LoaiSanPham> LoaiCons { get; set; } = new List<LoaiSanPham>();
    public ICollection<SanPham> SanPhams { get; set; } = new List<SanPham>();
}
