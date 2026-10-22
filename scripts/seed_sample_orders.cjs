/**
 * Snack Shop - Mock Data Generator & Seeder Tool
 * TẠO KHÁCH HÀNG THẬT & ĐẶT HÀNG THẬT TRỰC TIẾP VÀO DATABASE QUA ASP.NET CORE API
 */

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:5000';

const SAMPLE_CUSTOMERS = [
  { hoLot: 'Nguyễn Minh', ten: 'Tuấn', sdt: '0901234561', diaChi: '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM' },
  { hoLot: 'Trần Thị', ten: 'Mai', sdt: '0912345672', diaChi: '45 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng' },
  { hoLot: 'Lê Hoàng', ten: 'Long', sdt: '0983456783', diaChi: '88 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội' },
  { hoLot: 'Phạm Thu', ten: 'Hà', sdt: '0974567894', diaChi: '102 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM' },
  { hoLot: 'Vũ Đức', ten: 'Anh', sdt: '0965678905', diaChi: '15 Trần Phú, Phường Máy Tơ, Quận Ngô Quyền, Hải Phòng' },
  { hoLot: 'Đặng Ngọc', ten: 'Ánh', sdt: '0946789016', diaChi: '36 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng' },
  { hoLot: 'Bùi Thanh', ten: 'Tùng', sdt: '0937890127', diaChi: '209 Phan Đăng Lưu, Phường 1, Quận Phú Nhuận, TP.HCM' },
  { hoLot: 'Đỗ Quỳnh', ten: 'Chi', sdt: '0928901238', diaChi: '67 Hoàng Hoa Thám, Phường Thụy Khuê, Quận Tây Hồ, Hà Nội' },
  { hoLot: 'Hồ Văn', ten: 'Khoa', sdt: '0919012349', diaChi: '14 Đại lộ Hòa Bình, Phường Tân An, Quận Ninh Kiều, Cần Thơ' },
  { hoLot: 'Ngô Bảo', ten: 'Châu', sdt: '0905123450', diaChi: '52 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM' }
];

const SAMPLE_REVIEWS = [
  { soSao: 5, binhLuan: 'Bánh tráng phơi sương dẻo ngon chuẩn vị Trảng Bàng, sốt bơ béo ngậy ăn dính thật sự!' },
  { soSao: 5, binhLuan: 'Khô gà lá chanh cay cay giòn giòn, thơm nức mũi. Đóng túi zip bạc sạch sẽ chu đáo!' },
  { soSao: 5, binhLuan: 'Cơm cháy chà bông siêu giòn rụm, sốt đậm đà cắn miếng nào đã miếng đó. Sẽ ủng hộ dài dài.' },
  { soSao: 4, binhLuan: 'Khô bò sợi mềm ngọt đậm đà, vắt thêm tí quất ăn xem bóng đá thì hết nước chấm.' },
  { soSao: 5, binhLuan: 'Giao hàng siêu tốc luôn, đồ ăn vặt bảo quản sạch sẽ và hạn sử dụng rất mới!' },
  { soSao: 5, binhLuan: 'Bánh tráng cuốn muối nhuyễn hành phi đỉnh chóp, giá hợp lý đóng gói cẩn thận.' },
  { soSao: 4, binhLuan: 'Món ăn vặt rất vừa miệng cả nhà mình ai cũng khen, chấm kèm sốt tắc bơ ăn mê ly.' },
  { soSao: 5, binhLuan: 'Đã thử nhiều nơi nhưng vị ở Snack Shop ăn cuốn nhất, 10 điểm chất lượng!' },
  { soSao: 5, binhLuan: 'Đồ ăn giòn rụm, gia vị tẩm ướp cay tê vừa vặn, chuẩn gu giới trẻ tụi mình.' }
];

async function apiRequest(endpoint, { method = 'GET', token = null, body = null } = {}) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body !== null) headers['Content-Type'] = 'application/json';

  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data };
}

