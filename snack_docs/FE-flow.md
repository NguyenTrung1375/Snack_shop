# System Design – SnackShop Frontend (`snack_FE`)

> Bước 1 của flow: **Chọn system design** → khóa token & luật → dựng skeleton → implement & audit.
> Tài liệu này bám theo `TONG_QUAN_CHUC_NANG.md` của `snack_BE` (.NET 8, JWT, 4 vai trò).

---

## 1. Mục tiêu & phạm vi

Một ứng dụng web duy nhất (SPA) phục vụ **3 nhóm người dùng**:

| Khu vực | Vai trò | Mục đích |
|---|---|---|
| **Storefront** (công khai + khách) | khách vãng lai, `khach_hang` | Xem/mua đồ ăn vặt (khô gà, bánh tráng, khô mực, khô bò, cơm cháy…) |
| **Back-office vận hành** | `nhan_vien`, `quan_ly` | Xử lý đơn, hóa đơn; quản lý sản phẩm, khuyến mãi, kho, báo cáo (chỉ `quan_ly`) |
| **Admin** | `admin` | Quản trị tài khoản & hồ sơ nhân viên |

Ngoài phạm vi: mobile app (`snack_MB`), thanh toán online thật, realtime (WebSocket).

## 2. Stack

| Hạng mục | Lựa chọn | Lý do |
|---|---|---|
| Build | **Vite** + React 18 | Khởi động nhanh, cấu hình ít |
| Ngôn ngữ | JavaScript (JSX) | Theo yêu cầu; có thể nâng lên TS sau |
| UI | **Ant Design 5** (`ConfigProvider` + design token) | Table/Form/Modal/Upload dựng sẵn, rất hợp trang quản trị |
| Routing | React Router v6 (data router) | Guard theo vai trò, lazy load theo khu vực |
| Server state | **TanStack Query** | Cache, phân trang, invalidate sau mutation |
| Client state | **Zustand** (auth, giỏ UI nhẹ) | Đơn giản hơn Redux cho đồ án |
| HTTP | **Axios** (1 instance + interceptor) | Gắn token, xử lý 401/403 tập trung |
| Form | Ant Design `Form` (+ rule tự viết) | Không thêm thư viện |
| Ngày/tiền | `dayjs`, `Intl.NumberFormat('vi-VN')` | Định dạng VND, ngày Việt |
| Lint/format | ESLint + Prettier | Phục vụ bước audit |

> Quyết định mở: dùng Zustand hay chỉ React Context + TanStack Query (xem mục 12).

## 3. Kiến trúc tổng thể

```
┌─────────────────────────── Browser (SPA) ───────────────────────────┐
│  Pages (route-level)                                                │
│     │ dùng                                                          │
│  Features (auth, catalog, cart, orders, ...)                        │
│     │  hooks (useXxxQuery / useXxxMutation)                         │
│  Shared (apiClient, components, utils, constants)                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS + Bearer JWT
                      snack_BE  /api/...  (ASP.NET Core)
```

Nguyên tắc phân tầng (một chiều, từ trên xuống):

1. **Page** chỉ ghép layout + component của feature, không gọi axios trực tiếp.
2. **Feature** sở hữu `api.js` (hàm gọi endpoint), `hooks.js` (TanStack Query), `components/`.
3. **Shared** không import từ feature.
4. Feature **không import chéo** feature khác; nếu cần dùng chung thì đưa lên `shared/`.

## 4. Cấu trúc thư mục

