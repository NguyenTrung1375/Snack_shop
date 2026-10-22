import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { getOrderDetail, getMyOrders } from '../api/orders';
import ReviewModal from '../components/ReviewModal';

export default function OrderTrackingScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const orderCode = route?.params?.orderCode;
  const autoReview = route?.params?.autoReview;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const handleOpenReview = (ct) => {
    setSelectedReviewItem({
      maChiTietDonHang: ct.maChiTietDonHang,
      maSanPham: ct.maSanPham,
      tenSanPham: ct.tenSanPham,
      hinhAnhDaiDien: ct.hinhAnhDaiDien,
    });
    setReviewModalVisible(true);
  };

  const handleReviewSuccess = () => {
    if (selectedReviewItem) {
      setOrder((prev) => {
        if (!prev || !prev.chiTiets) return prev;
        return {
          ...prev,
          chiTiets: prev.chiTiets.map((item) =>
            item.maChiTietDonHang === selectedReviewItem.maChiTietDonHang
              ? { ...item, daDanhGia: true }
              : item
          ),
        };
      });
    }
    if (orderId) {
      getOrderDetail(orderId)
        .then((fresh) => {
          if (fresh) setOrder(fresh);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (autoReview && order?.trangThaiDonHang === 'da_giao' && order?.chiTiets?.length > 0) {
      const unrated = order.chiTiets.find((ct) => !ct.daDanhGia);
      if (unrated) {
        handleOpenReview(unrated);
      }
    }
  }, [autoReview, order]);

  const formatVnd = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        if (orderId) {
          const data = await getOrderDetail(orderId);
          setOrder(data);
        } else {
          // Fallback fetch latest order
          const myOrders = await getMyOrders({ pageSize: 1 });
          const latest = myOrders?.items?.[0] || myOrders?.[0];
          if (latest) {
            setOrder(latest);
          }
        }
      } catch (err) {
        console.warn('Lỗi lấy thông tin đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, orderCode]);

  // Determine timeline steps based on order status
  const status = order?.trangThaiDonHang || 'cho_xac_nhan';
  const isCancelled = status === 'da_huy';

  const steps = [
    {
      id: '1',
      title: 'Chờ xác nhận',
      desc: 'Đơn hàng đang chờ được xác nhận',
      done: ['cho_xac_nhan', 'da_xac_nhan', 'dang_chuan_bi', 'dang_giao', 'da_giao'].includes(status),
      active: status === 'cho_xac_nhan',
    },
    {
      id: '2',
      title: 'Đã xác nhận',
      desc: 'Đơn hàng đã được xác nhận',
      done: ['da_xac_nhan', 'dang_chuan_bi', 'dang_giao', 'da_giao'].includes(status),
      active: status === 'da_xac_nhan' || status === 'dang_chuan_bi',
    },
    {
      id: '3',
      title: 'Đang giao hàng',
      desc: 'Đơn hàng đang được giao',
      done: ['dang_giao', 'da_giao'].includes(status),
      active: status === 'dang_giao',
    },
    {
      id: '4',
      title: 'Đã giao hàng',
      desc: 'Đơn hàng đã giao thành công',
      done: status === 'da_giao',
      active: status === 'da_giao',
    },
  ];

  const getStatusInfo = (st) => {
    switch (st) {
      case 'cho_xac_nhan':
        return { text: 'Chờ xác nhận', bg: '#fef3c7', color: '#b45309' };
      case 'da_xac_nhan':
      case 'dang_chuan_bi':
        return { text: 'Đã xác nhận', bg: '#dbeafe', color: '#1d4ed8' };
      case 'dang_giao':
        return { text: 'Đang giao hàng', bg: '#e0e7ff', color: '#4338ca' };
      case 'da_giao':
        return { text: 'Đã giao hàng', bg: '#dcfce7', color: '#15803d' };
      case 'da_huy':
        return { text: 'Đã hủy', bg: '#fee2e2', color: '#b91c1c' };
      default: {
        const clean = (st || '')
          .replace(/da_xac_nhan/gi, 'Đã xác nhận')
          .replace(/dang_giao/gi, 'Đang giao hàng')
          .replace(/da_giao/gi, 'Đã giao hàng')
          .replace(/da_huy/gi, 'Đã hủy')
          .replace(/cho_xac_nhan/gi, 'Chờ xác nhận');
        return { text: clean || 'Đang xử lý', bg: '#f1f5f9', color: '#475569' };
      }
    }
  };

  const statusInfo = getStatusInfo(status);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Đang tải tiến trình đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
        >
          <Text style={{ fontSize: 18 }}>🏠</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={{ fontSize: 16 }}>📋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: spacing.lg }}>
        {/* Status Card */}
        <View style={[styles.statusCard, isCancelled && { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
          <View style={[styles.statusBadgePill, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusBadgePillText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <Text style={styles.orderCode}>Mã đơn: #{order?.maCode || orderCode || 'DH-NEW'}</Text>
          <Text style={styles.estimateText}>
            Người nhận: {order?.tenNguoiNhan || 'Khách hàng'} • {order?.sdtNguoiNhan || ''}
          </Text>
          <Text style={[styles.estimateText, { marginTop: 2 }]}>
            Địa chỉ: {order?.diaChiGiaoHang || 'Địa chỉ giao hàng'}
          </Text>
        </View>

        {/* Timeline */}
        {!isCancelled && (
          <View style={styles.timelineBox}>
            <Text style={styles.sectionHeading}>Tiến trình đơn hàng</Text>
            {steps.map((step, idx) => (
              <View key={step.id} style={styles.stepRow}>
                {/* Dot & Line */}
                <View style={styles.dotCol}>
                  <View
                    style={[
                      styles.dot,
                      step.done && styles.dotDone,
                      step.active && styles.dotActive,
                    ]}
                  >
                    <Text style={{ fontSize: 10, color: '#fff', fontWeight: '800' }}>
                      {step.done ? '✓' : ''}
                    </Text>
                  </View>
                  {idx < steps.length - 1 && (
                    <View style={[styles.line, step.done && steps[idx + 1]?.done && styles.lineDone]} />
                  )}
                </View>

                {/* Text info */}
                <View style={{ flex: 1, paddingBottom: 20 }}>
                  <Text
                    style={[
                      styles.stepTitle,
                      step.done && { color: colors.text, fontWeight: '700' },
                      step.active && { color: '#1d4ed8', fontWeight: '800' },
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Ordered Items List */}
        {order?.chiTiets && order.chiTiets.length > 0 && (
          <View style={styles.itemsBox}>
            <Text style={styles.sectionHeading}>Món ăn đã đặt ({order.chiTiets.length})</Text>
            {order.chiTiets.map((ct, i) => (
              <View key={ct.maChiTietDonHang || i} style={styles.itemRowWrapper}>
                <View style={styles.itemRow}>
                  <Image
                    source={{
                      uri: ct.hinhAnhDaiDien || 'https://i.ibb.co/qMdPGF85/kho-ga-la-chanh.png',
                    }}
                    style={styles.itemThumb}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {ct.tenSanPham}
                    </Text>
                    <Text style={styles.itemSub}>
                      {formatVnd(ct.donGia)} x {ct.soLuong}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    {formatVnd(ct.thanhTien || ct.donGia * ct.soLuong)}
                  </Text>
                </View>

                {status === 'da_giao' && (
                  <View style={styles.itemReviewActionRow}>
                    {ct.daDanhGia ? (
                      <View style={styles.reviewedBadge}>
                        <Text style={styles.reviewedBadgeText}>✓ Đã đánh giá</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.reviewItemBtn}
                        onPress={() => handleOpenReview(ct)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.reviewItemBtnText}>⭐ Đánh giá</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalValue}>{formatVnd(order.tongTienThanhToan)}</Text>
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#ffedd5', borderColor: colors.primary, borderWidth: 1 }]}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Lịch sử đơn hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>Tiếp tục mua sắm ➔</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ReviewModal
        visible={reviewModalVisible}
        item={selectedReviewItem}
        onClose={() => setReviewModalVisible(false)}
        onSuccess={handleReviewSuccess}
      />
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
  statusCard: {
    backgroundColor: '#fff7ed',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#ffedd5',
    marginBottom: spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  statusBadgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginBottom: 8,
  },
  statusBadgePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  orderCode: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  estimateText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  timelineBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
  },
  dotCol: {
    alignItems: 'center',
    marginRight: 12,
    width: 22,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotDone: {
    backgroundColor: '#16a34a',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  lineDone: {
    backgroundColor: '#16a34a',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  stepDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemsBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  itemRowWrapper: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemReviewActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  reviewItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  reviewItemBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  reviewedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  itemSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
