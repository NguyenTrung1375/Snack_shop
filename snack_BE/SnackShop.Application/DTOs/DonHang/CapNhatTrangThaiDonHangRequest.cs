namespace SnackShop.Application.DTOs.DonHang;

public class CapNhatTrangThaiDonHangRequest
{
    private string _trangThaiDonHang = string.Empty;

    public string TrangThaiDonHang
    {
        get => _trangThaiDonHang;
        set => _trangThaiDonHang = value;
    }

    public string? TrangThai
    {
        get => _trangThaiDonHang;
        set
        {
            if (!string.IsNullOrWhiteSpace(value))
                _trangThaiDonHang = value;
        }
    }

    public string? GhiChu { get; set; }
}
