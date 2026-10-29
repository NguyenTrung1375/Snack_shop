import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SNACK_COMBOS,
  COMBO_CATEGORIES,
  formatVnd,
} from '../constants/snackCombos';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { addToCart } from '../api/cart';
import { colors } from '../constants/theme';

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 32 - 10) / 2;

export default function CombosScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [addingId, setAddingId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (2 cột) | 'list' (danh sách gọn)

  const { token } = useAuthStore();
  const { cartCount, fetchCart, addComboVoucher } = useCartStore();

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredCombos = useMemo(() => {
    let list = SNACK_COMBOS;
    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q) ||
          c.items.some((it) => it.tenSanPham.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const handleQuickAddCombo = async (combo) => {
    if (!token) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản để thêm trọn bộ combo vào giỏ hàng.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    try {
      setAddingId(combo.id);
      for (const item of combo.items) {
        await addToCart({
          maSanPham: item.maSanPham,
          soLuong: item.soLuong || 1,
        });
      }
      if (addComboVoucher) {
        addComboVoucher(combo);
      }
      await fetchCart();
      Alert.alert(
        'Đã thêm trọn bộ Combo 🎉',
        `Đã thêm thành công ${combo.items.length} món trong "${combo.name}" vào giỏ hàng của bạn! Tiết kiệm ngay ${formatVnd(combo.savedAmount || 0)}.`,
        [
          {
            text: 'Xem giỏ hàng',
            onPress: () => navigation.navigate('MainTabs', { screen: 'CartTab' }),
          },
          { text: 'Tiếp tục chọn combo' },
        ]
      );
    } catch (err) {
      console.warn('Lỗi thêm combo vào giỏ:', err);
      Alert.alert('Thông báo', 'Không thể thêm trọn bộ combo vào giỏ hàng lúc này. Vui lòng thử lại!');
    } finally {
      setAddingId(null);
    }
  };

  // Helper render tóm tắt món trong combo
  const getItemsSummary = (items) => {
    if (!items || items.length === 0) return '';
    return items
      .map((it) => it.tenSanPham.replace(/ - \d+ gram/g, '').replace(/ - GA3i.*$/i, '').trim())
      .join(', ');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />

      {/* 1. COMPACT HEADER BAR */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigation?.canGoBack && navigation.canGoBack() ? (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.iconBtn, { backgroundColor: '#F9EBE2', borderWidth: 0 }]}>
              <Text style={{ fontSize: 18 }}>🎁</Text>
            </View>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>
            🎉 Siêu Hội Combo
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowSearch(!showSearch)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 17 }}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
            activeOpacity={0.7}
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
      </View>

      {/* SEARCH BAR (EXPANDABLE) */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Text style={{ fontSize: 15, marginRight: 6 }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm theo tên combo, món bên trong..."
              placeholderTextColor="#8E7066"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Text style={{ color: '#8E7066', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. SLIM TICKER PROMO BANNER (TIẾT KIỆM KHÔNG GIAN) */}
        {showBanner && (
          <View style={styles.slimBanner}>
            <View style={styles.slimBannerContent}>
              <Text style={{ fontSize: 13, marginRight: 4 }}>📢</Text>
              <Text style={styles.slimBannerText} numberOfLines={1}>
                Đại tiệc Combo giảm đến <Text style={styles.boldAccent}>37%</Text> • Nhập mã{' '}
                <Text style={styles.boldCode}>COMBO30K</Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowBanner(false)}
              style={styles.slimBannerClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.slimBannerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. HORIZONTAL CATEGORY PILL TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {COMBO_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    isActive && styles.tabPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4. FEED TOOLBAR: COUNT + VIEW MODE TOGGLE (LƯỚI 2 CỘT / DANH SÁCH) */}
        <View style={styles.feedInfoRow}>
          <Text style={styles.feedCountText}>
            Hiển thị <Text style={styles.feedCountBold}>{filteredCombos.length}</Text> combo
          </Text>

          {/* Toggle Lưới / Danh sách */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
              onPress={() => setViewMode('grid')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, viewMode === 'grid' && styles.toggleBtnTextActive]}>
                ⊞ Lưới 2 cột
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, viewMode === 'list' && styles.toggleBtnTextActive]}>
                ☰ Danh sách
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. COMBO FEEDS */}
        {filteredCombos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🍟</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy combo phù hợp</Text>
            <Text style={styles.emptySub}>
              Hãy thử chọn phân khúc khác hoặc nhập từ khóa tìm kiếm mới nhé!
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetBtnText}>Xem tất cả combo</Text>
            </TouchableOpacity>
          </View>
        ) : viewMode === 'grid' ? (
          /* ========================================================== */
          /* CHẾ ĐỘ 1: LƯỚI 2 CỘT (GRID) - XEM ĐƯỢC 4-6 COMBOS / MÀN HÌNH */
          /* ========================================================== */
          <View style={styles.gridContainer}>
            {filteredCombos.map((combo) => {
              const isFav = !!favorites[combo.id];
              const isAdding = addingId === combo.id;

              return (
                <TouchableOpacity
                  key={combo.id}
                  style={styles.gridCard}
                  activeOpacity={0.88}
                  onPress={() =>
                    navigation.navigate('ComboDetail', { comboId: combo.id })
                  }
                >
                  {/* Image & Overlay Badges */}
                  <View style={styles.gridImgWrap}>
                    <Image
                      source={{ uri: combo.image }}
                      style={styles.gridImg}
                      resizeMode="cover"
                    />

                    {/* Discount badge top-left */}
                    <View style={styles.gridDiscountBadge}>
                      <Text style={styles.gridDiscountText}>
                        -{combo.discountPercent}%
                      </Text>
                    </View>

                    {/* Wishlist Heart Button */}
                    <TouchableOpacity
                      style={styles.gridHeartBtn}
                      onPress={() => toggleFavorite(combo.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 13 }}>{isFav ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>

                    {/* Bottom Tag */}
                    <View style={styles.gridCategoryStrip}>
                      <Text style={styles.gridCategoryText} numberOfLines={1}>
                        {combo.badge}
                      </Text>
                    </View>
                  </View>

                  {/* Card Body */}
                  <View style={styles.gridBody}>
                    <Text style={styles.gridTitle} numberOfLines={2}>
                      {combo.name}
                    </Text>

                    {/* Included Items Teaser */}
                    <Text style={styles.gridItemsTeaser} numberOfLines={1}>
                      🍱 {combo.items.length} món: {getItemsSummary(combo.items)}
                    </Text>

                    {/* Pricing */}
                    <View style={styles.gridPriceRow}>
                      <Text style={styles.gridComboPrice}>
                        {formatVnd(combo.comboPrice)}
                      </Text>
                      <Text style={styles.gridOriginalPrice}>
                        {formatVnd(combo.originalPrice)}
                      </Text>
                    </View>

                    {/* Savings Pill */}
                    <View style={styles.gridSavingsWrap}>
                      <Text style={styles.gridSavingsText}>
                        Tiết kiệm {formatVnd(combo.savedAmount)}
                      </Text>
                    </View>

                    {/* Quick Add Button */}
                    <TouchableOpacity
                      style={[styles.gridAddBtn, isAdding && { opacity: 0.8 }]}
                      onPress={() => handleQuickAddCombo(combo)}
                      disabled={isAdding}
                      activeOpacity={0.85}
                    >
                      {isAdding ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.gridAddBtnText}>🛒 Thêm giỏ</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* ========================================================== */
          /* CHẾ ĐỘ 2: DANH SÁCH GỌN (LIST) - XEM ĐƯỢC 6-8 COMBOS / MÀN HÌNH */
          /* ========================================================== */
          <View style={styles.listContainer}>
            {filteredCombos.map((combo) => {
              const isFav = !!favorites[combo.id];
              const isAdding = addingId === combo.id;

              return (
                <TouchableOpacity
                  key={combo.id}
                  style={styles.listCard}
                  activeOpacity={0.88}
                  onPress={() =>
                    navigation.navigate('ComboDetail', { comboId: combo.id })
                  }
                >
                  {/* Left Thumbnail */}
                  <View style={styles.listThumbWrap}>
                    <Image
                      source={{ uri: combo.image }}
                      style={styles.listThumb}
                      resizeMode="cover"
                    />
                    <View style={styles.listDiscountBadge}>
                      <Text style={styles.listDiscountText}>
                        -{combo.discountPercent}%
                      </Text>
                    </View>
                  </View>

                  {/* Middle Info */}
                  <View style={styles.listInfo}>
                    <View style={styles.listHeaderLine}>
                      <View
                        style={[
                          styles.listBadgePill,
                          { backgroundColor: combo.badgeColor || '#A53600' },
                        ]}
                      >
                        <Text style={styles.listBadgePillText}>{combo.badge}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleFavorite(combo.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={{ fontSize: 13 }}>{isFav ? '❤️' : '🤍'}</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.listTitle} numberOfLines={1}>
                      {combo.name}
                    </Text>

                    <Text style={styles.listItemsText} numberOfLines={1}>
                      {combo.items.length} món: {getItemsSummary(combo.items)}
                    </Text>

                    <View style={styles.listPriceRow}>
                      <Text style={styles.listComboPrice}>
                        {formatVnd(combo.comboPrice)}
                      </Text>
                      <Text style={styles.listOriginalPrice}>
                        {formatVnd(combo.originalPrice)}
                      </Text>
                      <Text style={styles.listSavingsText}>
                        (-{formatVnd(combo.savedAmount)})
                      </Text>
                    </View>
                  </View>

                  {/* Right Quick Add Button */}
                  <TouchableOpacity
                    style={[styles.listAddBtn, isAdding && { opacity: 0.8 }]}
                    onPress={() => handleQuickAddCombo(combo)}
                    disabled={isAdding}
                    activeOpacity={0.85}
                  >
                    {isAdding ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.listAddBtnText}>+ Thêm</Text>
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8F5',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F3E6DD',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 6,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    color: '#211A15',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#211A15',
    marginLeft: 8,
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    borderColor: '#FFF8F5',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF8F5',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#E3BFB3',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#211A15',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Slim Ticker Banner
  slimBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#FFD0BE',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F3E6DD',
  },
  slimBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slimBannerText: {
    fontSize: 11.5,
    color: '#5A4138',
    flex: 1,
  },
  boldAccent: {
    fontWeight: '800',
    color: '#A53600',
  },
  boldCode: {
    fontWeight: '800',
    color: '#A53600',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  slimBannerClose: {
    paddingLeft: 6,
  },
  slimBannerCloseText: {
    fontSize: 12,
    color: '#5A4138',
    fontWeight: '700',
  },
  // Category Pills
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F9EBE2',
    borderWidth: 1,
    borderColor: '#F3E6DD',
  },
  tabPillActive: {
    backgroundColor: '#A53600',
    borderColor: '#A53600',
    shadowColor: '#A53600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A4138',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Feed Info & View Toggle
  feedInfoRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedCountText: {
    fontSize: 12.5,
    color: '#5A4138',
  },
  feedCountBold: {
    fontWeight: '800',
    color: '#A53600',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F9EBE2',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#F3E6DD',
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#795648',
  },
  toggleBtnTextActive: {
    color: '#A53600',
    fontWeight: '800',
  },

  /* =================================== */
  /* GRID STYLES (2 CỘT TỐI ƯU SO SÁNH)  */
  /* =================================== */
  gridContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F9EBE2',
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 6,
  },
  gridImgWrap: {
    width: '100%',
    height: 118,
    backgroundColor: '#EEE0D7',
    position: 'relative',
  },
  gridImg: {
    width: '100%',
    height: '100%',
  },
  gridDiscountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridDiscountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  gridHeartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCategoryStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(33, 26, 21, 0.72)',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
  },
  gridCategoryText: {
    color: '#FFDBCE',
    fontSize: 9.5,
    fontWeight: '700',
  },
  gridBody: {
    padding: 9,
  },
  gridTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#211A15',
    lineHeight: 17,
    minHeight: 34,
  },
  gridItemsTeaser: {
    fontSize: 10.5,
    color: '#795648',
    marginTop: 2,
    marginBottom: 6,
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  gridComboPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A53600',
  },
  gridOriginalPrice: {
    fontSize: 10.5,
    color: '#8E7066',
    textDecorationLine: 'line-through',
  },
  gridSavingsWrap: {
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
    marginBottom: 8,
  },
  gridSavingsText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  gridAddBtn: {
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A53600',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A53600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  gridAddBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* =================================== */
  /* LIST STYLES (DANH SÁCH GỌN NGANG)   */
  /* =================================== */
  listContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F9EBE2',
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  listThumbWrap: {
    width: 78,
    height: 78,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#EEE0D7',
    position: 'relative',
    marginRight: 10,
  },
  listThumb: {
    width: '100%',
    height: '100%',
  },
  listDiscountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  listDiscountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  listInfo: {
    flex: 1,
    paddingRight: 6,
  },
  listHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  listBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  listBadgePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#211A15',
    lineHeight: 17,
  },
  listItemsText: {
    fontSize: 10.5,
    color: '#795648',
    marginTop: 1,
  },
  listPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 3,
  },
  listComboPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#A53600',
  },
  listOriginalPrice: {
    fontSize: 10.5,
    color: '#8E7066',
    textDecorationLine: 'line-through',
  },
  listSavingsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  listAddBtn: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A53600',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A53600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  listAddBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  emptyContainer: {
    paddingVertical: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#211A15',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#795648',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
  },
  resetBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: '#A53600',
    borderRadius: 18,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
