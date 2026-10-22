import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
  Linking,
  StatusBar,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../constants/theme';
import {
  getUsers,
  updateUserStatus,
  createAccount,
  updateUser,
  deleteUser,
} from '../api/users';
import { useAuthStore } from '../store/authStore';

const ROLE_CONFIG = {
  khach_hang: { label: 'khach_hang', display: 'Khách hàng', color: '#16a34a', bg: '#dcfce7', bar: '#16a34a' },
  nhan_vien: { label: 'nhan_vien', display: 'Nhân viên', color: '#2563eb', bg: '#dbeafe', bar: '#2563eb' },
  quan_ly: { label: 'quan_ly', display: 'Quản lý', color: '#d97706', bg: '#fef3c7', bar: '#d97706' },
  admin: { label: 'admin', display: 'Admin', color: '#dc2626', bg: '#fee2e2', bar: '#dc2626' },
};

export default function AdminUserManagementScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? Math.max(insets.top, StatusBar.currentHeight || 0) : insets.top;
  const { user } = useAuthStore();

  // Data states
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filter states
  const [keyword, setKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);

  // Modal Create states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    hoLot: '',
    ten: '',
    email: '',
    matKhau: '',
    soDienThoai: '',
    diaChi: '',
    vaiTro: 'khach_hang',
    mucLuong: '',
    ngayVaoLam: '',
  });

  // Modal Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    hoLot: '',
    ten: '',
    soDienThoai: '',
    diaChi: '',
    vaiTro: 'khach_hang',
    trangThai: 'hoat_dong',
  });

  // Load user list
  const fetchUsers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = {
        page,
        pageSize,
        keyword: keyword.trim() || undefined,
        vaiTro: selectedRole !== 'all' ? selectedRole : undefined,
        trangThai: activeOnly ? 'hoat_dong' : undefined,
      };

      const res = await getUsers(params);
      if (res && res.items) {
        setUsers(res.items);
        setTotalCount(res.totalCount || res.items.length);
      } else if (Array.isArray(res)) {
        setUsers(res);
        setTotalCount(res.length);
      }
    } catch (err) {
      console.warn('Lỗi khi tải danh sách người dùng:', err);
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, keyword, selectedRole, activeOnly]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchTimer, setSearchTimer] = useState(null);
  const handleSearchChange = (text) => {
    setKeyword(text);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(
      setTimeout(() => {
        setPage(1);
      }, 400)
    );
  };

  // Toggle user status
  const handleToggleStatus = async (item) => {
    const isCurrentlyActive = item.trangThai === 'hoat_dong';
    const newStatus = isCurrentlyActive ? 'khoa' : 'hoat_dong';

    setUsers((prev) =>
      prev.map((u) =>
        u.maNguoiDung === item.maNguoiDung ? { ...u, trangThai: newStatus } : u
      )
    );

    try {
      await updateUserStatus(item.maNguoiDung, newStatus);
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) =>
          u.maNguoiDung === item.maNguoiDung ? { ...u, trangThai: item.trangThai } : u
        )
      );
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể đổi trạng thái tài khoản');
    }
  };

  // Delete user
  const handleDeleteUser = (item) => {
    const fullName = `${item.hoLot || ''} ${item.ten || ''}`.trim() || item.email;
    Alert.alert(
      'Xác nhận xóa tài khoản',
      `Bạn có chắc chắn muốn xóa "${fullName}" khỏi hệ thống?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(item.maNguoiDung);
              Alert.alert('Thành công', 'Đã xóa người dùng.');
              fetchUsers();
            } catch (err) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể xóa người dùng này.');
            }
          },
        },
      ]
    );
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingUser(item);
    setEditForm({
      hoLot: item.hoLot || '',
      ten: item.ten || '',
      soDienThoai: item.soDienThoai || '',
      diaChi: item.diaChi || '',
      vaiTro: item.vaiTro || 'khach_hang',
      trangThai: item.trangThai || 'hoat_dong',
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleSubmitEdit = async () => {
    if (!editForm.ten.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Tên người dùng');
      return;
    }

    try {
      setSubmittingEdit(true);
      await updateUser(editingUser.maNguoiDung, {
        hoLot: editForm.hoLot.trim(),
        ten: editForm.ten.trim(),
        soDienThoai: editForm.soDienThoai.trim(),
        diaChi: editForm.diaChi.trim(),
        vaiTro: editForm.vaiTro,
      });

      if (editForm.trangThai !== editingUser.trangThai) {
        await updateUserStatus(editingUser.maNguoiDung, editForm.trangThai);
      }

      Alert.alert('Thành công 🎉', 'Đã cập nhật thông tin người dùng.');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật người dùng');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Submit Create
  const handleSubmitCreate = async () => {
    if (!createForm.ten.trim() || !createForm.email.trim() || !createForm.matKhau.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ Tên, Email và Mật khẩu (≥ 6 ký tự)');
      return;
    }
    if (createForm.matKhau.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }

    try {
      setSubmittingCreate(true);
      await createAccount({
        hoLot: createForm.hoLot.trim(),
        ten: createForm.ten.trim(),
        email: createForm.email.trim(),
        matKhau: createForm.matKhau.trim(),
        soDienThoai: createForm.soDienThoai.trim() || null,
        diaChi: createForm.diaChi.trim() || null,
        vaiTro: createForm.vaiTro,
        mucLuong: createForm.mucLuong ? Number(createForm.mucLuong) : undefined,
        ngayVaoLam: createForm.ngayVaoLam || undefined,
      });

      Alert.alert('Thành công 🎉', `Đã tạo tài khoản cho ${createForm.ten}!`);
      setIsCreateModalOpen(false);
      setCreateForm({
        hoLot: '',
        ten: '',
        email: '',
        matKhau: '',
        soDienThoai: '',
        diaChi: '',
        vaiTro: 'khach_hang',
        mucLuong: '',
        ngayVaoLam: '',
      });
      fetchUsers();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleCallPhone = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Lỗi', 'Không thể khởi động ứng dụng gọi điện');
    });
  };

  const getInitials = (item) => {
    const name = `${item.hoLot || ''} ${item.ten || ''}`.trim() || item.email || 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Render individual card
  const renderUserCard = ({ item, index }) => {
    const roleCfg = ROLE_CONFIG[item.vaiTro] || ROLE_CONFIG.khach_hang;
    const isActive = item.trangThai === 'hoat_dong';
    const fullName = `${item.hoLot || ''} ${item.ten || ''}`.trim() || item.email;
    const shortId = `#ID-${String(index + 1 + (page - 1) * pageSize).padStart(3, '0')}`;

    return (
      <View style={styles.userCard}>
        <View style={[styles.cardTopAccent, { backgroundColor: roleCfg.bar }]} />

        <View style={styles.cardContent}>
          {/* Top Row: Avatar, Name, Role Badge, Switch */}
          <View style={styles.cardTopRow}>
            <View style={styles.cardUserInfo}>
              <View style={[styles.avatarCircle, { backgroundColor: roleCfg.bg }]}>
                <Text style={[styles.avatarText, { color: roleCfg.color }]}>
                  {getInitials(item)}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardUserName} numberOfLines={1}>
                  {fullName}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.roleBadge, { backgroundColor: roleCfg.bg }]}>
                    <Text style={[styles.roleBadgeText, { color: roleCfg.color }]}>
                      {roleCfg.label}
                    </Text>
                  </View>
                  <Text style={styles.idBadgeText}>{shortId}</Text>
                </View>
              </View>
            </View>

            <View style={styles.switchBox}>
              <Switch
                value={isActive}
                onValueChange={() => handleToggleStatus(item)}
                trackColor={{ false: '#d2d9f4', true: colors.primary }}
                thumbColor={'#ffffff'}
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
              <Text style={[styles.switchLabel, { color: isActive ? '#16a34a' : '#8e7066' }]}>
                {isActive ? 'Hoạt động' : 'Đã khóa'}
              </Text>
            </View>
          </View>

          {/* Middle Info */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItemRow}>
              <Text style={styles.infoIcon}>✉️</Text>
              <Text style={styles.infoText} numberOfLines={1}>{item.email}</Text>
            </View>

            {item.soDienThoai ? (
              <TouchableOpacity
                style={styles.infoItemRow}
                activeOpacity={0.7}
                onPress={() => handleCallPhone(item.soDienThoai)}
              >
                <Text style={styles.infoIcon}>📞</Text>
                <Text style={[styles.infoText, { color: colors.primary, fontWeight: '600' }]}>
                  {item.soDienThoai} (Chạm để gọi)
                </Text>
              </TouchableOpacity>
            ) : null}

            {item.diaChi ? (
              <View style={styles.infoItemRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText} numberOfLines={2}>{item.diaChi}</Text>
              </View>
            ) : null}
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.detailBtn}
              activeOpacity={0.8}
              onPress={() => handleOpenEdit(item)}
            >
              <Text style={styles.detailBtnText}>👁️ Chi tiết & Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              activeOpacity={0.8}
              onPress={() => handleDeleteUser(item)}
            >
              <Text style={styles.deleteBtnText}>🗑️ Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Configure Android/iOS Status Bar cleanly */}
      <StatusBar barStyle="light-content" backgroundColor="#1C0B04" translucent={true} />

      {/* 1. TOP BRAND HEADER (#1C0B04) with Dynamic Safe Inset */}
      <View style={[styles.topHeader, { paddingTop: topInset + 6 }]}>
        <View style={styles.brandRow}>
          {/* Left: Clear Back to Storefront button */}
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
              <Text style={styles.brandTitle}>
                Snack<Text style={{ color: colors.primary }}>Shop</Text>
              </Text>
              <Text style={styles.brandSubtitle}>QUẢN TRỊ VIÊN</Text>
            </View>
          </View>

          {/* Right: Compact Admin Pill */}
          <View style={styles.adminPill}>
            <Text style={styles.adminPillText} numberOfLines={1}>
              {user?.ten || user?.hoTen?.split(' ').pop() || 'Admin'}
            </Text>
            <View style={styles.adminAvatarCircle}>
              <Text style={{ fontSize: 10, color: '#fff' }}>👑</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. SUB-HEADER / ACTIONS (Compact) */}
      <View style={styles.subHeader}>
        <View style={styles.subHeaderLeft}>
          <Text style={styles.subHeaderTitle}>Người Dùng</Text>
          <View style={styles.adminTag}>
            <Text style={styles.adminTagText}>ADMIN</Text>
          </View>
          <Text style={styles.totalBadgeText}>({totalCount})</Text>
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          activeOpacity={0.85}
          onPress={() => setIsCreateModalOpen(true)}
        >
          <Text style={styles.createBtnText}>+ Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <View style={styles.filterSection}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, email, sđt..."
            placeholderTextColor="#8e7066"
            value={keyword}
            onChangeText={handleSearchChange}
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <Text style={{ color: '#8e7066', paddingHorizontal: 6, fontSize: 14 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, selectedRole === 'all' && styles.filterChipActive]}
            onPress={() => { setSelectedRole('all'); setPage(1); }}
          >
            <Text style={[styles.filterChipText, selectedRole === 'all' && styles.filterChipTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedRole === 'khach_hang' && styles.filterChipActive]}
            onPress={() => { setSelectedRole('khach_hang'); setPage(1); }}
          >
            <View style={[styles.chipDot, { backgroundColor: '#16a34a' }]} />
            <Text style={[styles.filterChipText, selectedRole === 'khach_hang' && styles.filterChipTextActive]}>
              Khách hàng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedRole === 'nhan_vien' && styles.filterChipActive]}
            onPress={() => { setSelectedRole('nhan_vien'); setPage(1); }}
          >
            <View style={[styles.chipDot, { backgroundColor: '#2563eb' }]} />
            <Text style={[styles.filterChipText, selectedRole === 'nhan_vien' && styles.filterChipTextActive]}>
              Nhân viên
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedRole === 'quan_ly' && styles.filterChipActive]}
            onPress={() => { setSelectedRole('quan_ly'); setPage(1); }}
          >
            <View style={[styles.chipDot, { backgroundColor: '#d97706' }]} />
            <Text style={[styles.filterChipText, selectedRole === 'quan_ly' && styles.filterChipTextActive]}>
              Quản lý
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedRole === 'admin' && styles.filterChipActive]}
            onPress={() => { setSelectedRole('admin'); setPage(1); }}
          >
            <View style={[styles.chipDot, { backgroundColor: '#dc2626' }]} />
            <Text style={[styles.filterChipText, selectedRole === 'admin' && styles.filterChipTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>

          <View style={styles.activeOnlyBox}>
            <Text style={styles.activeOnlyLabel}>Đang bật</Text>
            <Switch
              value={activeOnly}
              onValueChange={(val) => { setActiveOnly(val); setPage(1); }}
              trackColor={{ false: '#d2d9f4', true: colors.primary }}
              thumbColor={'#ffffff'}
              style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
            />
          </View>
        </ScrollView>
      </View>

      {/* 4. USER CARDS LIST */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.maNguoiDung)}
          renderItem={renderUserCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchUsers(true)}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>🔍</Text>
              <Text style={styles.emptyTitle}>Không tìm thấy người dùng</Text>
              <Text style={styles.emptyDesc}>Hãy thử thay đổi từ khóa hoặc bộ lọc vai trò</Text>
            </View>
          }
        />
      )}

      {/* 5. BOTTOM PAGINATION BAR */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomCountText}>
          Tổng: <Text style={{ color: colors.primary, fontWeight: '800' }}>{totalCount} người dùng</Text>
        </Text>

        <View style={styles.pageControls}>
          <TouchableOpacity
            style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
            disabled={page <= 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            <Text style={styles.pageBtnText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.pageStatusText}>
            Trang {page}/{totalPages}
          </Text>

          <TouchableOpacity
            style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
            disabled={page >= totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <Text style={styles.pageBtnText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL 1: TẠO TÀI KHOẢN MỚI */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>+ Tạo Tài Khoản Mới</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              <Text style={styles.inputLabel}>Vai trò tài khoản (*)</Text>
              <View style={styles.roleSelectRow}>
                {['khach_hang', 'nhan_vien', 'quan_ly', 'admin'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleSelectChip,
                      createForm.vaiTro === r && styles.roleSelectChipActive,
                    ]}
                    onPress={() => setCreateForm({ ...createForm, vaiTro: r })}
                  >
                    <Text
                      style={[
                        styles.roleSelectChipText,
                        createForm.vaiTro === r && styles.roleSelectChipTextActive,
                      ]}
                    >
                      {ROLE_CONFIG[r]?.display || r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.nameRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Họ lót</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Nguyễn Văn"
                    value={createForm.hoLot}
                    onChangeText={(t) => setCreateForm({ ...createForm, hoLot: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Tên (*)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="An"
                    value={createForm.ten}
                    onChangeText={(t) => setCreateForm({ ...createForm, ten: t })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Email (*)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={createForm.email}
                onChangeText={(t) => setCreateForm({ ...createForm, email: t })}
              />

              <Text style={styles.inputLabel}>Mật khẩu khởi tạo (*) (≥ 6 ký tự)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập mật khẩu"
                secureTextEntry
                value={createForm.matKhau}
                onChangeText={(t) => setCreateForm({ ...createForm, matKhau: t })}
              />

              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0901234567"
                keyboardType="phone-pad"
                value={createForm.soDienThoai}
                onChangeText={(t) => setCreateForm({ ...createForm, soDienThoai: t })}
              />

              <Text style={styles.inputLabel}>Địa chỉ</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Số nhà, tên đường, quận/huyện..."
                value={createForm.diaChi}
                onChangeText={(t) => setCreateForm({ ...createForm, diaChi: t })}
              />

              {(createForm.vaiTro === 'nhan_vien' || createForm.vaiTro === 'quan_ly') && (
                <>
                  <Text style={styles.inputLabel}>Mức lương khởi điểm (VNĐ)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="8000000"
                    keyboardType="numeric"
                    value={createForm.mucLuong}
                    onChangeText={(t) => setCreateForm({ ...createForm, mucLuong: t })}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsCreateModalOpen(false)}
              >
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                disabled={submittingCreate}
                onPress={handleSubmitCreate}
              >
                {submittingCreate ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Tạo tài khoản ngay ➔</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CHI TIẾT & SỬA THÔNG TIN */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi Tiết & Sửa Người Dùng</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              <View style={styles.readOnlyBox}>
                <Text style={styles.readOnlyLabel}>Email tài khoản:</Text>
                <Text style={styles.readOnlyValue}>{editingUser?.email}</Text>
              </View>

              <View style={styles.nameRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Họ lót</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editForm.hoLot}
                    onChangeText={(t) => setEditForm({ ...editForm, hoLot: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Tên (*)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editForm.ten}
                    onChangeText={(t) => setEditForm({ ...editForm, ten: t })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="phone-pad"
                value={editForm.soDienThoai}
                onChangeText={(t) => setEditForm({ ...editForm, soDienThoai: t })}
              />

              <Text style={styles.inputLabel}>Địa chỉ</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.diaChi}
                onChangeText={(t) => setEditForm({ ...editForm, diaChi: t })}
              />

              <Text style={styles.inputLabel}>Vai trò</Text>
              <View style={styles.roleSelectRow}>
                {['khach_hang', 'nhan_vien', 'quan_ly', 'admin'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleSelectChip,
                      editForm.vaiTro === r && styles.roleSelectChipActive,
                    ]}
                    onPress={() => setEditForm({ ...editForm, vaiTro: r })}
                  >
                    <Text
                      style={[
                        styles.roleSelectChipText,
                        editForm.vaiTro === r && styles.roleSelectChipTextActive,
                      ]}
                    >
                      {ROLE_CONFIG[r]?.display || r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Trạng thái tài khoản</Text>
              <View style={styles.statusToggleRow}>
                <Text style={styles.statusToggleText}>
                  {editForm.trangThai === 'hoat_dong' ? '🟢 Đang hoạt động' : '🔴 Đang bị khóa'}
                </Text>
                <Switch
                  value={editForm.trangThai === 'hoat_dong'}
                  onValueChange={(val) =>
                    setEditForm({ ...editForm, trangThai: val ? 'hoat_dong' : 'khoa' })
                  }
                  trackColor={{ false: '#d2d9f4', true: colors.primary }}
                  thumbColor={'#ffffff'}
                />
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalOpen(false)}
              >
                <Text style={styles.modalCancelBtnText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                disabled={submittingEdit}
                onPress={handleSubmitEdit}
              >
                {submittingEdit ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Lưu Thay Đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  brandSubtitle: {
    color: '#fd7540',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b140b',
    borderRadius: 16,
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 3,
    maxWidth: 95,
  },
  adminPillText: {
    color: '#ffdbcf',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  adminAvatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#a53600',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. SUB-HEADER (Compact)
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff1e8',
    borderBottomWidth: 1,
    borderBottomColor: '#f3e6dd',
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#211a15',
  },
  adminTag: {
    backgroundColor: '#ba1a1a',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  adminTagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8e7066',
  },
  createBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },

  // 3. SEARCH & FILTERS
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#fff8f5',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: '#f3e6dd',
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#211a15',
    paddingVertical: 0,
  },
  filterChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e6dd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  filterChipActive: {
    backgroundColor: '#131b2e',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5a4138',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  activeOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
    marginLeft: 2,
  },
  activeOnlyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5a4138',
  },

  // 4. USER CARDS LIST
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 10,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3e6dd',
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopAccent: {
    height: 3.5,
    width: '100%',
  },
  cardContent: {
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardUserName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#211a15',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  idBadgeText: {
    fontSize: 9,
    color: '#8e7066',
    fontWeight: '600',
  },
  switchBox: {
    alignItems: 'flex-end',
  },
  switchLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  infoGrid: {
    backgroundColor: '#fff8f5',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    gap: 4,
  },
  infoItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 11,
    marginRight: 6,
  },
  infoText: {
    fontSize: 11,
    color: '#5a4138',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  detailBtn: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4f46e5',
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },

  // 5. BOTTOM BAR
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3e6dd',
  },
  bottomCountText: {
    fontSize: 11,
    color: '#645a52',
  },
  pageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageBtn: {
    backgroundColor: '#f3e6dd',
    width: 26,
    height: 26,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.35,
  },
  pageBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#211a15',
  },
  pageStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5a4138',
  },

  // STATES
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#645a52',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#211a15',
  },
  emptyDesc: {
    fontSize: 11,
    color: '#8e7066',
    marginTop: 3,
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e6dd',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#211a15',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#8e7066',
    padding: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5a4138',
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#fff8f5',
    borderWidth: 1,
    borderColor: '#f3e6dd',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: '#211a15',
  },
  nameRow: {
    flexDirection: 'row',
  },
  roleSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  roleSelectChip: {
    backgroundColor: '#f3e6dd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  roleSelectChipActive: {
    backgroundColor: '#ea580c',
  },
  roleSelectChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5a4138',
  },
  roleSelectChipTextActive: {
    color: '#ffffff',
  },
  readOnlyBox: {
    backgroundColor: '#fff1e8',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  readOnlyLabel: {
    fontSize: 10,
    color: '#8e7066',
  },
  readOnlyValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#211a15',
    marginTop: 2,
  },
  statusToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff8f5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3e6dd',
    marginTop: 4,
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#211a15',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3e6dd',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f3e6dd',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5a4138',
  },
  modalSubmitBtn: {
    flex: 2,
    backgroundColor: '#ea580c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
});
