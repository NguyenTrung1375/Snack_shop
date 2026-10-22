# KẾ HOẠCH TRIỂN KHAI: WEB-APP & MOBILE APP CHO SNACK SHOP (PHƯƠNG ÁN 1)

> **Mục tiêu:** Sao chép và nâng cấp toàn bộ thành quả từ `snack_FE` sang thư mục `Snack_WA`, phát triển thành **Web-App (Mobile-First + PWA)** hoàn chỉnh cho khách hàng, sau đó tích hợp **Capacitor** để đóng gói trực tiếp thành **Mobile App (Android APK)** chạy mượt mà trên điện thoại.

---

## 1. TỔNG QUAN KIẾN TRÚC & TIẾP CẬN

```
                                  ┌─────────────────────────────┐
                                  │   snack_BE (ASP.NET Core)   │
                                  │  RESTful API + JWT Auth     │
                                  └──────────────┬──────────────┘
                                                 │
                                                 │ HTTPS / JSON API
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Snack_WA (Web-App Core)                                   │
│  React 18 + Vite + Ant Design 5 + TanStack Query + CSS Tokens chuẩn nhận diện logo          │
│                                                                                             │
│  ┌───────────────────────────────────────────┐  ┌────────────────────────────────────────┐  │
│  │       Giao diện Desktop & Tablet          │  │       Giao diện Mobile-First           │  │
│  │  - Storefront xem món & mua sắm           │  │  - Header gọn gàng                     │  │
│  │  - Backoffice (Quản lý, Báo cáo, Đơn)     │  │  - Bottom Navigation Bar cố định đáy   │  │
│  │  - Admin (Quản trị tài khoản)             │  │  - Trải nghiệm chạm/vuốt như native app│  │
│  └───────────────────────────────────────────┘  └────────────────────────────────────────┘  │
│                                                                                             │
│  ┌───────────────────────────────────────────┐  ┌────────────────────────────────────────┐  │
│  │       Tầng PWA (Progressive Web App)      │  │     Tầng Capacitor (Mobile Wrapper)    │  │
│  │  - Web App Manifest (Icon, Tên, Màu cam)  │  │  - Đóng gói lõi React thành Native     │  │
│  │  - Service Worker (Cache, Offline base)   │  │  - Xuất file APK cài đặt lên Android   │  │
│  │  - Nút "Cài đặt ra màn hình chính"        │  │  - Mở rộng chức năng phần cứng (nếu cần│  │
│  └───────────────────────────────────────────┘  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. LỘ TRÌNH 4 GIAI ĐOẠN CHI TIẾT

### GIAI ĐOẠN 1: Sao chép & Khởi tạo môi trường `Snack_WA`
* **Mục tiêu:** Di chuyển an toàn toàn bộ source code đã tối ưu từ `snack_FE` sang `Snack_WA`, đảm bảo build độc lập thành công.
* **Các việc thực hiện:**
  1. Sao chép toàn bộ mã nguồn: `src/`, `public/`, `index.html`, `package.json`, `vite.config.js`, `.eslintrc.cjs` từ `snack_FE` sang `Snack_WA`.
  2. Đồng bộ các tài nguyên thương hiệu: `logo.png`, cấu hình favicon, tiêu đề ứng dụng *"Snack Shop - Thế Giới Ăn Vặt"*.
  3. Chạy `npm install` và kiểm tra lệnh `npm run build` trên `Snack_WA` để đảm bảo 0 lỗi biên dịch.
  4. Cấu hình biến môi trường kết nối API sang `snack_BE` (`http://localhost:5000` / `https://localhost:5001`).

---

### GIAI ĐOẠN 2: Nâng cấp trải nghiệm Mobile-First & Cấu hình PWA
* **Mục tiêu:** Biến website thành một Web-App thân thiện với người dùng di động, có thể cài ra màn hình điện thoại như ứng dụng độc lập.
* **Các việc thực hiện:**
  1. **Thanh điều hướng đáy màn hình (Bottom Navigation Bar):**
     * Tự động hiển thị khi xem trên màn hình điện thoại (`<= 768px`).
     * 5 tab chuẩn ứng dụng mua sắm:
       * 🏠 **Trang chủ:** Banner, món nổi bật, danh mục hot.
       * 🍔 **Thực đơn:** Lọc danh mục, tìm kiếm, thẻ sản phẩm tỉ lệ 3:4.
       * 🛒 **Giỏ hàng:** Có badge hiển thị số lượng món đang chọn.
       * 📦 **Đơn hàng:** Lịch sử mua hàng và trạng thái giao hàng.
       * 👤 **Tài khoản:** Đăng nhập, thông tin cá nhân.
  2. **Tối ưu thao tác Mobile:**
     * Nút bấm to bản tối thiểu 44px để dễ chạm.
     * Cuộn mượt mà (smooth scrolling), chặn zoom ngoài ý muốn trên mobile input.
  3. **Cấu hình PWA (Progressive Web App):**
     * Tạo file `manifest.webmanifest`: Khai báo icon logo các kích cỡ (192x192, 512x512), màu chủ đạo `#ea580c`, chế độ hiển thị `standalone` (toàn màn hình, không hiện thanh địa chỉ của trình duyệt).
     * Cài đặt Service Worker cơ bản để lưu cache tài nguyên tĩnh.
     * Thêm thông báo mời người dùng: *"Thêm Snack Shop vào màn hình chính để đặt món nhanh hơn"*.

