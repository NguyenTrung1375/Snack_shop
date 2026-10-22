# Hướng dẫn code Backend – Cửa hàng đồ ăn vặt (C# .NET + MySQL)

Tài liệu này dùng để code backend dựa trên file `cua_hang_do_an_vat.sql` (MySQL 8) và ERD Mermaid đã có. Làm theo thứ tự các phần ở cuối file.

---

## 1. Công nghệ

| Hạng mục | Lựa chọn |
|---|---|
| Framework | .NET 8, ASP.NET Core Web API (Controller) |
| ORM | EF Core 8 + `Pomelo.EntityFrameworkCore.MySql` |
| Xác thực | JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`) |
| Băm mật khẩu | `BCrypt.Net-Next` |
| Mapping | AutoMapper |
| Validation | FluentValidation (hoặc DataAnnotations nếu muốn đơn giản) |
| Tài liệu API | Swashbuckle (Swagger) |

```bash
dotnet new sln -n SnackShop
dotnet new classlib -n SnackShop.Domain
dotnet new classlib -n SnackShop.Application
dotnet new classlib -n SnackShop.Infrastructure
dotnet new webapi   -n SnackShop.API --use-controllers

dotnet sln add SnackShop.*/SnackShop.*.csproj
dotnet add SnackShop.Application reference SnackShop.Domain
dotnet add SnackShop.Infrastructure reference SnackShop.Application
dotnet add SnackShop.API reference SnackShop.Application SnackShop.Infrastructure

dotnet add SnackShop.Infrastructure package Pomelo.EntityFrameworkCore.MySql
dotnet add SnackShop.Infrastructure package Microsoft.EntityFrameworkCore.Design
dotnet add SnackShop.Infrastructure package BCrypt.Net-Next
dotnet add SnackShop.Application   package AutoMapper
dotnet add SnackShop.Application   package FluentValidation
dotnet add SnackShop.API           package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add SnackShop.API           package Swashbuckle.AspNetCore
```

> **Không dùng EF Migrations.** Database đã được tạo bằng file SQL (có trigger, view, generated column). EF chỉ **ánh xạ** vào DB có sẵn.

---

## 2. Cấu trúc thư mục (Clean Architecture)

```
SnackShop/
├── SnackShop.Domain/
│   ├── Entities/            # NguoiDung, NhanVien, KhachHang, SanPham, DonHang, ...
│   └── Enums/               # VaiTro, TrangThaiDonHang, PhuongThucThanhToan, ...
├── SnackShop.Application/
│   ├── DTOs/                # Request/Response theo từng module
│   ├── Interfaces/          # IAuthService, IDonHangService, IAppDbContext, ...
│   ├── Services/            # Logic nghiệp vụ
│   ├── Validators/
│   ├── Mappings/            # AutoMapper Profile
│   └── Common/              # AppException, PagedResult<T>
├── SnackShop.Infrastructure/
│   ├── Persistence/
│   │   ├── AppDbContext.cs
│   │   ├── Configurations/  # IEntityTypeConfiguration<T> cho từng bảng
│   │   ├── Converters/      # Enum <-> chuỗi snake_case
│   │   └── Interceptors/    # Gán @nguoi_thuc_hien
│   └── Security/            # JwtTokenService, PasswordHasher
└── SnackShop.API/
    ├── Controllers/
    ├── Middlewares/         # ExceptionHandlingMiddleware
    ├── Program.cs
    └── appsettings.json
