namespace SnackShop.Application.DTOs.ThongBao;

public class ThongBaoDto
{
    public Guid MaThongBao { get; set; }
    public Guid Id => MaThongBao;
    public Guid MaNguoiDung { get; set; }
    public string TieuDe { get; set; } = string.Empty;
    public string? NoiDung { get; set; }
    public bool DaDoc { get; set; }
    public DateTime NgayTao { get; set; }
}
