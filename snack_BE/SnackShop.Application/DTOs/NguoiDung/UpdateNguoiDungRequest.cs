using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.NguoiDung;

public class UpdateNguoiDungRequest
{
    [Required(ErrorMessage = "Họ lót không được để trống")]
    public string HoLot { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên không được để trống")]
    public string Ten { get; set; } = string.Empty;

    public string? SoDienThoai { get; set; }
    public string? VaiTro { get; set; }
    public string? DiaChi { get; set; }
}