```

---

## 3. Domain

### 3.1. Enum

Giá trị trong DB là chuỗi snake_case (`cho_xac_nhan`...), trong C# dùng PascalCase.

```csharp
public enum VaiTro { Admin, NhanVien, KhachHang }                 // admin, nhan_vien, khach_hang
public enum TrangThaiNguoiDung { HoatDong, NgungHoatDong }        // hoat_dong, ngung_hoat_dong
public enum TrangThaiSanPham { DangBan, NgungBan }                // dang_ban, ngung_ban
public enum LoaiGiamGia { PhanTram, SoTien }                      // phan_tram, so_tien
public enum PhuongThucThanhToan { Cod, ChuyenKhoan, ViDienTu, The }   // cod, chuyen_khoan, vi_dien_tu, the
public enum TrangThaiThanhToan { ChuaThanhToan, DaThanhToan, DaHoanTien }
public enum TrangThaiDonHang { ChoXacNhan, DaXacNhan, DangGiao, DaGiao, DaHuy }
```

### 3.2. Entity

Mỗi bảng một class, khóa chính kiểu `Guid` (Pomelo tự ánh xạ sang `char(36)`; ép `varchar(36)` trong configuration). Ví dụ:

```csharp
public class NguoiDung
{
    public Guid MaNguoiDung { get; set; }
    public string HoLot { get; set; } = null!;
    public string Ten { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? SoDienThoai { get; set; }
    public string MatKhau { get; set; } = null!;
    public string? DiaChi { get; set; }
    public VaiTro VaiTro { get; set; } = VaiTro.KhachHang;
    public TrangThaiNguoiDung TrangThai { get; set; } = TrangThaiNguoiDung.HoatDong;
    public DateTime NgayTao { get; set; }
    public DateTime NgayCapNhat { get; set; }

    public NhanVien? NhanVien { get; set; }
    public KhachHang? KhachHang { get; set; }
}

public class NhanVien
{
    public Guid MaNguoiDung { get; set; }      // PK + FK
    public decimal MucLuong { get; set; }
    public DateOnly? NgayVaoLam { get; set; }
    public NguoiDung NguoiDung { get; set; } = null!;
}

public class DonHang
{
    public Guid MaDonHang { get; set; }
    public string MaCode { get; set; } = null!;
    public Guid MaKhachHang { get; set; }
    public Guid? MaCtkm { get; set; }
    public string TenNguoiNhan { get; set; } = null!;
    public string SdtNguoiNhan { get; set; } = null!;
    public string DiaChiGiaoHang { get; set; } = null!;
    public string? GhiChu { get; set; }
    public decimal PhiVanChuyen { get; set; }
    public decimal TienHang { get; set; }                 // do trigger tính
    public decimal TienGiamGia { get; set; }              // do backend tính
    public decimal TongTienThanhToan { get; set; }        // generated column
    public PhuongThucThanhToan PhuongThucThanhToan { get; set; }
    public TrangThaiThanhToan TrangThaiThanhToan { get; set; }
    public TrangThaiDonHang TrangThaiDonHang { get; set; }
    public DateTime NgayTao { get; set; }

    public KhachHang KhachHang { get; set; } = null!;
    public ChuongTrinhKhuyenMai? Ctkm { get; set; }
    public ICollection<ChiTietDonHang> ChiTiets { get; set; } = new List<ChiTietDonHang>();
    public ICollection<LichSuDonHang> LichSus { get; set; } = new List<LichSuDonHang>();
    public HoaDon? HoaDon { get; set; }
}
```

Danh sách entity cần có (khớp 21 bảng trong SQL): `NguoiDung`, `NhanVien`, `KhachHang`, `ThongBao`, `NhaCungCap`, `LoaiSanPham` (có `MaLoaiCha`, `LoaiCha`, `LoaiCons`), `SanPham`, `HinhAnhSanPham`, `DonNhapHang`, `ChiTietNhapHang` (khóa kép), `ChiTietGioHang`, `ChuongTrinhKhuyenMai`, `KhuyenMaiTheoSanPham` (khóa kép), `KhuyenMaiTheoHoaDon`, `KhuyenMaiTheoVoucher`, `DonHang`, `ChiTietDonHang`, `HoaDon`, `LichSuDonHang`, `DanhGiaSanPham`.

Quan hệ 1–1 / kế thừa:
- `NguoiDung 1 — 0..1 NhanVien / KhachHang` (dùng chung khóa `MaNguoiDung`).
- `ChuongTrinhKhuyenMai 1 — 0..1` mỗi bảng con `KhuyenMaiTheoHoaDon`, `KhuyenMaiTheoVoucher`; `1 — n KhuyenMaiTheoSanPham`.
- `DonHang 1 — 0..1 HoaDon`; `ChiTietDonHang 1 — 0..1 DanhGiaSanPham`.

---

## 4. Infrastructure – ánh xạ EF Core với DB có sẵn

### 4.1. Converter enum ⇄ snake_case

```csharp
public class SnakeCaseEnumConverter<T> : ValueConverter<T, string> where T : struct, Enum
{
    public SnakeCaseEnumConverter() : base(v => ToSnake(v.ToString()), s => Parse(s)) { }

