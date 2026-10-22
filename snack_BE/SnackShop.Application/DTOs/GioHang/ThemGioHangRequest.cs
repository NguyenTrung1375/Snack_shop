using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.GioHang;

public class ThemGioHangRequest
{
    [Required(ErrorMessage = "Mã sản phẩm không được để trống.")]
    public Guid MaSanPham { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0.")]
    public int SoLuong { get; set; } = 1;
}
