import React, { useState, useEffect, useMemo } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  Divider, 
  Rate, 
  Avatar, 
  Image, 
  message, 
  Breadcrumb, 
  Skeleton,
  Tooltip
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  ThunderboltOutlined, 
  SafetyCertificateOutlined, 
  GiftOutlined, 
  StarFilled, 
  CheckCircleOutlined,
  CopyOutlined,
  FireOutlined,
  UserOutlined,
  LikeOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getComboById, SNACK_COMBOS } from '../../shared/constants/snackCombos';
import { getProduct, getProductReviews } from '../../features/catalog/api';
import { addToCart } from '../../features/cart/api';
import { useComboCartStore } from '../../features/cart/comboCartStore';
import { useAuthStore } from '../../shared/auth/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { formatVnd, formatDate } from '../../shared/utils/formatters';

const { Title, Text, Paragraph } = Typography;

export default function ComboDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const addComboVoucher = useComboCartStore((s) => s.addComboVoucher);

  const combo = useMemo(() => getComboById(id), [id]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Live DB metrics
  const [metrics, setMetrics] = useState({
    soldCount: combo?.soldCount || 0,
    rating: combo?.rating || 4.8,
    reviewCount: combo?.reviewCount || 0,
    reviews: [],
    loading: true,
  });

  useEffect(() => {
    if (!combo) return;
    setSelectedImage(combo.image);

    let isMounted = true;
    const fetchLiveMetrics = async () => {
      try {
        const productPromises = (combo.items || []).map((it) =>
          getProduct(it.maSanPham).catch(() => null)
        );
        const reviewPromises = (combo.items || []).map((it) =>
          getProductReviews(it.maSanPham).catch(() => [])
        );

        const [productsData, reviewsData] = await Promise.all([
          Promise.all(productPromises),
          Promise.all(reviewPromises),
        ]);

        if (!isMounted) return;

        const validProducts = productsData.filter(Boolean);
        const realTotalSold = validProducts.reduce((sum, p) => sum + (Number(p.daBan) || 0), 0);

        const allReviews = reviewsData.flat().filter(Boolean);
        let realAvgRating = combo.rating;
        if (allReviews.length > 0) {
          const totalStars = allReviews.reduce((sum, r) => sum + (Number(r.soSao) || 5), 0);
          realAvgRating = Math.round((totalStars / allReviews.length) * 10) / 10;
        }

        setMetrics({
          soldCount: realTotalSold > 0 ? realTotalSold : combo.soldCount,
          rating: realAvgRating || combo.rating,
          reviewCount: allReviews.length > 0 ? allReviews.length : combo.reviewCount,
          reviews: allReviews,
          loading: false,
        });
      } catch (err) {
        console.warn('Lỗi tải metrics live cho combo:', err);
        if (isMounted) setMetrics((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchLiveMetrics();
    return () => { isMounted = false; };
  }, [combo]);

  if (!combo) {
    return (
      <div style={{ maxWidth: 900, margin: '60px auto', textAlign: 'center' }}>
        <Card style={{ borderRadius: 20, border: '1px solid #fed7aa', padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🍱</div>
          <Title level={3} style={{ color: '#9a3412' }}>Không tìm thấy Set Combo này</Title>
          <Paragraph type="secondary">Combo có thể đã hết hạn hoặc tạm dừng mở bán.</Paragraph>
          <Button type="primary" onClick={() => navigate('/combo')} style={{ borderRadius: 10 }}>
            Quay lại danh sách Combo
          </Button>
        </Card>
      </div>
    );
  }

  const galleryImages = combo.gallery?.length ? combo.gallery : [combo.image];

  const handleCopyVoucher = () => {
    const code = `COMBO_${combo.savedAmount || 0}`;
    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã voucher "${code}"!`);
  };

  const handleAddToCart = async (isBuyNowAction = false) => {
    if (!token) {
      message.warning('Vui lòng đăng nhập để đặt mua combo');
      navigate('/dang-nhap');
      return;
    }

    try {
      if (isBuyNowAction) setIsBuyingNow(true);
      else setIsAdding(true);

      for (const item of combo.items) {
        await addToCart({
          maSanPham: item.maSanPham,
          soLuong: (item.soLuong || 1) * quantity,
        });
      }

      addComboVoucher(combo);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });

      if (isBuyNowAction) {
        navigate('/thanh-toan', { state: { comboVoucherCode: `COMBO_${combo.savedAmount || 0}` } });
      } else {
        message.success(`Đã thêm ${quantity} set "${combo.name}" vào giỏ hàng!`);
      }
    } catch (err) {
      console.error('Lỗi thêm giỏ hàng combo:', err);
      message.error(err.response?.data?.message || 'Không thể thêm combo vào giỏ hàng');
    } finally {
      setIsAdding(false);
      setIsBuyingNow(false);
    }
  };

  // Other related combos
  const otherCombos = SNACK_COMBOS.filter((c) => c.id !== combo.id && c.category === combo.category).slice(0, 4);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/combo">Combo Ăn Vặt</Link> },
          { title: combo.name },
        ]}
      />

      {/* Main Product Card */}
      <Card 
        style={{ 
          borderRadius: 24, 
          border: '1.5px solid #fed7aa', 
          boxShadow: '0 8px 30px rgba(194, 65, 12, 0.06)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: 'clamp(20px, 3vw, 36px)' } }}
      >
        <Row gutter={[36, 36]}>
          {/* Left: Gallery */}
          <Col xs={24} md={11}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Main Image */}
              <div style={{
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={selectedImage || combo.image}
                  alt={combo.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                />

                <span style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  background: combo.badgeColor || '#ea580c',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  {combo.badge}
                </span>

                <span style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: '#dc2626',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '13px',
                  padding: '4px 12px',
                  borderRadius: 20,
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                }}>
                  GIẢM {combo.discountPercent}%
                </span>
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 12,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImage === img ? '2.5px solid #ea580c' : '1px solid #fed7aa',
                        background: '#fff',
                        flexShrink: 0,
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Assurance Trust */}
              <div style={{
                background: '#fffaf5',
                borderRadius: 16,
                padding: '16px',
                border: '1px solid #fed7aa',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#9a3412' }}>
                  <ThunderboltOutlined style={{ color: '#ea580c', fontSize: 18 }} />
                  <span><strong>Giao siêu tốc 2H</strong> tại khu vực nội thành</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#9a3412' }}>
                  <SafetyCertificateOutlined style={{ color: '#16a34a', fontSize: 18 }} />
                  <span>Đảm bảo <strong>100% An toàn VSTP</strong>, không phẩm màu độc hại</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#9a3412' }}>
                  <GiftOutlined style={{ color: '#ec4899', fontSize: 18 }} />
                  <span>{combo.giftBonus || 'Tặng kèm dụng cụ ăn vặt tiện lợi'}</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Right: Info & Purchase */}
          <Col xs={24} md={13}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <Tag color="orange" style={{ fontWeight: 700, borderRadius: 6, marginBottom: 8 }}>
                  {combo.categoryLabel}
                </Tag>
                <Title level={2} style={{ margin: '0 0 10px', color: '#292524', fontWeight: 900 }}>
                  {combo.name}
                </Title>
                <Paragraph type="secondary" style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
                  {combo.tagline}
                </Paragraph>
              </div>

              {/* Rating & Sold Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef3c7', padding: '4px 10px', borderRadius: 8 }}>
                  <StarFilled style={{ color: '#f59e0b', fontSize: 16 }} />
                  <span style={{ fontWeight: 800, color: '#92400e', fontSize: '0.95rem' }}>{metrics.rating}</span>
                  <span style={{ color: '#b45309', fontSize: '0.85rem' }}>({metrics.reviewCount} đánh giá)</span>
                </div>
                <div style={{ color: '#78716c', fontSize: '0.9rem' }}>
                  Đã bán: <strong style={{ color: '#292524' }}>{Number(metrics.soldCount).toLocaleString()}</strong> set
                </div>
              </div>

              {/* Price Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                padding: '20px 24px',
                borderRadius: 18,
                border: '1.5px solid #fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#78716c', marginBottom: 4 }}>Giá ưu đãi trọn bộ combo:</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#dc2626' }}>
                      {formatVnd(combo.comboPrice)}
                    </span>
                    <span style={{ fontSize: '1.15rem', color: '#a8a29e', textDecoration: 'line-through' }}>
                      {formatVnd(combo.originalPrice)}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <Tag color="success" style={{ fontSize: '13px', fontWeight: 800, padding: '4px 10px', borderRadius: 8 }}>
                    Tiết kiệm {formatVnd(combo.savedAmount || 0)}
                  </Tag>
                  <div style={{ fontSize: '0.78rem', color: '#9a3412', marginTop: 4 }}>
                    Đã tự động tính voucher ngầm
                  </div>
                </div>
              </div>

              {/* Items List Inside Combo */}
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#431407', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🍱 Các món có trong Set Combo ({combo.items?.length} món):</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {combo.items?.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#fafaf9',
                        borderRadius: 12,
                        border: '1px solid #f5f5f4',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#fff', border: '1px solid #fed7aa', flexShrink: 0 }}>
                          <img src={item.hinhAnh || '/logo.png'} alt={item.tenSanPham} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#292524' }}>
                            {item.tenSanPham}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#78716c' }}>
                            {item.quyCach}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <Tag color="volcano" style={{ margin: 0, fontWeight: 700 }}>
                          Số lượng: {item.soLuong}
                        </Tag>
                        <div style={{ fontSize: '0.8rem', color: '#a8a29e', marginTop: 2 }}>
                          {formatVnd(item.giaLe)}/món
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity & CTA Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontWeight: 700, color: '#431407' }}>Số lượng set:</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #fed7aa', borderRadius: 10, background: '#fff' }}>
                    <Button 
                      type="text" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: 36, height: 36, fontWeight: 800 }}
                    >
                      -
                    </Button>
                    <span style={{ width: 44, textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>
                      {quantity}
                    </span>
                    <Button 
                      type="text" 
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ width: 36, height: 36, fontWeight: 800 }}
                    >
                      +
                    </Button>
                  </div>

                  <span style={{ fontSize: '0.88rem', color: '#78716c' }}>
                    Tổng tiền: <strong style={{ color: '#dc2626' }}>{formatVnd(combo.comboPrice * quantity)}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <Button
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    loading={isAdding}
                    onClick={() => handleAddToCart(false)}
                    style={{
                      flex: '1 1 200px',
                      height: 50,
                      borderRadius: 14,
                      fontWeight: 800,
                      fontSize: '1rem',
                      borderColor: '#ea580c',
                      color: '#ea580c',
                      background: '#fff7ed'
                    }}
                  >
                    Thêm vào giỏ
                  </Button>

                  <Button
                    type="primary"
                    size="large"
                    icon={<ThunderboltOutlined />}
                    loading={isBuyingNow}
                    onClick={() => handleAddToCart(true)}
                    style={{
                      flex: '1 1 200px',
                      height: 50,
                      borderRadius: 14,
                      fontWeight: 800,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)'
                    }}
                  >
                    Mua ngay combo
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Description & Reviews Tabs */}
      <Row gutter={[24, 24]}>
        {/* Left: Detailed profile */}
        <Col xs={24} lg={14}>
          <Card style={{ borderRadius: 20, border: '1px solid #fed7aa' }}>
            <Title level={4} style={{ color: '#431407', fontWeight: 800, marginTop: 0 }}>
              Đặc Điểm & Hương Vị Của Set
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.95rem' }}>
              <div>
                <strong style={{ color: '#ea580c' }}>✨ Hương vị chủ đạo:</strong>
                <Paragraph style={{ margin: '4px 0 0', color: '#44403c' }}>
                  {combo.flavorProfile || 'Hương vị đậm đà thơm giòn, kích thích vị giác với đầy đủ vị cay giòn chuẩn gu ăn vặt Việt.'}
                </Paragraph>
              </div>

              <div>
                <strong style={{ color: '#ea580c' }}>🎯 Thích hợp cho dịp:</strong>
                <Paragraph style={{ margin: '4px 0 0', color: '#44403c' }}>
                  {combo.bestFor || 'Cày phim cuối tuần, tụ tập bạn bè tám chuyện, tiệc liên hoan nhẹ hoặc nhâm nhi giờ làm việc.'}
                </Paragraph>
              </div>

              <div>
                <strong style={{ color: '#ea580c' }}>🎁 Quà tặng & Đóng gói:</strong>
                <Paragraph style={{ margin: '4px 0 0', color: '#44403c' }}>
                  {combo.giftBonus || 'Đóng hũ PET / túi zip kín sạch sẽ, kèm bao tay và tăm tre tiện lợi.'}
                </Paragraph>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right: Live Customer Reviews */}
        <Col xs={24} lg={10}>
          <Card style={{ borderRadius: 20, border: '1px solid #fed7aa', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4} style={{ color: '#431407', fontWeight: 800, margin: 0 }}>
                Đánh Giá Khách Hàng
              </Title>
              <Tag color="gold" style={{ fontWeight: 800 }}>
                {metrics.rating} ⭐ ({metrics.reviewCount})
              </Tag>
            </div>

            {metrics.reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#a8a29e' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
                <Text type="secondary">Các món trong combo đã nhận hơn {metrics.reviewCount} phản hồi tích cực từ khách mua.</Text>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 380, overflowY: 'auto' }}>
                {metrics.reviews.slice(0, 5).map((rev, idx) => (
                  <div key={idx} style={{ paddingBottom: 12, borderBottom: '1px solid #f5f5f4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar size="small" icon={<UserOutlined />} style={{ background: '#fed7aa', color: '#ea580c' }} />
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{rev.hoTen || rev.tenNguoiDung || 'Khách hàng'}</span>
                      </div>
                      <Rate disabled defaultValue={rev.soSao || 5} style={{ fontSize: 12 }} />
                    </div>
                    <Paragraph style={{ fontSize: '0.85rem', color: '#57534e', margin: '4px 0' }}>
                      {rev.noiDung || rev.nhanXet || 'Đồ ăn rất ngon, giao hàng nhanh chóng và đóng gói cẩn thận!'}
                    </Paragraph>
                    <div style={{ fontSize: '0.75rem', color: '#a8a29e' }}>
                      {rev.ngayTao ? formatDate(rev.ngayTao) : 'Đã mua hàng chính hãng'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Other Combos */}
      {otherCombos.length > 0 && (
        <section style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={3} style={{ color: '#431407', fontWeight: 800, margin: 0 }}>
              Gợi Ý Combo Cùng Loại
            </Title>
            <Link to="/combo" style={{ color: '#ea580c', fontWeight: 700 }}>
              Xem tất cả 20+ combo →
            </Link>
          </div>

          <Row gutter={[16, 16]}>
            {otherCombos.map((c) => (
              <Col xs={12} sm={12} md={6} key={c.id}>
                <Link to={`/combo/${c.id}`} style={{ textDecoration: 'none' }}>
                  <Card
                    hoverable
                    style={{ borderRadius: 16, border: '1px solid #fed7aa' }}
                    styles={{ body: { padding: 12 } }}
                    cover={
                      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#fff7ed' }}>
                        <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
                      </div>
                    }
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#292524', height: 38, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {c.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                      <span style={{ color: '#dc2626', fontWeight: 900, fontSize: '1rem' }}>{formatVnd(c.comboPrice)}</span>
                      <span style={{ color: '#a8a29e', fontSize: '0.75rem', textDecoration: 'line-through' }}>{formatVnd(c.originalPrice)}</span>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </section>
      )}
    </div>
  );
}

