import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import apiClient, {
  setCustomApiUrl,
  resetToAutoDetectedUrl,
  autoDiscoverWorkingHost,
  getCandidateHosts,
  checkBackendHealth,
  API_PORT,
} from '../api/client';

export default function ServerConfigModal({ visible, onClose, onSaved }) {
  const [currentUrl, setCurrentUrl] = useState(apiClient.defaults.baseURL);
  const [inputIp, setInputIp] = useState('');
  const [testing, setTesting] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const candidates = getCandidateHosts();

  useEffect(() => {
    if (visible) {
      setCurrentUrl(apiClient.defaults.baseURL);
      testCurrentConnection();
    }
  }, [visible]);

  const testCurrentConnection = async () => {
    setTesting(true);
    setStatusResult(null);
    const res = await checkBackendHealth();
    setStatusResult(res);
    setTesting(false);
  };

  const handleApplyCandidate = async (host) => {
    setTesting(true);
    const targetUrl = `http://${host}:${API_PORT}/api`;
    const res = await setCustomApiUrl(targetUrl);
    setTesting(false);
    if (res.success) {
      setCurrentUrl(res.url);
      setStatusResult({ success: true, url: res.url });
      Alert.alert('Thành công 🎉', `Đã kết nối máy chủ tại ${res.url}!`);
      if (onSaved) onSaved(res.url);
      onClose();
    } else {
      Alert.alert('Không thể kết nối', `Máy chủ tại ${targetUrl} không phản hồi.\nLỗi: ${res.error || 'Timeout'}`);
    }
  };

  const handleManualSave = async () => {
    if (!inputIp.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập IP hoặc URL máy chủ');
      return;
    }
    setTesting(true);
    const res = await setCustomApiUrl(inputIp.trim());
    setTesting(false);
    if (res.success) {
      setCurrentUrl(res.url);
      setStatusResult({ success: true, url: res.url });
      Alert.alert('Thành công 🎉', `Đã lưu và kết nối máy chủ tại ${res.url}!`);
      if (onSaved) onSaved(res.url);
      onClose();
    } else {
      Alert.alert('Kết nối thất bại', `Không thể kết nối đến ${res.url}.\nLỗi: ${res.error || 'Network Error'}`);
    }
  };

  const handleAutoScan = async () => {
    setTesting(true);
    const discovered = await autoDiscoverWorkingHost();
    setTesting(false);
    if (discovered) {
      setCurrentUrl(discovered);
      setStatusResult({ success: true, url: discovered });
      Alert.alert('Tìm thấy máy chủ 🎉', `Đã tự động kết nối thành công tới ${discovered}!`);
      if (onSaved) onSaved(discovered);
      onClose();
    } else {
      Alert.alert('Không tìm thấy', 'Đã quét tất cả các địa chỉ IP ứng viên nhưng không thấy Backend phản hồi. Vui lòng kiểm tra lại Backend C# đã chạy chưa.');
    }
  };

  const handleReset = async () => {
    const def = await resetToAutoDetectedUrl();
    setCurrentUrl(def);
    testCurrentConnection();
    Alert.alert('Đã khôi phục', `Đã chuyển về URL tự động phát hiện: ${def}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 22 }}>⚙️</Text>
              <Text style={styles.modalTitle}>Cài đặt máy chủ Backend</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Current Active URL Banner */}
            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>Địa chỉ hiện tại đang dùng:</Text>
              <Text style={styles.currentUrlText}>{currentUrl}</Text>
              <View style={styles.statusIndicatorRow}>
                {testing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : statusResult?.success ? (
                  <View style={styles.badgeSuccess}>
                    <Text style={styles.badgeSuccessText}>🟢 Kết nối tốt (HTTP 200 OK)</Text>
                  </View>
                ) : (
                  <View style={styles.badgeError}>
                    <Text style={styles.badgeErrorText}>🔴 Mất kết nối (Network Error)</Text>
                  </View>
                )}
                <TouchableOpacity onPress={testCurrentConnection} style={styles.testBtn}>
                  <Text style={styles.testBtnText}>Kiểm tra lại</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Auto Scan Button */}
            <TouchableOpacity
              style={styles.autoScanBtn}
              onPress={handleAutoScan}
              disabled={testing}
              activeOpacity={0.8}
            >
              <Text style={styles.autoScanBtnText}>🔍 Tự động quét & Dò tìm IP Backend</Text>
            </TouchableOpacity>

            {/* Quick Select Candidates */}
            <Text style={styles.subHeading}>Hoặc chọn nhanh IP máy tính trong mạng:</Text>
            <View style={styles.candidateList}>
              {candidates.map((host) => (
                <TouchableOpacity
                  key={host}
                  style={styles.candidateCard}
                  onPress={() => handleApplyCandidate(host)}
                  activeOpacity={0.7}
                  disabled={testing}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.candidateHost}>{host}</Text>
                    <Text style={styles.candidateDesc}>
                      {host === '10.0.2.2' ? 'Máy ảo Android Emulator' : host === 'localhost' ? 'Máy tính nội bộ' : 'Mạng Wi-Fi nội bộ'}
                    </Text>
                  </View>
                  <Text style={styles.candidateAction}>Chọn ➔</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Manual IP Input */}
            <Text style={styles.subHeading}>Hoặc tự nhập IP máy tính / Link Tunnel:</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="VD: 192.168.31.155 hoặc link ngrok"
                placeholderTextColor={colors.textMuted}
                value={inputIp}
                onChangeText={setInputIp}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleManualSave}
                disabled={testing}
                activeOpacity={0.8}
              >
                <Text style={styles.applyBtnText}>Lưu & Dùng</Text>
              </TouchableOpacity>
            </View>

            {/* Reset */}
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>↺ Khôi phục tự động dò</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '700',
  },
  statusBox: {
    backgroundColor: '#f8fafc',
    borderRadius: borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  currentUrlText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  badgeError: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeErrorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b91c1c',
  },
  testBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  autoScanBtn: {
    backgroundColor: '#ea580c',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: 16,
  },
  autoScanBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  candidateList: {
    gap: 8,
    marginBottom: 16,
  },
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  candidateHost: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  candidateDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  candidateAction: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.text,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  resetBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetBtnText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});