```
snack_FE/
├─ index.html
├─ vite.config.js
├─ .env.development / .env.production      # VITE_API_BASE_URL
├─ src/
│  ├─ main.jsx
│  ├─ app/
│  │  ├─ App.jsx                 # providers: QueryClient, ConfigProvider, Router
│  │  ├─ router.jsx              # định nghĩa route + lazy
│  │  ├─ queryClient.js
│  │  └─ theme.js                # AntD token (đã khóa ở bước 2)
│  ├─ layouts/
│  │  ├─ StoreLayout.jsx         # header, search, giỏ, footer
│  │  ├─ BackOfficeLayout.jsx    # sider menu theo role (nhan_vien/quan_ly)
│  │  ├─ AdminLayout.jsx
│  │  └─ AuthLayout.jsx          # đăng nhập / đăng ký
│  ├─ shared/
│  │  ├─ api/
│  │  │  ├─ apiClient.js         # axios instance + interceptors
│  │  │  └─ errors.js            # chuẩn hóa lỗi từ BE
│  │  ├─ auth/
│  │  │  ├─ authStore.js         # token, user, role
│  │  │  ├─ RequireAuth.jsx      # guard đăng nhập
│  │  │  └─ RequireRole.jsx      # guard theo role
│  │  ├─ components/             # PageHeader, PriceText, StatusTag, EmptyState,
│  │  │                          # ConfirmButton, ErrorBoundary, ImageWithFallback
│  │  ├─ hooks/                  # usePagination, useDebounce, useQueryParams
│  │  ├─ constants/
│  │  │  ├─ roles.js             # ROLES = { ADMIN:'admin', QUAN_LY:'quan_ly', ... }
│  │  │  ├─ orderStatus.js       # nhãn + màu Tag + luồng chuyển trạng thái
│  │  │  └─ routes.js            # đường dẫn tập trung
│  │  └─ utils/                  # formatVnd, formatDate, buildImageUrl
│  ├─ features/
│  │  ├─ auth/                   # login, register, profile, đổi mật khẩu
│  │  ├─ catalog/                # sản phẩm, loại sản phẩm (cây), đánh giá
│  │  ├─ cart/                   # giỏ hàng
│  │  ├─ orders/                 # tạm tính, đặt hàng, danh sách, chi tiết, hủy
│  │  ├─ invoices/
│  │  ├─ promotions/             # chương trình đang chạy, voucher
│  │  ├─ inventory/              # nhà cung cấp, đơn nhập, hàng sắp hết
│  │  ├─ reports/                # doanh thu tháng, bán chạy
│  │  ├─ users/                  # người dùng, nhân viên, tạo tài khoản
│  │  ├─ notifications/
│  │  └─ reviews/
│  └─ pages/
│     ├─ store/                  # Home, ProductList, ProductDetail, Cart, Checkout,
│     │                          # MyOrders, OrderDetail, Profile, Notifications
│     ├─ auth/                   # Login, Register
│     ├─ backoffice/             # Orders, OrderDetail, Invoices, Products, Categories,
│     │                          # Promotions, Suppliers, ImportOrders, LowStock, Reports
│     ├─ admin/                  # Users, UserDetail, Employees, CreateAccount
│     └─ errors/                 # NotFound, Forbidden
```

Mỗi feature có cấu trúc đồng nhất: `api.js` · `hooks.js` · `components/` · (tùy chọn) `schema.js` cho rule form.

## 5. Routing & phân quyền

### 5.1 Bảng route

