using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.KhuyenMai;

public class KiemTraVoucherRequest
{
    [Required(ErrorMessage = "Mã voucher không được để trống.")]
    [StringLength(30, ErrorMessage = "Mã voucher không vượt quá 30 ký tự.")]
    public string MaCode { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Tổng tiền hàng phải lớn hơn hoặc bằng 0.")]
    public decimal TongTienHang { get; set; }
}