    private static string ToSnake(string s) =>
        string.Concat(s.Select((c, i) => i > 0 && char.IsUpper(c) ? "_" + char.ToLower(c) : char.ToLower(c).ToString()));

    private static T Parse(string s) =>
        Enum.Parse<T>(string.Concat(s.Split('_').Select(p => char.ToUpper(p[0]) + p[1..])));
}
```

Đăng ký cho từng cột enum: `.HasConversion(new SnakeCaseEnumConverter<TrangThaiDonHang>())`.

### 4.2. Cột sinh tự động & cột do trigger cập nhật

EF **không được ghi** các cột này, nếu không MySQL báo lỗi (generated column) hoặc ghi đè kết quả trigger:

```csharp
// DonHang
b.Property(x => x.TongTienThanhToan).ValueGeneratedOnAddOrUpdate().Metadata
 .SetAfterSaveBehavior(PropertySaveBehavior.Ignore);
b.Property(x => x.TongTienThanhToan).Metadata.SetBeforeSaveBehavior(PropertySaveBehavior.Ignore);

// ChiTietDonHang.ThanhTien, ChiTietNhapHang.ThanhTien: cấu hình tương tự (generated)

// Cột trigger tự cập nhật: không cho EF ghi sau khi insert
b.Property(x => x.TienHang).Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);   // DonHang.TienHang
b.Property(x => x.TongTien).Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);   // DonNhapHang.TongTien
b.Property(x => x.SoLuongTon).Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore); // SanPham.SoLuongTon
b.Property(x => x.SoLuotDaDung).Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore); // Voucher
```

Với `NgayTao`, `NgayCapNhat` có `DEFAULT CURRENT_TIMESTAMP`: dùng `ValueGeneratedOnAdd()` (và `OnAddOrUpdate` cho `NgayCapNhat`).

### 4.3. Khóa kép và quan hệ tự tham chiếu

```csharp
b.HasKey(x => new { x.MaDonNhap, x.MaSanPham });                 // ChiTietNhapHang
b.HasKey(x => new { x.MaCtkm, x.MaSanPham });                    // KhuyenMaiTheoSanPham

// LoaiSanPham cha - con
b.HasOne(x => x.LoaiCha).WithMany(x => x.LoaiCons)
 .HasForeignKey(x => x.MaLoaiCha).OnDelete(DeleteBehavior.SetNull);
```

### 4.4. Gán `@nguoi_thuc_hien` cho trigger (QUAN TRỌNG)

Trigger `trg_don_hang_ai` / `trg_don_hang_au` ghi `lich_su_don_hang.nguoi_thuc_hien = @nguoi_thuc_hien`. Biến session này chỉ sống trong **cùng một kết nối**, nên phải đặt ngay trước khi `SaveChanges` trên kết nối đó. Cách gọn nhất là interceptor:

```csharp
public class NguoiThucHienInterceptor : DbCommandInterceptor
{
    private readonly ICurrentUser _user;
    public NguoiThucHienInterceptor(ICurrentUser user) => _user = user;

