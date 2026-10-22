import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { getMyOrders } from '../api/orders';
import { useAuthStore } from '../store/authStore';

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuthStore();

  const formatVnd = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getMyOrders({ pageSize: 30 });
      const items = res?.items || (Array.isArray(res) ? res : []);
      setOrders(items);
    } catch (err) {
      console.warn('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'cho_xac_nhan':
        return { label: 'Chờ xác nhận', bg: '#fef3c7', color: '#b45309' };
      case 'da_xac_nhan':
      case 'dang_chuan_bi':
        return { label: 'Đã xác nhận', bg: '#dbeafe', color: '#1d4ed8' };
      case 'dang_giao':
        return { label: 'Đang giao hàng', bg: '#e0e7ff', color: '#4338ca' };
      case 'da_giao':
        return { label: 'Đã giao hàng', bg: '#dcfce7', color: '#15803d' };
      case 'da_huy':
        return { label: 'Đã hủy', bg: '#fee2e2', color: '#b91c1c' };
      default: {
        const clean = (st || '')
          .replace(/da_xac_nhan/gi, 'Đã xác nhận')
          .replace(/dang_giao/gi, 'Đang giao hàng')
          .replace(/da_giao/gi, 'Đã giao hàng')
          .replace(/da_huy/gi, 'Đã hủy')
          .replace(/cho_xac_nhan/gi, 'Chờ xác nhận');
        return { label: clean || 'Đang xử lý', bg: '#f1f5f9', color: '#475569' };
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 18 }}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && orders.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.textSecondary }}>Đang tải danh sách đơn hàng...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 56, marginBottom: 12 }}>📦</Text>
            <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
            <Text style={styles.emptySub}>
              Bạn chưa đặt đơn hàng nào tại SnackShop. Hãy chọn ngay vài món ăn vặt thơm ngon nhé!
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
            >
              <Text style={styles.primaryBtnText}>Đặt món ngay ➔</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((item) => {
            const badge = getStatusBadge(item.trangThaiDonHang);
            const dateStr = item.ngayTao ? new Date(item.ngayTao).toLocaleDateString('vi-VN') : '';
            return (
              <TouchableOpacity
                key={item.maDonHang}
                style={styles.orderCard}
                onPress={() =>
                  navigation.navigate('OrderTracking', {
                    orderId: item.maDonHang,
                    orderCode: item.maCode,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderCode}>#{item.maCode}</Text>
                    <Text style={styles.orderDate}>{dateStr}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.itemSummary}>
                    {item.chiTiets?.length ? `${item.chiTiets.length} món ăn vặt` : 'Đơn hàng ăn vặt'}
                  </Text>
                  <Text style={styles.orderTotal}>{formatVnd(item.tongTienThanhToan)}</Text>
                </View>

                <View style={styles.cardFooter}>
                  {item.trangThaiDonHang === 'da_giao' ? (
                    <TouchableOpacity
                      style={styles.reviewBtn}
                      onPress={() =>
                        navigation.navigate('OrderTracking', {
                          orderId: item.maDonHang,
                          orderCode: item.maCode,
                          autoReview: true,
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.reviewBtnText}>⭐ Đánh giá món</Text>
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )}
                  <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>
                    Xem chi tiết tiến trình ➔
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingBottom: spacing.md,
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
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderCode: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  itemSummary: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 36,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});

