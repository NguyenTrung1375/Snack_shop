using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.KhoHang;

public class TaoDonNhapHangRequest
{
    [Required]
    public Guid MaNhaCungCap { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Phải có ít nhất một chi tiết nhập hàng.")]
    public List<ChiTietNhapHangRequest> ChiTiets { get; set; } = new();
}
