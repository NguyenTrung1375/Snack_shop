using System.ComponentModel.DataAnnotations;

namespace SnackShop.Application.DTOs.KhuyenMai;

public class UpdateKhuyenMaiRequest
{
    [Required(ErrorMessage = "Tên chương trình khuyến mãi không được để trống.")]
    [StringLength(200, ErrorMessage = "Tên chương trình khuyến mãi không vượt quá 200 ký tự.")]
    public string TenKm { get; set; } = string.Empty;

    [Required(ErrorMessage = "Ngày bắt đầu không được để trống.")]
    public DateTime NgayBatDau { get; set; }

    [Required(ErrorMessage = "Ngày kết thúc không được để trống.")]
    public DateTime NgayKetThuc { get; set; }

    public UpdateKhuyenMaiHoaDonItem? KhuyenMaiTheoHoaDon { get; set; }
    public UpdateKhuyenMaiVoucherItem? KhuyenMaiTheoVoucher { get; set; }
    public List<CreateKhuyenMaiSanPhamItem>? KhuyenMaiTheoSanPhams { get; set; }
}

public class UpdateKhuyenMaiHoaDonItem
{
    public string? TenKm { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Giá trị đơn tối thiểu phải >= 0.")]
    public decimal GiaTriDonToiThieu { get; set; }

    [Required(ErrorMessage = "Loại giảm giá không được để trống (phan_tram, so_tien).")]
    public string LoaiGiamGia { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Giá trị giảm phải >= 0.")]
    public decimal GiaTriGiam { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Giảm tối đa phải >= 0.")]
    public decimal? GiamToiDa { get; set; }
}

public class UpdateKhuyenMaiVoucherItem
{
    public string? TenKm { get; set; }

    [StringLength(30, ErrorMessage = "Mã voucher không vượt quá 30 ký tự.")]
    public string? MaCode { get; set; }

    [Required(ErrorMessage = "Loại giảm giá không được để trống (phan_tram, so_tien).")]
    public string LoaiGiamGia { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Giá trị giảm phải >= 0.")]
    public decimal GiaTriGiam { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Giá trị đơn tối thiểu phải >= 0.")]
    public decimal GiaTriDonToiThieu { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Giảm tối đa phải >= 0.")]
    public decimal? GiamToiDa { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Giới hạn sử dụng phải lớn hơn 0.")]
    public int? GioiHanSuDung { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Giới hạn mỗi khách phải lớn hơn 0.")]
    public int? GioiHanMoiKhach { get; set; }
}