| Khu vực | Đường dẫn | Trang | Quyền |
|---|---|---|---|
| Auth | `/dang-nhap`, `/dang-ky` | Login, Register | Công khai (đã đăng nhập → chuyển hướng theo role) |
| Store | `/` | Trang chủ | Công khai |
| | `/san-pham` | Danh sách (lọc, từ khóa, khoảng giá, sắp xếp, phân trang) | Công khai |
| | `/san-pham/:id` | Chi tiết, ảnh, đánh giá, khuyến mãi | Công khai |
| | `/gio-hang` | Giỏ hàng | `khach_hang` |
| | `/thanh-toan` | Tạm tính + voucher + đặt hàng | `khach_hang` |
| | `/don-hang`, `/don-hang/:id` | Đơn của tôi, chi tiết, hóa đơn, hủy, đánh giá | `khach_hang` |
| | `/tai-khoan`, `/thong-bao` | Hồ sơ, đổi mật khẩu, thông báo | Mọi role đã đăng nhập |
| Back-office | `/van-hanh/don-hang` (+ `/:id`) | Danh sách/chi tiết/cập nhật trạng thái & thanh toán, xuất hóa đơn | `nhan_vien`, `quan_ly` |
| | `/van-hanh/hoa-don` | Tra cứu hóa đơn | `nhan_vien`, `quan_ly` |
| | `/van-hanh/san-pham`, `/van-hanh/loai-san-pham` | CRUD, trạng thái bán, ảnh | `quan_ly` |
| | `/van-hanh/khuyen-mai` | CRUD chương trình | `quan_ly` |
| | `/van-hanh/nha-cung-cap`, `/van-hanh/nhap-hang`, `/van-hanh/ton-kho` | Kho | `quan_ly` |
| | `/van-hanh/bao-cao` | Doanh thu tháng, bán chạy | `quan_ly` |
| Admin | `/admin/nguoi-dung` (+ `/:id`) | Danh sách, lọc, khóa/mở | `admin` |
| | `/admin/nhan-vien` | Danh sách/tạo/sửa nhân viên | `admin` |
| | `/admin/tao-tai-khoan` | Tạo tài khoản theo vai trò | `admin` |
| Lỗi | `/403`, `*` | Forbidden, NotFound | — |

### 5.2 Guard

- `RequireAuth`: chưa có token → `/dang-nhap?redirect=<đường dẫn cũ>`.
- `RequireRole roles={[...]}`: đã đăng nhập nhưng sai role → `/403`.
- Điều hướng sau đăng nhập: `khach_hang` → `/`, `nhan_vien`/`quan_ly` → `/van-hanh/don-hang`, `admin` → `/admin/nguoi-dung`.
- Lazy load theo khu vực (`React.lazy`) để khách không phải tải code của back-office.
- **Guard ở FE chỉ để UX**, BE vẫn là nơi quyết định quyền thật.

### 5.3 Menu theo role (từ ma trận quyền BE)

| Mục menu | nhan_vien | quan_ly | admin |
|---|:---:|:---:|:---:|
| Đơn hàng, Hóa đơn | ✓ | ✓ | — |
| Sản phẩm, Loại sản phẩm, Khuyến mãi | — | ✓ | — |
| Nhà cung cấp, Nhập hàng, Tồn kho | — | ✓ | — |
| Báo cáo | — | ✓ | — |
| Người dùng, Nhân viên, Tạo tài khoản | — | — | ✓ |

### 5.4 Điểm lệch giữa BE và UX cần FE xử lý

1. **Admin không phải super-admin**: menu Admin **không** hiện sản phẩm/kho/khuyến mãi/báo cáo (BE sẽ trả 403).
2. **Giỏ/đặt hàng**: BE cho `nhan_vien`/`admin` gọi được nhưng đó là hành vi kỹ thuật. FE chỉ hiện nút *Thêm vào giỏ / Mua* cho `khach_hang`; role khác thấy nút dẫn về khu vực của mình.
3. **Admin** chỉ có quyền *xem* đơn/hóa đơn theo ID, không có danh sách toàn bộ đơn → không đặt trang đơn hàng trong menu Admin.
4. `POST /nhan-vien`: hiện chỉ Admin được gọi (dù ý định gồm cả quản lý) → nút "Tạo nhân viên" chỉ ở khu Admin.

## 6. Xác thực & token

- Đăng nhập → BE trả JWT; lưu trong **`localStorage`** (key `snack_token`) để giữ phiên khi tải lại. Đồ án dùng cách này cho đơn giản; nêu rủi ro XSS trong báo cáo.
- `authStore` giữ: `token`, `user` (từ `/api/auth/me`), `role` (snake_case: `admin`, `quan_ly`, `nhan_vien`, `khach_hang`).
- Khởi động app: có token → gọi `/api/auth/me` để xác nhận; lỗi → xóa token.
- Request interceptor: gắn `Authorization: Bearer <token>`.
- Response interceptor:
  - `401` → xóa phiên, về `/dang-nhap` kèm `redirect`.
  - `403` → thông báo "Bạn không có quyền" (không đăng xuất).
  - Lỗi mạng / `5xx` → thông báo chung.
