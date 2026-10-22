namespace SnackShop.Application.DTOs.HoaDon;

public class HoaDonFilterRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? Keyword { get; set; }
    public DateTime? TuNgay { get; set; }
    public DateTime? DenNgay { get; set; }
}

