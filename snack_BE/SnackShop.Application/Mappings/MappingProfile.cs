using AutoMapper;
using SnackShop.Application.Common;
using SnackShop.Application.DTOs.Auth;
using SnackShop.Application.DTOs.BaoCao;
using SnackShop.Application.DTOs.GioHang;
using SnackShop.Application.DTOs.HinhAnh;
using SnackShop.Application.DTOs.KhoHang;
using SnackShop.Application.DTOs.LoaiSanPham;
using SnackShop.Application.DTOs.NguoiDung;
using SnackShop.Application.DTOs.SanPham;
using SnackShop.Application.DTOs.ThongBao;
using SnackShop.Domain.Entities;

namespace SnackShop.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Auth
        CreateMap<NguoiDung, UserProfileDto>()
            .ForMember(d => d.VaiTro, opt => opt.MapFrom(s => s.VaiTro.ToSnakeCase()))
            .ForMember(d => d.TrangThai, opt => opt.MapFrom(s => s.TrangThai.ToSnakeCase()));

        CreateMap<NguoiDung, AuthResponse>()
            .ForMember(d => d.Token, opt => opt.Ignore())
            .ForMember(d => d.AccessToken, opt => opt.Ignore())
            .ForMember(d => d.VaiTro, opt => opt.MapFrom(s => s.VaiTro.ToSnakeCase()));

        // LoaiSanPham
        CreateMap<LoaiSanPham, LoaiSanPhamDto>()
            .ForMember(d => d.TrangThai, opt => opt.MapFrom(s => s.TrangThai.ToSnakeCase()))
            .ForMember(d => d.LoaiCons, opt => opt.MapFrom(s => s.LoaiCons));

        CreateMap<CreateLoaiSanPhamRequest, LoaiSanPham>()
            .ForMember(d => d.MaLoaiSanPham, opt => opt.Ignore())
            .ForMember(d => d.TrangThai, opt => opt.Ignore())
            .ForMember(d => d.LoaiCha, opt => opt.Ignore())
            .ForMember(d => d.LoaiCons, opt => opt.Ignore())
            .ForMember(d => d.SanPhams, opt => opt.Ignore());

        // HinhAnhSanPham
        CreateMap<HinhAnhSanPham, HinhAnhSanPhamDto>();

        // SanPham
        CreateMap<SanPham, SanPhamDto>()
            .ForMember(d => d.TenLoaiSanPham, opt => opt.MapFrom(s => s.LoaiSanPham != null ? s.LoaiSanPham.TenLoaiSanPham : null))
            .ForMember(d => d.TrangThai, opt => opt.MapFrom(s => s.TrangThai.ToSnakeCase()))
            .ForMember(d => d.DiemTrungBinh, opt => opt.MapFrom(s => s.DanhGiaSanPhams.Any() ? Math.Round(s.DanhGiaSanPhams.Average(d => (double)d.SoSao), 1) : 0))
            .ForMember(d => d.SoDanhGia, opt => opt.MapFrom(s => s.DanhGiaSanPhams.Count));

        CreateMap<SanPham, SanPhamChiTietDto>()
            .ForMember(d => d.TenLoaiSanPham, opt => opt.MapFrom(s => s.LoaiSanPham != null ? s.LoaiSanPham.TenLoaiSanPham : null))
            .ForMember(d => d.TrangThai, opt => opt.MapFrom(s => s.TrangThai.ToSnakeCase()))
            .ForMember(d => d.DiemTrungBinh, opt => opt.MapFrom(s => s.DanhGiaSanPhams.Any() ? Math.Round(s.DanhGiaSanPhams.Average(d => (double)d.SoSao), 1) : 0))
            .ForMember(d => d.SoDanhGia, opt => opt.MapFrom(s => s.DanhGiaSanPhams.Count))
            .ForMember(d => d.HinhAnhs, opt => opt.MapFrom(s => s.HinhAnhSanPhams.OrderBy(h => h.ThuTuHienThi)))
            .ForMember(d => d.KhuyenMais, opt => opt.Ignore());

        CreateMap<CreateSanPhamRequest, SanPham>()
            .ForMember(d => d.MaSanPham, opt => opt.Ignore())
            .ForMember(d => d.SoLuongTon, opt => opt.Ignore())
            .ForMember(d => d.TrangThai, opt => opt.Ignore())
            .ForMember(d => d.LoaiSanPham, opt => opt.Ignore())
            .ForMember(d => d.HinhAnhSanPhams, opt => opt.Ignore())
            .ForMember(d => d.ChiTietNhapHangs, opt => opt.Ignore())
            .ForMember(d => d.ChiTietGioHangs, opt => opt.Ignore())
            .ForMember(d => d.KhuyenMaiTheoSanPhams, opt => opt.Ignore())
            .ForMember(d => d.ChiTietDonHangs, opt => opt.Ignore())
            .ForMember(d => d.DanhGiaSanPhams, opt => opt.Ignore());

        // ChiTietGioHang
        CreateMap<ChiTietGioHang, ChiTietGioHangDto>()
            .ForMember(d => d.TenSanPham, opt => opt.MapFrom(s => s.SanPham != null ? s.SanPham.TenSanPham : string.Empty))
            .ForMember(d => d.HinhAnhDaiDien, opt => opt.MapFrom(s => s.SanPham != null ? s.SanPham.HinhAnhDaiDien : null))
            .ForMember(d => d.GiaBan, opt => opt.MapFrom(s => s.SanPham != null ? s.SanPham.GiaBan : 0))
            .ForMember(d => d.ThanhTien, opt => opt.MapFrom(s => s.SanPham != null ? s.SanPham.GiaBan * s.SoLuong : 0));

        // DanhGiaSanPham
        CreateMap<DanhGiaSanPham, DanhGiaSanPhamDto>()
            .ForMember(d => d.TenKhachHang, opt => opt.MapFrom(s => s.KhachHang != null && s.KhachHang.NguoiDung != null ? $"{s.KhachHang.NguoiDung.HoLot} {s.KhachHang.NguoiDung.Ten}".Trim() : string.Empty));

        // KhuyenMai
        CreateMap<KhuyenMaiTheoHoaDon, SnackShop.Application.DTOs.KhuyenMai.KhuyenMaiHoaDonDetailDto>()
            .ForMember(d => d.LoaiGiamGia, opt => opt.MapFrom(s => s.LoaiGiamGia.ToSnakeCase()));

        CreateMap<KhuyenMaiTheoVoucher, SnackShop.Application.DTOs.KhuyenMai.KhuyenMaiVoucherDetailDto>()
            .ForMember(d => d.LoaiGiamGia, opt => opt.MapFrom(s => s.LoaiGiamGia.ToSnakeCase()));

        // DonHang & HoaDon
        CreateMap<DonHang, SnackShop.Application.DTOs.DonHang.DonHangDto>()
            .ForMember(d => d.PhuongThucThanhToan, opt => opt.MapFrom(s => s.PhuongThucThanhToan.ToSnakeCase()))
            .ForMember(d => d.TrangThaiThanhToan, opt => opt.MapFrom(s => s.TrangThaiThanhToan.ToSnakeCase()))
            .ForMember(d => d.TrangThaiDonHang, opt => opt.MapFrom(s => s.TrangThaiDonHang.ToSnakeCase()))
            .ForMember(d => d.TenKhachHang, opt => opt.MapFrom(s => s.KhachHang != null && s.KhachHang.NguoiDung != null ? $"{s.KhachHang.NguoiDung.HoLot} {s.KhachHang.NguoiDung.Ten}".Trim() : null))
            .ForMember(d => d.TenKm, opt => opt.MapFrom(s => s.ChuongTrinhKhuyenMai != null ? s.ChuongTrinhKhuyenMai.TenKm : null))
            .ForMember(d => d.ChiTiets, opt => opt.MapFrom(s => s.ChiTietDonHangs))
            .ForMember(d => d.LichSus, opt => opt.MapFrom(s => s.LichSuDonHangs));

        CreateMap<ChiTietDonHang, SnackShop.Application.DTOs.DonHang.ChiTietDonHangDto>()
            .ForMember(d => d.TenSanPham, opt => opt.MapFrom(s => s.SanPham != null ? s.SanPham.TenSanPham : string.Empty))
            .ForMember(d => d.HinhAnhDaiDien, opt => opt.MapFrom(s => s.SanPham != null ? s.SanPham.HinhAnhDaiDien : null))
            .ForMember(d => d.DaDanhGia, opt => opt.MapFrom(s => s.DanhGiaSanPham != null));

        CreateMap<LichSuDonHang, SnackShop.Application.DTOs.DonHang.LichSuDonHangDto>()
            .ForMember(d => d.TenNguoiThucHien, opt => opt.MapFrom(s => s.NguoiDung != null ? $"{s.NguoiDung.HoLot} {s.NguoiDung.Ten}".Trim() : null))
            .ForMember(d => d.TrangThai, opt => opt.MapFrom(s => s.TrangThai.ToSnakeCase()));

        CreateMap<HoaDon, SnackShop.Application.DTOs.HoaDon.HoaDonDto>()
            .ForMember(d => d.MaCodeDonHang, opt => opt.MapFrom(s => s.DonHang != null ? s.DonHang.MaCode : string.Empty))
            .ForMember(d => d.TenNhanVien, opt => opt.MapFrom(s => s.NhanVien != null && s.NhanVien.NguoiDung != null ? $"{s.NhanVien.NguoiDung.HoLot} {s.NhanVien.NguoiDung.Ten}".Trim() : null))
            .ForMember(d => d.TongTienThanhToan, opt => opt.MapFrom(s => s.DonHang != null ? s.DonHang.TongTienThanhToan : 0))
            .ForMember(d => d.PhiVanChuyen, opt => opt.MapFrom(s => s.DonHang != null ? s.DonHang.PhiVanChuyen : 0))
            .ForMember(d => d.TienGiamGia, opt => opt.MapFrom(s => s.DonHang != null ? s.DonHang.TienGiamGia : 0))
            .ForMember(d => d.TenKhachHang, opt => opt.MapFrom(s => s.DonHang != null && s.DonHang.KhachHang != null && s.DonHang.KhachHang.NguoiDung != null ? $"{s.DonHang.KhachHang.NguoiDung.HoLot} {s.DonHang.KhachHang.NguoiDung.Ten}".Trim() : string.Empty))
            .ForMember(d => d.SdtKhachHang, opt => opt.MapFrom(s => s.DonHang != null ? s.DonHang.SdtNguoiNhan : string.Empty))
            .ForMember(d => d.DiaChiGiaoHang, opt => opt.MapFrom(s => s.DonHang != null ? s.DonHang.DiaChiGiaoHang : string.Empty))
            .ForMember(d => d.PhuongThucThanhToan, opt => opt.MapFrom(s => s.DonHang != null ? s.DonHang.PhuongThucThanhToan.ToSnakeCase() : string.Empty))
            .ForMember(d => d.TrangThaiThanhToan, opt => opt.MapFrom(s => s.DonHang != null ? s.DonHang.TrangThaiThanhToan.ToSnakeCase() : string.Empty))
            .ForMember(d => d.ChiTiets, opt => opt.MapFrom(s => s.DonHang != null ? s.DonHang.ChiTietDonHangs : new List<ChiTietDonHang>()));

        // ThongBao
        CreateMap<ThongBao, ThongBaoDto>();

        // KhoHang — Nhà cung cấp
        CreateMap<NhaCungCap, NhaCungCapDto>();

        // KhoHang — Đơn nhập hàng
        CreateMap<DonNhapHang, DonNhapHangDto>()
            .ForMember(d => d.TenNhaCungCap, opt => opt.MapFrom(s => s.NhaCungCap != null ? s.NhaCungCap.TenNhaCungCap : string.Empty))
            .ForMember(d => d.TenNhanVien, opt => opt.MapFrom(s => s.NhanVien != null && s.NhanVien.NguoiDung != null ? $"{s.NhanVien.NguoiDung.HoLot} {s.NhanVien.NguoiDung.Ten}".Trim() : string.Empty))
            .ForMember(d => d.ChiTiets, opt => opt.MapFrom(s => s.ChiTietNhapHangs));

        CreateMap<ChiTietNhapHang, ChiTietNhapHangDto>()
            .ForMember(d => d.TenSanPham, opt => opt.MapFrom(s => s.SanPham != null ? s.SanPham.TenSanPham : string.Empty));

        // KhoHang — View sắp hết hàng
        CreateMap<SanPhamSapHetHangView, SanPhamSapHetHangDto>();

        // NguoiDung
        CreateMap<NguoiDung, NguoiDungDto>()
            .ForMember(d => d.VaiTro, opt => opt.MapFrom(s => s.VaiTro.ToSnakeCase()))
            .ForMember(d => d.TrangThai, opt => opt.MapFrom(s => s.TrangThai.ToSnakeCase()));

        // NhanVien
        CreateMap<NhanVien, NhanVienDto>()
            .ForMember(d => d.HoLot, opt => opt.MapFrom(s => s.NguoiDung != null ? s.NguoiDung.HoLot : string.Empty))
            .ForMember(d => d.Ten, opt => opt.MapFrom(s => s.NguoiDung != null ? s.NguoiDung.Ten : string.Empty))
            .ForMember(d => d.Email, opt => opt.MapFrom(s => s.NguoiDung != null ? s.NguoiDung.Email : string.Empty))
            .ForMember(d => d.SoDienThoai, opt => opt.MapFrom(s => s.NguoiDung != null ? s.NguoiDung.SoDienThoai : null))
            .ForMember(d => d.TrangThai, opt => opt.MapFrom(s => s.NguoiDung != null ? s.NguoiDung.TrangThai.ToSnakeCase() : string.Empty))
            .ForMember(d => d.VaiTro, opt => opt.MapFrom(s => s.NguoiDung != null ? s.NguoiDung.VaiTro.ToSnakeCase() : string.Empty));

        // BaoCao — Views
        CreateMap<DoanhThuTheoThangView, DoanhThuTheoThangDto>();
        CreateMap<SanPhamBanChayView, SanPhamBanChayDto>();
    }
}
