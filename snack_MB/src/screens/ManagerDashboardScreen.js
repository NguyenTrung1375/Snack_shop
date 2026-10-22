import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, borderRadius } from '../constants/theme';
import ManagerModuleDetailModal from '../components/ManagerModuleDetailModal';
import {
  getOrders,
  getMonthlyRevenueReport,
  getTopProductsReport,
  getLowStockReport,
  getImportOrders,
  getSuppliers,
  getEmployees,
  getPromotions,
  updateOrderStatus,
} from '../api/manager';

export default function ManagerDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? Math.max(insets.top, StatusBar.currentHeight || 0) : insets.top;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real backend metrics
  const [revenueData, setRevenueData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importCount, setImportCount] = useState(0);
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [employeesList, setEmployeesList] = useState([]);
  const [latestImport, setLatestImport] = useState(null);
  const [promotionsCount, setPromotionsCount] = useState(0);

  // Urgent Order State
  const [urgentOrderState, setUrgentOrderState] = useState(null);
  const [confirmingOrder, setConfirmingOrder] = useState(false);

  // Modal Info states
  const [activeModalModule, setActiveModalModule] = useState(null);

  // Fetch real data from BE
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [ordersRes, revRes, topRes, lowStockRes, importRes, supRes, empRes, promoRes] = await Promise.allSettled([
        getOrders({ trangThaiDonHang: 'cho_xac_nhan', pageSize: 1 }),
        getMonthlyRevenueReport(),
        getTopProductsReport(1, 5),
        getLowStockReport(1, 10),
        getImportOrders(1, 10),
        getSuppliers(1, 10),
        getEmployees(1, 10),
        getPromotions(),
      ]);

      if (revRes.status === 'fulfilled' && revRes.value) {
        setRevenueData(revRes.value);
      }
      if (topRes.status === 'fulfilled' && topRes.value) {
        const items = topRes.value?.items || (Array.isArray(topRes.value) ? topRes.value : []);
        setTopProducts(items);
      }
      if (lowStockRes.status === 'fulfilled' && lowStockRes.value) {
        const count = lowStockRes.value?.totalCount || (Array.isArray(lowStockRes.value) ? lowStockRes.value.length : 0);
        setLowStockCount(count);
      }
      if (importRes.status === 'fulfilled' && importRes.value) {
        const items = importRes.value?.items || (Array.isArray(importRes.value) ? importRes.value : []);
        setImportCount(importRes.value?.totalCount || items.length || 0);
        setLatestImport(items[0] || null);
        const total = items.reduce((sum, item) => sum + (Number(item.tongTien) || 0), 0);
        setImportTotal(total);
      }
      if (supRes.status === 'fulfilled' && supRes.value) {
        const items = supRes.value?.items || (Array.isArray(supRes.value) ? supRes.value : []);
        setSuppliersCount(supRes.value?.totalCount || items.length || 0);
      }
      if (empRes.status === 'fulfilled' && empRes.value) {
        const items = empRes.value?.items || (Array.isArray(empRes.value) ? empRes.value : []);
        setEmployeesCount(empRes.value?.totalCount || items.length || 0);
        setEmployeesList(items);
      }
      if (promoRes.status === 'fulfilled' && promoRes.value) {
        const list = Array.isArray(promoRes.value) ? promoRes.value : [];
        setPromotionsCount(list.length);
      }

      if (ordersRes && ordersRes.status === 'fulfilled' && ordersRes.value) {
        const pendingItems = ordersRes.value?.items || (Array.isArray(ordersRes.value) ? ordersRes.value : []);
        if (pendingItems.length > 0) {
          const ord = pendingItems[0];
          setUrgentOrderState({
            maDonHang: ord.maDonHang,
            maCode: ord.maCode,
            khachHang: ord.tenNguoiNhan || 'Khách hàng',
            thoiGian: ord.ngayTao ? new Date(ord.ngayTao).toLocaleString('vi-VN') : 'Mới đây',
            tongTien: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ord.tongTienThanhToan || 0),
            thanhToan: ord.trangThaiThanhToan === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa thanh toán',
            trangThai: ord.trangThaiDonHang || 'cho_xac_nhan',
            monAn: ord.chiTietDonHangs?.map(c => c.tenSanPham).join(', ') || 'Đơn hàng mới',
          });
        } else {
          setUrgentOrderState(null);
        }
      }
  
    } catch (err) {
      console.warn('Lỗi khi tải dữ liệu điều hành quản lý:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Confirm Urgent Order
  const handleConfirmUrgentOrder = async () => {
    if (!urgentOrderState?.maDonHang) return;
    try {
      setConfirmingOrder(true);
      await updateOrderStatus(urgentOrderState.maDonHang, 'da_xac_nhan');
      setUrgentOrderState((prev) => prev ? ({ ...prev, trangThai: 'da_xac_nhan' }) : null);
      Alert.alert(
        'Đã Xác Nhận Đơn Hàng 🎉',
        `Đơn hàng #${urgentOrderState.maCode || urgentOrderState.maDonHang.slice(0, 8)} đã được xác nhận thành công trên cơ sở dữ liệu!`
      );
      fetchDashboardData(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng trên máy chủ';
      Alert.alert('Lỗi', msg);
    } finally {
      setConfirmingOrder(false);
    }
  };

  const formatVnd = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const latestRevenue = Array.isArray(revenueData) && revenueData.length > 0 ? revenueData[revenueData.length - 1] : null;
  const currentRevenueText = latestRevenue ? formatVnd(latestRevenue.doanhThu) : '0₫';
  const currentOrdersCount = latestRevenue ? latestRevenue.soDon : 0;
  const currentMonthLabel = latestRevenue?.thang ? `Tháng ${latestRevenue.thang}` : 'Tháng này';

  const bestSellerItem = Array.isArray(topProducts) && topProducts.length > 0 ? topProducts[0] : null;
  const bestSellerName = bestSellerItem?.tenSanPham || 'Đang cập nhật';
  const bestSellerSoldText = bestSellerItem?.tongSoLuongBan != null ? `🔥 ${bestSellerItem.tongSoLuongBan} phần` : '0 phần';

  const totalPayroll = employeesList.reduce((sum, e) => sum + (Number(e.mucLuong) || 0), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1C0B04" translucent={true} />

      {/* 1. TOP BRAND HEADER (#1C0B04) */}
      <View style={[styles.topHeader, { paddingTop: topInset + 6 }]}>
        <View style={styles.brandRow}>
          {/* Left: Return to Storefront button */}
          <TouchableOpacity
            style={styles.backStoreBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.backStoreIcon}>←</Text>
            <Text style={styles.backStoreText}>Cửa hàng</Text>
          </TouchableOpacity>

          {/* Center: Brand identity */}
          <View style={styles.brandCenter}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.brandTitle}>
                  Snack<Text style={{ color: colors.primary }}>Shop</Text>
                </Text>
                <View style={styles.managerRoleBadge}>
                  <Text style={styles.managerRoleBadgeText}>QUẢN LÝ</Text>
                </View>
              </View>
              <Text style={styles.brandSubtitle}>KHU VỰC QUẢN LÝ</Text>
            </View>
          </View>

          {/* Right: Manager Pill */}
          <View style={styles.managerPill}>
            <Text style={styles.managerPillText} numberOfLines={1}>
              {user?.ten || user?.hoTen?.split(' ').pop() || 'Quản Lý'}
            </Text>
            <View style={styles.managerAvatarCircle}>
              <Text style={{ fontSize: 10, color: '#fff' }}>👑</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDashboardData(true)}
            colors={[colors.primary]}
          />
        }
      >
        {/* 2. SUB-HEADER & SHIFT VITAL STATUS */}
        <View style={styles.subHeader}>
          <View style={styles.subHeaderTopRow}>
            <View>
              <Text style={styles.subHeaderTitle}>Trung Tâm Điều Hành</Text>
              <Text style={styles.branchSubtext}>🏪 Cửa Hàng Chi Nhánh #01 • Q.1, TP.HCM</Text>
            </View>

            <TouchableOpacity
              style={styles.refreshBtn}
              activeOpacity={0.75}
              onPress={() => fetchDashboardData(true)}
            >
              <Text style={styles.refreshBtnText}>🔄 Làm mới</Text>
            </TouchableOpacity>
          </View>

          {/* Operational Vital Pill */}
          <View style={styles.vitalPill}>
            <View style={styles.vitalPillLeft}>
              <View style={styles.pulseDot} />
              <Text style={styles.vitalPillText}>
                Ca làm việc: <Text style={{ color: '#15803d', fontWeight: '800' }}>Bình thường</Text> • Tồn kho an toàn 100%
              </Text>
            </View>
            <View style={styles.monthTag}>
              <Text style={styles.monthTagText}>10/2026</Text>
            </View>
          </View>
        </View>

        {/* 3. EXECUTIVE KPI METRICS (2x2 FLEX GRID) */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            {/* KPI 1: Real Revenue */}
            <TouchableOpacity
              style={styles.kpiCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('bao_cao')}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#ffedd5' }]}>
                  <Text style={{ fontSize: 15 }}>💵</Text>
                </View>
                <View style={styles.trendBadge}>
                  <Text style={styles.trendBadgeText}>Thực tế</Text>
                </View>
              </View>
              <Text style={styles.kpiLabel}>DOANH THU THỰC</Text>
              <Text style={styles.kpiValue}>{currentRevenueText}</Text>
              <Text style={styles.kpiSubtext}>{currentOrdersCount} đơn • {currentMonthLabel} ➔</Text>
            </TouchableOpacity>

            {/* KPI 2: Completed Orders */}
            <TouchableOpacity
              style={styles.kpiCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('don_hang')}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#fef3c7' }]}>
                  <Text style={{ fontSize: 15 }}>🛍️</Text>
                </View>
                {urgentOrderState?.trangThai === 'cho_xac_nhan' && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>1 chờ gấp</Text>
                  </View>
                )}
              </View>
              <Text style={styles.kpiLabel}>ĐƠN HOÀN THÀNH</Text>
              <Text style={styles.kpiValue}>{currentOrdersCount} <Text style={styles.kpiUnit}>đơn hàng</Text></Text>
              <Text style={[styles.kpiSubtext, { color: colors.primary, fontWeight: '700' }]}>
                {urgentOrderState?.trangThai === 'cho_xac_nhan' ? 'Cần duyệt đơn ngay ➔' : 'Đã duyệt toàn bộ ➔'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            {/* KPI 3: Best Seller */}
            <TouchableOpacity
              style={styles.kpiCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('san_pham')}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#fee2e2' }]}>
                  <Text style={{ fontSize: 15 }}>🏆</Text>
                </View>
                <View style={styles.top1Badge}>
                  <Text style={styles.top1BadgeText}>Top 1</Text>
                </View>
              </View>
              <Text style={styles.kpiLabel}>MÓN BÁN CHẠY</Text>
              <Text style={styles.kpiValue} numberOfLines={1}>{bestSellerName}</Text>
              <Text style={[styles.kpiSubtext, { color: colors.primary, fontWeight: '700' }]}>
                {bestSellerSoldText} ➔
              </Text>
            </TouchableOpacity>

            {/* KPI 4: Staff & Payroll */}
            <TouchableOpacity
              style={styles.kpiCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('nhan_vien')}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#e0e7ff' }]}>
                  <Text style={{ fontSize: 15 }}>👥</Text>
                </View>
                <View style={styles.fullShiftBadge}>
                  <Text style={styles.fullShiftBadgeText}>100% ca</Text>
                </View>
              </View>
              <Text style={styles.kpiLabel}>NHÂN SỰ & LƯƠNG</Text>
              <Text style={styles.kpiValue}>{employeesCount} <Text style={styles.kpiUnit}>nhân sự</Text></Text>
              <Text style={styles.kpiSubtext}>💰 Quỹ: {formatVnd(totalPayroll)} ➔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. LIVE OPERATIONAL ACTION CARDS (URGENT TASKS) */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={styles.liveActionDot} />
            <Text style={styles.sectionTitle}>Tác Vụ Cần Xử Lý Ngay</Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>
              {urgentOrderState?.trangThai === 'cho_xac_nhan' ? '1 Yêu Cầu Gấp' : 'Hoàn tất'}
            </Text>
          </View>
        </View>

        {/* Urgent Order Card */}
        {urgentOrderState ? (
          <View style={styles.urgentOrderCard}>
            <View style={[styles.urgentAccentBar, { backgroundColor: urgentOrderState.trangThai === 'cho_xac_nhan' ? '#f59e0b' : '#16a34a' }]} />

            <View style={styles.urgentCardBody}>
              <View style={styles.urgentTopRow}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.urgentOrderCode}>{urgentOrderState.maCode || urgentOrderState.maDonHang?.slice(0, 8)}</Text>
                    <View style={[styles.statusBadgePill, { backgroundColor: urgentOrderState.trangThai === 'cho_xac_nhan' ? '#fef3c7' : '#dcfce7' }]}>
                      <Text style={[styles.statusBadgePillText, { color: urgentOrderState.trangThai === 'cho_xac_nhan' ? '#b45309' : '#15803d' }]}>
                        {urgentOrderState.trangThai === 'cho_xac_nhan' ? 'Chờ xác nhận' : 'Đã xác nhận'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.urgentTime}>{urgentOrderState.thoiGian} • {urgentOrderState.khachHang}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.urgentAmount}>{urgentOrderState.tongTien}</Text>
                  <Text style={styles.urgentPaymentStatus}>{urgentOrderState.thanhToan}</Text>
                </View>
              </View>

              {/* Snack summary */}
              <View style={styles.snackSummaryBox}>
                <Text style={{ fontSize: 13, marginRight: 6 }}>🍱</Text>
                <Text style={styles.snackSummaryText} numberOfLines={1}>
                  {urgentOrderState.monAn}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.urgentActionRow}>
                <TouchableOpacity
                  style={styles.urgentDetailBtn}
                  activeOpacity={0.8}
                  onPress={() => setActiveModalModule('don_hang')}
                >
                  <Text style={styles.urgentDetailBtnText}>👁️ Xem danh sách đơn</Text>
                </TouchableOpacity>

                {urgentOrderState.trangThai === 'cho_xac_nhan' ? (
                  <TouchableOpacity
                    style={styles.urgentConfirmBtn}
                    activeOpacity={0.85}
                    disabled={confirmingOrder}
                    onPress={handleConfirmUrgentOrder}
                  >
                    {confirmingOrder ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.urgentConfirmBtnText}>Xác nhận & Giao ➔</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.urgentConfirmedBox}>
                    <Text style={styles.urgentConfirmedText}>✅ Đã chuyển bếp soạn</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.urgentOrderCard}
            activeOpacity={0.85}
            onPress={() => setActiveModalModule('don_hang')}
          >
            <View style={[styles.urgentAccentBar, { backgroundColor: '#16a34a' }]} />
            <View style={[styles.urgentCardBody, { paddingVertical: 18, alignItems: 'center' }]}>
              <Text style={{ fontSize: 24, marginBottom: 6 }}>✅</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#16a34a' }}>Tất cả đơn hàng đã được xử lý</Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Không có đơn hàng mới nào cần xác nhận gấp</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 5. BỘ CÔNG CỤ QUẢN TRỊ (10 MODULES FLEX GRID) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Bộ Công Cụ Quản Trị (10 Chức Năng)</Text>
          <Text style={styles.sectionSubtitle}>10 Modules</Text>
        </View>

        <View style={styles.gridContainer}>
          {/* Hàng 1: Đơn hàng & Hóa đơn */}
          <View style={styles.gridRow}>
            {/* 1. Đơn hàng */}
            <TouchableOpacity
              style={styles.moduleCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('don_hang')}
            >
              <View style={styles.moduleTopRow}>
                <View style={[styles.moduleIconBox, { backgroundColor: '#ffedd5' }]}>
                  <Text style={{ fontSize: 16 }}>📦</Text>
                </View>
                <View style={[styles.moduleBadge, { backgroundColor: urgentOrderState ? '#fef3c7' : '#dcfce7' }]}>
                  <Text style={[styles.moduleBadgeText, { color: urgentOrderState ? '#b45309' : '#15803d' }]}>
                    {urgentOrderState ? '1 Chờ' : '0 Chờ'}
                  </Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>Quản lý Đơn hàng</Text>
              <Text style={styles.moduleDesc}>Duyệt đơn & giao vận</Text>
            </TouchableOpacity>

            {/* 2. Hóa đơn */}
            <TouchableOpacity
              style={styles.moduleCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('hoa_don')}
            >
              <View style={styles.moduleTopRow}>
                <View style={[styles.moduleIconBox, { backgroundColor: '#cffafe' }]}>
                  <Text style={{ fontSize: 16 }}>🧾</Text>
                </View>
                <View style={[styles.moduleBadge, { backgroundColor: '#e0f2fe' }]}>
                  <Text style={[styles.moduleBadgeText, { color: '#0369a1' }]}>Đã xuất</Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>Tra Cứu Hóa Đơn</Text>
              <Text style={styles.moduleDesc}>Hóa đơn & quyết toán</Text>
            </TouchableOpacity>
          </View>

          {/* Hàng 2: Sản phẩm & Loại sản phẩm */}
          <View style={styles.gridRow}>
            {/* 3. Sản phẩm */}
            <TouchableOpacity
              style={styles.moduleCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('san_pham')}
            >
              <View style={styles.moduleTopRow}>
                <View style={[styles.moduleIconBox, { backgroundColor: '#ffedd5' }]}>
                  <Text style={{ fontSize: 16 }}>🍱</Text>
                </View>
                <View style={[styles.moduleBadge, { backgroundColor: '#dcfce7' }]}>
                  <Text style={[styles.moduleBadgeText, { color: '#15803d' }]}>Thực đơn</Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>Quản Lý Sản Phẩm</Text>
              <Text style={styles.moduleDesc}>Ăn vặt (Bật/Tắt bán)</Text>
            </TouchableOpacity>

            {/* 4. Loại sản phẩm */}
            <TouchableOpacity
              style={styles.moduleCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('loai_sp')}
            >
              <View style={styles.moduleTopRow}>
                <View style={[styles.moduleIconBox, { backgroundColor: '#dcfce7' }]}>
                  <Text style={{ fontSize: 16 }}>🏷️</Text>
                </View>
                <View style={[styles.moduleBadge, { backgroundColor: '#f1f5f9' }]}>
                  <Text style={[styles.moduleBadgeText, { color: '#475569' }]}>Danh mục</Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>Loại Sản Phẩm</Text>
              <Text style={styles.moduleDesc}>Phân cấp danh mục</Text>
            </TouchableOpacity>
          </View>

          {/* Hàng 3: Khuyến mãi & Nhà cung cấp */}
          <View style={styles.gridRow}>
            {/* 5. Khuyến mãi & Voucher */}
            <TouchableOpacity
              style={styles.moduleCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('khuyen_mai')}
            >
              <View style={styles.moduleTopRow}>
                <View style={[styles.moduleIconBox, { backgroundColor: '#f3e8ff' }]}>
                  <Text style={{ fontSize: 16 }}>🎁</Text>
                </View>
                <View style={[styles.moduleBadge, { backgroundColor: '#ede9fe' }]}>
                  <Text style={[styles.moduleBadgeText, { color: '#6d28d9' }]}>{promotionsCount} Mã</Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>Khuyến Mãi & Mã</Text>
              <Text style={styles.moduleDesc}>Chiến dịch & voucher</Text>
            </TouchableOpacity>

            {/* 6. Nhà cung cấp */}
            <TouchableOpacity
              style={styles.moduleCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('nha_cung_cap')}
            >
              <View style={styles.moduleTopRow}>
                <View style={[styles.moduleIconBox, { backgroundColor: '#dbeafe' }]}>
                  <Text style={{ fontSize: 16 }}>🚚</Text>
                </View>
                <View style={[styles.moduleBadge, { backgroundColor: '#eff6ff' }]}>
                  <Text style={[styles.moduleBadgeText, { color: '#1d4ed8' }]}>{suppliersCount} Đối tác</Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>Nhà Cung Cấp</Text>
              <Text style={styles.moduleDesc}>Đối tác nguồn hàng</Text>
            </TouchableOpacity>
          </View>

          {/* Hàng 4: Đơn nhập hàng & Cảnh báo kho */}
          <View style={styles.gridRow}>
            {/* 7. Đơn nhập hàng */}
            <TouchableOpacity
              style={styles.moduleCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('nhap_hang')}
            >
              <View style={styles.moduleTopRow}>
                <View style={[styles.moduleIconBox, { backgroundColor: '#e0e7ff' }]}>
                  <Text style={{ fontSize: 16 }}>📥</Text>
                </View>
                <View style={[styles.moduleBadge, { backgroundColor: '#f1f5f9' }]}>
                  <Text style={[styles.moduleBadgeText, { color: '#312e81' }]}>{importCount} Phiếu</Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>Đơn Nhập Hàng</Text>
              <Text style={styles.moduleDesc}>{formatVnd(importTotal)} tổng nhập</Text>
            </TouchableOpacity>

            {/* 8. Cảnh báo kho */}
            <TouchableOpacity
              style={styles.moduleCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('ton_kho')}
            >
              <View style={styles.moduleTopRow}>
                <View style={[styles.moduleIconBox, { backgroundColor: '#fee2e2' }]}>
                  <Text style={{ fontSize: 16 }}>⚠️</Text>
                </View>
                <View style={[styles.moduleBadge, { backgroundColor: lowStockCount > 0 ? '#fee2e2' : '#dcfce7' }]}>
                  <Text style={[styles.moduleBadgeText, { color: lowStockCount > 0 ? '#b91c1c' : '#15803d' }]}>
                    {lowStockCount > 0 ? `${lowStockCount} cảnh báo` : 'An toàn'}
                  </Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>Cảnh Báo Kho</Text>
              <Text style={styles.moduleDesc}>{lowStockCount} món dưới ngưỡng</Text>
            </TouchableOpacity>
          </View>

          {/* Hàng 5: Báo cáo thống kê & Quản lý nhân viên */}
          <View style={styles.gridRow}>
            {/* 9. Báo cáo thống kê */}
            <TouchableOpacity
              style={styles.moduleCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('bao_cao')}
            >
              <View style={styles.moduleTopRow}>
                <View style={[styles.moduleIconBox, { backgroundColor: '#ccfbf1' }]}>
                  <Text style={{ fontSize: 16 }}>📊</Text>
                </View>
                <View style={[styles.moduleBadge, { backgroundColor: '#f0fdfa' }]}>
                  <Text style={[styles.moduleBadgeText, { color: '#0f766e' }]}>Realtime</Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>Báo Cáo Thống Kê</Text>
              <Text style={styles.moduleDesc}>Doanh thu & bán chạy</Text>
            </TouchableOpacity>

            {/* 10. Quản lý nhân viên */}
            <TouchableOpacity
              style={styles.moduleCard}
              activeOpacity={0.8}
              onPress={() => setActiveModalModule('nhan_vien')}
            >
              <View style={styles.moduleTopRow}>
                <View style={[styles.moduleIconBox, { backgroundColor: '#ffe4e6' }]}>
                  <Text style={{ fontSize: 16 }}>👥</Text>
                </View>
                <View style={[styles.moduleBadge, { backgroundColor: '#fff1f2' }]}>
                  <Text style={[styles.moduleBadgeText, { color: '#be123c' }]}>{employeesCount} Nhân sự</Text>
                </View>
              </View>
              <Text style={styles.moduleTitle}>Quản Lý Nhân Viên</Text>
              <Text style={styles.moduleDesc}>Lương & phân quyền</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. PHIẾU NHẬP KHO GẦN NHẤT */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Phiếu Nhập Kho Gần Nhất</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveModalModule('nhap_hang')}>
            <Text style={styles.sectionLink}>Xem tất cả ({importCount}) ›</Text>
          </TouchableOpacity>
        </View>

        {latestImport ? (
          <TouchableOpacity
            style={styles.recentStockCard}
            activeOpacity={0.85}
            onPress={() => setActiveModalModule('nhap_hang')}
          >
            <View style={styles.stockTopRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.stockIconBox}>
                  <Text style={{ fontSize: 16 }}>📥</Text>
                </View>
                <View>
                  <Text style={styles.stockCode}>#{latestImport.maDonNhap?.slice(0, 8)}</Text>
                  <Text style={styles.stockPartner}>Đối tác: {latestImport.tenNhaCungCap || 'Đối tác nhập hàng'}</Text>
                </View>
              </View>
              <View style={styles.stockSuccessBadge}>
                <Text style={styles.stockSuccessBadgeText}>{latestImport.ngayNhapKho ? 'Đã Nhập Kho' : 'Mới tạo'}</Text>
              </View>
            </View>

            <View style={styles.stockDivider} />

            <View style={styles.stockInfoRow}>
              <View style={styles.stockInfoCol}>
                <Text style={styles.stockInfoLabel}>Mặt hàng</Text>
                <Text style={styles.stockInfoValue}>{latestImport.chiTiets?.length || 1} mục</Text>
              </View>
              <View style={styles.stockInfoCol}>
                <Text style={styles.stockInfoLabel}>Tổng giá trị</Text>
                <Text style={[styles.stockInfoValue, { color: colors.primary, fontWeight: '800' }]}>
                  {formatVnd(latestImport.tongTien)}
                </Text>
              </View>
              <View style={styles.stockInfoCol}>
                <Text style={styles.stockInfoLabel}>Người tạo</Text>
                <Text style={styles.stockInfoValue}>{latestImport.tenNhanVien || 'Quản lý'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.recentStockCard, { alignItems: 'center', paddingVertical: 20 }]}>
            <Text style={{ fontSize: 13, color: '#6b7280' }}>Chưa có phiếu nhập kho nào</Text>
          </View>
        )}

        {/* 7. NHÂN SỰ CA HIỆN TẠI */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Nhân Sự Ca Hiện Tại</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveModalModule('nhan_vien')}>
            <Text style={styles.onlineStatusText}>{employeesCount} Nhân sự ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.staffContainer}>
          {employeesList.length > 0 ? (
            employeesList.slice(0, 3).map((emp, index) => {
              const bgColors = ['#b91c1c', '#2563eb', '#d97706'];
              const isManager = emp.vaiTro === 'quan_ly' || emp.vaiTro === 'admin';
              const roleColor = isManager ? '#b45309' : '#1d4ed8';
              const roleBg = isManager ? '#fef3c7' : '#dbeafe';
              const roleText = emp.vaiTro === 'admin' ? 'Admin' : emp.vaiTro === 'quan_ly' ? 'Quản lý' : 'Nhân viên';
              const empName = emp.hoTen || `${emp.hoLot || ''} ${emp.ten || ''}`.trim() || 'Nhân viên';
              return (
                <View key={emp.maNguoiDung || index} style={styles.staffRow}>
                  <View style={[styles.staffAvatar, { backgroundColor: bgColors[index % bgColors.length] }]}>
                    <Text style={styles.staffAvatarText}>
                      {(emp.ten || emp.hoTen || 'NV').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.staffName}>{empName}</Text>
                      <View style={[styles.staffRolePill, { backgroundColor: roleBg }]}>
                        <Text style={[styles.staffRolePillText, { color: roleColor }]}>{roleText}</Text>
                      </View>
                    </View>
                    <Text style={styles.staffSub}>{emp.email || (emp.mucLuong ? `Lương: ${formatVnd(emp.mucLuong)}` : 'Đang hoạt động')}</Text>
                  </View>
                  <View style={styles.workingBadge}>
                    <Text style={styles.workingBadgeText}>Làm việc</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>Chưa có danh sách nhân sự</Text>
            </View>
          )}
        </View>

        {/* 8. BANNER TIÊU CHUẨN VẬN HÀNH */}
        <View style={styles.backofficeBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.backofficeBannerTag}>⚡ ĐẠT CHUẨN VẬN HÀNH</Text>
            <Text style={styles.backofficeBannerTitle}>SnackShop BackOffice v2.6</Text>
            <Text style={styles.backofficeBannerDesc}>
              Đồng bộ dữ liệu thời gian thực cùng hệ thống POS quầy & Web Admin
            </Text>
          </View>
          <View style={styles.backofficeBannerIconBox}>
            <Text style={{ fontSize: 22 }}>⚡</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* MODAL XEM CHI TIẾT 10 PHÂN HỆ QUẢN LÝ (CHUẨN WEB-APP) */}
      <ManagerModuleDetailModal
        visible={!!activeModalModule}
        moduleKey={activeModalModule}
        onClose={() => setActiveModalModule(null)}
        onOrderUpdated={() => fetchDashboardData(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f5',
  },

  // 1. TOP BRAND HEADER (#1C0B04)
  topHeader: {
    backgroundColor: '#1C0B04',
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#431407',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
  },
  backStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b140b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#431407',
    gap: 4,
  },
  backStoreIcon: {
    color: '#ffdbcf',
    fontSize: 15,
    fontWeight: '800',
  },
  backStoreText: {
    color: '#ffdbcf',
    fontSize: 11,
    fontWeight: '700',
  },
  brandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  brandTitle: {
    color: '#ffdbcf',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  managerRoleBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  managerRoleBadgeText: {
    color: '#b45309',
    fontSize: 8,
    fontWeight: '800',
  },
  brandSubtitle: {
    color: '#fd7540',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  managerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b140b',
    borderRadius: 16,
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 3,
    maxWidth: 105,
  },
  managerPillText: {
    color: '#ffdbcf',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  managerAvatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // SCROLL CONTENT
  scrollContent: {
    paddingBottom: 24,
  },

  // 2. SUB-HEADER
  subHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  subHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#211a15',
    letterSpacing: -0.3,
  },
  branchSubtext: {
    fontSize: 11,
    color: '#8e7066',
    marginTop: 2,
    fontWeight: '500',
  },
  refreshBtn: {
    backgroundColor: '#f3e6dd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5a4138',
  },
  vitalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3e6dd',
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  vitalPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    marginRight: 8,
  },
  vitalPillText: {
    fontSize: 11,
    color: '#5a4138',
    fontWeight: '600',
  },
  monthTag: {
    backgroundColor: '#f3e6dd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  monthTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5a4138',
  },

  // 3. 2x2 KPI GRID
  gridContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 6,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3e6dd',
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  trendBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
  },
  urgentBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
  },
  top1Badge: {
    backgroundColor: '#f3e6dd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  top1BadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5a4138',
  },
  fullShiftBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  fullShiftBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3730a3',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8e7066',
    letterSpacing: 0.4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#211a15',
    marginTop: 2,
  },
  kpiUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8e7066',
  },
  kpiSubtext: {
    fontSize: 10,
    color: '#8e7066',
    marginTop: 2,
  },

  // SECTION HEADERS
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#211a15',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8e7066',
  },
  sectionLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  liveActionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  pendingBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },

  // 4. URGENT ORDER CARD
  urgentOrderCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3e6dd',
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  urgentAccentBar: {
    height: 4,
    width: '100%',
  },
  urgentCardBody: {
    padding: 12,
  },
  urgentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  urgentOrderCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#211a15',
  },
  statusBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  statusBadgePillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  urgentTime: {
    fontSize: 11,
    color: '#8e7066',
    marginTop: 2,
  },
  urgentAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  urgentPaymentStatus: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '700',
    marginTop: 1,
  },
  snackSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f5',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  snackSummaryText: {
    fontSize: 11,
    color: '#5a4138',
    flex: 1,
    fontWeight: '500',
  },
  urgentActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  urgentDetailBtn: {
    backgroundColor: '#f3e6dd',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  urgentDetailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5a4138',
  },
  urgentConfirmBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  urgentConfirmBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  urgentConfirmedBox: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  urgentConfirmedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
  },

  // 5. 10-MODULE GRID
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  moduleCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3e6dd',
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  moduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  moduleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  moduleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  moduleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#211a15',
  },
  moduleDesc: {
    fontSize: 10,
    color: '#8e7066',
    marginTop: 2,
  },

  // 6. RECENT STOCK-IN CARD
  recentStockCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3e6dd',
  },
  stockTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#211a15',
  },
  stockPartner: {
    fontSize: 11,
    color: '#8e7066',
  },
  stockSuccessBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stockSuccessBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
  },
  stockDivider: {
    height: 1,
    backgroundColor: '#f3e6dd',
    marginVertical: 10,
  },
  stockInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockInfoCol: {
    alignItems: 'flex-start',
  },
  stockInfoLabel: {
    fontSize: 10,
    color: '#8e7066',
  },
  stockInfoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#211a15',
    marginTop: 2,
  },

  // 7. ACTIVE STAFF LIST
  onlineStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  staffContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3e6dd',
    gap: 10,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  staffAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  staffName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#211a15',
  },
  staffRolePill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  staffRolePillText: {
    fontSize: 8,
    fontWeight: '800',
  },
  staffSub: {
    fontSize: 10,
    color: '#8e7066',
    marginTop: 1,
  },
  workingBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  workingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },

  // 8. BACKOFFICE BANNER
  backofficeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C0B04',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ea580c',
  },
  backofficeBannerTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#f59e0b',
    letterSpacing: 0.5,
  },
  backofficeBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffdbcf',
    marginTop: 2,
  },
  backofficeBannerDesc: {
    fontSize: 10,
    color: '#ffd0be',
    marginTop: 2,
  },
  backofficeBannerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2b140b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ea580c',
  },
});

