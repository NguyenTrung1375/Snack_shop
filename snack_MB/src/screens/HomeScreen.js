import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import { colors, spacing, borderRadius } from '../constants/theme';
import { getProducts, getCategories, getFeaturedReviews } from '../api/products';
import { addToCart } from '../api/cart';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import {
  semanticSearchProducts,
  POPULAR_SEARCH_KEYWORDS,
} from '../utils/searchHelper';

import {
  DEFAULT_SNACK_IMAGE,
  SNACK_HERO_BANNER,
  getCategoryThumbnail,
} from '../constants/snackImages';
import { SNACK_COMBOS } from '../constants/snackCombos';
import apiClient from '../api/client';
import ServerConfigModal from '../components/ServerConfigModal';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [networkError, setNetworkError] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voucherSaved, setVoucherSaved] = useState(false);
  const [addingId, setAddingId] = useState(null);

  // Countdown timer for Flash Sale (02:45:12)
  const [countdown, setCountdown] = useState(9912); // seconds

  const { token, user } = useAuthStore();
  const { fetchCart, incrementCount } = useCartStore();

  const formatVnd = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 10800));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return {
      h: String(hours).padStart(2, '0'),
      m: String(mins).padStart(2, '0'),
      s: String(secs).padStart(2, '0'),
    };
  };

  const timerDisplay = formatTime(countdown);

  const getInitials = (name) => {
    if (!name) return 'KH';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setNetworkError(false);
      const [prodsRes, catsRes, reviewsRes] = await Promise.all([
        getProducts({ pageSize: 50 }, forceRefresh),
        getCategories(forceRefresh).catch(() => []),
        getFeaturedReviews(8).catch(() => []),
      ]);

      const items = Array.isArray(prodsRes) ? prodsRes : prodsRes?.items || [];
      const rawCats = Array.isArray(catsRes) ? catsRes : (catsRes?.value || catsRes?.items || []);
      const normalizedCats = rawCats.map((c) => ({
        ...c,
        tenLoai: c.tenLoai || c.tenLoaiSanPham || 'Món ngon',
        tenLoaiSanPham: c.tenLoaiSanPham || c.tenLoai || 'Món ngon',
      }));
      setProducts(items);
      setCategories(normalizedCats);
      setReviews(Array.isArray(reviewsRes) ? reviewsRes : []);
      setNetworkError(false);
    } catch (e) {
      console.warn('Lỗi tải dữ liệu HomeScreen:', e);
      setNetworkError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    fetchCart();
  }, [loadData, fetchCart]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
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

  const handleSearchSubmit = (queryArg) => {
    const q = (typeof queryArg === 'string' ? queryArg : searchQuery).trim();
    if (!q) return;
    navigation.navigate('MainTabs', {
      screen: 'ProductsTab',
      params: { search: q },
    });
  };

  const liveResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return semanticSearchProducts(products, searchQuery, categories).slice(0, 4);
  }, [searchQuery, products, categories]);

  // Top món ngon bán chạy nhất: Sắp xếp chuẩn theo lượt bán (daBan) giảm dần
  const bestSellers = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...products]
      .sort((a, b) => {
        const soldA = Number(a.daBan ?? a.soLuongDaBan ?? a.soLuongBan ?? 0);
        const soldB = Number(b.daBan ?? b.soLuongDaBan ?? b.soLuongBan ?? 0);
        if (soldB !== soldA) return soldB - soldA;
        if (b.laBanChay && !a.laBanChay) return 1;
        if (!b.laBanChay && a.laBanChay) return -1;
        return (Number(b.diemTrungBinh) || 0) - (Number(a.diemTrungBinh) || 0);
      })
      .slice(0, 6);
  }, [products]);

  // Flash sales ưu tiên món có giảm giá
  const flashSaleItems = useMemo(() => {
    if (!products || products.length === 0) return [];
    const discounted = products.filter((p) => p.giaSauGiam && p.giaSauGiam < p.giaBan);
    if (discounted.length >= 4) return discounted.slice(0, 8);
    return products.slice(0, 6);
  }, [products]);

  return (
    <View style={styles.container}>
      <AppHeader
        navigation={navigation}
        showSearch={false}
      />

      {/* Network Error Recovery Strip */}
      {networkError && (
        <View style={styles.networkErrorCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <Text style={{ fontSize: 18 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.networkErrorTitle}>Lỗi kết nối Backend máy chủ</Text>
              <Text style={styles.networkErrorSub} numberOfLines={1}>
                {apiClient.defaults.baseURL}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadData()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.configBtn}
              onPress={() => setShowServerModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.configBtnText}>Đổi IP</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* 1. GREETING & SMART SEARCH & VOUCHER QUICK STRIP */}
        <View style={styles.sectionGreeting}>
          <View style={styles.greetingHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingSub}>
                {user ? `Xin chào ${user.hoTen || 'bạn mê ăn vặt'}! 👋` : 'Xin chào bạn mê ăn vặt! 👋'}
              </Text>
              <Text style={styles.greetingTitle}>
                Thèm ăn vặt gì hôm nay? 🍟
              </Text>
            </View>
            <View style={styles.fireBadge}>
              <Text style={{ fontSize: 20 }}>🔥</Text>
            </View>
          </View>

          {/* Smart Search Bar (Shopee Style) */}
          <View style={styles.smartSearchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Tìm bánh tráng, khô gà, cơm cháy..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearchSubmit()}
              returnKeyType="search"
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="none"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => handleSearchSubmit()}
              activeOpacity={0.8}
            >
              <Text style={styles.searchBtnText}>Tìm</Text>
            </TouchableOpacity>
          </View>

          {/* Shopee-style Trending Tags (when not typing) */}
          {searchQuery.trim().length === 0 ? (
            <View style={styles.popularTagsRow}>
              <Text style={styles.popularTagLabel}>Gợi ý:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularTagsScroll}
              >
                {POPULAR_SEARCH_KEYWORDS.map((kw) => (
                  <TouchableOpacity
                    key={kw}
                    style={styles.popularTagChip}
                    onPress={() => {
                      setSearchQuery(kw);
                      handleSearchSubmit(kw);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.popularTagText}>{kw}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            /* Live Suggestions Dropdown (Shopee Style) */
            liveResults.length > 0 && (
              <View style={styles.liveSearchBox}>
                <View style={styles.liveSearchHeader}>
                  <Text style={styles.liveSearchTitle}>
                    Gợi ý món ngon ({liveResults.length})
                  </Text>
                  <TouchableOpacity onPress={() => handleSearchSubmit()}>
                    <Text style={styles.liveSearchSeeAll}>Xem tất cả ➔</Text>
                  </TouchableOpacity>
                </View>
                {liveResults.map((item) => (
                  <TouchableOpacity
                    key={item.maSanPham}
                    style={styles.liveItemRow}
                    onPress={() => navigation.navigate('ProductDetail', { id: item.maSanPham })}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: item.hinhAnhDaiDien || item.hinhAnh || DEFAULT_SNACK_IMAGE }}
                      style={styles.liveItemThumb}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.liveItemName} numberOfLines={1}>
                        {item.tenSanPham}
                      </Text>
                      <Text style={styles.liveItemPrice}>
                        {formatVnd(item.giaSauGiam || item.giaBan)}
                      </Text>
                    </View>
                    <Text style={styles.liveItemArrow}>➔</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )
          )}

          {/* Voucher Quick Strip */}
          <View style={styles.voucherStrip}>
            <View style={styles.voucherLeft}>
              <Text style={{ fontSize: 18 }}>🎟️</Text>
              <View style={styles.voucherTextCol}>
                <Text style={styles.voucherTitle}>
                  Giảm 20K <Text style={styles.voucherSub}>đơn 199K • Mã: </Text>
                  <Text style={styles.voucherCode}>SNACK20</Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.saveVoucherBtn, voucherSaved && styles.savedVoucherBtn]}
              onPress={() => {
                setVoucherSaved(true);
                Alert.alert('Thành công', 'Đã lưu mã ưu đãi SNACK20 vào ví của bạn!');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.saveVoucherBtnText}>
                {voucherSaved ? 'Đã lưu!' : 'Lưu mã'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. HERO PROMO BANNER (ĐẠI TIỆC ĐỒNG GIÁ 19K) */}
        <View style={styles.heroSection}>
          <TouchableOpacity
            style={styles.heroCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('MainTabs', { screen: 'ProductsTab' })}
          >
            <Image
              source={{
                uri: SNACK_HERO_BANNER,
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>SIÊU HỘI ĂN VẶT</Text>
              </View>
              <Text style={styles.heroHeading}>
                ĐẠI TIỆC ĂN VẶT{'\n'}
                <Text style={styles.heroHeadingAccent}>ĐỒNG GIÁ CHỈ 19K</Text>
              </Text>
              <View style={styles.heroBottomRow}>
                <Text style={styles.heroSubtitle} numberOfLines={1}>
                  Hơn 50+ món giòn rụm cay đã khát gom gọn 1 giỏ
                </Text>
                <View style={styles.heroCtaBtn}>
                  <Text style={styles.heroCtaText}>Săn Ngay →</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* COMBO SUPER SALE BANNER */}
          <TouchableOpacity
            style={styles.comboHeroBanner}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('MainTabs', { screen: 'CombosTab' })}
          >
            <View style={styles.comboHeroLeft}>
              <View style={styles.comboHeroBadge}>
                <Text style={styles.comboHeroBadgeText}>TIẾT KIỆM ĐẾN 37%</Text>
              </View>
              <Text style={styles.comboHeroTitle}>
                SIÊU HỘI COMBO{'\n'}
                <Text style={styles.comboHeroTitleAccent}>ĂN VẶT TRỌN GÓI</Text>
              </Text>
              <Text style={styles.comboHeroSub} numberOfLines={1}>
                20 combo HSSV, Văn phòng, Cày phim & Quà VIP
              </Text>
              <View style={styles.comboHeroCta}>
                <Text style={styles.comboHeroCtaText}>Khám phá 20 Combo ›</Text>
              </View>
            </View>
            <View style={styles.comboHeroRight}>
              <Text style={{ fontSize: 44 }}>🎁</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. KHÁM PHÁ DANH MỤC */}
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khám phá danh mục 🍿</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'ProductsTab' })}
            >
              <Text style={styles.seeAllText}>Xem tất cả ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.length > 0
              ? categories.map((cat, idx) => {
                  const catTitle = cat.tenLoai || cat.tenLoaiSanPham || 'Món ngon';
                  const imgUri = getCategoryThumbnail(cat);

                  return (
                    <TouchableOpacity
                      key={cat.maLoaiSanPham || idx}
                      style={styles.categoryItem}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('MainTabs', {
                          screen: 'ProductsTab',
                          params: { category: cat.maLoaiSanPham },
                        })
                      }
                    >
                      <View style={styles.categoryIconWrap}>
                        <Image
                          source={{ uri: imgUri }}
                          style={styles.categoryThumb}
                          resizeMode="cover"
                        />
                      </View>
                      <Text style={styles.categoryName} numberOfLines={2}>
                        {catTitle}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              : null}
          </ScrollView>
        </View>

        {/* 4. GIỜ VÀNG SĂN SALE ⚡ (Flash Sale) */}
        <View style={styles.flashSaleSection}>
          <View style={styles.flashSaleHeader}>
            <View style={styles.flashTitleRow}>
              <Text style={styles.flashTitle}>GIỜ VÀNG SĂN SALE ⚡</Text>
              <View style={styles.timerGroup}>
                <View style={styles.timerBox}>
                  <Text style={styles.timerNum}>{timerDisplay.h}</Text>
                </View>
                <Text style={styles.timerColon}>:</Text>
                <View style={styles.timerBox}>
                  <Text style={styles.timerNum}>{timerDisplay.m}</Text>
                </View>
                <Text style={styles.timerColon}>:</Text>
                <View style={styles.timerBox}>
                  <Text style={styles.timerNum}>{timerDisplay.s}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'ProductsTab' })}
            >
              <Text style={styles.seeAllText}>Xem tất cả ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flashList}
          >
            {flashSaleItems.map((item) => (
              <TouchableOpacity
                key={item.maSanPham}
                style={styles.flashCard}
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate('ProductDetail', { id: item.maSanPham })
                }
              >
                <View style={styles.flashImageWrapper}>
                  <Image
                    source={{
                      uri:
                        item.hinhAnhDaiDien ||
                        item.hinhAnh ||
                        DEFAULT_SNACK_IMAGE,
                    }}
                    style={styles.flashImage}
                  />
                  {item.giaSauGiam && item.giaSauGiam < item.giaBan ? (
                    <View style={styles.flashDiscountBadge}>
                      <Text style={styles.flashDiscountText}>
                        -{item.phanTramGiam || Math.round((1 - item.giaSauGiam / item.giaBan) * 100)}%
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.flashInfo}>
                  <Text style={styles.flashItemTitle} numberOfLines={1}>
                    {item.tenSanPham}
                  </Text>
                  <View style={styles.flashPriceRow}>
                    <Text style={styles.flashPrice}>{formatVnd(item.giaSauGiam || item.giaBan)}</Text>
                    {item.giaSauGiam && item.giaSauGiam < item.giaBan && (
                      <Text style={styles.flashOldPrice}>
                        {formatVnd(item.giaBan)}
                      </Text>
                    )}
                  </View>
                  {/* Stock progress */}
                  <View style={styles.stockBarTrack}>
                    <View style={[styles.stockBarFill, { width: item.soLuongTon > 0 ? '60%' : '100%' }]} />
                    <Text style={styles.stockBarText}>Còn lại {item.soLuongTon != null ? item.soLuongTon : 0} {item.donViTinh || 'món'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* COMBO HOT TIẾT KIỆM (20 Combos Đặc Sắc) */}
        <View style={styles.comboHomeSection}>
          <View style={styles.sectionHeader}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.sectionTitle}>Combo Ăn Vặt Tiết Kiệm 🎉</Text>
                <View style={styles.comboPillBadge}>
                  <Text style={styles.comboPillBadgeText}>-37%</Text>
                </View>
              </View>
              <Text style={styles.sectionSub}>Gom món ăn vặt trọn gói • Giá siêu hời</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'CombosTab' })}>
              <Text style={styles.seeAllText}>Xem tất cả (20) ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.comboScroll}
          >
            {SNACK_COMBOS.slice(0, 6).map((combo) => (
              <TouchableOpacity
                key={combo.id}
                style={styles.comboHomeCard}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('ComboDetail', { comboId: combo.id })}
              >
                <View style={styles.comboHomeImgWrap}>
                  <Image source={{ uri: combo.image }} style={styles.comboHomeImage} resizeMode="cover" />
                  <View style={[styles.comboHomeBadge, { backgroundColor: combo.badgeColor || '#A53600' }]}>
                    <Text style={styles.comboHomeBadgeText}>{combo.badge}</Text>
                  </View>
                </View>
                <View style={styles.comboHomeBody}>
                  <Text style={styles.comboHomeTitle} numberOfLines={1}>{combo.name}</Text>
                  <Text style={styles.comboHomeCategory} numberOfLines={1}>{combo.categoryLabel}</Text>
                  <View style={styles.comboHomePriceRow}>
                    <Text style={styles.comboHomePrice}>{formatVnd(combo.comboPrice)}</Text>
                    <Text style={styles.comboHomeOldPrice}>{formatVnd(combo.originalPrice)}</Text>
                  </View>
                  <Text style={styles.comboHomeSavings}>Tiết kiệm {formatVnd(combo.savedAmount)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. MÓN NGON BÁN CHẠY NHẤT 🔥 (Top tuần này) */}
        <View style={styles.bestSellerSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Món Ngon Bán Chạy Nhất 🔥</Text>
              <Text style={styles.sectionSub}>Top thịnh hành được yêu thích tuần này</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'ProductsTab' })}
            >
              <Text style={styles.seeAllText}>Xem tất cả ›</Text>
            </TouchableOpacity>
          </View>

          {/* 2-column grid */}
          <View style={styles.productGrid}>
            {bestSellers.map((item) => {
              const hasDiscount = item.giaSauGiam && item.giaSauGiam < item.giaBan;
              const isAdding = addingId === item.maSanPham;

              return (
                <TouchableOpacity
                  key={item.maSanPham}
                  style={styles.gridCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('ProductDetail', { id: item.maSanPham })
                  }
                >
                  <View style={styles.gridImageWrapper}>
                    <Image
                      source={{
                        uri:
                          item.hinhAnhDaiDien ||
                          item.hinhAnh ||
                          DEFAULT_SNACK_IMAGE,
                      }}
                      style={styles.gridImage}
                    />
                    <View style={styles.gridBadges}>
                      {item.laBanChay && (
                        <View style={styles.bestSellerTag}>
                          <Text style={styles.bestSellerTagText}>Bán chạy</Text>
                        </View>
                      )}
                      {hasDiscount && (
                        <View style={styles.gridDiscountTag}>
                          <Text style={styles.gridDiscountTagText}>
                            -{item.phanTramGiam || Math.round((1 - item.giaSauGiam / item.giaBan) * 100)}%
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.gridInfo}>
                    <Text style={styles.gridTitle} numberOfLines={2}>
                      {item.tenSanPham}
                    </Text>
                    <View style={styles.gridRatingRow}>
                      <Text style={{ color: colors.accentGold, fontSize: 11 }}>★</Text>
                      <Text style={styles.gridRatingVal}>{item.diemTrungBinh ? Number(item.diemTrungBinh).toFixed(1) : '5.0'}</Text>
                      <Text style={styles.gridDot}>•</Text>
                      <Text style={styles.gridSold}>
                        Đã bán {item.daBan != null ? item.daBan : 0}
                      </Text>
                    </View>
                    <View style={styles.gridBottomRow}>
                      <View>
                        <Text style={styles.gridPrice}>{formatVnd(item.giaSauGiam || item.giaBan)}</Text>
                        {hasDiscount && (
                          <Text style={styles.gridOldPrice}>{formatVnd(item.giaBan)}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.gridAddBtn}
                        onPress={() => handleQuickAdd(item)}
                        disabled={isAdding}
                        activeOpacity={0.8}
                      >
                        {isAdding ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.gridAddBtnText}>+</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 8. HỘI MÊ SNACK NÓI GÌ? 💬 (Đánh giá thực từ Database) */}
        {reviews.length > 0 && (
          <View style={styles.testimonialsSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Hội Mê Snack Nói Gì? 💬</Text>
                <Text style={styles.sectionSub}>Đánh giá thực từ khách hàng đã mua</Text>
              </View>
              <View style={styles.ratingBadgePill}>
                <Text style={styles.ratingBadgeText}>★ 5.0/5.0</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.reviewsScroll}
            >
              {reviews.map((r, idx) => (
                <TouchableOpacity
                  key={r.maDanhGia || idx}
                  style={styles.reviewCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (r.maSanPham) {
                      navigation.navigate('ProductDetail', { id: r.maSanPham });
                    }
                  }}
                >
                  <View style={styles.reviewerRow}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>{getInitials(r.tenKhachHang)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName} numberOfLines={1}>
                        {r.tenKhachHang || 'Khách hàng'}
                      </Text>
                      <Text style={styles.reviewStars}>
                        {'★'.repeat(r.soSao || 5)}
                        {r.tenSanPham ? ` • ${r.tenSanPham}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment} numberOfLines={3}>
                    "{r.binhLuan}"
                  </Text>
                  {r.hinhAnhSanPham ? (
                    <Image
                      source={{ uri: r.hinhAnhSanPham }}
                      style={styles.reviewPhoto}
                      resizeMode="cover"
                    />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <ServerConfigModal
        visible={showServerModal}
        onClose={() => setShowServerModal(false)}
        onSaved={() => loadData()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  networkErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    marginHorizontal: spacing.lg,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  networkErrorTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991b1b',
  },
  networkErrorSub: {
    fontSize: 10,
    color: '#b91c1c',
  },
  retryBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  configBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  configBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionGreeting: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: 12,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingSub: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.onSurface,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  fireBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.onSurface,
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 4,
  },
  clearBtnText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  searchBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  popularTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  popularTagLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDeep,
    marginRight: 6,
  },
  popularTagsScroll: {
    gap: 6,
    alignItems: 'center',
  },
  popularTagChip: {
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  popularTagText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  liveSearchBox: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  liveSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 6,
  },
  liveSearchTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  liveSearchSeeAll: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  liveItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  liveItemThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  liveItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface,
  },
  liveItemPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  liveItemArrow: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 6,
  },
  voucherStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryFixed,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  voucherTextCol: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  voucherSub: {
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  voucherCode: {
    fontWeight: '800',
    color: colors.onSurface,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  saveVoucherBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  savedVoucherBtn: {
    backgroundColor: colors.success,
  },
  saveVoucherBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    marginTop: 14,
  },
  heroCard: {
    height: 180,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceContainerHigh,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(33, 26, 21, 0.55)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  heroTag: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: 6,
  },
  heroTagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 26,
  },
  heroHeadingAccent: {
    color: '#ffd0be',
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#ffd0be',
    flex: 1,
  },
  heroCtaBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  heroCtaText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  categorySection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 76,
  },
  categoryIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryThumb: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
  flashSaleSection: {
    marginTop: 22,
    backgroundColor: colors.surfaceContainerLow,
    paddingVertical: 14,
  },
  flashSaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: 10,
  },
  flashTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primaryDeep,
  },
  timerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timerBox: {
    backgroundColor: colors.onSurface,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timerNum: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  timerColon: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.onSurface,
  },
  flashList: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  flashCard: {
    width: 140,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  flashImageWrapper: {
    width: '100%',
    height: 110,
    position: 'relative',
  },
  flashImage: {
    width: '100%',
    height: '100%',
  },
  flashDiscountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.chiliRed,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  flashDiscountText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  flashInfo: {
    padding: 8,
  },
  flashItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface,
  },
  flashPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  flashPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  flashOldPrice: {
    fontSize: 10,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  stockBarTrack: {
    height: 14,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 7,
    marginTop: 6,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  stockBarFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.primary,
    borderRadius: 7,
  },
  stockBarText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    zIndex: 1,
  },
  bestSellerSection: {
    marginTop: 24,
    paddingHorizontal: spacing.lg,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  gridImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: colors.surfaceContainerHigh,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridBadges: {
    position: 'absolute',
    top: 6,
    left: 6,
    gap: 4,
  },
  bestSellerTag: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  bestSellerTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  gridDiscountTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  gridDiscountTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#ffffff',
  },
  gridInfo: {
    padding: 10,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    lineHeight: 18,
    minHeight: 36,
  },
  gridRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  gridRatingVal: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurface,
  },
  gridDot: {
    fontSize: 9,
    color: colors.textMuted,
  },
  gridSold: {
    fontSize: 10,
    color: colors.textMuted,
  },
  gridBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  gridOldPrice: {
    fontSize: 10,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  gridAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  gridAddBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  comboSection: {
    marginTop: 24,
    paddingHorizontal: spacing.lg,
  },
  comboCard: {
    backgroundColor: colors.primaryDeep,
    borderRadius: borderRadius.xl,
    padding: 18,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  comboHeaderTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    marginBottom: 8,
  },
  comboHeaderTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  comboTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  comboDesc: {
    fontSize: 12,
    color: '#ffd0be',
    lineHeight: 16,
    marginBottom: 14,
  },
  comboBtn: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  comboBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  valuePropsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    marginHorizontal: spacing.lg,
    marginTop: 24,
    borderRadius: borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  valuePropItem: {
    flex: 1,
    alignItems: 'center',
  },
  valuePropTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.onSurface,
    textAlign: 'center',
  },
  valuePropSub: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  valuePropDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.borderLight,
  },
  testimonialsSection: {
    marginTop: 24,
  },
  ratingBadgePill: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  reviewsScroll: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  reviewCard: {
    width: 250,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#32190e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface,
  },
  reviewStars: {
    fontSize: 9,
    color: colors.accentGold,
    marginTop: 1,
  },
  reviewComment: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
    marginBottom: 8,
  },
  reviewPhoto: {
    width: '100%',
    height: 100,
    borderRadius: borderRadius.md,
  },
  comboHeroBanner: {
    marginTop: 12,
    backgroundColor: '#FFD0BE',
    borderRadius: borderRadius.xl || 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F3E6DD',
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  comboHeroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  comboHeroBadge: {
    backgroundColor: '#A53600',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  comboHeroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  comboHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#211A15',
    lineHeight: 22,
  },
  comboHeroTitleAccent: {
    color: '#A53600',
  },
  comboHeroSub: {
    fontSize: 11,
    color: '#5A4138',
    marginTop: 2,
    marginBottom: 8,
  },
  comboHeroCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3BFB3',
  },
  comboHeroCtaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A53600',
  },
  comboHeroRight: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 6,
  },
  comboHomeSection: {
    marginTop: spacing?.lg || 16,
    marginBottom: 8,
  },
  comboPillBadge: {
    backgroundColor: '#FFD0BE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  comboPillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7A5749',
  },
  comboScroll: {
    paddingHorizontal: spacing?.margin || 16,
    gap: 12,
    paddingVertical: 8,
  },
  comboHomeCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg || 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F9EBE2',
    shadowColor: '#32190E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  comboHomeImgWrap: {
    width: '100%',
    height: 115,
    backgroundColor: '#EEE0D7',
    position: 'relative',
  },
  comboHomeImage: {
    width: '100%',
    height: '100%',
  },
  comboHomeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  comboHomeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  comboHomeBody: {
    padding: 10,
  },
  comboHomeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#211A15',
  },
  comboHomeCategory: {
    fontSize: 11,
    color: '#795648',
    marginTop: 2,
    marginBottom: 6,
  },
  comboHomePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  comboHomePrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A53600',
  },
  comboHomeOldPrice: {
    fontSize: 11,
    color: '#8E7066',
    textDecorationLine: 'line-through',
  },
  comboHomeSavings: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
});
