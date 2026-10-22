using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.KhoHang;

public class ChiTietNhapHangRequest
{
    [Required]
    public Guid MaSanPham { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0.")]
    public int SoLuong { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Giá nhập phải lớn hơn 0.")]
    public decimal GiaNhap { get; set; }
}
