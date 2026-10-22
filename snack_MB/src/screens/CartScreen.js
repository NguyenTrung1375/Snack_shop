import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { colors, spacing, borderRadius } from '../constants/theme';
import { DEFAULT_SNACK_IMAGE } from '../constants/snackImages';
import { getCart, updateCartItem, removeFromCart } from '../api/cart';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const FREESHIP_THRESHOLD = 200000;

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Voucher state
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherInput, setVoucherInput] = useState('');

  const { token } = useAuthStore();
  const { setCartItems, fetchCart } = useCartStore();

  const formatVnd = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const loadCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getCart();
      const list = Array.isArray(data) ? data : [];
      setItems(list);
      setCartItems(list);
      // Select all by default
      setSelectedIds(new Set(list.map((i) => i.maGioHang)));
    } catch (err) {
      console.warn('Lỗi tải giỏ hàng:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, setCartItems]);

  useEffect(() => {
    loadCart();
    const unsubscribe = navigation.addListener('focus', () => {
      loadCart();
    });
    return unsubscribe;
  }, [navigation, loadCart]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCart();
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.maGioHang)));
    }
  };

  const handleUpdateQty = async (item, delta) => {
    const nextQty = item.soLuong + delta;
    if (nextQty <= 0) {
      handleRemove(item);
      return;
    }

    try {
      setUpdatingId(item.maGioHang);
      // Optimistic update
      const updated = items.map((i) =>
        i.maGioHang === item.maGioHang
          ? { ...i, soLuong: nextQty, thanhTien: i.giaBan * nextQty }
          : i
      );
      setItems(updated);
      setCartItems(updated);

      await updateCartItem(item.maGioHang, nextQty);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể cập nhật số lượng';
      Alert.alert('Lỗi', msg);
      loadCart();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = (item) => {
    Alert.alert(
      'Xóa món ăn',
      `Bạn có chắc muốn xóa "${item.tenSanPham}" khỏi giỏ hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = items.filter((i) => i.maGioHang !== item.maGioHang);
              setItems(updated);
              setCartItems(updated);
              setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(item.maGioHang);
                return next;
              });
              await removeFromCart(item.maGioHang);
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa món ăn khỏi giỏ hàng');
              loadCart();
            }
          },
        },
      ]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      'Xóa các món đã chọn',
      `Bạn có chắc muốn xóa ${selectedIds.size} món khỏi giỏ hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const id of Array.from(selectedIds)) {
                await removeFromCart(id);
              }
              loadCart();
            } catch (e) {
              loadCart();
            }
          },
        },
      ]
    );
  };

  const handleApplyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã ưu đãi.');
      return;
    }
    if (code === 'SNACK30' || code === 'FREESHIP' || code === 'GIAM15K') {
      setAppliedVoucher(code);
      setVoucherInput('');
      Alert.alert('Thành công', `Đã áp dụng mã ưu đãi ${code}!`);
    } else {
      Alert.alert('Mã không hợp lệ', 'Mã giảm giá đã hết hạn hoặc không áp dụng cho đơn này.');
    }
  };

  // Calculations
  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.has(i.maGioHang)),
    [items, selectedIds]
  );

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + (item.thanhTien || item.giaBan * item.soLuong),
    0
  );

  const BASE_SHIPPING_FEE = 20000;
  const isFreeshipEligible = subtotal >= FREESHIP_THRESHOLD;
  const shippingFee = selectedItems.length > 0 ? (isFreeshipEligible ? 0 : BASE_SHIPPING_FEE) : 0;
  const shippingDiscount = isFreeshipEligible && selectedItems.length > 0 ? BASE_SHIPPING_FEE : 0;

  const voucherDiscount =
    appliedVoucher === 'SNACK30' && subtotal >= 99000
      ? 30000
      : appliedVoucher === 'GIAM15K' && subtotal >= 50000
      ? 15000
      : 0;

  const totalDiscount = voucherDiscount + shippingDiscount;
  const grandTotal = Math.max(0, subtotal + (selectedItems.length > 0 ? BASE_SHIPPING_FEE : 0) - totalDiscount);
  const remainingForFreeship = Math.max(0, FREESHIP_THRESHOLD - subtotal);
  const freeshipProgress = Math.min(1, subtotal / FREESHIP_THRESHOLD);

  if (!token) {
    return (
      <View style={styles.container}>
        <AppHeader navigation={navigation} showSearch={false} title="Giỏ hàng" />
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🔒</Text>
          <Text style={styles.emptyTitle}>Đăng nhập để xem giỏ hàng</Text>
          <Text style={styles.emptySubtitle}>
            Vui lòng đăng nhập tài khoản của bạn để đồng bộ món ngon đã chọn và nhận ưu đãi riêng!
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        navigation={navigation}
        showSearch={false}
        title="Giỏ hàng của bạn"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* 1. FREESHIP PROGRESS BAR */}
        <View style={styles.freeshipSection}>
          <View style={styles.freeshipTopRow}>
            <View style={styles.freeshipLeft}>
              <Text style={{ fontSize: 16 }}>🚚</Text>
              <Text style={styles.freeshipTitle}>Freeship đơn từ 200.000đ</Text>
            </View>
            <Text style={styles.freeshipRemaining}>
              {isFreeshipEligible ? 'Đã đủ điều kiện!' : `Thiếu ${formatVnd(remainingForFreeship)}`}
            </Text>
          </View>

          <Text style={styles.freeshipNote}>
            {isFreeshipEligible
              ? '🎉 Chúc mừng! Đơn hàng được miễn phí 15.000đ tiền ship!'
              : `Mua thêm ${formatVnd(remainingForFreeship)} để nhận voucher giảm 15.000đ phí ship!`}
          </Text>

          {/* Progress Bar Track */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(freeshipProgress * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.progressNumbersRow}>
            <Text style={styles.progressNum}>{formatVnd(subtotal)}</Text>
            <Text style={styles.progressNum}>Mốc 200k</Text>
          </View>
        </View>

        {/* 2. CART HEADER (Count & Delete Selected) */}
        <View style={styles.cartHeaderRow}>
          <TouchableOpacity
            style={styles.selectAllToggle}
            onPress={toggleSelectAll}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkboxCircle,
                selectedIds.size === items.length && items.length > 0 && styles.activeCheckbox,
              ]}
            >
              {selectedIds.size === items.length && items.length > 0 && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </View>
            <Text style={styles.cartHeaderTitle}>
              Giỏ hàng của bạn ({items.length} món)
            </Text>
          </TouchableOpacity>

          {selectedIds.size > 0 && (
            <TouchableOpacity onPress={handleDeleteSelected} activeOpacity={0.7}>
              <Text style={styles.deleteSelectedText}>
                Xóa đã chọn ({selectedIds.size})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. CART ITEMS LIST */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.centerLoadingText}>Đang kiểm tra giỏ hàng...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyCartBox}>
            <Text style={{ fontSize: 56, marginBottom: 12 }}>🛒</Text>
            <Text style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
            <Text style={styles.emptySubtitle}>
              Hàng chục món ăn vặt giòn ngon chuẩn vị Tây Ninh đang đợi bạn đó!
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'ProductsTab' })}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreBtnText}>Lên đơn ngay 🍟</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemsListWrapper}>
            {items.map((item) => {
              const isChecked = selectedIds.has(item.maGioHang);
              const isUpdating = updatingId === item.maGioHang;

              return (
                <View key={item.maGioHang} style={styles.cartItemCard}>
                  <View style={styles.cardMainRow}>
                    {/* Checkbox */}
                    <TouchableOpacity
                      style={styles.checkboxTouch}
                      onPress={() => toggleSelect(item.maGioHang)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkboxCircle,
                          isChecked && styles.activeCheckbox,
                        ]}
                      >
                        {isChecked && <Text style={styles.checkIcon}>✓</Text>}
                      </View>
                    </TouchableOpacity>

                    {/* Food Image */}
                    <View style={styles.itemImageWrapper}>
                      <Image
                        source={{
                          uri:
                            item.hinhAnhDaiDien ||
                            item.hinhAnh ||
                            DEFAULT_SNACK_IMAGE,
                        }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                      <View style={styles.itemSpiceTag}>
                        <Text style={styles.itemSpiceTagText}>Cay cay</Text>
                      </View>
                    </View>

                    {/* Details */}
                    <View style={styles.itemDetails}>
                      <View style={styles.itemTitleRow}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.tenSanPham}
                        </Text>
                        <TouchableOpacity
                          style={styles.trashBtn}
                          onPress={() => handleRemove(item)}
                          activeOpacity={0.7}
                        >
                          <Text style={{ fontSize: 16 }}>🗑️</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Variant tag */}
                      <View style={styles.variantPill}>
                        <Text style={styles.variantPillText}>
                          {item.khoiLuong ? `Khối lượng: ${item.khoiLuong}` : 'Vị: Chuẩn vị quán'}
                        </Text>
                      </View>

                      {/* Price & Stepper */}
                      <View style={styles.itemBottomRow}>
                        <Text style={styles.itemPrice}>
                          {formatVnd(item.giaBan)}
                        </Text>

                        <View style={styles.stepperWrap}>
                          <TouchableOpacity
                            style={styles.stepBtn}
                            onPress={() => handleUpdateQty(item, -1)}
                            disabled={isUpdating}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.stepBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.itemQty}>{item.soLuong}</Text>
                          <TouchableOpacity
                            style={styles.stepBtn}
                            onPress={() => handleUpdateQty(item, 1)}
                            disabled={isUpdating}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.stepBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Delivery Note */}
                  <View style={styles.itemDeliveryNote}>
                    <Text style={{ fontSize: 13, color: colors.primary }}>⚡</Text>
                    <Text style={styles.itemDeliveryText}>
                      Sẵn sàng giao siêu tốc 2H tại TP.HCM & Hà Nội
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* 4. VOUCHERS & PROMOTIONS SECTION */}
        {items.length > 0 && (
          <View style={styles.voucherSection}>
            <View style={styles.voucherHeaderRow}>
              <View style={styles.voucherHeaderLeft}>
                <Text style={{ fontSize: 18 }}>🎟️</Text>
                <Text style={styles.voucherSectionTitle}>Mã giảm giá SnackShop</Text>
              </View>
              <Text style={styles.voucherSubAction}>Chọn hoặc nhập mã</Text>
            </View>

            {/* Applied Voucher Card */}
            {appliedVoucher ? (
              <View style={styles.appliedVoucherCard}>
                <View style={styles.appliedVoucherLeft}>
                  <View style={styles.percentCircle}>
                    <Text style={{ fontSize: 14 }}>%</Text>
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.appliedCodeText}>{appliedVoucher}</Text>
                      <View style={styles.appliedTag}>
                        <Text style={styles.appliedTagText}>Đã áp dụng</Text>
                      </View>
                    </View>
                    <Text style={styles.appliedDesc}>
                      {appliedVoucher === 'SNACK30'
                        ? 'Giảm 30.000đ cho đơn hàng từ 99K'
                        : 'Ưu đãi món ngon SnackShop'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.removeVoucherBtn}
                  onPress={() => setAppliedVoucher(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeVoucherText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Input Voucher Row */}
            <View style={styles.voucherInputRow}>
              <Text style={styles.sellIcon}>🏷️</Text>
              <TextInput
                placeholder="Nhập mã ưu đãi khác..."
                placeholderTextColor={colors.textMuted}
                value={voucherInput}
                onChangeText={setVoucherInput}
                autoCapitalize="characters"
                style={styles.voucherInputField}
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyVoucher}
                activeOpacity={0.8}
              >
                <Text style={styles.applyBtnText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 5. EXPRESS 2H DELIVERY NOTE */}
        {items.length > 0 && (
          <View style={styles.expressCard}>
            <View style={styles.expressIconCircle}>
              <Text style={{ fontSize: 20 }}>🛵</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.expressTitle}>Giao Hỏa Tốc 2 Giờ</Text>
                <View style={styles.liveGreenDot} />
              </View>
              <Text style={styles.expressSub}>
                Nội thành TP.HCM & Hà Nội nhận hàng nóng giòn trong tích tắc!
              </Text>
            </View>
          </View>
        )}

        {/* 6. ORDER BILL BREAKDOWN */}
        {items.length > 0 && (
          <View style={styles.billCard}>
            <Text style={styles.billHeading}>Chi tiết thanh toán</Text>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                Tiền hàng ({selectedItems.length} món)
              </Text>
              <Text style={styles.billValue}>{formatVnd(subtotal)}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Phí vận chuyển ước tính</Text>
              {isFreeshipEligible ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13, color: colors.textMuted, textDecorationLine: 'line-through' }}>
                    {formatVnd(BASE_SHIPPING_FEE)}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#16a34a' }}>
                    0 ₫ (Freeship)
                  </Text>
                </View>
              ) : (
                <Text style={styles.billValue}>{formatVnd(shippingFee)}</Text>
              )}
            </View>

            {voucherDiscount > 0 && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: colors.primary }]}>
                  🎁 Voucher món ngon ({appliedVoucher})
                </Text>
                <Text style={[styles.billValue, { color: colors.primary }]}>
                  -{formatVnd(voucherDiscount)}
                </Text>
              </View>
            )}

            {shippingDiscount > 0 && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: colors.primary }]}>
                  🚚 Giảm phí vận chuyển (Freeship)
                </Text>
                <Text style={[styles.billValue, { color: colors.primary }]}>
                  -{formatVnd(shippingDiscount)}
                </Text>
              </View>
            )}

            <View style={styles.billDivider} />

            <View style={styles.billTotalRow}>
              <View>
                <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                {totalDiscount > 0 && (
                  <Text style={styles.savingsNote}>
                    Tiết kiệm {formatVnd(totalDiscount)} cho đơn này 🎉
                  </Text>
                )}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.totalValue}>{formatVnd(grandTotal)}</Text>
                <Text style={styles.vatNote}>(Đã bao gồm VAT)</Text>
              </View>
            </View>

            <View style={styles.packagingNote}>
              <Text style={{ fontSize: 13, marginRight: 4 }}>🛡️</Text>
              <Text style={styles.packagingText}>
                Đóng gói 3 lớp chống bể vỡ & hút chân không chuẩn vệ sinh
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 7. STICKY BOTTOM CHECKOUT BAR */}
      {items.length > 0 && (
        <View
          style={[styles.bottomCheckoutBar, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <TouchableOpacity
            style={styles.bottomSelectAll}
            onPress={toggleSelectAll}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkboxCircle,
                selectedIds.size === items.length && styles.activeCheckbox,
              ]}
            >
              {selectedIds.size === items.length && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </View>
            <View>
              <Text style={styles.bottomAllText}>Tất cả</Text>
              <Text style={styles.bottomCountText}>({selectedItems.length} món)</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomTotalCol}>
            <Text style={styles.bottomTotalLabel}>Tổng cộng:</Text>
            <Text style={styles.bottomTotalPrice}>{formatVnd(grandTotal)}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              selectedItems.length === 0 && styles.disabledCheckoutBtn,
            ]}
            onPress={() => {
              if (selectedItems.length === 0) {
                Alert.alert('Chưa chọn món', 'Vui lòng chọn ít nhất một món để thanh toán.');
                return;
              }
              navigation.navigate('Checkout', {
                selectedItems,
                subtotal,
                grandTotal,
                voucherCode: appliedVoucher,
                discount: totalDiscount,
              });
            }}
            disabled={selectedItems.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutBtnText}>Thanh toán →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  freeshipSection: {
    backgroundColor: colors.surfaceContainerLowest,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  freeshipTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  freeshipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeshipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
  },
  freeshipRemaining: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  freeshipNote: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 16,
  },
  progressTrack: {
    height: 7,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 3.5,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3.5,
  },
  progressNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressNum: {
    fontSize: 10,
    color: colors.textMuted,
  },
  cartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: 14,
    marginBottom: 8,
  },
  selectAllToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxTouch: {
    padding: 4,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
  },
  activeCheckbox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  cartHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
  },
  deleteSelectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.chiliRed,
  },
  itemsListWrapper: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  cartItemCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemImageWrapper: {
    width: 76,
    height: 76,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceContainerHigh,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemSpiceTag: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  itemSpiceTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    flex: 1,
    lineHeight: 18,
  },
  trashBtn: {
    padding: 2,
    marginLeft: 6,
  },
  variantPill: {
    backgroundColor: colors.surfaceContainerHigh,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 4,
  },
  variantPillText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  itemQty: {
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: '800',
    color: colors.onSurface,
  },
  itemDeliveryNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  itemDeliveryText: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  voucherSection: {
    backgroundColor: colors.surfaceContainerLowest,
    marginHorizontal: spacing.lg,
    marginTop: 16,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 10,
  },
  voucherHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voucherHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voucherSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.onSurface,
  },
  voucherSubAction: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  appliedVoucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondaryContainer,
    padding: 10,
    borderRadius: borderRadius.md,
  },
  appliedVoucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  percentCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 0.5,
  },
  appliedTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
  },
  appliedTagText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
  appliedDesc: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  removeVoucherBtn: {
    padding: 4,
  },
  removeVoucherText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
  },
  voucherInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    paddingHorizontal: 8,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sellIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  voucherInputField: {
    flex: 1,
    fontSize: 12,
    color: colors.onSurface,
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  expressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainerLow,
    marginHorizontal: spacing.lg,
    marginTop: 12,
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  expressIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expressTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.onSurface,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  expressSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  billCard: {
    backgroundColor: colors.surfaceContainerLowest,
    marginHorizontal: spacing.lg,
    marginTop: 14,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
  },
  billHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 2,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  billValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurface,
  },
  billDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  billTotalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
  },
  savingsNote: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  vatNote: {
    fontSize: 9,
    color: colors.textMuted,
  },
  packagingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    padding: 8,
    borderRadius: borderRadius.sm,
    marginTop: 6,
  },
  packagingText: {
    fontSize: 9,
    color: colors.textMuted,
    flex: 1,
  },
  bottomCheckoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomSelectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurface,
  },
  bottomCountText: {
    fontSize: 9,
    color: colors.textMuted,
  },
  bottomTotalCol: {
    alignItems: 'flex-end',
    marginHorizontal: 8,
  },
  bottomTotalLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  bottomTotalPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  disabledCheckoutBtn: {
    backgroundColor: colors.borderLight,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  centerBox: {
    padding: 32,
    alignItems: 'center',
  },
  centerLoadingText: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyCartBox: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
