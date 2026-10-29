import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRightOutlined, 
  ShoppingOutlined, 
  FireOutlined, 
  ThunderboltOutlined, 
  SafetyCertificateOutlined, 
  GiftOutlined, 
  StarFilled,
  HeartOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CrownOutlined,
  RocketOutlined,
  ShopOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Typography, Tag, Skeleton, message, Tooltip, Progress } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/auth/authStore';
import { useProductsQuery, useCategories } from '../../features/catalog/hooks';
import { formatVnd } from '../../shared/utils/formatters';
import { SNACK_COMBOS } from '../../shared/constants/snackCombos';
import { useComboCartStore } from '../../features/cart/comboCartStore';
import { addToCart } from '../../features/cart/api';
import { useQueryClient } from '@tanstack/react-query';

const fallbackSnackCategories = [
  { name: 'Khô gà lá chanh', emoji: '🍗', tag: 'Bán chạy nhất' },
  { name: 'Bánh tráng cuốn/trộn', emoji: '🌯', tag: 'Hot trend' },
  { name: 'Cơm cháy chà bông', emoji: '🍘', tag: 'Giòn rụm' },
  { name: 'Rong biển cháy tỏi', emoji: '🌿', tag: 'Thơm nức' },
  { name: 'Trái cây sấy dẻo', emoji: '🥭', tag: 'Healthy' },
  { name: 'Đồ ăn vặt tuổi thơ', emoji: '🍭', tag: 'Hoài niệm' },
];

const flattenCategoryTree = (nodes = [], depth = 0) => {
  let result = [];
  for (const item of nodes) {
    const id = item.maLoaiSanPham || item.maLoai;
    const name = item.tenLoaiSanPham || item.tenLoai;
    if (!id || !name) continue;
    result.push({
      id,
      name,
      depth,
      isChild: !!item.maLoaiCha,
    });
    if (item.loaiCons && item.loaiCons.length > 0) {
      result = result.concat(flattenCategoryTree(item.loaiCons, depth + 1));
    }
  }
  return result;
};

// 20 Set combo ăn vặt chuẩn vị được import trực tiếp từ shared/constants/snackCombos.js đồng bộ 1:1 với trang /combo và mobile app

