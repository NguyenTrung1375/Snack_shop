import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { getProfile, updateProfile, changePassword } from '../api/auth';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuthStore();

  // Profile fields
  const [hoLot, setHoLot] = useState('');
  const [ten, setTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Change password fields
  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadFreshProfile();
  }, []);

  const loadFreshProfile = async () => {
    try {
      setFetching(true);
      const res = await getProfile();
      if (res) {
        setHoLot(res.hoLot || '');
        setTen(res.ten || '');
        setSoDienThoai(res.soDienThoai || '');
        setDiaChi(res.diaChi || '');
        await updateUser(res);
      }
    } catch (err) {
      // Fallback to store user if network error
      if (user) {
        setHoLot(user.hoLot || '');
        setTen(user.ten || '');
        setSoDienThoai(user.soDienThoai || '');
        setDiaChi(user.diaChi || '');
      }
    } finally {
      setFetching(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!ten.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên của bạn.');
      return;
    }

    try {
      setSavingProfile(true);
      const payload = {
        hoLot: hoLot.trim(),
        ten: ten.trim(),
        soDienThoai: soDienThoai.trim() || null,
        diaChi: diaChi.trim() || null,
      };

      const res = await updateProfile(payload);
      await updateUser(res);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật thành công!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      Alert.alert('Lỗi cập nhật', msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!matKhauCu) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!matKhauMoi || matKhauMoi.length < 6) {
      Alert.alert('Mật khẩu yếu', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (matKhauMoi !== xacNhanMatKhau) {
      Alert.alert('Không khớp', 'Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword({
        matKhauCu,
        matKhauMoi,
      });

      setMatKhauCu('');
      setMatKhauMoi('');
      setXacNhanMatKhau('');
      Alert.alert('Thành công', 'Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Mật khẩu hiện tại không chính xác hoặc không hợp lệ.';
      Alert.alert('Đổi mật khẩu thất bại', msg);
    } finally {
      setSavingPassword(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Đang tải thông tin cá nhân...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 18 }}>⬅️</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: spacing.lg }}>
          {/* Account Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.avatarBox}>
              <Text style={{ fontSize: 32 }}>👤</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.overviewName}>
                {user?.hoTen || `${hoLot} ${ten}`.trim() || 'Khách hàng'}
              </Text>
              <Text style={styles.overviewEmail}>{user?.email}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>
                  {user?.vaiTro === 'khach_hang' ? '⭐ Khách hàng thân thiết' : (user?.vaiTro || 'Tài khoản')}
                </Text>
              </View>
            </View>
          </View>

          {/* Form 1: Edit Profile Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📝 Chỉnh sửa thông tin hồ sơ</Text>

            <View style={styles.rowFields}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Họ và tên đệm</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: Nguyễn Văn"
                  value={hoLot}
                  onChangeText={setHoLot}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Tên *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: An"
                  value={ten}
                  onChangeText={setTen}
                />
              </View>
            </View>

            <Text style={styles.label}>Số điện thoại liên hệ</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại (VD: 0988123456)"
              keyboardType="phone-pad"
              value={soDienThoai}
              onChangeText={setSoDienThoai}
            />

            <Text style={styles.label}>Địa chỉ giao hàng mặc định</Text>
            <TextInput
              style={[styles.input, { height: 72, textAlignVertical: 'top' }]}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
              multiline
              value={diaChi}
              onChangeText={setDiaChi}
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>💾 Lưu thông tin mới</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Form 2: Change Password */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔒 Đổi mật khẩu tài khoản</Text>

            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry
              value={matKhauCu}
              onChangeText={setMatKhauCu}
            />

            <Text style={styles.label}>Mật khẩu mới (tối thiểu 6 ký tự)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry
              value={matKhauMoi}
              onChangeText={setMatKhauMoi}
            />

            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
              value={xacNhanMatKhau}
              onChangeText={setXacNhanMatKhau}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: '#ea580c' }]}
              onPress={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>🔐 Cập nhật mật khẩu</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 45,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffedd5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  overviewEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  card: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  rowFields: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

