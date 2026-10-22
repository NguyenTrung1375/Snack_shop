using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.GioHang;

public class CapNhatGioHangRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0.")]
    public int SoLuong { get; set; }
}
