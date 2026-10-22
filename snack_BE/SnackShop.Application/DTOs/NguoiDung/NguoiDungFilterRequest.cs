namespace SnackShop.Application.DTOs.NguoiDung;

public class NguoiDungFilterRequest
{
    public string? Keyword { get; set; }
    public string? VaiTro { get; set; }
    public string? TrangThai { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
