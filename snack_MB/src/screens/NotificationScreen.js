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
import { getNotifications, markAllAsRead, markAsRead } from '../api/notifications';
import { useAuthStore } from '../store/authStore';

const formatNotificationInfo = (item) => {
  let title = item.tieuDe || 'Thông báo mới';
  let body = item.noiDung || '';
  let icon = '📦';
  let badgeText = '';
  let badgeColor = colors.primary;

  // Clean raw enums in body
  body = body
    .replace(/chuyen sang trang thai: da_xac_nhan/gi, 'đã được xác nhận thành công! Bếp đang chuẩn bị món.')
    .replace(/chuyển sang trạng thái: da_xac_nhan/gi, 'đã được xác nhận thành công! Bếp đang chuẩn bị món.')
    .replace(/chuyen sang trang thai: dang_giao/gi, 'đang trên đường giao đến bạn. Vui lòng chú ý điện thoại!')
    .replace(/chuyển sang trạng thái: dang_giao/gi, 'đang trên đường giao đến bạn. Vui lòng chú ý điện thoại!')
    .replace(/chuyen sang trang thai: da_giao/gi, 'đã được giao thành công. Chúc bạn ngon miệng!')
    .replace(/chuyển sang trạng thái: da_giao/gi, 'đã được giao thành công. Chúc bạn ngon miệng!')
    .replace(/chuyen sang trang thai: da_huy/gi, 'đã bị hủy.')
    .replace(/chuyển sang trạng thái: da_huy/gi, 'đã bị hủy.')
    .replace(/da_xac_nhan/gi, 'Đã xác nhận')
    .replace(/dang_giao/gi, 'Đang giao')
    .replace(/da_giao/gi, 'Đã giao')
    .replace(/da_huy/gi, 'Đã hủy')
    .replace(/cho_xac_nhan/gi, 'Chờ xác nhận');

  const lowerBody = body.toLowerCase();
  const lowerTitle = title.toLowerCase();

  if (item.loaiThongBao === 'khuyen_mai' || lowerTitle.includes('khuyến mãi') || lowerTitle.includes('voucher')) {
    icon = '🎁';
    badgeText = 'Ưu đãi';
    badgeColor = '#ea580c';
  } else if (lowerBody.includes('đã xác nhận') || lowerBody.includes('bếp đang')) {
    icon = '👨‍🍳';
    badgeText = 'Đã xác nhận';
    badgeColor = '#2563eb';
    if (title === 'Cập nhật đơn hàng') title = 'Đơn hàng đã được xác nhận! 🍳';
  } else if (lowerBody.includes('đang giao') || lowerBody.includes('shipper')) {
    icon = '🛵';
    badgeText = 'Đang giao hàng';
    badgeColor = '#0284c7';
    if (title === 'Cập nhật đơn hàng') title = 'Đơn hàng đang giao đến bạn! 🛵';
  } else if (lowerBody.includes('đã giao') || lowerBody.includes('ngon miệng')) {
    icon = '🎉';
    badgeText = 'Đã giao hàng';
    badgeColor = '#16a34a';
    if (title === 'Cập nhật đơn hàng') title = 'Đơn hàng đã được giao! 🍟';
  } else if (lowerBody.includes('đã hủy') || lowerBody.includes('hủy đơn')) {
    icon = '❌';
    badgeText = 'Đã hủy';
    badgeColor = '#dc2626';
    if (title === 'Cập nhật đơn hàng') title = 'Đơn hàng đã bị hủy';
  } else if (lowerTitle.includes('đặt hàng')) {
    icon = '🛍️';
    badgeText = 'Đặt hàng mới';
    badgeColor = '#f59e0b';
  }

  return { title, body, icon, badgeText, badgeColor };
};

export default function NotificationScreen({ navigation }) {
  const [tab, setTab] = useState('all');
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuthStore();

  const fetchNotifs = useCallback(async () => {
    if (!token) {
      setNotifs([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getNotifications();
      const list = Array.isArray(data) ? data : (data?.items || []);
      setNotifs(list);
    } catch (err) {
      console.warn('Lỗi lấy thông báo:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifs();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotifs();
    });
    return unsubscribe;
  }, [navigation, fetchNotifs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifs();
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifs((prev) => prev.map((n) => ({ ...n, daDoc: true })));
      await markAllAsRead();
    } catch (err) {
      console.warn('Lỗi đánh dấu đã đọc tất cả:', err);
      fetchNotifs();
    }
  };

  const handleItemPress = async (item) => {
    if (!item.daDoc) {
      setNotifs((prev) =>
        prev.map((n) =>
          n.maThongBao === item.maThongBao ? { ...n, daDoc: true } : n
        )
      );
      try {
        await markAsRead(item.maThongBao);
      } catch (e) {
        // ignore
      }
    }

    if (item.loaiThongBao === 'don_hang' || item.duLieuBoSung?.maDonHang) {
      navigation.navigate('OrderHistory');
    }
  };

  const displayed =
    tab === 'unread' ? notifs.filter((n) => !n.daDoc) : notifs;
  const unreadCount = notifs.filter((n) => !n.daDoc).length;

  if (!token) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontSize: 56, marginBottom: 12 }}>🔔</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
          Đăng nhập để nhận thông báo
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
          Xem cập nhật đơn hàng, khuyến mãi và thông tin quan trọng dành riêng cho bạn.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryBtnText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo {unreadCount > 0 ? `(${unreadCount})` : ''}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>Đã đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'all' && styles.tabBtnActive]}
          onPress={() => setTab('all')}
        >
          <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
            Tất cả ({notifs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'unread' && styles.tabBtnActive]}
          onPress={() => setTab('unread')}
        >
          <Text style={[styles.tabText, tab === 'unread' && styles.tabTextActive]}>
            Chưa đọc ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && notifs.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.textSecondary }}>Đang tải thông báo...</Text>
          </View>
        ) : displayed.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 56, marginBottom: 12 }}>✨</Text>
            <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
            <Text style={styles.emptySub}>
              {tab === 'unread'
                ? 'Bạn đã đọc hết tất cả thông báo!'
                : 'Mọi thông báo về đơn hàng và ưu đãi sẽ xuất hiện tại đây.'}
            </Text>
          </View>
        ) : (
          displayed.map((n) => {
            const dateStr = n.ngayTao
              ? new Date(n.ngayTao).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                })
              : '';
            const info = formatNotificationInfo(n);
            return (
              <TouchableOpacity
                key={n.maThongBao}
                style={[styles.notifCard, !n.daDoc && styles.notifUnread]}
                onPress={() => handleItemPress(n)}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Text style={{ fontSize: 20 }}>{info.icon}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6, flexWrap: 'wrap' }}>
                      <Text style={[styles.notifTitle, !n.daDoc && { color: colors.primary, fontWeight: '800' }]}>
                        {info.title}
                      </Text>
                      {info.badgeText ? (
                        <View style={[styles.statusBadge, { backgroundColor: info.badgeColor + '18' }]}>
                          <Text style={[styles.statusBadgeText, { color: info.badgeColor }]}>
                            {info.badgeText}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    {!n.daDoc && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifBody}>{info.body}</Text>
                  <Text style={styles.notifTime}>{dateStr}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  markReadText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  notifUnread: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 6,
  },
  notifBody: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 4,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: colors.textMuted,
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
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