    public override InterceptionResult<DbDataReader> ReaderExecuting(
        DbCommand cmd, CommandEventData e, InterceptionResult<DbDataReader> r)
    {
        if (cmd.CommandText.TrimStart().StartsWith("INSERT INTO `don_hang`") ||
            cmd.CommandText.TrimStart().StartsWith("UPDATE `don_hang`"))
        {
            var set = cmd.Connection!.CreateCommand();
            set.Transaction = cmd.Transaction;
            set.CommandText = $"SET @nguoi_thuc_hien = {(_user.Id is null ? "NULL" : $"'{_user.Id}'")}";
            set.ExecuteNonQuery();
        }
        return r;
    }
}
```

Phương án đơn giản hơn nếu thấy interceptor rắc rối: trong service mở transaction rồi chạy `ExecuteSqlRawAsync("SET @nguoi_thuc_hien = {0}", userId)` **trước** khi `SaveChangesAsync()` (cùng transaction → cùng kết nối).

---

## 5. Quy tắc nghiệp vụ: việc nào do DB, việc nào do backend

DB đã có trigger, backend **không làm lại** những việc này (làm lại sẽ bị cộng/trừ hai lần).

| Việc | Ai làm |
|---|---|
| Cộng tồn kho khi nhập hàng, tính `don_nhap_hang.tong_tien` | **Trigger** |
| Kiểm tra tồn kho, trừ tồn khi thêm `chi_tiet_don_hang` | **Trigger** (ném `SQLSTATE 45000`) |
| Tính `don_hang.tien_hang`, `tong_tien_thanh_toan` | **Trigger / generated column** |
| Ghi `lich_su_don_hang`, gửi `thong_bao` khi tạo/đổi trạng thái đơn | **Trigger** |
| Hoàn tồn kho + trả lượt voucher khi hủy đơn | **Trigger** |
| Chặn khôi phục đơn đã hủy; chặn xuất hóa đơn đơn đã hủy | **Trigger** |
| Chỉ đánh giá khi đơn đã giao, đúng sản phẩm/khách | **Trigger** |
| Tăng `so_luot_da_dung` voucher, kiểm tra hạn/giới hạn voucher | **Trigger** |
| **Tính `tien_giam_gia`** (khuyến mãi sản phẩm / hóa đơn / voucher) | **Backend** |
| Kiểm tra `gia_tri_don_toi_thieu`, `giam_toi_da` của khuyến mãi | **Backend** (trigger không kiểm) |
| Tính `phi_van_chuyen` | **Backend** |
| Sinh `ma_code` đơn hàng (`DH` + yyyyMMdd + số thứ tự) và `so_hoa_don` | **Backend** |
| Kiểm tra luồng chuyển trạng thái hợp lệ | **Backend** |
| Phân quyền theo vai trò | **Backend** |
| Xóa giỏ hàng sau khi đặt hàng thành công | **Backend** |

### 5.1. Luồng trạng thái đơn hàng

```
cho_xac_nhan → da_xac_nhan → dang_giao → da_giao
      └──────────────┴────────┐
                              └→ da_huy   (chỉ được hủy khi chưa sang dang_giao)