---

### GIAI ĐOẠN 3: Hoàn thiện trọn vẹn luồng Web-App cho khách hàng
* **Mục tiêu:** Khách hàng có thể trải nghiệm mua sắm từ A đến Z ngay trên Web-App.
* **Các tính năng cần bổ sung:**
  1. **Trang chi tiết sản phẩm (`/san-pham/:id`):**
     * Khung ảnh tỉ lệ 3:4 sắc nét.
     * Thông tin chi tiết: Đơn vị tính, tồn kho, mô tả, đánh giá sao.
     * Bộ chọn số lượng (+ / -) và nút **"Thêm vào giỏ hàng"** / **"Mua ngay"**.
  2. **Trang giỏ hàng (`/gio-hang`):**
     * Danh sách món ăn đã chọn, cập nhật số lượng, xóa món.
     * Tạm tính tiền, ô nhập mã giảm giá (Voucher).
  3. **Trang thanh toán & đặt hàng (`/thanh-toan`):**
     * Form thông tin nhận hàng: Họ tên, Số điện thoại, Địa chỉ giao hàng, Ghi chú.
     * Chọn phương thức thanh toán (COD khi nhận hàng).
     * Gọi API `POST /api/don-hang` sang `snack_BE`.
  4. **Trang đơn hàng của tôi (`/don-hang`):**
     * Danh sách đơn hàng đã đặt với các trạng thái rõ ràng: *Chờ xác nhận, Đang chuẩn bị, Đang giao, Đã giao*.

---

### GIAI ĐOẠN 4: Đóng gói thành Mobile App (Android APK) với Capacitor
* **Mục tiêu:** Xuất ra file ứng dụng Android để cài trực tiếp lên điện thoại hoặc nộp đồ án/demo.
* **Các việc thực hiện:**
  1. Cài đặt các thư viện lõi của Capacitor vào `Snack_WA`:
     ```bash
     npm install @capacitor/core @capacitor/cli @capacitor/android
     ```
  2. Khởi tạo cấu hình ứng dụng:
     * App ID: `com.snackshop.app`
     * App Name: `Snack Shop`
     * Web Directory: `dist`
  3. Tạo dự án Android:
     ```bash
     npx cap add android
     ```
  4. Cấu hình Splash Screen (màn hình chờ) và App Icon chuẩn logo màu cam `logo.png`.
  5. Build mã nguồn và đồng bộ vào Android:
     ```bash
     npm run build
     npx cap sync
     ```
  6. Sử dụng Android Studio hoặc câu lệnh Gradle để xuất file **`app-release.apk`** hoặc **`app-debug.apk`**.

---

## 3. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

| Hạng mục | Tiêu chí đạt |
|---|---|
| **Môi trường `Snack_WA`** | Độc lập, chạy `npm run build` thành công 100%, không xung đột với `snack_FE`. |
| **Giao diện Web-App** | Responsive mượt trên màn hình điện thoại; có Bottom Navigation Bar 5 tab tiện lợi. |
| **Tính năng PWA** | Bấm *"Cài đặt ứng dụng"* trên Chrome điện thoại tạo icon logo trên màn hình chính, mở lên toàn màn hình. |
| **Nghiệp vụ mua hàng** | Khách chọn món -> Thêm giỏ -> Điền địa chỉ -> Đặt đơn thành công -> Hiện trong lịch sử đơn. |
| **Mobile App (Capacitor)** | Khởi tạo thành công thư mục `android/`, sẵn sàng build ra file APK cài đặt lên điện thoại. |

---

## 4. KẾ HOẠCH BẮT ĐẦU

Ngay khi bạn duyệt kế hoạch này, chúng ta sẽ bắt đầu thực hiện:
* **Bước 1:** Sao chép toàn bộ source code từ `snack_FE` sang `Snack_WA`.
* **Bước 2:** Cài đặt package và chạy thử nghiệm bản build đầu tiên của `Snack_WA`.