async function main() {
  const isConfirmed = process.argv.includes('--confirm');
  console.log('===============================================================');
  console.log('     SNACK SHOP - ĐẶT HÀNG THẬT VÀO DATABASE (REAL ORDERS)    ');
  console.log('===============================================================');
  console.log(`Backend API: ${BASE_URL}`);
  console.log(`Chế độ: ${isConfirmed ? '🚀 XÁC NHẬN THỰC THI (LƯU VÀO DATABASE)' : '🔍 XEM TRƯỚC (PREVIEW MODE)'}`);
  console.log('---------------------------------------------------------------');

  // 1. Kiểm tra kết nối Backend
  try {
    const health = await apiRequest('/api/san-pham');
    if (!health.ok) {
      console.error(`❌ Không thể kết nối tới Backend API tại ${BASE_URL} (Status: ${health.status})`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Lỗi kết nối tới Backend API (${BASE_URL}): ${err.message}`);
    process.exit(1);
  }

  // 2. Lấy danh sách sản phẩm thực tế trong DB
  const prodsRes = await apiRequest('/api/san-pham?pageSize=100');
  const products = Array.isArray(prodsRes.data) ? prodsRes.data : (prodsRes.data?.items || []);
  if (!products || products.length === 0) {
    console.error('❌ Cơ sở dữ liệu chưa có sản phẩm nào để đặt hàng.');
    process.exit(1);
  }
  console.log(`✓ Đã kết nối cơ sở dữ liệu. Tìm thấy ${products.length} món ăn vặt sẵn sàng.`);

  // Đảm bảo kho hàng còn đủ số lượng
  try {
    await apiRequest('/api/kho-hang/nhap-toan-bo-hang?soLuong=100', { method: 'POST' });
  } catch (e) {
    // ignore
  }

  // Phân bổ 30 đơn hàng
  const targetStatuses = [
    ...Array(8).fill('cho_xac_nhan'),
    ...Array(6).fill('da_xac_nhan'),
    ...Array(6).fill('dang_giao'),
    ...Array(9).fill('da_giao'),
    'da_huy'
  ];

  if (!isConfirmed) {
    console.log('\n⚠️  BẠN ĐANG Ở CHẾ ĐỘ XEM TRƯỚC (PREVIEW MODE)');
    console.log('Hệ thống CHƯA thực hiện thao tác lưu vào database.');
    console.log('\n👉 Để thực thi lưu 10 khách hàng & 30 đơn hàng vào DB, chạy:');
    console.log('   node scripts/seed_sample_orders.cjs --confirm\n');
    return;
  }

  // XÁC NHẬN THỰC THI (LIVE RUN VÀO DATABASE)
  console.log('\n🚀 BẮT ĐẦU ĐẶT HÀNG THẬT VÀ LƯU VÀO DATABASE MYSQL...\n');

  // Đăng nhập Admin
  let adminToken = null;
  const adminLogin = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@test.vn', matKhau: '123456' }
  });
  if (adminLogin.ok && adminLogin.data?.token) {
    adminToken = adminLogin.data.token;
    console.log('✓ Đã xác thực quyền Quản trị (Admin) để cập nhật trạng thái đơn hàng.');
  }

  const timestamp = Date.now().toString().slice(-4);
  const createdCustomers = [];

  // Bước 1: Tạo và Đăng nhập 10 khách hàng thật vào MySQL
  console.log('\n--- BƯỚC 1: TẠO 10 TÀI KHOẢN KHÁCH HÀNG VÀO DATABASE ---');
  for (let i = 0; i < SAMPLE_CUSTOMERS.length; i++) {
    const cust = SAMPLE_CUSTOMERS[i];
    const email = `khachhang${i + 1}_${timestamp}@gmail.com`;
    const regRes = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        hoLot: cust.hoLot,
        ten: cust.ten,
        email: email,
        matKhau: '123456',
        soDienThoai: cust.sdt,
        diaChi: cust.diaChi
      }
    });

    let token = null;
    let userId = null;
    if (regRes.ok && regRes.data?.token) {
      token = regRes.data.token;
      userId = regRes.data.user?.id || regRes.data.user?.maNguoiDung;
    } else {
      const loginRes = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, matKhau: '123456' }
      });
      if (loginRes.ok && loginRes.data?.token) {
        token = loginRes.data.token;
        userId = loginRes.data.user?.id;
      }
    }

    if (token) {
      createdCustomers.push({ ...cust, email, token, userId });
      console.log(`  [KH #${i + 1}] Đã lưu vào DB: ${cust.hoLot} ${cust.ten} (${email})`);
    }
  }

  if (createdCustomers.length === 0) {
    console.error('❌ Không thể đăng ký khách hàng vào database.');
    process.exit(1);
  }

  // Bước 2: Tạo 30 đơn hàng thật vào MySQL qua API /api/don-hang
  console.log('\n--- BƯỚC 2: TIẾN HÀNH ĐẶT 30 ĐƠN HÀNG THẬT VÀO MYSQL ---');
  let successOrdersCount = 0;
  let totalRevenue = 0;
  const reviewQueue = [];

  const paymentMethods = ['cod', 'chuyen_khoan', 'vi_dien_tu', 'the'];

  for (let i = 0; i < targetStatuses.length; i++) {
    const customer = createdCustomers[i % createdCustomers.length];
    const targetStatus = targetStatuses[i];

    // Chọn ngẫu nhiên 1 - 3 món ăn
    const numItems = 1 + (i % 3);
    const chosenProducts = [];
    const usedIndices = new Set();
    while (chosenProducts.length < numItems) {
      const idx = Math.floor(Math.random() * products.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        chosenProducts.push(products[idx]);
      }
    }

    const chiTiets = chosenProducts.map((p) => ({
      maSanPham: p.maSanPham,
      soLuong: 1 + Math.floor(Math.random() * 2)
    }));

    const pttt = paymentMethods[i % paymentMethods.length];

    const orderRes = await apiRequest('/api/don-hang', {
      method: 'POST',
      token: customer.token,
      body: {
        tenNguoiNhan: `${customer.hoLot} ${customer.ten}`,
        sdtNguoiNhan: customer.sdt,
        diaChiGiaoHang: customer.diaChi,
        ghiChu: `Đơn hàng tự động #${i + 1}`,
        phuongThucThanhToan: pttt,
        chiTiets: chiTiets
      }
    });

    if (orderRes.ok && orderRes.data?.maDonHang) {
      const order = orderRes.data;
      successOrdersCount++;
      totalRevenue += (order.tongTienThanhToan || 0);

      // Cập nhật trạng thái đơn hàng trên MySQL nếu khác 'cho_xac_nhan'
      if (adminToken && targetStatus !== 'cho_xac_nhan') {
        if (targetStatus === 'da_huy') {
          await apiRequest(`/api/don-hang/${order.maDonHang}/huy`, {
            method: 'POST',
            token: customer.token,
            body: { lyDoHuy: 'Khách hàng đổi ý muốn đặt món khác' }
          });
        } else {
          const flow = [];
          if (targetStatus === 'da_xac_nhan') flow.push('da_xac_nhan');
          if (targetStatus === 'dang_giao') flow.push('da_xac_nhan', 'dang_giao');
          if (targetStatus === 'da_giao') flow.push('da_xac_nhan', 'dang_giao', 'da_giao');

          for (const st of flow) {
            await apiRequest(`/api/don-hang/${order.maDonHang}/trang-thai`, {
              method: 'PATCH',
              token: adminToken,
              body: { trangThai: st, ghiChu: `Cập nhật sang ${st}` }
            });
          }

          if (targetStatus === 'da_giao') {
            await apiRequest(`/api/don-hang/${order.maDonHang}/thanh-toan`, {
              method: 'PATCH',
              token: adminToken,
              body: { trangThaiThanhToan: 'da_thanh_toan' }
            });

            // Lấy lại chi tiết đơn hàng
            const detailRes = await apiRequest(`/api/don-hang/${order.maDonHang}`, {
              method: 'GET',
              token: customer.token
            });
            const freshOrder = detailRes.ok ? detailRes.data : order;
            const items = freshOrder.chiTiets || freshOrder.ChiTiets || freshOrder.chiTietDonHangs || [];

            if (items.length > 0) {
              reviewQueue.push({
                customerToken: customer.token,
                customerName: `${customer.hoLot} ${customer.ten}`,
                maDonHang: order.maDonHang,
                chiTiet: items[0]
              });
            }
          }
        }
      }

      const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.tongTienThanhToan || 0);
      console.log(`  [Đơn #${i + 1}] Mã: #${order.maCode || order.maDonHang.slice(0, 8)} | KH: ${customer.ten} | Trạng thái: ${targetStatus.toUpperCase()} | Tổng: ${formattedTotal}`);
    } else {
      console.log(`  [Đơn #${i + 1}] ⚠️ Không tạo được đơn: ${JSON.stringify(orderRes.data)}`);
    }
  }

  // Bước 3: Tạo Đánh giá sao & nhận xét thật vào bảng danh_gia_san_pham
  console.log('\n--- BƯỚC 3: LƯU ĐÁNH GIÁ MẪU VÀO BẢNG danh_gia_san_pham ---');
  let reviewCount = 0;
  for (let j = 0; j < reviewQueue.length; j++) {
    const item = reviewQueue[j];
    const ctdhId = item.chiTiet?.maChiTietDonHang || item.chiTiet?.MaChiTietDonHang;
    const spId = item.chiTiet?.maSanPham || item.chiTiet?.MaSanPham;
    if (!ctdhId || !spId) continue;

    const sampleReview = SAMPLE_REVIEWS[j % SAMPLE_REVIEWS.length];
    const revRes = await apiRequest('/api/danh-gia', {
      method: 'POST',
      token: item.customerToken,
      body: {
        maChiTietDonHang: ctdhId,
        maSanPham: spId,
        soSao: sampleReview.soSao,
        binhLuan: sampleReview.binhLuan
      }
    });

    if (revRes.ok) {
      reviewCount++;
      console.log(`  [Đánh giá #${j + 1}] ${sampleReview.soSao}⭐ từ ${item.customerName}: "${sampleReview.binhLuan.slice(0, 45)}..."`);
    } else {
      console.log(`  [Đánh giá #${j + 1}] ⚠️ Không tạo được đánh giá: ${JSON.stringify(revRes.data)}`);
    }
  }

  console.log('\n===============================================================');
  console.log('       🎉 ĐÃ LƯU THÀNH CÔNG VÀO DATABASE MYSQL (snack_shop)!   ');
  console.log('===============================================================');
  console.log(`✓ Khách hàng đã lưu bảng nguoi_dung & khach_hang : ${createdCustomers.length}/10`);
  console.log(`✓ Đơn hàng đã lưu bảng don_hang & chi_tiet       : ${successOrdersCount}/30`);
  console.log(`✓ Tổng giá trị đơn hàng thực tế                 : ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}`);
  console.log(`✓ Đánh giá đã lưu bảng danh_gia_san_pham        : ${reviewCount} đánh giá (4-5⭐)`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('Lỗi thực thi:', err);
});