```

```csharp
private static readonly Dictionary<TrangThaiDonHang, TrangThaiDonHang[]> Next = new()
{
    [TrangThaiDonHang.ChoXacNhan] = new[] { TrangThaiDonHang.DaXacNhan, TrangThaiDonHang.DaHuy },
    [TrangThaiDonHang.DaXacNhan]  = new[] { TrangThaiDonHang.DangGiao,  TrangThaiDonHang.DaHuy },
    [TrangThaiDonHang.DangGiao]   = new[] { TrangThaiDonHang.DaGiao },
    [TrangThaiDonHang.DaGiao]     = Array.Empty<TrangThaiDonHang>(),
    [TrangThaiDonHang.DaHuy]      = Array.Empty<TrangThaiDonHang>(),
};
```

Khi chuyển sang `da_giao` với COD, đồng thời đặt `TrangThaiThanhToan = DaThanhToan` (giống dữ liệu mẫu).

### 5.2. Tính giảm giá

1. **Theo sản phẩm** (`khuyen_mai_theo_san_pham`): chương trình còn hiệu lực → giảm `phan_tram` hoặc `so_tien` trên từng dòng. Nếu áp dụng thì lưu `don_gia` đã giảm vào `chi_tiet_don_hang` (vì `thanh_tien = so_luong * don_gia`).
2. **Theo hóa đơn** (`khuyen_mai_theo_hoa_don`): `tien_hang >= gia_tri_don_toi_thieu` → giảm theo loại; nếu `phan_tram` thì không vượt `giam_toi_da`.
3. **Voucher**: khách nhập `ma_code` → tìm `khuyen_mai_theo_voucher` → lấy `ma_ctkm` gán vào `don_hang.ma_ctkm`; kiểm tra `gia_tri_don_toi_thieu`, cắt theo `giam_toi_da`. Hết lượt/quá giới hạn mỗi khách thì trigger sẽ báo lỗi, backend chỉ cần dịch lỗi ra thông báo.
4. Mỗi đơn hàng chỉ có **một** `ma_ctkm` (hóa đơn **hoặc** voucher).

> **Lưu ý:** trigger `trg_hoa_don_bi` đặt `hoa_don.tong_tien = SUM(thanh_tien)` (chưa tính phí ship và giảm giá), trong khi số tiền khách phải trả là `don_hang.tong_tien_thanh_toan`. Khi hiển thị hóa đơn, dùng `tong_tien_thanh_toan` của đơn hàng cho số tiền thanh toán; `hoa_don.tong_tien` là tổng tiền hàng. Nếu muốn thống nhất, sửa trigger trong SQL.

### 5.3. Đặt hàng (checkout) – các bước

```csharp
public async Task<DonHangDto> DatHangAsync(Guid khachHangId, DatHangRequest req)
{
    await using var tx = await _db.Database.BeginTransactionAsync();

    // 1. Lấy giỏ hàng (hoặc danh sách mua ngay) + sản phẩm đang bán
    // 2. Tính tiền hàng tạm, áp khuyến mãi sản phẩm -> đơn giá
    // 3. Tính tien_giam_gia (hóa đơn / voucher), phi_van_chuyen
    // 4. SET @nguoi_thuc_hien = khachHangId
    // 5. Insert don_hang (ma_code do backend sinh)
    //    SaveChanges  -> trigger ghi lịch sử + thông báo + tăng lượt voucher
    // 6. Insert các chi_tiet_don_hang
    //    SaveChanges  -> trigger kiểm tồn, trừ tồn, cập nhật tien_hang
    // 7. Xóa các dòng chi_tiet_gio_hang tương ứng
    // 8. Commit
    // 9. Đọc lại don_hang từ DB (AsNoTracking) để lấy tien_hang, tong_tien_thanh_toan đúng

    await tx.CommitAsync();
    return dto;
}
```

Hai điều dễ sai:
- Sau khi insert chi tiết, `tien_hang` trong entity đang theo dõi (tracked) vẫn là 0 → phải **đọc lại** từ DB trước khi trả về.
- `tien_giam_gia` tính từ tổng tiền hàng **dự kiến** (backend tự cộng), vì lúc insert `don_hang` trigger chưa có chi tiết.

### 5.4. Dịch lỗi từ trigger

Trigger dùng `SIGNAL SQLSTATE '45000'` → Pomelo ném `MySqlException` có `SqlState == "45000"`. Bắt ở middleware và trả `400` với `ex.Message` (tiếng Việt, đã viết sẵn trong trigger):

```csharp
catch (DbUpdateException ex) when (ex.InnerException is MySqlException { SqlState: "45000" } my)
{
    throw new AppException(my.Message, StatusCodes.Status400BadRequest);
}
```

---

## 6. Xác thực & phân quyền

- Đăng ký → tạo `nguoi_dung` (`vai_tro = khach_hang`) **và** dòng `khach_hang` trong cùng transaction.
- Mật khẩu: `BCrypt.HashPassword`. Dữ liệu mẫu có `HASH_DEMO` nên **không đăng nhập được** – tạo lại mật khẩu bằng endpoint đăng ký hoặc chạy lệnh UPDATE với hash BCrypt thật.
- JWT claims: `sub = ma_nguoi_dung`, `email`, `role = admin | nhan_vien | khach_hang`. Hết hạn 60 phút.
- Chỉ cho đăng nhập khi `trang_thai = hoat_dong`.

| Vai trò | Quyền |
|---|---|
| Khách hàng | Xem sản phẩm; quản lý giỏ hàng, đơn hàng, thông báo, đánh giá **của chính mình** |
| Nhân viên | Xử lý đơn hàng (đổi trạng thái), lập đơn nhập, xuất hóa đơn, xem tồn kho |
| Admin | Tất cả của nhân viên + quản lý người dùng, nhân viên, sản phẩm, loại, nhà cung cấp, khuyến mãi, báo cáo |

Dùng `[Authorize(Roles = "admin,nhan_vien")]` trên controller; với dữ liệu của khách luôn lọc theo `User.FindFirst("sub")`, **không** nhận `maKhachHang` từ client.

---

## 7. Danh sách API

Tiền tố `/api`. Kết quả danh sách có phân trang `?page=1&pageSize=20`.

### Auth
| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | public | Đăng ký khách hàng |
| POST | `/auth/login` | public | Đăng nhập, trả JWT |
| GET | `/auth/me` | đăng nhập | Thông tin tài khoản |
| PUT | `/auth/me` | đăng nhập | Cập nhật hồ sơ |
| PUT | `/auth/change-password` | đăng nhập | Đổi mật khẩu |

### Danh mục & sản phẩm
| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| GET | `/loai-san-pham` | public | Cây loại sản phẩm cha–con |
| POST/PUT/DELETE | `/loai-san-pham[/{id}]` | admin | CRUD loại |
| GET | `/san-pham` | public | Lọc: `keyword`, `maLoai`, `giaTu`, `giaDen`, sắp xếp |
| GET | `/san-pham/{id}` | public | Chi tiết + ảnh + điểm trung bình + khuyến mãi đang chạy |
| POST/PUT | `/san-pham[/{id}]` | admin | Thêm / sửa (không sửa `so_luong_ton` trực tiếp) |
| PATCH | `/san-pham/{id}/trang-thai` | admin | Đổi `dang_ban` / `ngung_ban` |
| POST/DELETE | `/san-pham/{id}/hinh-anh[/{maHinh}]` | admin | Quản lý ảnh |
| GET | `/san-pham/{id}/danh-gia` | public | Đánh giá của sản phẩm |

### Giỏ hàng (khách hàng)
| Method | Route | Mô tả |
|---|---|---|
| GET | `/gio-hang` | Xem giỏ |
| POST | `/gio-hang` | Thêm `{maSanPham, soLuong}` (đã có thì cộng dồn) |
| PUT | `/gio-hang/{maGioHang}` | Đổi số lượng |
| DELETE | `/gio-hang/{maGioHang}` | Xóa dòng |

### Đơn hàng
| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| POST | `/don-hang` | khách | Đặt hàng (mục 5.3) |
| POST | `/don-hang/tinh-tam` | khách | Xem trước tiền hàng, giảm giá, tổng thanh toán |
| GET | `/don-hang/cua-toi` | khách | Danh sách đơn của mình |
| GET | `/don-hang/{id}` | khách (của mình) / NV / admin | Chi tiết + lịch sử |
| POST | `/don-hang/{id}/huy` | khách (khi `cho_xac_nhan`) | Hủy đơn |
| GET | `/don-hang` | NV, admin | Tất cả đơn, lọc theo trạng thái, ngày |
| PATCH | `/don-hang/{id}/trang-thai` | NV, admin | Chuyển trạng thái hợp lệ |
| PATCH | `/don-hang/{id}/thanh-toan` | NV, admin | Cập nhật trạng thái thanh toán |
| POST | `/don-hang/{id}/hoa-don` | NV, admin | Xuất hóa đơn (sinh `so_hoa_don`) |
| GET | `/hoa-don/{id}` | NV, admin, khách (của mình) | Xem hóa đơn |

### Đánh giá & thông báo
| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| POST | `/danh-gia` | khách | `{maChiTietDonHang, soSao, binhLuan}` (backend lấy `maSanPham`, `maKhachHang` từ chi tiết đơn) |
| GET | `/thong-bao` | đăng nhập | Thông báo của mình |
| PATCH | `/thong-bao/{id}/da-doc` | đăng nhập | Đánh dấu đã đọc |

### Khuyến mãi
| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| GET | `/khuyen-mai/dang-chay` | public | Chương trình còn hiệu lực |
| POST | `/khuyen-mai/kiem-tra-voucher` | khách | Kiểm tra `ma_code` + tổng tiền |
| POST/PUT/DELETE | `/khuyen-mai[/{id}]` | admin | CRUD chương trình + bảng con tương ứng (tạo cha và con cùng transaction) |

### Nhập hàng & nhà cung cấp (NV, admin)
| Method | Route | Mô tả |
|---|---|---|
| CRUD | `/nha-cung-cap` | Nhà cung cấp |
| POST | `/don-nhap-hang` | Tạo đơn nhập kèm danh sách chi tiết (trigger cộng tồn) |
| GET | `/don-nhap-hang[/{id}]` | Xem đơn nhập |
| GET | `/ton-kho/sap-het` | Đọc view `v_san_pham_sap_het_hang` |

> Muốn sửa/xóa chi tiết nhập sau khi đã nhập kho cũng được vì trigger đã xử lý update/delete, nhưng với đồ án nên **chỉ cho tạo mới**, không cho sửa.

### Người dùng & báo cáo (admin)
| Method | Route | Mô tả |
|---|---|---|
| GET/POST/PUT | `/nguoi-dung`, `/nhan-vien` | Quản lý tài khoản, tạo nhân viên (tạo `nguoi_dung` + `nhan_vien`) |
| PATCH | `/nguoi-dung/{id}/trang-thai` | Khóa / mở tài khoản |
| GET | `/bao-cao/doanh-thu-theo-thang` | Đọc `v_doanh_thu_theo_thang` |
| GET | `/bao-cao/san-pham-ban-chay` | Đọc `v_san_pham_ban_chay` |

### Đọc view bằng EF

```csharp
public class SanPhamBanChayView { public Guid MaSanPham {get;set;} public string TenSanPham {get;set;} = null!;
                                  public long TongSoLuongBan {get;set;} public decimal TongDoanhThu {get;set;} }

