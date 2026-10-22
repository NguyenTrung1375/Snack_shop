import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../constants/theme';
import { DEFAULT_SNACK_IMAGE } from '../constants/snackImages';
import { getProduct, getProducts, getProductReviews } from '../api/products';
import { addToCart } from '../api/cart';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function ProductDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const productId = route?.params?.id;
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upsellItems, setUpsellItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const { token } = useAuthStore();
  const { cartCount, fetchCart, incrementCount } = useCartStore();

  const formatVnd = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getProduct(productId);
        if (!isMounted) return;
        setProduct(data);

        if (data.bienThes && data.bienThes.length > 0) {
          const current = data.bienThes.find((b) => b.maSanPham === data.maSanPham);
          setSelectedVariant(current || data.bienThes[0]);
        } else {
          setSelectedVariant(data);
        }

        // Fetch recommendations for upsell
        const allProds = await getProducts({ pageSize: 4 });
        const list = Array.isArray(allProds) ? allProds : allProds?.items || [];
        setUpsellItems(list.filter((p) => p.maSanPham !== productId).slice(0, 2));
      } catch (err) {
        console.warn('Lỗi tải chi tiết món ăn:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      if (!productId) return;
      try {
        setLoadingReviews(true);
        const data = await getProductReviews(productId);
        if (isMounted) {
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn('Lỗi tải đánh giá sản phẩm:', err);
      } finally {
        if (isMounted) setLoadingReviews(false);
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const currentItem = selectedVariant || product;

  const hasDiscount = currentItem?.giaSauGiam != null && currentItem.giaSauGiam < currentItem.giaBan;
  const unitPrice = hasDiscount ? currentItem.giaSauGiam : (currentItem?.giaBan || 0);
  const totalPrice = unitPrice * quantity;
  const oldUnitPrice = hasDiscount ? currentItem.giaBan : 0;
  const discountPercent = currentItem?.phanTramGiam || (hasDiscount && currentItem.giaBan > 0 ? Math.round(((currentItem.giaBan - currentItem.giaSauGiam) / currentItem.giaBan) * 100) : 0);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Món ngon SnackShop: ${currentItem?.tenSanPham} - Giá chỉ ${formatVnd(currentItem?.giaBan)}. Mời bạn thưởng thức!`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleAddToCart = async (isBuyNow = false) => {
    if (!token) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản để thêm món vào giỏ hàng và đặt món ăn vặt.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (!currentItem) return;

    try {
      setIsSubmitting(true);
      await addToCart({
        maSanPham: currentItem.maSanPham,
        soLuong: quantity,
      });

      incrementCount(quantity);
      fetchCart();

      if (isBuyNow) {
        navigation.navigate('Cart');
      } else {
        const title = currentItem.khoiLuong
          ? `${product.tenSanPham} (${currentItem.khoiLuong})`
          : product.tenSanPham;
        Alert.alert(
          'Đã thêm vào giỏ hàng 🎉',
          `Đã thêm ${quantity} "${title}" vào giỏ hàng của bạn.`,
          [
            {
              text: 'Xem giỏ hàng',
              onPress: () => navigation.navigate('MainTabs', { screen: 'CartTab' }),
            },
            { text: 'Tiếp tục chọn món' },
          ]
        );
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng lúc này.';
      Alert.alert('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết món ăn ngon...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>⚠️</Text>
        <Text style={styles.notFoundTitle}>Không tìm thấy món ăn</Text>
        <Text style={styles.notFoundSub}>
          Món ăn này có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.
        </Text>
        <TouchableOpacity style={styles.backBtnLarge} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Floating App Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.circleBtnIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.topBarTitle} numberOfLines={1}>
          Chi tiết món ngon
        </Text>

        <View style={styles.topRightBtns}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 18 }}>🛍️</Text>
            {cartCount > 0 && (
              <View style={styles.topCartBadge}>
                <Text style={styles.topCartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 16 }}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. HERO PRODUCT IMAGE */}
        <View style={styles.heroImageWrapper}>
          <Image
            source={{
              uri:
                currentItem?.hinhAnhDaiDien ||
                currentItem?.hinhAnh ||
                product?.hinhAnhDaiDien ||
                product?.hinhAnh ||
                DEFAULT_SNACK_IMAGE,
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Badges Over Image */}
          <View style={styles.heroBadgeTopLeft}>
            {currentItem?.laBanChay ? (
              <View style={styles.bestSellerHeroBadge}>
                <Text style={styles.bestSellerHeroText}>🔥 Bán chạy nhất</Text>
              </View>
            ) : null}
            {hasDiscount ? (
              <View style={styles.flashSaleHeroBadge}>
                <Text style={styles.flashSaleHeroText}>⚡ Giảm giá</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* 2. PRODUCT MAIN INFO CARD */}
        <View style={styles.infoCard}>
          <View style={styles.brandOriginRow}>
            <View style={styles.brandDotTag}>
              <View style={styles.greenDot} />
              <Text style={styles.brandTagText}>SNACKSHOP ORIGINAL</Text>
            </View>
          </View>

          <Text style={styles.productHeading}>
            {product.tenSanPham}
            {currentItem?.khoiLuong ? ` (${currentItem.khoiLuong})` : ''}
          </Text>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.mainPrice}>{formatVnd(unitPrice)}</Text>
            {hasDiscount && oldUnitPrice > unitPrice && (
              <Text style={styles.strikethroughPrice}>{formatVnd(oldUnitPrice)}</Text>
            )}
            {hasDiscount && discountPercent > 0 && (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>-{discountPercent}%</Text>
              </View>
            )}
          </View>

          {/* Social Proof Row */}
          <View style={styles.socialProofRow}>
            <View style={styles.ratingBox}>
              <Text style={styles.starGold}>★</Text>
              <Text style={styles.scoreText}>
                {reviews.length > 0
                  ? (reviews.reduce((acc, r) => acc + (r.soSao || 0), 0) / reviews.length).toFixed(1)
                  : currentItem?.diemTrungBinh
                    ? Number(currentItem.diemTrungBinh).toFixed(1)
                    : '5.0'}
              </Text>
              <Text style={styles.reviewCountText}>
                ({reviews.length > 0 ? reviews.length : (currentItem?.soDanhGia || 0)})
              </Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.soldTotalText}>
                Đã bán{' '}
                <Text style={{ fontWeight: '700', color: colors.onSurface }}>
                  {currentItem?.daBan != null ? currentItem.daBan : 0}
                </Text>
              </Text>
            </View>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. PHÂN LOẠI TRỌNG LƯỢNG (THEO DATABASE GỐC) */}
        <View style={styles.optionsSection}>
          {/* Phân loại trọng lượng từ database nếu có biến thể */}
          {product.bienThes && product.bienThes.length > 1 ? (
            <View style={styles.optionBlock}>
              <Text style={styles.optionBlockTitle}>
                Phân loại trọng lượng:{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {selectedVariant?.khoiLuong || 'Mặc định'}
                </Text>
              </Text>
              <View style={styles.chipsWrap}>
                {product.bienThes.map((variant) => {
                  const isSelected = selectedVariant?.maSanPham === variant.maSanPham;
                  return (
                    <TouchableOpacity
                      key={variant.maSanPham}
                      style={[
                        styles.variantChip,
                        isSelected && styles.activeVariantChip,
                      ]}
                      onPress={() => setSelectedVariant(variant)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.variantChipText,
                          isSelected && styles.activeVariantChipText,
                        ]}
                      >
                        {variant.khoiLuong || variant.tenSanPham} •{' '}
                        {formatVnd(variant.giaBan)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : product.khoiLuong ? (
            <View style={styles.optionBlock}>
              <Text style={styles.optionBlockTitle}>
                Trọng lượng quy cách:{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {product.khoiLuong}
                </Text>
              </Text>
            </View>
          ) : null}

          {/* Stepper Số lượng & Tồn kho */}
          <View style={styles.stepperRow}>
            <View>
              <Text style={styles.stepperLabel}>Số lượng muốn mua</Text>
              <Text style={styles.stockStatus}>
                Còn lại {currentItem?.soLuongTon != null ? currentItem.soLuongTon : 0} {currentItem?.donViTinh || 'món'} tại kho
              </Text>
            </View>

            <View style={styles.stepperControls}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                activeOpacity={0.7}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityVal}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() =>
                  setQuantity((q) =>
                    Math.min(currentItem?.soLuongTon || 99, q + 1)
                  )
                }
                activeOpacity={0.7}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. TIÊU CHUẨN AN TOÀN & THÔNG TIN (4 Thẻ) */}
        <View style={styles.specsSection}>
          <Text style={styles.specsTitle}>🛡️ Thông tin & Tiêu chuẩn an toàn</Text>
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specIcon}>📍</Text>
              <View>
                <Text style={styles.specLabel}>Xuất xứ</Text>
                <Text style={styles.specValue}>Trảng Bàng, Tây Ninh</Text>
              </View>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specIcon}>⏳</Text>
              <View>
                <Text style={styles.specLabel}>Hạn sử dụng</Text>
                <Text style={styles.specValue}>03 tháng (xem bao bì)</Text>
              </View>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specIcon}>📜</Text>
              <View>
                <Text style={styles.specLabel}>Chứng nhận</Text>
                <Text style={styles.specValue}>Chuẩn ATVSTP số 21/B</Text>
              </View>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specIcon}>📦</Text>
              <View>
                <Text style={styles.specLabel}>Quy cách gói</Text>
                <Text style={styles.specValue}>Túi Zip bạc hút chân không</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 5. THƯỜNG MUA CÙNG (Combo ngon) */}
        {upsellItems.length > 0 && (
          <View style={styles.upsellSection}>
            <Text style={styles.upsellTitle}>
              🍗 Thường mua cùng <Text style={styles.upsellSub}>(Combo ngon)</Text>
            </Text>
            {upsellItems.map((item) => (
              <View key={item.maSanPham} style={styles.upsellCard}>
                <Image
                  source={{
                    uri:
                      item.hinhAnhDaiDien ||
                      item.hinhAnh ||
                      DEFAULT_SNACK_IMAGE,
                  }}
                  style={styles.upsellThumb}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.upsellName} numberOfLines={1}>
                    {item.tenSanPham}
                  </Text>
                  <Text style={styles.upsellPrice}>{formatVnd(item.giaBan)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.upsellAddBtn}
                  onPress={() => {
                    addToCart({ maSanPham: item.maSanPham, soLuong: 1 });
                    incrementCount(1);
                    fetchCart();
                    Alert.alert('Thành công', `Đã thêm combo "${item.tenSanPham}"!`);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.upsellAddText}>+ Thêm</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 7. CUSTOMER REVIEWS SECTION */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeaderRow}>
            <Text style={styles.reviewsSectionTitle}>⭐ Đánh giá từ khách hàng</Text>
            <Text style={styles.reviewsSectionCount}>({reviews.length})</Text>
          </View>

          {/* Summary Box */}
          <View style={styles.reviewSummaryBox}>
            <View style={styles.scoreCol}>
              <Text style={styles.summaryScoreNum}>
                {reviews.length > 0
                  ? (reviews.reduce((acc, r) => acc + (r.soSao || 0), 0) / reviews.length).toFixed(1)
                  : currentItem?.diemTrungBinh != null && Number(currentItem.diemTrungBinh) > 0
                    ? Number(currentItem.diemTrungBinh).toFixed(1)
                    : '5.0'}
              </Text>
              <View style={styles.summaryStarsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Text key={s} style={styles.summaryStarIcon}>★</Text>
                ))}
              </View>
              <Text style={styles.summaryScoreSub}>
                {reviews.length > 0
                  ? `Dựa trên ${reviews.length} đánh giá thực tế từ người mua`
                  : 'Chất lượng đảm bảo từ SnackShop'}
              </Text>
            </View>
          </View>

          {/* Reviews List or Empty State */}
          {loadingReviews ? (
            <View style={styles.reviewLoadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.reviewLoadingText}>Đang tải đánh giá...</Text>
            </View>
          ) : reviews.length === 0 ? (
            <View style={styles.emptyReviewBox}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📝</Text>
              <Text style={styles.emptyReviewText}>
                Chưa có đánh giá nào cho món này. Hãy là người đầu tiên thưởng thức và đánh giá nhé!
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((rev, idx) => {
                const reviewDate = rev.ngayTao
                  ? new Date(rev.ngayTao).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })
                  : '';
                return (
                  <View key={rev.maDanhGia || idx} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <View style={styles.reviewerAvatar}>
                        <Text style={styles.reviewerAvatarText}>
                          {(rev.tenKhachHang || 'K').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.reviewerName}>
                          {rev.tenKhachHang || 'Khách hàng'}
                        </Text>
                        <View style={styles.reviewerStarsRow}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Text
                              key={star}
                              style={[
                                styles.reviewCardStar,
                                star <= (rev.soSao || 5)
                                  ? styles.reviewCardStarActive
                                  : styles.reviewCardStarInactive,
                              ]}
                            >
                              ★
                            </Text>
                          ))}
                          <Text style={styles.reviewDateText}>{reviewDate}</Text>
                        </View>
                      </View>
                    </View>

                    {rev.binhLuan ? (
                      <Text style={styles.reviewCommentText}>{rev.binhLuan}</Text>
                    ) : (
                      <Text style={styles.reviewCommentEmpty}>
                        Khách hàng không để lại nhận xét chi tiết.
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 8. STICKY BOTTOM ACTION BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.consultBtn}
          onPress={() =>
            Alert.alert(
              'Tư vấn trực tiếp',
              'Đội ngũ SnackShop sẵn sàng hỗ trợ bạn qua Zalo/Hotline: 0909 123 456'
            )
          }
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18 }}>💬</Text>
          <Text style={styles.consultText}>Tư vấn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addCartBottomBtn}
          onPress={() => handleAddToCart(false)}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 16 }}>🛍️</Text>
          <Text style={styles.addCartBottomText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={() => handleAddToCart(true)}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.buyNowTitle}>Mua ngay</Text>
              <Text style={styles.buyNowPrice}>{formatVnd(totalPrice)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 6,
  },
  notFoundSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  backBtnLarge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: 8,
    backgroundColor: 'rgba(255, 248, 245, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    zIndex: 10,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  topRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
  },
  circleBtnIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
  },
  topCartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  topCartBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroImageWrapper: {
    width: '100%',
    height: 320,
    backgroundColor: colors.surfaceContainerHigh,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadgeTopLeft: {
    position: 'absolute',
    top: 12,
    left: 14,
    gap: 6,
  },
  bestSellerHeroBadge: {
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  bestSellerHeroText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  flashSaleHeroBadge: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  flashSaleHeroText: {
    color: colors.primaryDeep,
    fontSize: 10,
    fontWeight: '800',
  },
  photoCounterBadge: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(33, 26, 21, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  photoCounterText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  brandOriginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  brandDotTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  brandTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  originPill: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  originText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  productHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
    lineHeight: 24,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  mainPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  strikethroughPrice: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discountPill: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  discountPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  flashSaleTag: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginLeft: 'auto',
  },
  flashSaleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  socialProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
    marginTop: 12,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starGold: {
    fontSize: 14,
    color: colors.accentGold,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.onSurface,
  },
  reviewCountText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dotSeparator: {
    fontSize: 10,
    color: colors.textMuted,
    marginHorizontal: 2,
  },
  soldTotalText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  shareBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  optionsSection: {
    backgroundColor: colors.surfaceContainerLowest,
    marginTop: 12,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: 16,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  optionBlock: {
    gap: 8,
  },
  optionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionBlockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activeVariantChip: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.primary,
  },
  variantChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  activeVariantChipText: {
    color: colors.primaryDeep,
    fontWeight: '800',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
  },
  stockStatus: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    lineHeight: 18,
  },
  quantityVal: {
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
  },
  specsSection: {
    backgroundColor: colors.surfaceContainerLowest,
    marginTop: 12,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  specsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 10,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specBox: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    padding: 10,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  specIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  specLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  specValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 1,
  },
  tipCard: {
    backgroundColor: colors.surfaceContainerLow,
    marginHorizontal: spacing.lg,
    marginTop: 12,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDeep,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
  },
  upsellSection: {
    backgroundColor: colors.surfaceContainerLowest,
    marginTop: 12,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: 10,
  },
  upsellTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
  },
  upsellSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  upsellCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  upsellThumb: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
  },
  upsellName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface,
  },
  upsellPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  upsellAddBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
  },
  upsellAddText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  reviewsSection: {
    backgroundColor: colors.surfaceContainerLowest,
    marginTop: 12,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
  },
  seeAllReviews: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  reviewScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    padding: 12,
    borderRadius: borderRadius.lg,
    gap: 16,
  },
  scoreLeft: {
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
    paddingRight: 14,
  },
  bigScore: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.onSurface,
  },
  bigStars: {
    fontSize: 11,
    color: colors.accentGold,
    marginVertical: 2,
  },
  satisfactionText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  scoreRightBars: {
    flex: 1,
    gap: 6,
  },
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    width: 60,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  barNum: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurface,
    width: 20,
    textAlign: 'right',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  consultBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  consultText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 2,
  },
  addCartBottomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: borderRadius.md,
    height: 46,
    gap: 6,
  },
  addCartBottomText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  buyNowBtn: {
    flex: 1.2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  buyNowPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffdbcf',
  },
  reviewsSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  reviewsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
  },
  reviewsSectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  reviewSummaryBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  scoreCol: {
    alignItems: 'center',
  },
  summaryScoreNum: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.accentGold,
  },
  summaryStarsRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  summaryStarIcon: {
    fontSize: 18,
    color: colors.accentGold,
    marginHorizontal: 1,
  },
  summaryScoreSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reviewLoadingBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  reviewLoadingText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyReviewBox: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
  },
  emptyReviewText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  reviewsList: {
    marginTop: spacing.xs,
  },
  reviewCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
  },
  reviewerStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewCardStar: {
    fontSize: 13,
    marginRight: 1,
  },
  reviewCardStarActive: {
    color: colors.accentGold,
  },
  reviewCardStarInactive: {
    color: '#d1d5db',
  },
  reviewDateText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 8,
  },
  reviewCommentText: {
    fontSize: 13,
    color: colors.onSurface,
    lineHeight: 18,
    marginTop: 4,
  },
  reviewCommentEmpty: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: 4,
  },
});