- Tài liệu BE **không nêu refresh token** → hết hạn là đăng nhập lại.
- Đăng xuất: xóa token + `queryClient.clear()` (tránh lộ cache sang tài khoản khác).

## 7. Lớp gọi API

- Một `apiClient` duy nhất; `baseURL` lấy từ `import.meta.env.VITE_API_BASE_URL`.
- Mỗi feature: `api.js` chỉ chứa hàm thuần (`getProducts(params)`, `createOrder(payload)`…), trả về `data` đã bóc vỏ.
- `shared/api/errors.js`: hàm `getErrorMessage(error)` chuyển lỗi từ middleware BE thành chuỗi tiếng Việt để hiển thị.
- Upload ảnh sản phẩm: `multipart/form-data` qua `Upload` của AntD (`customRequest` dùng apiClient).
- Dev: Vite proxy `/api` → backend để tránh vướng CORS; production giới hạn origin ở BE.

## 8. Quản lý state

| Loại state | Công cụ | Ví dụ |
|---|---|---|
| Dữ liệu từ server | TanStack Query | sản phẩm, đơn, giỏ, báo cáo, thông báo |
| Phiên đăng nhập | Zustand `authStore` | token, user, role |
| Bộ lọc / phân trang | **URL query string** | `/san-pham?q=kho-ga&page=2&sort=gia-asc` (chia sẻ/refresh được) |
| UI cục bộ | `useState` | modal, drawer, tab |

Quy ước query key: `['products', filters]`, `['product', id]`, `['cart']`, `['orders', 'mine', filters]`, `['orders', 'all', filters]`, `['notifications']`…

Invalidate sau mutation:

| Mutation | Làm mới |
|---|---|
| Thêm/sửa/xóa giỏ | `['cart']` |
| Đặt hàng | `['cart']`, `['orders']`, `['notifications']` |
| Hủy đơn / đổi trạng thái / thanh toán | `['order', id]`, `['orders']` |
| Xuất hóa đơn | `['order', id]`, `['invoice', ...]` |
| Tạo đơn nhập | `['import-orders']`, `['products']`, `['low-stock']` (trigger đã cộng tồn) |
| Đánh giá | `['reviews', productId]`, `['order', id]` |

## 9. Các màn hình & hành vi chính

**Storefront**
- *Trang chủ*: banner khuyến mãi đang chạy, danh mục (cây cha–con), sản phẩm bán chạy/mới.
- *Danh sách sản phẩm*: sidebar lọc (loại, khoảng giá), ô tìm kiếm có debounce, sắp xếp, phân trang phía server.
- *Chi tiết sản phẩm*: ảnh, giá, khuyến mãi, tồn kho, đánh giá, nút thêm giỏ (cộng dồn nếu đã có).
- *Giỏ hàng*: đổi số lượng, xóa mục, tổng tạm tính.
- *Thanh toán*: gọi **tạm tính** (giá, khuyến mãi, phí ship) → nhập/kiểm tra **voucher** → đặt hàng; lỗi hết tồn / voucher quá lượt hiển thị rõ (trigger BE trả lỗi).
- *Đơn của tôi*: lọc theo trạng thái, chi tiết + lịch sử, nút **Hủy** chỉ hiện khi trạng thái cho phép, nút **Đánh giá** chỉ hiện với dòng hàng của đơn `da_giao` và chưa đánh giá.

**Back-office**
- *Đơn hàng*: bảng lọc/phân trang; drawer chi tiết; nút chuyển trạng thái chỉ hiện bước hợp lệ tiếp theo; cập nhật thanh toán; **Xuất hóa đơn** chỉ khi `da_giao`.
- *Sản phẩm*: bảng + form; bật/tắt bán; upload/xóa ảnh; **không có ô sửa tồn kho** (tồn chỉ đổi qua nhập hàng/bán).
- *Khuyến mãi*: form theo loại (sản phẩm / hóa đơn / voucher), giảm % hoặc số tiền, giới hạn lượt tổng/lượt mỗi khách.
- *Kho*: nhà cung cấp, lập đơn nhập nhiều dòng (sản phẩm, số lượng, giá nhập), cảnh báo tồn `<= 20`.
- *Báo cáo*: biểu đồ doanh thu theo tháng, bảng sản phẩm bán chạy.

