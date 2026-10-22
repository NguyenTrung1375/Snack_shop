namespace SnackShop.Application.DTOs.KhoHang;

public class NhaCungCapDto
{
    public Guid MaNhaCungCap { get; set; }
    public string TenNhaCungCap { get; set; } = string.Empty;
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
}
