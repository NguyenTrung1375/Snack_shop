namespace SnackShop.Application.DTOs.KhuyenMai;

public class KhuyenMaiFilterRequest
{
    public string? Keyword { get; set; }
    public string? LoaiKhuyenMai { get; set; } // san_pham, hoa_don, voucher
    public string? TrangThai { get; set; }     // dang_dien_ra, sap_dien_ra, da_ket_thuc
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
