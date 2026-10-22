import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { createReview } from '../api/products';
import { useAuthStore } from '../store/authStore';
import { DEFAULT_SNACK_IMAGE } from '../constants/snackImages';

const RATING_TEXTS = {
  1: 'Rất tệ',
  2: 'Chưa ngon',
  3: 'Bình thường',
  4: 'Ngon',
  5: 'Rất ngon / Tuyệt vời',
};

export default function ReviewModal({ visible, onClose, onSuccess, item }) {
  const { token } = useAuthStore();
  const [soSao, setSoSao] = useState(5);
  const [binhLuan, setBinhLuan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setSoSao(5);
      setBinhLuan('');
      setSubmitting(false);
    }
  }, [visible, item]);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn vui lòng đăng nhập để gửi đánh giá món ăn nhé!'
      );
      return;
    }

    if (!item?.maChiTietDonHang) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin chi tiết đơn hàng để đánh giá.');
      return;
    }

    if (soSao < 1 || soSao > 5) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao từ 1 đến 5.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createReview({
        maChiTietDonHang: item.maChiTietDonHang,
        maSanPham: item.maSanPham,
        soSao,
        binhLuan: binhLuan.trim() ? binhLuan.trim() : null,
      });

      Alert.alert('Thành công', 'Cảm ơn bạn đã gửi đánh giá món ăn! 🌟');
      if (onSuccess) {
        onSuccess(res);
      }
      onClose();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Không thể gửi đánh giá món ăn.';
      Alert.alert('Thông báo', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.headerBadge}>⭐ ĐÁNH GIÁ MÓN ĂN</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {item?.tenSanPham || 'Món ăn vặt'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              disabled={submitting}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Product Info Preview */}
            <View style={styles.itemPreviewCard}>
              <Image
                source={{
                  uri: item?.hinhAnhDaiDien || DEFAULT_SNACK_IMAGE,
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemMeta}>
                <Text style={styles.itemMetaTitle} numberOfLines={2}>
                  {item?.tenSanPham || 'Sản phẩm từ đơn hàng'}
                </Text>
                <Text style={styles.itemMetaHint}>
                  Bạn cảm thấy hương vị món này thế nào?
                </Text>
              </View>
            </View>

            {/* Interactive Star Rating */}
            <View style={styles.ratingSection}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setSoSao(star)}
                    activeOpacity={0.7}
                    style={styles.starTouchable}
                  >
                    <Text
                      style={[
                        styles.starChar,
                        star <= soSao ? styles.starFilled : styles.starEmpty,
                      ]}
                    >
                      {star <= soSao ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.ratingFeedbackText}>
                {RATING_TEXTS[soSao] || 'Vui lòng chọn số sao'}
              </Text>
            </View>

            {/* Comment Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Nhận xét của bạn (không bắt buộc):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Chia sẻ cảm nhận của bạn về hương vị món ăn..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                maxLength={500}
                value={binhLuan}
                onChangeText={setBinhLuan}
                textAlignVertical="top"
                editable={!submitting}
              />
              <View style={styles.charCountRow}>
                <Text style={styles.charCountText}>
                  {binhLuan.length}/500 ký tự
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (soSao === 0 || submitting) && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={soSao === 0 || submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Gửi đánh giá</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  titleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  headerBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.onSurface,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  scrollContent: {
    paddingBottom: spacing.xs,
  },
  itemPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  itemMeta: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  itemMetaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  itemMetaHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starTouchable: {
    padding: 6,
  },
  starChar: {
    fontSize: 38,
    lineHeight: 42,
  },
  starFilled: {
    color: colors.accentGold,
  },
  starEmpty: {
    color: '#d1d5db',
  },
  ratingFeedbackText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentGold,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.onSurface,
    minHeight: 90,
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  charCountText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