modelBuilder.Entity<SanPhamBanChayView>().HasNoKey().ToView("v_san_pham_ban_chay");
```

---

## 8. Cấu hình chạy

`appsettings.json`

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Port=3306;Database=cua_hang_do_an_vat;User=root;Password=YOUR_PASSWORD;CharSet=utf8mb4;"
  },
  "Jwt": {
    "Key": "doi-chuoi-bi-mat-dai-it-nhat-32-ky-tu",
    "Issuer": "SnackShop",
    "Audience": "SnackShopClient",
    "ExpireMinutes": 60
  }
}
```

`Program.cs` (phần chính)

```csharp
builder.Services.AddDbContext<AppDbContext>((sp, opt) =>
    opt.UseMySql(builder.Configuration.GetConnectionString("Default"),
                 ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("Default")))
       .AddInterceptors(sp.GetRequiredService<NguoiThucHienInterceptor>()));

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddScoped<NguoiThucHienInterceptor>();
builder.Services.AddAutoMapper(typeof(MappingProfile));
// AddAuthentication().AddJwtBearer(...), AddAuthorization(), AddCors(), AddSwaggerGen()
// các IxxxService -> AddScoped

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors(); app.UseAuthentication(); app.UseAuthorization();
app.MapControllers();
```

Định dạng lỗi thống nhất: `{ "message": "...", "status": 400 }`.

