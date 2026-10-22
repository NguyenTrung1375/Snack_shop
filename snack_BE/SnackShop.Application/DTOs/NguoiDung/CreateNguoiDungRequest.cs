using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.NguoiDung;

public class CreateNguoiDungRequest
{
    public string? HoLot { get; set; }
    public string? Ten { get; set; }
    public string? HoTen { get; set; }

    [Required(ErrorMessage = "Email không được để trống")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu không được để trống")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
    public string MatKhau { get; set; } = string.Empty;

    public string? SoDienThoai { get; set; }
    public string? DiaChi { get; set; }

    [Required(ErrorMessage = "Vai trò không được để trống")]
    public string VaiTro { get; set; } = string.Empty;

    public decimal? MucLuong { get; set; }
    public DateOnly? NgayVaoLam { get; set; }
}

