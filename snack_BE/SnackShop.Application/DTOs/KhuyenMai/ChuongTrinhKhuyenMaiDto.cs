namespace SnackShop.Application.DTOs.KhuyenMai;

public class ChuongTrinhKhuyenMaiDto
{
    public Guid MaCtkm { get; set; }
    public string TenKm { get; set; } = string.Empty;
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public DateTime NgayTao { get; set; }
    public string LoaiKhuyenMai { get; set; } = string.Empty; // "san_pham" | "hoa_don" | "voucher"
    public string TrangThai { get; set; } = string.Empty;     // "dang_dien_ra" | "sap_dien_ra" | "da_ket_thuc"

    public KhuyenMaiHoaDonDetailDto? KhuyenMaiTheoHoaDon { get; set; }
    public KhuyenMaiVoucherDetailDto? KhuyenMaiTheoVoucher { get; set; }
    public List<KhuyenMaiSanPhamDetailDto> KhuyenMaiTheoSanPhams { get; set; } = new();
}
