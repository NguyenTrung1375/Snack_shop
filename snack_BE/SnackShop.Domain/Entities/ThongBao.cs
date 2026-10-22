namespace SnackShop.Domain.Entities;

public class ThongBao
{
    public Guid MaThongBao { get; set; }
    public Guid MaNguoiDung { get; set; }
    public string TieuDe { get; set; } = null!;
    public string? NoiDung { get; set; }
    public bool DaDoc { get; set; }
    public DateTime NgayTao { get; set; }

    public NguoiDung NguoiDung { get; set; } = null!;
}