---

## 9. Thứ tự thực hiện (checklist)

1. [ ] Chạy file SQL trong MySQL Workbench, kiểm tra các view trả dữ liệu.
2. [ ] Tạo solution 4 project, cài package (mục 1).
3. [ ] Viết enum + entity (mục 3).
4. [ ] Viết `AppDbContext`, configuration từng bảng, converter enum, cấu hình cột generated/trigger (mục 4).
5. [ ] Test nhanh: `GET /san-pham` đọc được dữ liệu mẫu, enum chuyển đúng.
6. [ ] Auth: đăng ký, đăng nhập, JWT, phân quyền (mục 6).
7. [ ] Danh mục, sản phẩm, ảnh.
8. [ ] Giỏ hàng.
9. [ ] Khuyến mãi + tính giảm giá (mục 5.2).
10. [ ] Đặt hàng, hủy đơn, đổi trạng thái, interceptor `@nguoi_thuc_hien` (mục 4.4, 5.1, 5.3).
11. [ ] Hóa đơn, đánh giá, thông báo.
12. [ ] Nhập hàng, nhà cung cấp, tồn kho.
13. [ ] Báo cáo (đọc view), quản lý người dùng.
14. [ ] Middleware lỗi (dịch lỗi trigger `45000`), Swagger, kiểm thử các kịch bản:
    - Đặt vượt tồn kho → 400 "Không đủ tồn kho…"
    - Voucher `WELCOME10` dùng lần 2 cùng khách → 400
    - Hủy đơn → tồn kho và lượt voucher được hoàn
    - Đánh giá khi đơn chưa giao → 400
    - Hủy xong không thể đổi lại trạng thái → 400

---

## 10. Lưu ý khi viết báo cáo đồ án

- Giải thích rõ **phân chia trách nhiệm**: trigger lo toàn vẹn tồn kho/tổng tiền/lịch sử, backend lo tính khuyến mãi, phân quyền, luồng trạng thái.
- Mỗi API trong mục 7 có thể ánh xạ trực tiếp vào chức năng cấp 3 của sơ đồ BFD.
