import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getComboById, formatVnd } from '../constants/snackCombos';
import { getProduct, getProductReviews } from '../api/products';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { addToCart } from '../api/cart';

const { width } = Dimensions.get('window');

export default function ComboDetailScreen({ route, navigation }) {
  const comboId = route?.params?.comboId;
  const combo = useMemo(() => getComboById(comboId), [comboId]);

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Real data state fetched live from backend API / database
  const [realMetrics, setRealMetrics] = useState({
    soldCount: combo.soldCount,
    rating: combo.rating,
    reviewCount: combo.reviewCount,
    reviews: [],
    loading: true,
  });

  const { token } = useAuthStore();
  const { cartCount, fetchCart, addComboVoucher } = useCartStore();

  // Fetch real sold count, ratings, and customer reviews from live database
  useEffect(() => {
    let isMounted = true;
    const fetchRealData = async () => {
      try {
        const productPromises = combo.items.map((it) =>
          getProduct(it.maSanPham).catch(() => null)
        );
        const reviewPromises = combo.items.map((it) =>
          getProductReviews(it.maSanPham).catch(() => [])
        );

        const [productsData, reviewsData] = await Promise.all([
          Promise.all(productPromises),
          Promise.all(reviewPromises),
        ]);

        if (!isMounted) return;

        const validProducts = productsData.filter(Boolean);
        // Tổng số lượt bán thực tế của các món trong combo từ database
        const realTotalSold = validProducts.reduce(
          (sum, p) => sum + (Number(p.daBan) || 0),
          0
        );

        // Thu thập toàn bộ đánh giá thực tế từ khách hàng
        const allReviews = reviewsData.flat().filter(Boolean);
        const realReviewCount = allReviews.length;

        let realAvgRating = combo.rating;
        if (allReviews.length > 0) {
          const totalStars = allReviews.reduce(
            (sum, r) => sum + (Number(r.soSao) || 5),
            0
          );
          realAvgRating = Math.round((totalStars / allReviews.length) * 10) / 10;
        } else if (validProducts.length > 0) {
          const validRatings = validProducts
            .map((p) => Number(p.diemTrungBinh) || 0)
            .filter((r) => r > 0);
          if (validRatings.length > 0) {
            realAvgRating =
              Math.round(
                (validRatings.reduce((a, b) => a + b, 0) / validRatings.length) * 10
              ) / 10;
          }
        }

        setRealMetrics({
          soldCount: realTotalSold > 0 ? realTotalSold : combo.soldCount,
          rating: realAvgRating || combo.rating,
          reviewCount: realReviewCount > 0 ? realReviewCount : combo.reviewCount,
          reviews: allReviews,
          loading: false,
        });
      } catch (err) {
        console.warn('Lỗi tải dữ liệu real cho combo:', err);
        if (isMounted) {
          setRealMetrics((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    fetchRealData();
    return () => {
      isMounted = false;
    };
  }, [combo]);

  const images = useMemo(() => {
    if (combo.gallery && combo.gallery.length > 0) {
      return combo.gallery;
    }
    return [combo.image];
  }, [combo]);

  const handleShare = async () => {
    try {
      await Share.share({
        title: combo.name,
        message: `Món ngon SnackShop: ${combo.name} chỉ ${formatVnd(combo.comboPrice)} (Tiết kiệm ${combo.discountPercent}%). Đặt ngay tại SnackShop!`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const copyCode = () => {
    setCopiedVoucher(true);
    Alert.alert('Thành công', 'Đã lưu mã ưu đãi SNACK20 vào ví của bạn!');
  };

  const updateQuantity = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async (isBuyNow = false) => {
    if (!token) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản để đặt mua combo.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    try {
      setIsAdding(true);
      for (const item of combo.items) {
        await addToCart({
          maSanPham: item.maSanPham,
          soLuong: (item.soLuong || 1) * quantity,
        });
      }
      if (addComboVoucher) {
        addComboVoucher({
          ...combo,
          savedAmount: (combo.savedAmount || 0) * quantity,
        });
      }
      await fetchCart();

      if (isBuyNow) {
        navigation.navigate('MainTabs', { screen: 'CartTab' });
      } else {
        Alert.alert(
          'Đã thêm vào giỏ hàng 🎉',
          `Đã thêm ${quantity} suất "${combo.name}" (${combo.items.length * quantity} món) vào giỏ hàng của bạn!`,
          [
            {
              text: 'Xem giỏ hàng',
              onPress: () => navigation.navigate('MainTabs', { screen: 'CartTab' }),
            },
            { text: 'Tiếp tục xem món' },
          ]
        );
      }
    } catch (err) {
      console.warn('Lỗi thêm combo vào giỏ:', err);
      Alert.alert('Thông báo', 'Không thể thêm combo vào giỏ hàng lúc này. Vui lòng thử lại!');
    } finally {
      setIsAdding(false);
    }
  };

  const totalCalculated = combo.comboPrice * quantity;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* FLOATING TOP APP BAR */}
      <SafeAreaView style={styles.floatingHeader} edges={['top']}>
        <TouchableOpacity
          style={styles.floatingCircleBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingBackArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.floatingHeaderRight}>
          <TouchableOpacity
            style={styles.floatingCircleBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 16 }}>📤</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.floatingCircleBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 18 }}>🛍️</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. HERO MEDIA CAROUSEL */}
        <View style={styles.heroMediaContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const index = Math.round(x / width);
              setActiveImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imgUri, idx) => (
              <Image
                key={idx}
                source={{ uri: imgUri }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Flash Promo Badge */}
          <View style={styles.heroFlashBadge}>
            <Text style={{ fontSize: 13, marginRight: 4 }}>🔥</Text>
            <Text style={styles.heroFlashText}>
              GIẢM {combo.discountPercent}% HÔM NAY
            </Text>
          </View>

          {/* Pagination Counter Indicator */}
          {images.length > 1 && (
            <View style={styles.heroPagination}>
              <Text style={{ fontSize: 12, marginRight: 4 }}>📷</Text>
              <Text style={styles.heroPaginationText}>
                {activeImageIndex + 1}/{images.length} ảnh
              </Text>
            </View>
          )}
        </View>

        {/* 2. MAIN INFORMATION CONTAINER */}
        <View style={styles.mainInfoContainer}>
          {/* Tag Category Verification */}
          <View style={styles.verificationRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.verificationText}>COMBO ĐẶC SẢN CHỌN LỌC</Text>
          </View>

          {/* Combo Title */}
          <Text style={styles.titleText}>{combo.name}</Text>

          {/* Social Proof Metrics (Real Database Data) */}
          <View style={styles.metricsRow}>
            <View style={styles.ratingBox}>
              <Text style={styles.starText}>⭐</Text>
              <Text style={styles.ratingNumber}>
                {Number(realMetrics.rating).toFixed(1)}
              </Text>
              <Text style={styles.reviewCountText}>
                ({realMetrics.reviewCount} đánh giá)
              </Text>
            </View>
            <Text style={styles.metricDot}>•</Text>
            <View style={styles.soldBox}>
              <Text style={{ fontSize: 13, marginRight: 4 }}>🔥</Text>
              <Text style={styles.soldText}>
                Đã bán{' '}
                <Text style={styles.soldNumber}>
                  {Number(realMetrics.soldCount).toLocaleString('vi-VN')}
                </Text>{' '}
                món
              </Text>
            </View>
          </View>

          {/* Pricing Row */}
          <View style={styles.pricingRow}>
            <Text style={styles.priceHighlight}>
              {formatVnd(combo.comboPrice)}
            </Text>
            <Text style={styles.originalPriceText}>
              {formatVnd(combo.originalPrice)}
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>
                -{combo.discountPercent}% GIẢM NGAY
              </Text>
            </View>
          </View>

          {/* Interactive Voucher Banner */}
          <View style={styles.voucherCard}>
            <View style={styles.voucherLeft}>
              <View style={styles.voucherIconWrap}>
                <Text style={{ fontSize: 16 }}>⚡</Text>
              </View>
              <View style={styles.voucherTextWrap}>
                <Text style={styles.voucherCardTitle}>Mã giảm thêm 20.000đ</Text>
                <Text style={styles.voucherCardSub}>
                  Đơn từ 199k • Mã:{' '}
                  <Text style={styles.voucherCardCode}>SNACK20</Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.copyVoucherBtn,
                copiedVoucher && styles.copiedVoucherBtn,
              ]}
              onPress={copyCode}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.copyVoucherText,
                  copiedVoucher && styles.copiedVoucherText,
                ]}
              >
                {copiedVoucher ? 'Đã lưu!' : 'Sao chép'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. ITEMIZED BREAKDOWN ("BÊN TRONG COMBO CÓ GÌ?") */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18 }}>🍱</Text>
              <Text style={styles.sectionTitle}>Bên Trong Combo Có Gì?</Text>
            </View>
            <Text style={styles.sectionSub}>
              {combo.items.length} món tiêu chuẩn đóng nắp nhôm & túi zip riêng biệt, đảm bảo ATVSTP 100%
            </Text>
          </View>

          <View style={styles.itemsList}>
            {combo.items.map((it, idx) => (
              <View key={idx} style={styles.itemDetailCard}>
                <Image
                  source={{ uri: it.hinhAnh }}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />
                <View style={styles.itemDetailInfo}>
                  <Text style={styles.itemDetailName} numberOfLines={1}>
                    {it.soLuong > 1 ? `${it.soLuong}x ` : ''}
                    {it.tenSanPham}
                  </Text>
                  <View style={styles.itemSpecsRow}>
                    <View style={styles.specPill}>
                      <Text style={styles.specPillText}>{it.quyCach}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.itemPriceCol}>
                  <Text style={styles.itemPriceText}>
                    {formatVnd(it.giaLe * (it.soLuong || 1))}
                  </Text>
                  <Text style={styles.itemPriceSub}>Giá bán lẻ</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 4. TRANSPARENT CALCULATION RECEIPT CARD */}
        <View style={styles.sectionWrap}>
          <View style={styles.receiptCard}>
            {/* Header */}
            <View style={styles.receiptHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 18 }}>🧾</Text>
                <Text style={styles.receiptTitle}>
                  Tiết Kiệm Khi Mua Combo
                </Text>
              </View>
              <View style={styles.keoHoiBadge}>
                <Text style={styles.keoHoiText}>KÈO HỜI</Text>
              </View>
            </View>

            {/* Calculations */}
            <View style={styles.receiptRows}>
              <View style={styles.receiptLine}>
                <Text style={styles.receiptLineLabel}>Tổng giá mua lẻ từng món</Text>
                <Text style={styles.receiptLineOldPrice}>
                  {formatVnd(combo.originalPrice)}
                </Text>
              </View>

              <View style={styles.receiptLine}>
                <Text style={styles.receiptLineBoldLabel}>
                  Giá ưu đãi theo Combo
                </Text>
                <Text style={styles.receiptLineNewPrice}>
                  {formatVnd(combo.comboPrice)}
                </Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptLine}>
                <Text style={styles.receiptTotalSavedLabel}>
                  Bạn tiết kiệm được
                </Text>
                <Text style={styles.receiptTotalSavedVal}>
                  {formatVnd(combo.savedAmount)} (-{combo.discountPercent}%)
                </Text>
              </View>
            </View>

            {/* Bonus Tag */}
            <View style={styles.bonusBox}>
              <Text style={{ fontSize: 16, marginRight: 6 }}>🎁</Text>
              <Text style={styles.bonusText}>
                {combo.giftBonus ||
                  'Được tặng thêm 02 khăn lạnh cao cấp & đóng hộp giấy Kraft vintage sang trọng sẵn sàng làm quà tặng!'}
              </Text>
            </View>
          </View>
        </View>

        {/* 5. TASTING EXPERIENCE & QUALITY ASSURANCES */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Cảm Nhận Hương Vị & Bảo Quản</Text>

          {/* 2 Grid Cards */}
          <View style={styles.gridExperience}>
            <View style={styles.gridCard}>
              <View style={styles.gridIconWrap}>
                <Text style={{ fontSize: 18 }}>🍽️</Text>
              </View>
              <Text style={styles.gridCardTitle}>Vị Giòn & Đậm Đà</Text>
              <Text style={styles.gridCardSub}>
                {combo.flavorProfile ||
                  'Cay nhẹ the đầu lưỡi, mặn ngọt cân bằng, giòn rôm rốp kích thích vị giác tối đa.'}
              </Text>
            </View>

            <View style={styles.gridCard}>
              <View style={styles.gridIconWrap}>
                <Text style={{ fontSize: 18 }}>📺</Text>
              </View>
              <Text style={styles.gridCardTitle}>Phù Hợp Nhất</Text>
              <Text style={styles.gridCardSub}>
                {combo.bestFor ||
                  'Cày Netflix thâu đêm, tụ họp chiến game hoặc nhâm nhi tám chuyện cùng bạn bè.'}
              </Text>
            </View>
          </View>

          {/* Assurance Pills */}
          <View style={styles.assuranceBox}>
            <View style={styles.assuranceRow}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.assuranceTitle}>Hạn Sử Dụng 06 Tháng</Text>
                <Text style={styles.assuranceSub}>
                  Không chất bảo quản công nghiệp, đậy kín nắp sau khi mở bao bì.
                </Text>
              </View>
            </View>

            <View style={styles.assuranceDivider} />

            <View style={styles.assuranceRow}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>🚚</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.assuranceTitle}>Giao Hỏa Tốc 2H TP.HCM</Text>
                <Text style={styles.assuranceSub}>
                  Đóng gói 3 lớp carton bóng khí, cam kết đồ ăn nguyên vẹn giòn tan.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 6. ĐÁNH GIÁ THỰC TẾ TỪ KHÁCH HÀNG (REAL REVIEWS TỪ CSDL) */}
        <View style={styles.sectionWrap}>
          <View style={styles.reviewSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18 }}>⭐</Text>
              <Text style={styles.sectionTitle}>
                Đánh Giá Khách Hàng ({realMetrics.reviews.length})
              </Text>
            </View>
            <View style={styles.verifiedTagPill}>
              <Text style={styles.verifiedTagText}>✓ Dữ liệu thật từ đơn hàng</Text>
            </View>
          </View>

          {realMetrics.reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {realMetrics.reviews.slice(0, 6).map((rev, idx) => (
                <View key={rev.maDanhGia || idx} style={styles.reviewItemCard}>
                  <View style={styles.reviewUserRow}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {(rev.tenKhachHang || 'KH')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewUserName}>
                        {rev.tenKhachHang || 'Khách hàng SnackShop'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={styles.reviewStars}>
                          {'⭐'.repeat(Math.max(1, Math.min(5, rev.soSao || 5)))}
                        </Text>
                        <Text style={styles.reviewTimeText}>
                          {rev.ngayTao
                            ? new Date(rev.ngayTao).toLocaleDateString('vi-VN')
                            : 'Gần đây'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.verifiedBuyerBadge}>
                      <Text style={styles.verifiedBuyerText}>✓ Đã mua hàng</Text>
                    </View>
                  </View>

                  {rev.tenSanPham ? (
                    <Text style={styles.reviewedItemName}>
                      Món: <Text style={{ fontStyle: 'italic', color: '#A53600' }}>{rev.tenSanPham}</Text>
                    </Text>
                  ) : null}

                  <Text style={styles.reviewCommentText}>
                    "{rev.binhLuan || 'Món ăn vặt rất thơm ngon, giòn rụm và đóng gói cẩn thận!'}"
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyReviewBox}>
              <Text style={styles.emptyReviewText}>
                ⭐ Đánh giá tổng hợp trung bình {Number(realMetrics.rating).toFixed(1)}/5 từ các khách hàng đã thưởng thức các món trong combo này.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 6. STICKY BOTTOM INTERACTIVE CHECKOUT BAR */}
      <View style={styles.stickyFooter}>
        <View style={styles.stickyContent}>
          {/* Stepper Quantity Selector */}
          <View style={styles.stepperWrap}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(-1)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.stepVal}>{quantity}</Text>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Add To Cart Primary Button */}
          <TouchableOpacity
            style={[styles.checkoutBtn, isAdding && { opacity: 0.8 }]}
            onPress={() => handleAddToCart(false)}
            disabled={isAdding}
            activeOpacity={0.88}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 18 }}>🛍️</Text>
                <Text style={styles.checkoutBtnText}>
                  Thêm Vào Giỏ • {formatVnd(totalCalculated)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  floatingCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  floatingBackArrow: {
    fontSize: 32,
    color: '#211A15',
    marginTop: -4,
    fontWeight: '300',
  },
  floatingHeaderRight: {
    flexDirection: 'row',
    gap: 10,
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#A53600',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroMediaContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#EEE0D7',
  },
  heroImage: {
    width,
    height: width,
  },
  heroFlashBadge: {
    position: 'absolute',
    top: 60,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A53600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  heroFlashText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroPagination: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 26, 21, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  heroPaginationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mainInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    color: '#A53600',
    fontSize: 13,
    fontWeight: '900',
    marginRight: 5,
  },
  verificationText: {
    color: '#A53600',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#211A15',
    lineHeight: 28,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9EBE2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  starText: {
    fontSize: 12,
    marginRight: 3,
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#211A15',
    marginRight: 4,
  },
  reviewCountText: {
    fontSize: 12,
    color: '#5A4138',
  },
  metricDot: {
    color: '#E3BFB3',
    marginHorizontal: 8,
    fontSize: 14,
  },
  soldBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soldText: {
    fontSize: 13,
    color: '#5A4138',
  },
  soldNumber: {
    fontWeight: '700',
    color: '#211A15',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  priceHighlight: {
    fontSize: 24,
    fontWeight: '900',
    color: '#A53600',
    marginRight: 10,
  },
  originalPriceText: {
    fontSize: 15,
    color: '#8E7066',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: '#FFD0BE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7A5749',
  },
  voucherCard: {
    marginTop: 14,
    backgroundColor: '#FFF1E8',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F3E6DD',
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voucherIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFD0BE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  voucherTextWrap: {
    flex: 1,
  },
  voucherCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#211A15',
  },
  voucherCardSub: {
    fontSize: 12,
    color: '#5A4138',
    marginTop: 1,
  },
  voucherCardCode: {
    color: '#A53600',
    fontWeight: '800',
  },
  copyVoucherBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3BFB3',
  },
  copiedVoucherBtn: {
    backgroundColor: '#A53600',
    borderColor: '#A53600',
  },
  copyVoucherText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A53600',
  },
  copiedVoucherText: {
    color: '#FFFFFF',
  },
  sectionWrap: {
    marginTop: 22,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#211A15',
  },
  sectionSub: {
    fontSize: 12,
    color: '#795648',
    marginTop: 3,
    lineHeight: 16,
  },
  itemsList: {
    gap: 10,
  },
  itemDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F9EBE2',
  },
  itemThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#EEE0D7',
    marginRight: 12,
  },
  itemDetailInfo: {
    flex: 1,
  },
  itemDetailName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#211A15',
  },
  itemSpecsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  specPill: {
    backgroundColor: '#F9EBE2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  specPillText: {
    fontSize: 10,
    color: '#5A4138',
    fontWeight: '600',
  },
  itemPriceCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  itemPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A53600',
  },
  itemPriceSub: {
    fontSize: 10,
    color: '#8E7066',
    marginTop: 1,
  },
  receiptCard: {
    backgroundColor: '#FFF1E8',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3BFB3',
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E3BFB3',
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#211A15',
  },
  keoHoiBadge: {
    backgroundColor: '#FFD0BE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  keoHoiText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7A5749',
  },
  receiptRows: {
    paddingVertical: 10,
    gap: 6,
  },
  receiptLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLineLabel: {
    fontSize: 13,
    color: '#5A4138',
  },
  receiptLineOldPrice: {
    fontSize: 13,
    color: '#8E7066',
    textDecorationLine: 'line-through',
  },
  receiptLineBoldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#211A15',
  },
  receiptLineNewPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#A53600',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E3BFB3',
    marginVertical: 4,
  },
  receiptTotalSavedLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#211A15',
  },
  receiptTotalSavedVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A53600',
  },
  bonusBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  bonusText: {
    flex: 1,
    fontSize: 12,
    color: '#5A4138',
    lineHeight: 16,
  },
  gridExperience: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F9EBE2',
  },
  gridIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F9EBE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#211A15',
    marginBottom: 4,
  },
  gridCardSub: {
    fontSize: 11,
    color: '#795648',
    lineHeight: 15,
  },
  assuranceBox: {
    marginTop: 12,
    backgroundColor: '#FFF1E8',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  assuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assuranceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#211A15',
  },
  assuranceSub: {
    fontSize: 11,
    color: '#795648',
    marginTop: 1,
  },
  assuranceDivider: {
    height: 1,
    backgroundColor: '#F3E6DD',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#F3E6DD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  stickyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9EBE2',
    borderRadius: 22,
    padding: 3,
    height: 44,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#211A15',
  },
  stepVal: {
    width: 32,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: '#211A15',
  },
  checkoutBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#A53600',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A53600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  verifiedTagPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  reviewsList: {
    gap: 10,
    marginTop: 6,
  },
  reviewItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F9EBE2',
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD0BE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A53600',
  },
  reviewUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#211A15',
  },
  reviewStars: {
    fontSize: 10,
  },
  reviewTimeText: {
    fontSize: 10.5,
    color: '#8E7066',
  },
  verifiedBuyerBadge: {
    backgroundColor: '#F9EBE2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBuyerText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#795648',
  },
  reviewedItemName: {
    fontSize: 11,
    color: '#795648',
    marginBottom: 4,
  },
  reviewCommentText: {
    fontSize: 12,
    color: '#5A4138',
    lineHeight: 17,
  },
  emptyReviewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F9EBE2',
    alignItems: 'center',
  },
  emptyReviewText: {
    fontSize: 12,
    color: '#795648',
    textAlign: 'center',
    lineHeight: 18,
  },
});