**Admin**: bảng người dùng (lọc từ khóa/vai trò/trạng thái, khóa/mở), form tạo tài khoản theo vai trò, quản lý hồ sơ nhân viên.

## 10. Quy ước dùng chung

- **Trạng thái đơn** (`orderStatus.js`): `cho_xac_nhan` → `da_xac_nhan` → `dang_giao` → `da_giao`; nhánh `da_huy`. **Thanh toán**: `chua_thanh_toan`, `da_thanh_toan`, `da_hoan_tien`. Mỗi giá trị có nhãn tiếng Việt + màu `Tag` cố định.
- **Tiền**: luôn qua `formatVnd()`; không tự tính tiền ở FE ngoài hiển thị, số liệu chính thức lấy từ BE.
- **Ngôn ngữ UI**: tiếng Việt; locale AntD `vi_VN`.
- **Trạng thái UI bắt buộc** cho mọi trang dữ liệu: loading (Skeleton/Spin), empty (`Empty`), lỗi (có nút thử lại).
- **Hành động nguy hiểm** (xóa, hủy, khóa tài khoản): luôn qua `Popconfirm`.
- **Đặt tên**: component `PascalCase`, hook `useXxx`, file API `api.js`, hằng số `UPPER_SNAKE`.
- **Ảnh**: dùng `ImageWithFallback` khi thiếu/hỏng ảnh sản phẩm.
- **Bảo mật**: không `dangerouslySetInnerHTML` với dữ liệu người dùng (đánh giá, tên); không log token.

## 11. Chất lượng & audit (chuẩn bị cho bước cuối)

Checklist audit sẽ dùng:
- Mọi route có guard đúng role theo bảng 5.1; không nút nào hiện ra mà BE chắc chắn từ chối.
- Mọi trang dữ liệu có đủ loading / empty / error.
- Không gọi axios trực tiếp trong page/component.
- Không hardcode màu/khoảng cách ngoài token đã khóa.
- Form có validate trước khi gửi; chặn gửi trùng (disable nút khi `isPending`).
- Responsive: storefront dùng được trên điện thoại; back-office tối thiểu ≥ 1024px.
- Bundle: khu vực back-office/admin được tách chunk.

## 12. Điểm cần xác nhận trước khi dựng skeleton

1. **Định dạng phân trang & lỗi của BE** (tên trường: `items/total/page`? `{message}` hay ProblemDetails?) → đối chiếu Swagger rồi chốt `errors.js` và `usePagination`.
2. **Điều kiện hủy đơn** cụ thể ("trạng thái cho phép") và **luồng chuyển trạng thái hợp lệ** → để FE ẩn/hiện nút đúng.
3. **Quy tắc đường dẫn ảnh** BE trả về (tuyệt đối hay tương đối) → ảnh hưởng `buildImageUrl`.
4. Zustand hay chỉ Context cho `authStore`.
5. Có cần trang "Về chúng tôi / Liên hệ" tĩnh trong storefront không.
6. Thời hạn JWT và cách xử lý hết hạn giữa chừng (hiện chỉ có đăng nhập lại).

## 13. Bước tiếp theo (skeleton)

1. `npm create vite@latest snack_FE -- --template react`, cài `antd @ant-design/icons react-router-dom @tanstack/react-query axios zustand dayjs`.
2. Dựng cây thư mục mục 4 (file rỗng/placeholder), `router.jsx` với guard, 4 layout.
3. `apiClient` + `authStore` + `RequireAuth/RequireRole` chạy được với login thật.
4. Mỗi route có một trang placeholder hiển thị tên trang và role yêu cầu.