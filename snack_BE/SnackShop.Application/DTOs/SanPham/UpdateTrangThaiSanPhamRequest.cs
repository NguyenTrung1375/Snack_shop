using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.SanPham;

public class UpdateTrangThaiSanPhamRequest
{
    [Required(ErrorMessage = "Trạng thái không được để trống.")]
    public string TrangThai { get; set; } = string.Empty;
}
