# SnackShop Backend

## Yêu cầu
- .NET 8 SDK
- MySQL 8 + đã chạy file `snack_database.sql`

## Cấu hình
Mở `SnackShop.API/appsettings.json` và cập nhật:
- `ConnectionStrings:Default` → đặt password MySQL
- `Jwt:Key` → thay bằng chuỗi bí mật thật (ít nhất 32 ký tự)

## Chạy dự án
```bash
cd snack_BE
dotnet restore
dotnet build
dotnet run --project SnackShop.API
```

## Cấu trúc
```
SnackShop.Domain/        → Entities, Enums
SnackShop.Application/   → DTOs, Interfaces, Services, Validators, Mappings
SnackShop.Infrastructure/ → EF Core, Security
SnackShop.API/           → Controllers, Middlewares, Program.cs
```
