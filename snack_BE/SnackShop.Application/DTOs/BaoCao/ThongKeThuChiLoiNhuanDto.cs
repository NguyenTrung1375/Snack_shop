namespace SnackShop.Application.DTOs.BaoCao;

public class ThongKeThuChiLoiNhuanDto
{
    public int Nam { get; set; }
    public List<ChiTieuThuChiRowDto> Rows { get; set; } = new();
}

public class ChiTieuThuChiRowDto
{
    public string ChiTieu { get; set; } = string.Empty; // "HĐ (Tổng thu)", "PNH (Tổng chi)", "Lợi nhuận"
    public string MaChiTieu { get; set; } = string.Empty; // "tong_thu", "tong_chi", "loi_nhuan"
    public decimal Q1 { get; set; }
    public decimal Q2 { get; set; }
    public decimal Q3 { get; set; }
    public decimal Q4 { get; set; }
    public decimal TongCong { get; set; }
}

