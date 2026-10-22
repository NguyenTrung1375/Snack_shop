import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { getProfile } from '../api/auth';
import apiClient from '../api/client';
import ServerConfigModal from '../components/ServerConfigModal';

export default function ProfileScreen({ navigation }) {
  const { user, token, logout, updateUser } = useAuthStore();
  const [showServerModal, setShowServerModal] = useState(false);

  const userRole = (user?.vaiTro || user?.vai_tro || user?.role || user?.Role || user?.VaiTro || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s-]/g, '_');
  const isAdmin = userRole === 'admin' || userRole === 'administrator';
  const isManager = userRole === 'quan_ly' || userRole === 'quanly' || userRole === 'manager';

  useFocusEffect(
    useCallback(() => {
      if (token) {
        getProfile()
          .then((res) => {
            if (res) {
              updateUser(res);
            }
          })
          .catch(() => {});
      }
    }, [token])
  );

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          logout();
          Alert.alert('Thành công', 'Đã đăng xuất tài khoản.');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: spacing.lg }}>
        {/* User Card */}
        <TouchableOpacity
          style={styles.userCard}
          activeOpacity={token ? 0.8 : 1}
          onPress={() => token && navigation.navigate('EditProfile')}
        >
          <View style={styles.avatar}>
            <Text style={{ fontSize: 32 }}>😋</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.userName}>
              {user?.hoTen || (token ? 'Khách hàng' : 'Khách vãng lai')}
            </Text>
            <Text style={styles.userEmail}>{user?.email || 'Chưa đăng nhập'}</Text>
            {token && (
              <View style={styles.memberBadge}>
                <Text style={styles.memberBadgeText}>
                  {user?.vaiTro === 'khach_hang' ? 'Thành viên thân thiết ⭐' : (user?.vaiTro || 'Khách hàng')}
                </Text>
              </View>
            )}
          </View>
          {token && (
            <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '700' }}>Sửa ✎</Text>
          )}
        </TouchableOpacity>

        {/* Admin Portal Banner (Chỉ hiển thị khi isAdmin) */}
        {token && isAdmin && (
          <TouchableOpacity
            style={styles.adminBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminUserManagement')}
          >
            <View style={styles.adminBannerLeft}>
              <View style={styles.adminBannerIcon}>
                <Text style={{ fontSize: 24 }}>🛡️</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.adminBannerTitle}>Trang Quản Trị Hệ Thống</Text>
                  <View style={styles.adminBadgeSmall}>
                    <Text style={styles.adminBadgeSmallText}>ADMIN</Text>
                  </View>
                </View>
                <Text style={styles.adminBannerSubtitle}>
                  Quản lý người dùng, phân quyền & bảo mật
                </Text>
              </View>
            </View>
            <View style={styles.adminBannerArrow}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>Vào Quản Trị ➔</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Menu Options */}
        <View style={styles.menuBox}>
          {/* Admin Menu Shortcut */}
          {token && isAdmin && (
            <>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('AdminUserManagement')}
              >
                <Text style={styles.menuIcon}>🛡️</Text>
                <Text style={[styles.menuText, { color: '#DC2626', fontWeight: '800' }]}>
                  Trang Quản Trị Hệ Thống (Phân quyền)
                </Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />
            </>
          )}

          {/* Manager Menu Shortcut */}
          {token && isManager && (
            <>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('ManagerDashboard')}
              >
                <Text style={styles.menuIcon}>👑</Text>
                <Text style={[styles.menuText, { color: '#D97706', fontWeight: '800' }]}>
                  Quản lý cửa hàng
                </Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />
            </>
          )}
          {token && (
            <>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text style={styles.menuIcon}>👤</Text>
                <Text style={styles.menuText}>Thông tin cá nhân & Đổi mật khẩu</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />
            </>
          )}

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Text style={styles.menuIcon}>📦</Text>
            <Text style={styles.menuText}>Lịch sử đơn hàng của tôi</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
          >
            <Text style={styles.menuIcon}>🛒</Text>
            <Text style={styles.menuText}>Giỏ hàng đang chọn</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('MainTabs', { screen: 'NotificationTab' })}
          >
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Thông báo & Tin tức</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowServerModal(true)}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Cài đặt máy chủ Backend</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }} numberOfLines={1}>
                {apiClient.defaults.baseURL}
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Details Box */}
        {token && user && (
          <TouchableOpacity
            style={styles.infoBox}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.infoTitle}>Thông tin cá nhân</Text>
              <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '700' }}>Cập nhật ✎</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ và tên:</Text>
              <Text style={styles.infoValue}>
                {user.hoTen || `${user.hoLot || ''} ${user.ten || ''}`.trim() || 'Chưa cập nhật'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoValue}>{user.soDienThoai || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Địa chỉ giao hàng:</Text>
              <Text style={styles.infoValue}>{user.diaChi || 'Chưa cập nhật'}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* App Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Ứng dụng SnackShop</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phiên bản:</Text>
            <Text style={styles.infoValue}>1.0.0 (Android APK)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hotline hỗ trợ:</Text>
            <Text style={styles.infoValue}>0988 123 456 (8h - 22h)</Text>
          </View>
        </View>

        {/* Login / Logout Button */}
        {token ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>Đăng nhập / Đăng ký ngay ➔</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <ServerConfigModal
        visible={showServerModal}
        onClose={() => setShowServerModal(false)}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  memberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
  },
  menuBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  menuArrow: {
    fontSize: 18,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 44,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '65%',
    textAlign: 'right',
  },
  logoutBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  adminBanner: {
    backgroundColor: '#1C0B04',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  adminBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  adminBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2B140B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBannerTitle: {
    color: '#FFDBCF',
    fontSize: 15,
    fontWeight: '800',
  },
  adminBadgeSmall: {
    backgroundColor: '#ba1a1a',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  adminBadgeSmallText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  adminBannerSubtitle: {
    color: '#ffd0be',
    fontSize: 11,
    marginTop: 2,
  },
  adminBannerArrow: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
});
