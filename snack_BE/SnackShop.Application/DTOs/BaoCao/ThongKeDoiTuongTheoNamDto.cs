namespace SnackShop.Application.DTOs.BaoCao;

public class ThongKeDoiTuongTheoNamDto
{
    public string LoaiDoiTuong { get; set; } = string.Empty; // "nhan_vien" hoặc "khach_hang"
    public List<int> DanhSachNam { get; set; } = new(); // [2024, 2025, 2026]
    public List<DoiTuongDoanhThuRowDto> Items { get; set; } = new();
    public DoiTuongDoanhThuRowDto TongCongToanBo { get; set; } = new();
}

public class DoiTuongDoanhThuRowDto
{
    public Guid MaDoiTuong { get; set; }
    public string TenDoiTuong { get; set; } = string.Empty;
    public string? MaDinhDanh { get; set; } // NV01, KH01
    public Dictionary<string, decimal> DoanhThuTheoNam { get; set; } = new(); // {"2024": ..., "2025": ..., "2026": ...}
    public decimal TongCong { get; set; }
}

