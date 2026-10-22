import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { login, register } from '../api/auth';
import { CURRENT_LAN_IP, API_PORT } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen({ navigation }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  // Form states
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');

  // Register fields
  const [hoLot, setHoLot] = useState('');
  const [ten, setTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [diaChi, setDiaChi] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !matKhau.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      if (isRegister) {
        if (!ten.trim()) {
          Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên của bạn');
          setLoading(false);
          return;
        }

        const res = await register({
          hoLot: hoLot.trim(),
          ten: ten.trim(),
          email: email.trim(),
          matKhau: matKhau.trim(),
          soDienThoai: soDienThoai.trim(),
          diaChi: diaChi.trim(),
        });

        await setAuth(res.token, res);
        Alert.alert('Thành công 🎉', 'Đăng ký tài khoản thành công! Bắt đầu mua sắm ngay.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const res = await login({
          email: email.trim(),
          matKhau: matKhau.trim(),
        });

        await setAuth(res.token, res);
        const rawRole = res.vaiTro || res.vai_tro || res.role || res.VaiTro || res.Role || '';
        const role = rawRole.toString().toLowerCase().trim().replace(/[\s-]/g, '_');
        const isAdmin = role === 'admin' || role === 'administrator';
        const isManager = role === 'quan_ly' || role === 'quanly' || role === 'manager';

        if (isAdmin) {
          Alert.alert(
            'Quản Trị Viên Hệ Thống 🛡️',
            `Chào mừng SuperAdmin ${res.hoTen || res.ten || 'Admin'}! Bạn muốn truy cập màn hình nào?`,
            [
              {
                text: '🏪 Xem Cửa Hàng',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
              {
                text: '🛡️ Vào Trang Quản Trị',
                onPress: () => {
                  navigation.replace('AdminUserManagement');
                },
              },
            ]
          );
        } else if (isManager) {
          Alert.alert(
            'Quản Lý Cửa Hàng 👑',
            `Chào mừng Quản lý ${res.hoTen || res.ten || 'Quản lý'}! Bạn muốn chuyển đến khu vực nào?`,
            [
              {
                text: '🏪 Xem Cửa Hàng',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
              {
                text: '👑 Vào Trang Quản Lý',
                onPress: () => {
                  navigation.replace('ManagerDashboard');
                },
              },
            ]
          );
        } else {
          Alert.alert('Thành công 🎉', `Chào mừng ${res.hoTen || 'bạn'} quay trở lại!`, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      }
    } catch (err) {
      if (!err.response) {
        Alert.alert(
          'Không kết nối được Backend',
          `Không thể kết nối đến máy chủ Backend (http://${CURRENT_LAN_IP}:${API_PORT}/api). Vui lòng kiểm tra điện thoại có cùng Wi-Fi với máy tính và backend đang chạy.`
        );
      } else {
        const msg =
          err.response?.data?.message ||
          (isRegister ? 'Đăng ký thất bại. Email có thể đã tồn tại.' : 'Sai email hoặc mật khẩu.');
        Alert.alert('Lỗi', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 18 }}>⬅️</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoBox}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>
          {isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập SnackShop'}
        </Text>
        <Text style={styles.subtitle}>
          {isRegister
            ? 'Đăng ký nhận ngay voucher 30K cho đơn đầu tiên'
            : 'Thế giới ăn vặt thơm ngon giao tận nơi'}
        </Text>

        {/* Tab switch */}
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.tabSwitchBtn, !isRegister && styles.tabSwitchBtnActive]}
            onPress={() => setIsRegister(false)}
          >
            <Text style={[styles.tabSwitchText, !isRegister && styles.tabSwitchTextActive]}>
              Đăng nhập
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabSwitchBtn, isRegister && styles.tabSwitchBtnActive]}
            onPress={() => setIsRegister(true)}
          >
            <Text style={[styles.tabSwitchText, isRegister && styles.tabSwitchTextActive]}>
              Đăng ký
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {isRegister && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Họ lót</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nguyễn"
                  value={hoLot}
                  onChangeText={setHoLot}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Tên *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Văn An"
                  value={ten}
                  onChangeText={setTen}
                />
              </View>
            </View>
          )}

          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="snacklover@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.inputLabel}>Mật khẩu *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            value={matKhau}
            onChangeText={setMatKhau}
          />

          {isRegister && (
            <>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                placeholder="0988 123 456"
                keyboardType="phone-pad"
                value={soDienThoai}
                onChangeText={setSoDienThoai}
              />

              <Text style={styles.inputLabel}>Địa chỉ nhận hàng</Text>
              <TextInput
                style={styles.input}
                placeholder="Số nhà, đường, phường, quận..."
                value={diaChi}
                onChangeText={setDiaChi}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            disabled={loading}
            onPress={handleSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập ngay'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Accounts Selection */}
          {!isRegister && (
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>⚡ Chọn tài khoản test nhanh:</Text>
              <View style={styles.demoBtnRow}>
                <TouchableOpacity
                  style={[styles.demoBtn, { borderColor: '#EA580C', backgroundColor: '#FFF7ED' }]}
                  onPress={() => {
                    setEmail('admin@test.vn');
                    setMatKhau('123456');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.demoBtnText, { color: '#EA580C' }]}>🛡️ Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoBtn, { borderColor: '#D97706', backgroundColor: '#FEF3C7' }]}
                  onPress={() => {
                    setEmail('manager@test.vn');
                    setMatKhau('123456');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.demoBtnText, { color: '#B45309' }]}>👑 Quản Lý</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoBtn, { borderColor: '#16A34A', backgroundColor: '#DCFCE7' }]}
                  onPress={() => {
                    setEmail('customer@test.vn');
                    setMatKhau('123456');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.demoBtnText, { color: '#15803D' }]}>👤 Khách</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 40,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  logoImg: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: 20,
  },
  tabSwitchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabSwitchBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  tabSwitchText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabSwitchTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  form: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  demoSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
