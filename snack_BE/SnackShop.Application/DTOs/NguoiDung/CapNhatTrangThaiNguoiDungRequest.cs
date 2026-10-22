using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.NguoiDung;

public class CapNhatTrangThaiNguoiDungRequest
{
    /// <summary>hoat_dong | ngung_hoat_dong</summary>
    [Required]
    public string TrangThai { get; set; } = null!;
}
