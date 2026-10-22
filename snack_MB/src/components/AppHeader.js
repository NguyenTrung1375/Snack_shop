import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../constants/theme';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function AppHeader({
  navigation,
  showSearch = true,
  searchPlaceholder = 'Tìm món ngon...',
  onSearchPress,
  title,
  showBack = false,
}) {
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore((s) => s.cartCount);
  const user = useAuthStore((s) => s.user);

  const userRole = (user?.vaiTro || user?.vai_tro || user?.role || user?.Role || user?.VaiTro || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s-]/g, '_');
  const isAdmin = userRole === 'admin' || userRole === 'administrator';
  const isManager = userRole === 'quan_ly' || userRole === 'quanly' || userRole === 'manager';

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.topRow}>
        {/* Left: Back button OR Logo + Brand */}
        {showBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backTitle}>{title || 'Quay lại'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.brandContainer}
            onPress={() => navigation?.navigate('MainTabs', { screen: 'HomeTab' })}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.brandName}>
                Snack<Text style={{ color: colors.primary }}>Shop</Text>
              </Text>
              <Text style={styles.brandTagline}>Ăn vặt giòn ngon</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Center: Search pill (if showSearch is true) */}
        {showSearch && (
          <TouchableOpacity
            style={styles.searchPill}
            onPress={onSearchPress || (() => navigation?.navigate('MainTabs', { screen: 'ProductsTab' }))}
            activeOpacity={0.8}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder} numberOfLines={1}>
              {searchPlaceholder}
            </Text>
          </TouchableOpacity>
        )}

        {/* Right: Actions (Admin, Cart, Notification, Profile) */}
        <View style={styles.actionsGroup}>
          {/* Admin Portal Quick Button */}
          {isAdmin && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: '#1C0B04', borderColor: '#EA580C' }]}
              onPress={() => navigation?.navigate('AdminUserManagement')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>🛡️</Text>
            </TouchableOpacity>
          )}

          {/* Manager Portal Quick Button */}
          {isManager && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: '#2C1406', borderColor: '#F59E0B' }]}
              onPress={() => navigation?.navigate('ManagerDashboard')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>👑</Text>
            </TouchableOpacity>
          )}

          {/* Cart Bag Icon with Badge */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation?.navigate('MainTabs', { screen: 'CartTab' })}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20 }}>🛍️</Text>
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation?.navigate('Notification')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            <View style={styles.dotBadge} />
          </TouchableOpacity>

          {/* User Profile Avatar */}
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => {
              if (user) {
                navigation?.navigate('MainTabs', { screen: 'ProfileTab' });
              } else {
                navigation?.navigate('Login');
              }
            }}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitial}>
                {user?.hoTen ? user.hoTen.charAt(0).toUpperCase() : '👤'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(255, 248, 245, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    gap: spacing.sm,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: -2,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  backTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  searchPlaceholder: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  dotBadge: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
});

