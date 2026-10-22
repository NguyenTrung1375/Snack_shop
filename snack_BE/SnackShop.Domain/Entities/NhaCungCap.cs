namespace SnackShop.Domain.Entities;

public class NhaCungCap
{
    public Guid MaNhaCungCap { get; set; }
    public string TenNhaCungCap { get; set; } = null!;
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }

    public ICollection<DonNhapHang> DonNhapHangs { get; set; } = new List<DonNhapHang>();
}
