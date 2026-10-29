import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import { colors, spacing, borderRadius } from '../constants/theme';
import { DEFAULT_SNACK_IMAGE } from '../constants/snackImages';
import { getProducts, getCategories } from '../api/products';
import { addToCart } from '../api/cart';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { semanticSearchProducts } from '../utils/searchHelper';

const SORT_OPTIONS = [
  { label: 'Phổ biến nhất', value: 'popular' },
  { label: 'Bán chạy nhất', value: 'best_seller' },
  { label: 'Giá: Thấp đến Cao', value: 'price_asc' },
  { label: 'Giá: Cao đến Thấp', value: 'price_desc' },
  { label: 'Món mới nhất', value: 'newest' },
];

export default function ProductsScreen({ navigation, route }) {
  const initialCategory = route?.params?.category || 'all';
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('popular');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showSubCatModal, setShowSubCatModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [addingId, setAddingId] = useState(null);

  const { token } = useAuthStore();
  const { fetchCart, incrementCount } = useCartStore();

  const formatVnd = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const [prodsRes, catsRes] = await Promise.all([
        getProducts({ pageSize: 100 }, forceRefresh),
        getCategories(forceRefresh).catch(() => []),
      ]);

      const items = Array.isArray(prodsRes) ? prodsRes : (prodsRes?.items || []);
      const rawCats = Array.isArray(catsRes) ? catsRes : (catsRes?.value || catsRes?.items || []);
      const normalizedCats = rawCats.map((c) => ({
        ...c,
        tenLoai: c.tenLoaiSanPham || c.tenLoai || 'Món ngon',
        tenLoaiSanPham: c.tenLoaiSanPham || c.tenLoai || 'Món ngon',
      }));
      setProducts(items);
      setCategories(normalizedCats);
    } catch (e) {
      console.warn('Lỗi tải dữ liệu ProductsScreen:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const cat = route?.params?.category || route?.params?.categoryId;
    if (cat) {
      setSelectedCat(cat);
    }
    if (route?.params?.search !== undefined) {
      const q = route.params.search || '';
      setSearchQuery(q);
      if (q.trim()) {
        setSelectedCat('all'); // Show across all categories when searching from outside
      }
    }
  }, [route?.params?.category, route?.params?.categoryId, route?.params?.search]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleQuickAdd = async (item) => {
    if (!token) {
      Alert.alert(
        'Đăng nhập để đặt món',
        'Vui lòng đăng nhập để lưu món ngon vào giỏ hàng của bạn.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    try {
      setAddingId(item.maSanPham);
      await addToCart({
        maSanPham: item.maSanPham,
        soLuong: 1,
      });
      incrementCount(1);
      fetchCart();
      Alert.alert('Thành công', `Đã thêm "${item.tenSanPham}" vào giỏ hàng!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể thêm món vào giỏ hàng';
      Alert.alert('Thông báo', msg);
    } finally {
      setAddingId(null);
    }
  };

  // Active Parent Category (nếu chọn con thì tìm cha, nếu chọn cha thì là chính nó)
  const activeParentCategory = useMemo(() => {
    if (selectedCat === 'all') return null;
    const direct = categories.find((c) => c.maLoaiSanPham === selectedCat);
    if (direct) return direct;
    return categories.find((c) => c.loaiCons?.some((child) => child.maLoaiSanPham === selectedCat)) || null;
  }, [categories, selectedCat]);

  // Kiểm tra xem đang chọn mục con hay toàn bộ cha
  const isSelectedChild = Boolean(activeParentCategory && activeParentCategory.maLoaiSanPham !== selectedCat);

  // Tên hiển thị của biến thể con hiện tại
  const currentChildName = useMemo(() => {
    if (!activeParentCategory) return '';
    if (!isSelectedChild) return 'Tất cả';
    const child = activeParentCategory.loaiCons?.find((c) => c.maLoaiSanPham === selectedCat);
    return child?.tenLoaiSanPham || child?.tenLoai || 'Tất cả biến thể';
  }, [activeParentCategory, isSelectedChild, selectedCat]);

  // Filter & Sort
  const processedProducts = useMemo(() => {
    let list = [...products];

    // Filter by Category
    if (selectedCat !== 'all') {
      const parentCat = categories.find((c) => c.maLoaiSanPham === selectedCat);
      if (parentCat) {
        // Đang chọn danh mục cha: lấy tất cả sản phẩm của cha + các loại con
        const childIds = parentCat.loaiCons?.map((child) => child.maLoaiSanPham) || [];
        const matchIds = new Set([selectedCat, ...childIds]);
        list = list.filter((p) => matchIds.has(p.maLoaiSanPham));
      } else {
        // Đang chọn 1 biến thể con cụ thể: chỉ lọc đúng mục con đó
        list = list.filter((p) => p.maLoaiSanPham === selectedCat);
      }
    }

    // Shopee-style Semantic & Fuzzy Search
    if (searchQuery.trim()) {
      list = semanticSearchProducts(list, searchQuery, categories);
    }

    // Sort
    switch (sortOption) {
      case 'price_asc':
        list.sort((a, b) => (a.giaBan || 0) - (b.giaBan || 0));
        break;
      case 'price_desc':
        list.sort((a, b) => (b.giaBan || 0) - (a.giaBan || 0));
        break;
      case 'best_seller':
        list.sort((a, b) => (b.daBan || 0) - (a.daBan || 0));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.ngayTao || 0) - new Date(a.ngayTao || 0));
        break;
      default:
        // 'popular' keeps relevance score when searched
        break;
    }

    return list;
  }, [products, categories, selectedCat, searchQuery, sortOption]);

  const renderProductCard = ({ item }) => {
    const isFav = favorites.has(item.maSanPham);
    const isAdding = addingId === item.maSanPham;
    const hasDiscount = item.giaSauGiam != null && item.giaSauGiam < item.giaBan;
    const currentPrice = hasDiscount ? item.giaSauGiam : item.giaBan;
    const originalPrice = hasDiscount ? item.giaBan : null;
    const discountPercent = item.phanTramGiam || (hasDiscount && item.giaBan > 0 ? Math.round(((item.giaBan - item.giaSauGiam) / item.giaBan) * 100) : null);

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProductDetail', { id: item.maSanPham })}
      >
        {/* Image & Badges */}
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri:
                item.hinhAnhDaiDien ||
                item.hinhAnh ||
                DEFAULT_SNACK_IMAGE,
            }}
            style={styles.productImage}
            resizeMode="cover"
          />

          {/* Badges Left */}
          <View style={styles.badgeLeftCol}>
            {item.laBanChay ? (
              <View style={styles.bestSellerBadge}>
                <Text style={styles.bestSellerText}>Bán chạy</Text>
              </View>
            ) : null}
            {hasDiscount && discountPercent ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercent}%</Text>
              </View>
            ) : null}
          </View>

          {/* Favorite Heart Right */}
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(item.maSanPham)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 14 }}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Product Details */}
        <View style={styles.cardInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.tenSanPham}
          </Text>

          {/* Rating & Sold Row */}
          <View style={styles.ratingRow}>
            <Text style={styles.starText}>★</Text>
            <Text style={styles.ratingVal}>{item.diemTrungBinh ? Number(item.diemTrungBinh).toFixed(1) : '5.0'}</Text>
            <Text style={styles.ratingCount}>({item.soDanhGia || 0})</Text>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.soldText}>
              Đã bán {item.daBan != null ? item.daBan : 0}
            </Text>
          </View>

          {/* Price & Quick Add Button */}
          <View style={styles.priceRow}>
            <View style={styles.priceCol}>
              <Text style={styles.currentPrice}>{formatVnd(currentPrice)}</Text>
              {originalPrice && (
                <Text style={styles.oldPrice}>{formatVnd(originalPrice)}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.quickAddBtn}
              onPress={() => handleQuickAdd(item)}
              disabled={isAdding}
              activeOpacity={0.8}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.quickAddPlus}>+</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        navigation={navigation}
        showSearch={false}
        title="Thực đơn SnackShop"
      />

      {/* Title & Filter Bar Header */}
      <View style={styles.topFilterBar}>
        <View style={styles.titleRow}>
          <Text style={styles.screenHeading}>
            Tất cả sản phẩm{' '}
            <Text style={styles.countText}>({processedProducts.length} món)</Text>
          </Text>
          <View style={styles.guaranteeTag}>
            <Text style={styles.guaranteeText}>CHUYÊN VỊ</Text>
          </View>
        </View>

        {/* Search & Actions Bar */}
        <View style={styles.searchActionRow}>
          <View style={styles.searchInputBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Tìm theo tên món hoặc hương vị..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="none"
              style={styles.textInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sort Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setShowSortModal(true)}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 16 }}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Category Chips */}
        <View style={styles.chipsScrollWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ maLoaiSanPham: 'all', tenLoai: 'Tất cả' }, ...categories]}
            keyExtractor={(item) => item.maLoaiSanPham}
            contentContainerStyle={styles.chipsContainer}
            renderItem={({ item }) => {
              const isDirectActive = selectedCat === item.maLoaiSanPham;
              const isChildActive = item.loaiCons?.some((c) => c.maLoaiSanPham === selectedCat);
              const isActive = isDirectActive || isChildActive;
              const hasChildren = Array.isArray(item.loaiCons) && item.loaiCons.length > 0;

              return (
                <TouchableOpacity
                  style={[styles.chip, isActive && styles.activeChip]}
                  onPress={() => {
                    if (isActive && hasChildren) {
                      setShowSubCatModal(true);
                    } else {
                      setSelectedCat(item.maLoaiSanPham);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.chipText, isActive && styles.activeChipText]}
                  >
                    {item.tenLoai || item.tenLoaiSanPham || 'Món ngon'}
                    {hasChildren ? ' ▾' : ''}
                  </Text>
                  {hasChildren && (
                    <View style={[styles.childBadge, isActive && styles.activeChildBadge]}>
                      <Text style={[styles.childBadgeText, isActive && styles.activeChildBadgeText]}>
                        {item.loaiCons.length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Sub-Category Dropdown Bar (Hiển thị nếu danh mục đang chọn có biến thể con) */}
        {activeParentCategory && Array.isArray(activeParentCategory.loaiCons) && activeParentCategory.loaiCons.length > 0 && (
          <View style={styles.subCatBar}>
            <Text style={styles.subCatLabel}>Phân loại {activeParentCategory.tenLoai}:</Text>
            <TouchableOpacity
              style={styles.subCatDropdownBtn}
              onPress={() => setShowSubCatModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.subCatDropdownText} numberOfLines={1}>
                {isSelectedChild ? `↳ ${currentChildName}` : `Tất cả (${activeParentCategory.loaiCons.length} biến thể)`}
              </Text>
              <Text style={styles.subCatDropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Product Grid */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải món ngon SnackShop...</Text>
        </View>
      ) : processedProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🍿</Text>
          <Text style={styles.emptyTitle}>Không tìm thấy món phù hợp</Text>
          <Text style={styles.emptySubtitle}>
            Thử tìm từ khóa khác hoặc chuyển sang danh mục món khác bạn nhé!
          </Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSelectedCat('all');
              setSearchQuery('');
            }}
          >
            <Text style={styles.resetBtnText}>Xem tất cả món</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={processedProducts}
          keyExtractor={(item) => item.maSanPham}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={renderProductCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListFooterComponent={
            <View style={styles.listFooter}>
              <Text style={styles.footerInfo}>
                Đang hiển thị {processedProducts.length} sản phẩm
              </Text>
            </View>
          }
        />
      )}

      {/* Sort Selection Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sắp xếp theo</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.modalOption,
                  sortOption === opt.value && styles.activeModalOption,
                ]}
                onPress={() => {
                  setSortOption(opt.value);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    sortOption === opt.value && styles.activeModalOptionText,
                  ]}
                >
                  {opt.label}
                </Text>
                {sortOption === opt.value && (
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sub-Category Dropdown Modal */}
      <Modal
        visible={showSubCatModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubCatModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubCatModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.subCatModalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Biến thể: {activeParentCategory?.tenLoai || 'Loại sản phẩm'}
                </Text>
                <Text style={styles.subCatModalSub}>
                  Chọn loại con để lọc món chính xác theo nhu cầu
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSubCatModal(false)}>
                <Text style={{ fontSize: 18, color: colors.textMuted, padding: 4 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Option: Xem tất cả món của danh mục cha này */}
            <TouchableOpacity
              style={[
                styles.modalOption,
                !isSelectedChild && styles.activeModalOption,
              ]}
              onPress={() => {
                if (activeParentCategory) {
                  setSelectedCat(activeParentCategory.maLoaiSanPham);
                }
                setShowSubCatModal(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  !isSelectedChild && styles.activeModalOptionText,
                ]}
              >
                🏷️ Tất cả {activeParentCategory?.tenLoai} (Xem toàn bộ)
              </Text>
              {!isSelectedChild && (
                <Text style={{ color: colors.primary, fontWeight: '700' }}>✓</Text>
              )}
            </TouchableOpacity>

            {/* Options: Các biến thể con trong loaiCons */}
            {activeParentCategory?.loaiCons?.map((child) => {
              const isChildActive = selectedCat === child.maLoaiSanPham;
              return (
                <TouchableOpacity
                  key={child.maLoaiSanPham}
                  style={[
                    styles.modalOption,
                    isChildActive && styles.activeModalOption,
                  ]}
                  onPress={() => {
                    setSelectedCat(child.maLoaiSanPham);
                    setShowSubCatModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isChildActive && styles.activeModalOptionText,
                    ]}
                  >
                    ↳ {child.tenLoaiSanPham || child.tenLoai}
                  </Text>
                  {isChildActive && (
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topFilterBar: {
    backgroundColor: 'rgba(255, 248, 245, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingTop: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  screenHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.onSurface,
  },
  countText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  guaranteeTag: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  guaranteeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 0.5,
  },
  searchActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.md,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  clearText: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipsScrollWrapper: {
    paddingVertical: spacing.xs,
  },
  chipsContainer: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  activeChip: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeChipText: {
    color: colors.primaryDeep,
    fontWeight: '800',
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardContainer: {
    width: '48.5%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainerHigh,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  badgeLeftCol: {
    position: 'absolute',
    top: 6,
    left: 6,
    gap: 4,
  },
  bestSellerBadge: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bestSellerText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  discountBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  favBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardInfo: {
    padding: 10,
    justifyContent: 'space-between',
    flex: 1,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  starText: {
    fontSize: 12,
    color: colors.accentGold,
  },
  ratingVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurface,
  },
  ratingCount: {
    fontSize: 10,
    color: colors.textMuted,
  },
  bulletDot: {
    fontSize: 9,
    color: colors.textMuted,
    marginHorizontal: 1,
  },
  soldText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceCol: {
    flex: 1,
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  oldPrice: {
    fontSize: 11,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginTop: -2,
  },
  quickAddBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAddPlus: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 22,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  listFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerInfo: {
    fontSize: 12,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activeModalOption: {
    backgroundColor: colors.surfaceContainerLow,
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  modalOptionText: {
    fontSize: 14,
    color: colors.onSurface,
    fontWeight: '500',
  },
  activeModalOptionText: {
    color: colors.primary,
    fontWeight: '700',
  },
  childBadge: {
    backgroundColor: '#fff1e8',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  activeChildBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'transparent',
  },
  childBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  activeChildBadgeText: {
    color: '#ffffff',
  },
  subCatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  subCatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  subCatDropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff1e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  subCatDropdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  subCatDropdownArrow: {
    fontSize: 10,
    color: colors.primary,
    marginLeft: 6,
  },
  subCatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  subCatModalSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});