export default function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const addComboVoucher = useComboCartStore((state) => state.addComboVoucher);
  const [addingComboId, setAddingComboId] = useState(null);

  const handleQuickAddCombo = async (combo, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!token) {
      message.warning('Vui lòng đăng nhập để thêm combo vào giỏ hàng');
      navigate('/dang-nhap');
      return;
    }

    try {
      setAddingComboId(combo.id);
      for (const item of combo.items) {
        await addToCart({
          maSanPham: item.maSanPham,
          soLuong: item.soLuong || 1,
        });
      }
      addComboVoucher(combo);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      message.success(`Đã thêm trọn bộ "${combo.name}" vào giỏ hàng! Tiết kiệm ${formatVnd(combo.savedAmount || 0)}.`);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể thêm combo lúc này');
    } finally {
      setAddingComboId(null);
    }
  };

  const role = useAuthStore((state) => state.user?.vaiTro || state.user?.role);
  const { data, isLoading } = useProductsQuery({ page: 1, pageSize: 12, sapXep: 'ban_chay' });
  const { data: rawCategories = [] } = useCategories();
  const products = data?.items || [];

  // Countdown timer cho khối Giờ Vàng Flash Sale (đếm lùi thời gian thực)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format số 2 chữ số (02, 05,...)
  const padZero = (num) => String(num).padStart(2, '0');

  // Xử lý copy mã voucher
  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã ưu đãi "${code}" vào bộ nhớ tạm!`);
  };

  // Slider cho 7 combo sản phẩm (hiển thị 3 combo trên desktop, tự động trượt qua mỗi 3.5s)
  const [comboSlideIndex, setComboSlideIndex] = useState(0);
  const [isComboPaused, setIsComboPaused] = useState(false);
  const [comboItemsPerView, setComboItemsPerView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setComboItemsPerView(1);
      else if (window.innerWidth < 1024) setComboItemsPerView(2);
      else setComboItemsPerView(3);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const comboMaxIndex = Math.max(0, SNACK_COMBOS.length - comboItemsPerView);

  // Auto-slide effect mỗi 3.5s (tự tạm dừng khi hover)
  useEffect(() => {
    if (isComboPaused) return;
    const interval = setInterval(() => {
      setComboSlideIndex((prev) => (prev >= comboMaxIndex ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [isComboPaused, comboMaxIndex]);

  const handleComboPrev = () => {
    setComboSlideIndex((prev) => (prev <= 0 ? comboMaxIndex : prev - 1));
  };

  const handleComboNext = () => {
    setComboSlideIndex((prev) => (prev >= comboMaxIndex ? 0 : prev + 1));
  };

  // Danh mục hiển thị (lấy thực tế từ API /loai-san-pham)
  const displayCategories = useMemo(() => {
    const flattened = flattenCategoryTree(rawCategories || []);
    if (!flattened || flattened.length === 0) return fallbackSnackCategories;
    return flattened.slice(0, 6).map((cat) => {
      const lower = cat.name.toLowerCase();
      let emoji = '🍘';
      if (lower.includes('gà')) emoji = '🍗';
      else if (lower.includes('bò')) emoji = '🥩';
      else if (lower.includes('heo') || lower.includes('chà bông')) emoji = '🥓';
      else if (lower.includes('bánh tráng')) emoji = '🌯';
      else if (lower.includes('mực') || lower.includes('cá')) emoji = '🦑';
      else if (lower.includes('khoai') || lower.includes('bắp') || lower.includes('ngô')) emoji = '🍿';
      else if (lower.includes('trái cây') || lower.includes('xoài')) emoji = '🥭';
      else if (lower.includes('khô')) emoji = '🥢';
      return {
        id: cat.id,
        name: cat.name,
        emoji,
        tag: cat.isChild ? 'Mục con' : 'Đặc sản',
      };
    });
  }, [rawCategories]);

  // Các sản phẩm Flash Sale (lọc các món có khuyến mãi thật, nếu chưa có thì lấy top 4 bán chạy)
  const flashSaleProducts = useMemo(() => {
    const discounted = products.filter((p) => p.giaSauGiam && p.giaSauGiam < p.giaBan);
    if (discounted.length > 0) {
      return discounted.slice(0, 4);
    }
    return products.slice(0, 4);
  }, [products]);

  // Các sản phẩm bán chạy nhất: Sắp xếp theo số lượt bán (daBan) giảm dần
  const bestSellerProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...products]
      .sort((a, b) => {
        const soldA = Number(a.daBan ?? 0);
        const soldB = Number(b.daBan ?? 0);
        if (soldB !== soldA) return soldB - soldA;
        if (b.laBanChay && !a.laBanChay) return 1;
        if (!b.laBanChay && a.laBanChay) return -1;
        return (Number(b.diemTrungBinh) || 0) - (Number(a.diemTrungBinh) || 0);
      })
      .slice(0, 8);
  }, [products]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      
      {/* 1. Hero Banner Sinh Động (Stitch Style) */}
      <section 
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 28,
          padding: 'clamp(32px, 5vw, 56px)',
          color: '#ffffff',
          background: 'radial-gradient(130% 130% at 85% 15%, #ff6f26 0%, #f5520d 62%, #d93f02 100%)',
          boxShadow: '0 20px 48px rgba(217, 63, 2, 0.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap'
        }}
      >
        {/* Glow Circles Decoration */}
        <div style={{
          position: 'absolute',
          top: -70,
          right: -70,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.12)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: -60,
          left: '20%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(251, 191, 36, 0.15)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        {/* Cột trái: Tiêu đề & CTAs */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 640 }}>
          <div 
            className="badge-shimmer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '6px 16px',
              borderRadius: 30,
              marginBottom: 16,
              border: '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <FireOutlined style={{ color: '#fde047', fontSize: 15 }} />
            <span>THẾ GIỚI ĂN VẶT CHUẨN VỊ VIỆT</span>
          </div>
          
          <Typography.Title 
            style={{ 
              color: '#ffffff', 
              fontSize: 'clamp(2.1rem, 4.2vw, 3.4rem)', 
              fontWeight: 900, 
              lineHeight: 1.15, 
              margin: '0 0 16px',
              textShadow: '0 2px 10px rgba(67, 20, 7, 0.35)',
              letterSpacing: '-0.5px'
            }}
          >
            Đậm Vị Việt, Giòn Rụm & Vui Mê Say!
          </Typography.Title>
          
          <Typography.Paragraph 
            style={{ 
              color: '#ffedd5', 
              fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)', 
              maxWidth: 580, 
              marginBottom: 26, 
              lineHeight: 1.65 
            }}
          >
            Chọn ngay các món ăn vặt thơm ngon nức tiếng: <strong>Khô gà lá chanh</strong> thơm lừng, <strong>Bánh tráng Tây Ninh</strong> cay xé lưỡi, <strong>Cơm cháy giòn tan</strong> rợp chà bông... Đóng gói kín sạch sẽ, giao siêu tốc tận tay chỉ trong <strong>2 Giờ</strong>!
          </Typography.Paragraph>

          <Space size="middle" wrap align="center">
            <Link to="/san-pham">
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingOutlined />}
                style={{ 
                  height: 50, 
                  paddingInline: 30, 
                  fontSize: '1rem', 
                  fontWeight: 800,
                  background: '#ffffff',
                  color: '#ea580c',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(67, 20, 7, 0.3)',
                  borderRadius: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                Khám phá món ngon
              </Button>
            </Link>

            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(0, 0, 0, 0.22)',
                backdropFilter: 'blur(8px)',
                padding: '8px 16px',
                borderRadius: 14,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(253, 224, 71, 0.25)',
                display: 'grid',
                placeItems: 'center',
                color: '#fde047',
                fontSize: 16
              }}>
                <ThunderboltOutlined />
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffffff' }}>Giao Hỏa Tốc 2H</div>
                <div style={{ fontSize: '0.72rem', color: '#fef08a' }}>Nội thành TP.HCM & Hà Nội</div>
              </div>
            </div>

            {role === 'khach_hang' && (
              <Link to="/gio-hang">
                <Button 
                  size="large"
                  style={{ 
                    height: 50, 
                    paddingInline: 20, 
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    fontWeight: 700,
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  Giỏ hàng của bạn
                </Button>
              </Link>
            )}
          </Space>
        </div>

        {/* Cột phải: Mascot Collage Card (Theo thiết kế Stitch) */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', flex: '1 1 280px', maxWidth: 360 }}>
          <div 
            style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(16px)',
              borderRadius: 24,
              padding: 20,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              width: '100%',
              textAlign: 'center'
            }}
          >
            {/* Hot deal sticker */}
            <div className="hot-deal-sticker">
              🔥 SIÊU ƯU ĐÃI
            </div>

            <div style={{
              background: 'rgba(46, 20, 8, 0.4)',
              borderRadius: 18,
              padding: '24px 16px',
              border: '1px solid rgba(254, 215, 170, 0.25)'
            }}>
              {/* Mascot Stamp tròn lớn */}
              <div style={{
                width: 140,
                height: 140,
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #facc15 0%, #ea580c 100%)',
                padding: 6,
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.35)',
                display: 'grid',
                placeItems: 'center'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#2e1408',
                  border: '3px solid #fef08a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8
                }}>
                  <img 
                    src="/logo.png" 
                    alt="Snack Shop Mascot" 
                    style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 4 }} 
                  />
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
                    SNACK<span style={{ color: '#facc15' }}>SHOP</span>
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: '#fde047', textTransform: 'uppercase' }}>
                    100% Sạch & Giòn
                  </span>
                </div>
              </div>

              {/* 2 Tag nhỏ cam kết */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, fontSize: '11px', fontWeight: 700 }}>
                <span style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.15)', color: '#86efac' }}>
                  🌿 Không phẩm màu
                </span>
                <span style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fde047' }}>
                  🛡️ Chuẩn ATVSTP
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Promo Voucher Strip (Thanh Voucher Chào Mừng) */}
      <section 
        style={{
          background: '#ffffff',
          border: '1.5px solid #fed7aa',
          borderRadius: 20,
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 6px 20px rgba(234, 88, 12, 0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 24,
            color: '#ea580c',
            flexShrink: 0,
            boxShadow: 'inset 0 2px 4px rgba(234, 88, 12, 0.1)'
          }}>
            <GiftOutlined />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#431407' }}>
                Ưu đãi bạn mới: Nhập mã
              </span>
              <Tooltip title="Nhấp để sao chép mã voucher">
                <Tag 
                  color="volcano" 
                  onClick={() => handleCopyVoucher('WELCOME10')}
                  style={{ 
                    fontSize: '13px', 
                    fontWeight: 900, 
                    padding: '3px 10px', 
                    borderRadius: 6,
                    cursor: 'pointer',
                    letterSpacing: '0.8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  WELCOME10 <CopyOutlined style={{ fontSize: 12 }} />
                </Tag>
              </Tooltip>
            </div>
            <div style={{ color: '#78716c', fontSize: '0.85rem', marginTop: 2 }}>
              Giảm ngay 10% cho đơn hàng đầu tiên từ 100.000đ khi đặt qua website hoặc ứng dụng!
            </div>
          </div>
        </div>

        <Link to="/san-pham">
          <Button 
            type="primary" 
            style={{ 
              borderRadius: 12, 
              fontWeight: 800, 
              height: 42,
              paddingInline: 22,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)'
            }}
          >
            Đặt món ngay <ArrowRightOutlined />
          </Button>
        </Link>
      </section>

      {/* 3. KHỐI FLASH SALE: GIỜ VÀNG SĂN MỒI CỰC BỐC (New Feature từ Stitch) */}
      <section 
        style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #d97706 100%)',
          borderRadius: 28,
          padding: '28px 24px',
          color: '#ffffff',
          boxShadow: '0 16px 36px rgba(220, 38, 38, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative circle glow */}
        <div style={{
          position: 'absolute',
          bottom: -40,
          right: -40,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        {/* Header Flash Sale */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          paddingBottom: 20,
          marginBottom: 20,
          borderBottom: '1px solid rgba(255, 255, 255, 0.22)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: '#fde047',
              color: '#b91c1c',
              display: 'grid',
              placeItems: 'center',
              fontSize: 22,
              fontWeight: 900,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}>
              <ThunderboltOutlined />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Typography.Title level={3} style={{ margin: 0, color: '#ffffff', fontWeight: 900, letterSpacing: '-0.3px' }}>
                  GIỜ VÀNG SĂN MỒI CỰC BỐC
                </Typography.Title>
                <Tag color="warning" style={{ fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', borderRadius: 6 }}>
                  Hôm nay
                </Tag>
              </div>
              <Typography.Text style={{ color: '#ffedd5', fontSize: '0.85rem' }}>
                Giá ưu đãi chạm đáy - Đóng hộp PET niêm phong sạch sẽ, giữ giòn lâu!
              </Typography.Text>
            </div>
          </div>

          {/* Countdown Clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffedd5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} /> Kết thúc trong:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 900 }}>
              <span className="flash-timer-digit">{padZero(timeLeft.hours)}</span>
              <span style={{ color: '#fde047', fontSize: '1.2rem' }}>:</span>
              <span className="flash-timer-digit">{padZero(timeLeft.minutes)}</span>
              <span style={{ color: '#fde047', fontSize: '1.2rem' }}>:</span>
              <span className="flash-timer-digit">{padZero(timeLeft.seconds)}</span>
            </div>
          </div>
        </div>

        {/* 4 Sản phẩm Flash Sale (Dữ liệu thực từ API) */}
        {isLoading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Col xs={12} sm={12} md={6} key={idx}>
                <Card style={{ borderRadius: 16 }}><Skeleton active /></Card>
              </Col>
            ))}
          </Row>
        ) : flashSaleProducts.length > 0 ? (
          <Row gutter={[16, 16]}>
            {flashSaleProducts.map((p) => {
              const hasDiscount = p.giaSauGiam && p.giaSauGiam < p.giaBan;
              const discountPct = p.phanTramGiam || (hasDiscount ? Math.round(((p.giaBan - p.giaSauGiam) / p.giaBan) * 100) : null);
              const soldTotal = p.daBan || 0;
              const stock = p.soLuongTon || 0;
              const ratio = soldTotal + stock > 0 ? Math.min(100, Math.round((soldTotal / (soldTotal + stock)) * 100)) : 40;

              return (
                <Col xs={12} sm={12} md={6} key={p.maSanPham}>
                  <Link to={`/san-pham/${p.maSanPham}`} style={{ textDecoration: 'none' }}>
                    <div 
                      style={{
                        background: '#ffffff',
                        borderRadius: 18,
                        padding: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.18)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      <div>
                        {/* Ảnh sản phẩm */}
                        <div style={{
                          position: 'relative',
                          aspectRatio: '1/1',
                          borderRadius: 14,
                          overflow: 'hidden',
                          background: '#fffaf5',
                          marginBottom: 10
                        }}>
                          {discountPct && (
                            <span style={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              background: '#dc2626',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: 20,
                              zIndex: 2,
                              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)'
                            }}>
                              -{discountPct}%
                            </span>
                          )}

                          {p.hinhAnhDaiDien ? (
                            <img 
                              src={p.hinhAnhDaiDien} 
                              alt={p.tenSanPham} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 44 }}>
                              🍘
                            </div>
                          )}
                        </div>

                        {/* Tên & Phân loại */}
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', marginBottom: 2 }}>
                          {p.tenLoaiSanPham || 'Món ngon'}
                        </div>
                        <div style={{ 
                          fontWeight: 800, 
                          fontSize: '0.92rem', 
                          color: '#1c1917', 
                          lineHeight: 1.35, 
                          minHeight: 38,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {p.tenSanPham}
                        </div>

                        {/* Giá */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                          <span style={{ color: '#dc2626', fontWeight: 900, fontSize: '1.15rem' }}>
                            {formatVnd(hasDiscount ? p.giaSauGiam : p.GiaBan || p.giaBan)}
                          </span>
                          {hasDiscount && (
                            <span style={{ textDecoration: 'line-through', color: '#a8a29e', fontSize: '0.78rem' }}>
                              {formatVnd(p.giaBan)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Thanh mức độ bán chạy (Progress Bar) */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{ width: '100%', height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.max(25, ratio)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #f97316 0%, #dc2626 100%)',
                            borderRadius: 99
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#78716c', marginTop: 4, fontWeight: 600 }}>
                          <span>Đã bán {soldTotal}</span>
                          <span style={{ color: '#ea580c', fontWeight: 800 }}>
                            {soldTotal > 50 ? 'Cháy hàng' : 'Bán chạy'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#ffedd5' }}>
            Đang cập nhật các món ưu đãi trong khung giờ này...
          </div>
        )}
      </section>

      {/* 4. Gợi Ý Set Ăn Vặt Tiết Kiệm - Càng Đông Càng Vui (Auto-sliding Carousel 3 combo) */}
      <section 
        style={{
          background: 'linear-gradient(180deg, #fef3c7 0%, #ffedd5 100%)',
          borderRadius: 28,
          padding: 'clamp(24px, 4vw, 40px)',
          border: '1.5px solid #fed7aa',
          position: 'relative'
        }}
      >
        {/* Header Section: Tiêu đề + Nút điều khiển trượt */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 6, 
                padding: '4px 12px', 
                borderRadius: 20, 
                background: '#ea580c', 
                color: '#fff', 
                fontSize: '11px', 
                fontWeight: 800, 
                textTransform: 'uppercase'
              }}>
                👥 Set Ăn Vặt Tiết Kiệm
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#c2410c',
                background: 'rgba(255, 237, 213, 0.95)',
                padding: '3px 8px',
                borderRadius: 12,
                border: '1px solid #fed7aa'
              }}>
                ⚡ Tự động trượt 3.5s
              </span>
            </div>
            <Typography.Title level={3} style={{ margin: 0, color: '#431407', fontWeight: 900, letterSpacing: '-0.3px' }}>
              Gợi Ý Set Ăn Vặt Tiết Kiệm - Càng Đông Càng Vui
            </Typography.Title>
            <Typography.Text style={{ color: '#78716c', fontSize: '0.92rem' }}>
              Các set mix sẵn thơm ngon từ khô gà, khô bò, da heo đến bánh tráng cho cày phim, họp nhóm và tiệc văn phòng
            </Typography.Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 800, 
              color: '#78350f', 
              background: 'rgba(254, 240, 138, 0.95)', 
              padding: '7px 14px', 
              borderRadius: 12,
              border: '1px solid #fde047',
              display: 'inline-block'
            }}>
              🚚 Freeship đơn từ 150K
            </div>
            <Link to="/combo">
              <Button 
                type="primary" 
                style={{ 
                  borderRadius: 10, 
                  fontWeight: 700, 
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
                }}
              >
                Xem 20+ Combo →
              </Button>
            </Link>
            <Space>
              <Button 
                shape="circle" 
                icon={<LeftOutlined />} 
                onClick={handleComboPrev}
                style={{ 
                  border: '1.5px solid #fed7aa', 
                  background: '#ffffff', 
                  color: '#c2410c', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)' 
                }} 
                title="Xem combo trước"
              />
              <Button 
                shape="circle" 
                icon={<RightOutlined />} 
                onClick={handleComboNext}
                style={{ 
                  border: '1.5px solid #fed7aa', 
                  background: '#ffffff', 
                  color: '#c2410c', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)' 
                }} 
                title="Xem combo tiếp theo"
              />
            </Space>
          </div>
        </div>

        {/* Carousel Slider: Hiển thị 3 combo trên desktop, tự động trượt */}
        <div 
          onMouseEnter={() => setIsComboPaused(true)}
          onMouseLeave={() => setIsComboPaused(false)}
          style={{ overflow: 'hidden', width: '100%', margin: '0 -10px', padding: '12px 10px 4px' }}
        >
          <div 
            style={{
              display: 'flex',
              transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              transform: `translateX(-${comboSlideIndex * (100 / comboItemsPerView)}%)`,
            }}
          >
            {SNACK_COMBOS.map((combo) => (
              <div 
                key={combo.id}
                style={{
                  flex: `0 0 ${100 / comboItemsPerView}%`,
                  padding: '0 10px',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  background: '#ffffff',
                  borderRadius: 22,
                  overflow: 'hidden',
                  border: combo.badge === 'BÁN CHẠY' || combo.discountPercent >= 20 ? '2px solid #ea580c' : '1.5px solid #fed7aa',
                  boxShadow: '0 8px 24px rgba(234, 88, 12, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  position: 'relative'
                }}>
                  {/* Cover image with Badges */}
                  <div style={{ position: 'relative', paddingTop: '62%', background: '#fff7ed', overflow: 'hidden' }}>
                    <Link to={`/combo/${combo.id}`}>
                      <img
                        src={combo.image}
                        alt={combo.name}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.35s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                      />
                    </Link>

                    <span style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: combo.badgeColor || '#ea580c',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 14,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}>
                      {combo.badge}
                    </span>

                    <span style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: '#dc2626',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: 12,
                      boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                    }}>
                      -{combo.discountPercent}%
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Tag color="orange" style={{ margin: 0, fontSize: '11px', fontWeight: 700, borderRadius: 6 }}>
                        {combo.categoryLabel}
                      </Tag>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem' }}>
                        <StarFilled />
                        <span>{combo.rating}</span>
                        <span style={{ color: '#a8a29e', fontWeight: 400 }}>({combo.reviewCount})</span>
                      </div>
                    </div>

                    <Link to={`/combo/${combo.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        color: '#1c1917',
                        lineHeight: 1.35,
                        marginBottom: 6,
                        height: 44,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {combo.name}
                      </div>
                    </Link>

                    <div style={{
                      background: '#fafaf9',
                      borderRadius: 10,
                      padding: '8px 10px',
                      marginBottom: 12,
                      border: '1px solid #f5f5f4',
                      fontSize: '0.78rem',
                      color: '#78716c',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.45
                    }}>
                      🎁 <strong>Gồm:</strong> {combo.items?.map((it) => it.tenSanPham).join(' + ')}
                    </div>

                    {/* Price and CTA */}
                    <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px dashed #fed7aa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ color: '#dc2626', fontWeight: 900, fontSize: '1.35rem' }}>
                            {formatVnd(combo.comboPrice)}
                          </span>
                          <span style={{ color: '#a8a29e', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                            {formatVnd(combo.originalPrice)}
                          </span>
                        </div>
                        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.78rem' }}>
                          Tiết kiệm {formatVnd(combo.savedAmount)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <Link to={`/combo/${combo.id}`} style={{ flex: 1 }}>
                          <Button
                            block
                            style={{
                              height: 40,
                              borderRadius: 10,
                              fontWeight: 700,
                              borderColor: '#fed7aa',
                              color: '#ea580c'
                            }}
                          >
                            Chi tiết
                          </Button>
                        </Link>
                        <Button
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          loading={addingComboId === combo.id}
                          onClick={(e) => handleQuickAddCombo(combo, e)}
                          style={{
                            height: 40,
                            borderRadius: 10,
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            border: 'none',
                            boxShadow: '0 3px 8px rgba(234, 88, 12, 0.3)'
                          }}
                          title="Thêm trọn bộ vào giỏ hàng"
                        >
                          Thêm giỏ
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 22 }}>
          {Array.from({ length: comboMaxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setComboSlideIndex(idx)}
              style={{
                width: comboSlideIndex === idx ? 28 : 10,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: comboSlideIndex === idx ? '#ea580c' : '#fed7aa',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
              aria-label={`Combo slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 5. Món Ăn Yêu Thích & Bán Chạy Nhất (Bảo toàn 100% dữ liệu thực & 3 dòng tiêu chuẩn) */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <FireOutlined style={{ color: '#ea580c', fontSize: 22 }} />
              <Typography.Title level={3} style={{ margin: 0, color: '#431407', fontWeight: 900, letterSpacing: '-0.3px' }}>
                Món Ăn Yêu Thích & Bán Chạy Nhất
              </Typography.Title>
            </div>
            <Typography.Text type="secondary" style={{ fontSize: '0.92rem' }}>
              Top các món ăn vặt được đặt mua nhiều nhất tại Snack Shop, thơm ngon nức tiếng!
            </Typography.Text>
          </div>
          <Link to="/san-pham?sort=ban_chay" style={{ color: '#ea580c', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.92rem' }}>
            Xem tất cả món bán chạy <ArrowRightOutlined />
          </Link>
        </div>

        {isLoading ? (
          <Row gutter={[20, 20]}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Col xs={24} sm={12} md={6} key={idx}>
                <Card style={{ borderRadius: 18 }}><Skeleton active /></Card>
              </Col>
            ))}
          </Row>
        ) : bestSellerProducts.length > 0 ? (
          <Row gutter={[20, 20]}>
            {bestSellerProducts.map((p, idx) => (
              <Col xs={24} sm={12} md={6} key={p.maSanPham}>
                <div className="snack-card">
                  <div className="snack-card-cover">
                    {/* Badge Huy chương Top 1 - 2 - 3 */}
                    <span 
                      className="snack-card-badge"
                      style={
                        idx === 0 
                          ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', fontWeight: 800 } 
                          : idx === 1 
                          ? { background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', fontWeight: 800 }
                          : idx === 2 
                          ? { background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', fontWeight: 800 }
                          : { background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#fff', fontWeight: 700 }
                      }
                    >
                      {idx === 0 ? '🏆 TOP 1 BÁN CHẠY' : idx === 1 ? '🥈 TOP 2 BÁN CHẠY' : idx === 2 ? '🥉 TOP 3 BÁN CHẠY' : 'YÊU THÍCH'}
                    </span>

                    {p.hinhAnhDaiDien ? (
                      <img 
                        src={p.hinhAnhDaiDien} 
                        alt={p.tenSanPham} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                      />
                    ) : (
                      <span className="snack-card-emoji">🍘</span>
                    )}
                  </div>

                  <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      {/* Dòng 1: Tag "Bán chạy" (nền cam chữ trắng, chỉ cho 3 sản phẩm bán nhiều nhất) + Tên sản phẩm */}
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#292524', marginBottom: 10, lineHeight: 1.4, minHeight: 44 }}>
                        {p.laBanChay && (
                          <span style={{
                            display: 'inline-block',
                            background: '#ea580c',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            marginRight: 6,
                            verticalAlign: 'middle',
                            lineHeight: '16px'
                          }}>
                            Bán chạy
                          </span>
                        )}
                        <span style={{ verticalAlign: 'middle' }}>{p.tenSanPham}</span>
                      </div>

                      {/* Dòng 2: Giá (nếu giảm thì do khuyến mãi hiện giá giảm, giá gốc nhỏ mờ, tag % giảm cam pastel) */}
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 8px', marginBottom: 12, minHeight: 28 }}>
                        {p.giaSauGiam && p.giaSauGiam < p.giaBan ? (
                          <>
                            <span style={{ color: '#ea580c', fontWeight: 900, fontSize: '1.25rem', lineHeight: 1 }}>
                              {formatVnd(p.giaSauGiam)}
                            </span>
                            <span style={{ textDecoration: 'line-through', color: '#a8a29e', fontSize: '0.85rem' }}>
                              {formatVnd(p.giaBan)}
                            </span>
                            <span style={{
                              background: '#fff7ed',
                              color: '#ea580c',
                              border: '1px solid #fed7aa',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              -{p.phanTramGiam || Math.round(((p.giaBan - p.giaSauGiam) / p.giaBan) * 100)}%
                            </span>
                          </>
                        ) : (
                          <span style={{ color: '#ea580c', fontWeight: 900, fontSize: '1.25rem', lineHeight: 1 }}>
                            {formatVnd(p.giaBan)}
                          </span>
                        )}
                      </div>

                      {/* Dòng 3: Số sao đánh giá (trái) và số lượng bán được (phải đối diện) */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <StarFilled style={{ color: '#f59e0b', fontSize: 13 }} />
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#444' }}>
                            {p.diemTrungBinh > 0 ? p.diemTrungBinh : '5.0'}
                          </span>
                        </div>
                        <span style={{ color: '#78716c', fontSize: '0.82rem', fontWeight: 600 }}>
                          Đã bán {p.daBan || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <Link to={`/san-pham/${p.maSanPham}`}>
                        <Button 
                          type="primary" 
                          block 
                          icon={<ShoppingOutlined />}
                          style={{ 
                            borderRadius: 10, 
                            fontWeight: 800,
                            height: 40,
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)'
                          }}
                        >
                          Xem chi tiết & Mua
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Card style={{ borderRadius: 20, textAlign: 'center', padding: '36px 16px', background: '#fff' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🍿</div>
            <Typography.Title level={4} style={{ color: '#9a3412', marginBottom: 8 }}>
              Chào mừng bạn đến với Snack Shop!
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ maxWidth: 480, margin: '0 auto 20px' }}>
              Các món ăn vặt đang được chuẩn bị lên kệ. Bạn có thể vào thực đơn để khám phá các món mới nhất!
            </Typography.Paragraph>
            <Link to="/san-pham">
              <Button type="primary" size="large" style={{ borderRadius: 12, fontWeight: 800 }}>
                Xem danh sách sản phẩm
              </Button>
            </Link>
          </Card>
        )}
      </section>

      {/* 6. Danh Mục Món Ăn Vặt Được Yêu Thích */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <Typography.Title level={3} style={{ margin: 0, color: '#431407', fontWeight: 900, letterSpacing: '-0.3px' }}>
              Danh Mục Món Ăn Vặt Được Yêu Thích
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: '0.92rem' }}>
              Đầy đủ các loại đồ khô, bánh tráng cay xé, ăn vặt nhâm nhi xem phim cả ngày
            </Typography.Text>
          </div>
          <Link to="/san-pham" style={{ color: '#ea580c', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.92rem' }}>
            Xem tất cả danh mục <ArrowRightOutlined />
          </Link>
        </div>

        <Row gutter={[16, 16]}>
          {displayCategories.map((cat, idx) => (
            <Col xs={12} sm={8} md={4} key={cat.id || idx}>
              <Link to={cat.id ? `/san-pham?cat=${cat.id}` : `/san-pham?q=${encodeURIComponent(cat.name)}`} style={{ textDecoration: 'none' }}>
                <Card 
                  hoverable
                  style={{ 
                    textAlign: 'center', 
                    borderRadius: 20, 
                    border: '1.5px solid #fed7aa',
                    background: '#ffffff',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.04)'
                  }}
                  styles={{ body: { padding: '18px 12px' } }}
                >
                  <div style={{ fontSize: 42, marginBottom: 8, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.06))' }}>
                    {cat.emoji}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#292524', marginBottom: 6 }}>
                    {cat.name}
                  </div>
                  <Tag color="orange" style={{ margin: 0, fontSize: '10px', borderRadius: 6, fontWeight: 700 }}>
                    {cat.tag}
                  </Tag>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </section>

      {/* 7. Vì Sao Bạn Sẽ Mê Snack Shop? (Quality Pillars) */}
      <section style={{
        background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)',
        borderRadius: 28,
        padding: '44px 32px',
        border: '1.5px solid #fed7aa'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Typography.Title level={3} style={{ color: '#431407', fontWeight: 900, margin: 0 }}>
            Vì Sao Bạn Sẽ Mê Snack Shop?
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginTop: 6, fontSize: '0.95rem' }}>
            Chúng mình chăm chút từng mẻ đồ ăn vặt để bạn luôn có trải nghiệm ngon miệng và an tâm nhất
          </Typography.Paragraph>
        </div>

        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #fed7aa80', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: '#ffedd5', color: '#ea580c', display: 'grid', placeItems: 'center', fontSize: 26, margin: '0 auto 14px' }}>
                <ThunderboltOutlined />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#9a3412', marginBottom: 6 }}>Giao Siêu Tốc 2H</div>
              <div style={{ color: '#78716c', fontSize: '0.85rem', lineHeight: 1.55 }}>
                Đang thèm là có ngay, giao đồ ăn vặt đóng gói nóng hổi tới tận cửa nhà bạn trong 120 phút.
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #fed7aa80', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center', fontSize: 26, margin: '0 auto 14px' }}>
                <SafetyCertificateOutlined />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#9a3412', marginBottom: 6 }}>100% An Toàn VSTP</div>
              <div style={{ color: '#78716c', fontSize: '0.85rem', lineHeight: 1.55 }}>
                Nguyên liệu tươi sạch loại 1, quy trình sản xuất khép kín, không phẩm màu độc hại.
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #fed7aa80', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', fontSize: 26, margin: '0 auto 14px' }}>
                <ShopOutlined />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#9a3412', marginBottom: 6 }}>Hộp Kín Giòn Tan</div>
              <div style={{ color: '#78716c', fontSize: '0.85rem', lineHeight: 1.55 }}>
                Đóng hộp nhôm/PET có seal kín kèm gói hút ẩm, giữ trọn độ giòn rụm đến 6 tháng.
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ textAlign: 'center', background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #fed7aa80', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center', fontSize: 26, margin: '0 auto 14px' }}>
                <RocketOutlined />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#9a3412', marginBottom: 6 }}>Bảo Đảm Hài Lòng</div>
              <div style={{ color: '#78716c', fontSize: '0.85rem', lineHeight: 1.55 }}>
                Nếu sản phẩm không giòn ngon hoặc bị lỗi bao bì, hỗ trợ 1-đổi-1 hoàn toàn miễn phí.
              </div>
            </div>
          </Col>
        </Row>
      </section>

      {/* 8. Đánh Giá Khách Hàng (Customer Reviews Social Proof) */}
      <section style={{ marginBottom: 12 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 32px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            ⭐ Đánh Giá Thực Tế
          </span>
          <Typography.Title level={3} style={{ color: '#431407', fontWeight: 900, margin: '4px 0 8px' }}>
            Hơn 15.000+ Tín Đồ Ăn Vặt Tin Yêu
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: '0.92rem' }}>
            Cảm nhận thật từ các đơn hàng giao mỗi ngày trên khắp cả nước
          </Typography.Text>
        </div>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={8}>
            <div style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #e7e5e4',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}>
              <div>
                <div style={{ color: '#f59e0b', fontSize: 14, marginBottom: 10 }}>
                  ★★★★★
                </div>
                <p style={{ color: '#44403c', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                  "Khô gà thơm mùi lá chanh nức mũi luôn, không bị bở nát như mấy chỗ khác. Hũ bọc seal nhôm chắc chắn, ăn xong đậy nắp vẫn giòn rụm cả tuần."
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, paddingTop: 14, borderTop: '1px solid #f5f5f4' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffedd5', color: '#ea580c', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>
                  HL
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1c1917' }}>Hoàng Linh</div>
                  <div style={{ fontSize: '0.75rem', color: '#a8a29e' }}>Nhân viên văn phòng (Hà Nội)</div>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #e7e5e4',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}>
              <div>
                <div style={{ color: '#f59e0b', fontSize: 14, marginBottom: 10 }}>
                  ★★★★★
                </div>
                <p style={{ color: '#44403c', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                  "Bánh tráng phơi sương dẻo quẹo, nước sốt tắc cay xè đậm đà. Đặt 2h là shipper giao tới cửa rồi, cày phim mà có mâm này thì hết nước chấm!"
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, paddingTop: 14, borderTop: '1px solid #f5f5f4' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>
                  MA
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1c1917' }}>Minh Anh</div>
                  <div style={{ fontSize: '0.75rem', color: '#a8a29e' }}>Sinh viên ĐHQG TP.HCM</div>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #e7e5e4',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}>
              <div>
                <div style={{ color: '#f59e0b', fontSize: 14, marginBottom: 10 }}>
                  ★★★★★
                </div>
                <p style={{ color: '#44403c', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                  "Khô bò tẩm gia vị ăn rất cuốn, sợi to đều màu đẹp. Team công ty mình nghiện order ăn vặt chiều thứ sáu, tuần nào cũng đặt cả combo lớn."
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, paddingTop: 14, borderTop: '1px solid #f5f5f4' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>
                  QT
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1c1917' }}>Quốc Tuấn</div>
                  <div style={{ fontSize: '0.75rem', color: '#a8a29e' }}>Team Lead Media (Quận 1, TP.HCM)</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </section>

    </div>
  );
}
