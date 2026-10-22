using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.DanhGia;

public class TaoDanhGiaRequest
{
    [Required]
    public Guid MaChiTietDonHang { get; set; }

    [Range(1, 5, ErrorMessage = "Số sao phải từ 1 đến 5.")]
    public int SoSao { get; set; }

    public string? BinhLuan { get; set; }
}
