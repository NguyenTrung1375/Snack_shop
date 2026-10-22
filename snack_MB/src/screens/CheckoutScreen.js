import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { getCart } from '../api/cart';
import { calculateTempOrder, createOrder } from '../api/orders';
import { useAuthStore } from '../store/authStore';

const BASE_SHIPPING_FEE = 20000;
const FREESHIP_THRESHOLD = 200000;

export default function CheckoutScreen({ navigation }) {
  const { user } = useAuthStore();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [tenNguoiNhan, setTenNguoiNhan] = useState(user?.hoTen || '');
  const [sdtNguoiNhan, setSdtNguoiNhan] = useState(user?.soDienThoai || '');
  const [diaChiGiaoHang, setDiaChiGiaoHang] = useState(user?.diaChi || '');
  const [ghiChu, setGhiChu] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Voucher & Calc
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const formatVnd = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const data = await getCart();
        const items = Array.isArray(data) ? data : [];
        setCartItems(items);

        if (items.length > 0) {
          runCalculation(items, null);
        }
      } catch (err) {
        console.warn('Lỗi lấy giỏ hàng checkout:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const runCalculation = async (items, voucherToApply) => {
    if (!items || items.length === 0) return;
    try {
      setCalcLoading(true);
      const sub = items.reduce(
        (sum, item) => sum + (item.thanhTien || item.giaBan * item.soLuong),
        0
      );
      const isEligible = sub >= FREESHIP_THRESHOLD;
      const actualFee = isEligible ? 0 : BASE_SHIPPING_FEE;

      const chiTiets = items.map((i) => ({
        maSanPham: i.maSanPham,
        soLuong: i.soLuong,
      }));

      const res = await calculateTempOrder({
        maVoucher: voucherToApply || undefined,
        phiVanChuyen: actualFee,
        chiTiets,
      });
      setCalcResult(res);
      if (voucherToApply) {
        setAppliedVoucher(voucherToApply);
        Alert.alert('Thành công', `Đã áp dụng mã voucher "${voucherToApply}"!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể áp dụng mã voucher này';
      Alert.alert('Voucher không hợp lệ', msg);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Nhập mã', 'Vui lòng nhập mã giảm giá');
      return;
    }
    runCalculation(cartItems, code);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    runCalculation(cartItems, null);
  };

  const handleConfirmOrder = async () => {
    if (!tenNguoiNhan.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên người nhận');
      return;
    }
    if (!sdtNguoiNhan.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại nhận hàng');
      return;
    }
    if (!diaChiGiaoHang.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ giao hàng');
      return;
    }
    if (cartItems.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Không thể tạo đơn hàng khi giỏ hàng trống');
      return;
    }

    try {
      setSubmitting(true);
      const sub = cartItems.reduce(
        (sum, item) => sum + (item.thanhTien || item.giaBan * item.soLuong),
        0
      );
      const isEligible = sub >= FREESHIP_THRESHOLD;
      const actualFee = isEligible ? 0 : BASE_SHIPPING_FEE;

      const payload = {
        tenNguoiNhan: tenNguoiNhan.trim(),
        sdtNguoiNhan: sdtNguoiNhan.trim(),
        diaChiGiaoHang: diaChiGiaoHang.trim(),
        ghiChu: ghiChu.trim() || null,
        phiVanChuyen: actualFee,
        phuongThucThanhToan: paymentMethod,
        maVoucher: appliedVoucher || undefined,
        chiTiets: cartItems.map((i) => ({
          maSanPham: i.maSanPham,
          soLuong: i.soLuong,
        })),
      };

      const result = await createOrder(payload);
      Alert.alert(
        'Đặt hàng thành công! 🎉',
        `Đơn hàng #${result.maCode || ''} của bạn đã được tiếp nhận và chuyển đến bếp.`,
        [
          {
            text: 'Theo dõi đơn hàng ➔',
            onPress: () =>
              navigation.replace('OrderTracking', {
                orderId: result.maDonHang,
                orderCode: result.maCode,
              }),
          },
        ]
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng';
      Alert.alert('Đặt hàng thất bại', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.thanhTien || item.giaBan * item.soLuong),
    0
  );
  const isFreeship = subtotal >= FREESHIP_THRESHOLD;
  const shippingFee = isFreeship ? 0 : BASE_SHIPPING_FEE;
  const discount = calcResult?.tienGiamGia || 0;
  const finalTotal =
    calcResult?.tongTienThanhToan !== undefined
      ? calcResult.tongTienThanhToan
      : Math.max(0, subtotal - discount + shippingFee);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Đang chuẩn bị trang thanh toán...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 18 }}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đặt hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: spacing.lg }}>
        {/* Recipient Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Thông tin giao hàng</Text>

          <Text style={styles.inputLabel}>Họ và tên người nhận *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ tên người nhận"
            value={tenNguoiNhan}
            onChangeText={setTenNguoiNhan}
          />

          <Text style={styles.inputLabel}>Số điện thoại nhận hàng *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            value={sdtNguoiNhan}
            onChangeText={setSdtNguoiNhan}
          />

          <Text style={styles.inputLabel}>Địa chỉ chi tiết nhận hàng *</Text>
          <TextInput
            style={[styles.input, { height: 68, textAlignVertical: 'top' }]}
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
            multiline
            value={diaChiGiaoHang}
            onChangeText={setDiaChiGiaoHang}
          />

          <Text style={styles.inputLabel}>Ghi chú cho shipper (tùy chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
            value={ghiChu}
            onChangeText={setGhiChu}
          />
        </View>

        {/* Cart Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Món ăn trong đơn ({cartItems.length})</Text>
          {cartItems.map((item) => (
            <View key={item.maGioHang} style={styles.itemRow}>
              <Image
                source={{
                  uri: item.hinhAnhDaiDien || 'https://i.ibb.co/qMdPGF85/kho-ga-la-chanh.png',
                }}
                style={styles.itemThumb}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.tenSanPham}
                </Text>
                <Text style={styles.itemSub}>
                  {formatVnd(item.giaBan)} x {item.soLuong}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {formatVnd(item.thanhTien || item.giaBan * item.soLuong)}
              </Text>
            </View>
          ))}
        </View>

        {/* Voucher Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎟️ Mã giảm giá / Voucher</Text>
          {appliedVoucher ? (
            <View style={styles.appliedVoucherBox}>
              <View>
                <Text style={styles.appliedVoucherCode}>Mã: {appliedVoucher}</Text>
                <Text style={styles.appliedVoucherSub}>
                  Tiết kiệm: -{formatVnd(discount)}
                </Text>
              </View>
              <TouchableOpacity onPress={handleRemoveVoucher}>
                <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 13 }}>Gỡ bỏ</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.voucherRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Nhập mã voucher (VD: KHAITRUONG20)"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  value={voucherCode}
                  onChangeText={setVoucherCode}
                />
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={handleApplyVoucher}
                  disabled={calcLoading}
                >
                  {calcLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.applyBtnText}>Áp dụng</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.quickVoucherChip}
                onPress={() => {
                  setVoucherCode('KHAITRUONG20');
                  runCalculation(cartItems, 'KHAITRUONG20');
                }}
              >
                <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '700' }}>
                  🎟️ Gợi ý: KHAITRUONG20 (Giảm 20% tối đa 100k)
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                  Nhấn vào đây để áp dụng ngay ➔
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💳 Phương thức thanh toán</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Text style={{ fontSize: 20, marginRight: 10 }}>💵</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentName}>Thanh toán khi nhận hàng (COD)</Text>
              <Text style={styles.paymentDesc}>Trả tiền mặt cho shipper khi nhận được món</Text>
            </View>
            <Text style={{ fontSize: 16 }}>{paymentMethod === 'cod' ? '🔘' : '⚪'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'vnpay' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod('vnpay')}
          >
            <Text style={{ fontSize: 20, marginRight: 10 }}>💳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentName}>Chuyển khoản ngân hàng / VNPAY</Text>
              <Text style={styles.paymentDesc}>Quét mã QR chuyển khoản nhanh 24/7</Text>
            </View>
            <Text style={{ fontSize: 16 }}>{paymentMethod === 'vnpay' ? '🔘' : '⚪'}</Text>
          </TouchableOpacity>
        </View>

        {/* Pricing Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧾 Chi tiết thanh toán</Text>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Tiền món ăn:</Text>
            <Text style={styles.calcValue}>{formatVnd(subtotal)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Phí vận chuyển:</Text>
            {isFreeship ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.strikethroughText}>{formatVnd(BASE_SHIPPING_FEE)}</Text>
                <Text style={styles.freeshipText}>0 ₫ (Freeship)</Text>
              </View>
            ) : (
              <Text style={styles.calcValue}>{formatVnd(BASE_SHIPPING_FEE)}</Text>
            )}
          </View>

          {isFreeship ? (
            <View style={styles.freeshipBanner}>
              <Text style={{ fontSize: 13, marginRight: 6 }}>🎉</Text>
              <Text style={styles.freeshipBannerText}>
                Đơn hàng trên 200.000đ - Đã áp dụng MIỄN PHÍ VẬN CHUYỂN
              </Text>
            </View>
          ) : (
            <View style={styles.freeshipNotice}>
              <Text style={{ fontSize: 13, marginRight: 6 }}>🚚</Text>
              <Text style={styles.freeshipNoticeText}>
                Mua thêm {formatVnd(FREESHIP_THRESHOLD - subtotal)} để được Freeship 20.000₫!
              </Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.calcRow}>
              <Text style={[styles.calcLabel, { color: '#16a34a' }]}>Giảm giá voucher:</Text>
              <Text style={[styles.calcValue, { color: '#16a34a' }]}>-{formatVnd(discount)}</Text>
            </View>
          )}
          <View style={[styles.calcRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.totalValue}>{formatVnd(finalTotal)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom Order Button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={{ fontSize: 11, color: colors.textSecondary }}>Tổng thanh toán:</Text>
          <Text style={styles.bottomTotal}>{formatVnd(finalTotal)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, submitting && { opacity: 0.6 }]}
          disabled={submitting}
          onPress={handleConfirmOrder}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmBtnText}>Đặt hàng ngay 🚀</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  itemSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  voucherRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  quickVoucherChip: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff7ed',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  appliedVoucherBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  appliedVoucherCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16a34a',
  },
  appliedVoucherSub: {
    fontSize: 11,
    color: '#15803d',
    marginTop: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#fff7ed',
  },
  paymentName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  paymentDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calcLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  strikethroughText: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  freeshipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16a34a',
  },
  freeshipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  freeshipBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
    flex: 1,
  },
  freeshipNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  freeshipNoticeText: {
    fontSize: 11,
    color: '#92400e',
    flex: 1,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    marginTop: 6,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 4,
  },
  bottomTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});

