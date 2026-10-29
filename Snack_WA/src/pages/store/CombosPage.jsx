import React, { useState, useMemo } from 'react';
import { 
  Typography, 
  Button, 
  Input, 
  Tag, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Space, 
  message, 
  Tooltip,
  Segmented 
} from 'antd';
import { 
  SearchOutlined, 
  FireOutlined, 
  ThunderboltOutlined, 
  ShoppingCartOutlined, 
  StarFilled, 
  EyeOutlined,
  AppstoreOutlined,
  BarsOutlined,
  GiftOutlined,
  CheckCircleFilled,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { 
  SNACK_COMBOS, 
  COMBO_CATEGORIES 
} from '../../shared/constants/snackCombos';
import { useAuthStore } from '../../shared/auth/authStore';
import { useComboCartStore } from '../../features/cart/comboCartStore';
import { addToCart } from '../../features/cart/api';
import { useQueryClient } from '@tanstack/react-query';
import { formatVnd } from '../../shared/utils/formatters';

const { Title, Text, Paragraph } = Typography;

export default function CombosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const addComboVoucher = useComboCartStore((s) => s.addComboVoucher);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [addingId, setAddingId] = useState(null);
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
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
          c.tagline?.toLowerCase().includes(q) ||
          (c.items || []).some((it) => it.tenSanPham.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const handleQuickAddCombo = async (combo, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!token) {
      message.warning('Vui lòng đăng nhập để thêm combo vào giỏ hàng');
      navigate('/dang-nhap');
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

      addComboVoucher(combo);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });

      message.success({
        content: `Đã thêm trọn bộ "${combo.name}" vào giỏ hàng! Tiết kiệm ${formatVnd(combo.savedAmount || 0)}.`,
        duration: 3,
      });
    } catch (err) {
      console.error('Lỗi thêm combo:', err);
      message.error(err.response?.data?.message || 'Không thể thêm trọn bộ combo lúc này. Vui lòng thử lại!');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* 1. Hero Banner */}
      <section 
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 24,
          padding: 'clamp(24px, 4vw, 44px)',
          color: '#ffffff',
          background: 'radial-gradient(130% 130% at 85% 15%, #ea580c 0%, #c2410c 60%, #9a3412 100%)',
          boxShadow: '0 16px 36px rgba(194, 65, 12, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24
        }}
      >
        <div style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.8rem',
            padding: '5px 14px',
            borderRadius: 30,
            marginBottom: 12,
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <FireOutlined style={{ color: '#fde047' }} />
            <span>20+ COMBO ĂN VẶT CHUẨN VỊ SIÊU TIẾT KIỆM</span>
          </div>

          <Title style={{ color: '#fff', margin: '0 0 10px', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, lineHeight: 1.2 }}>
            Combo Ăn Vặt Giòn Rụm, Tiết Kiệm Đến 35%
          </Title>

          <Paragraph style={{ color: '#fed7aa', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: 20 }}>
            Tập hợp các món ăn vặt được yêu thích nhất: Khô gà, Khô heo, Khô bò, Bánh tráng phơi sương, Cơm cháy đáy nồi. Đặt combo giá sốc, tự động giảm sâu khi thanh toán!
          </Paragraph>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.25)', padding: '6px 14px', borderRadius: 12 }}>
              <CheckCircleFilled style={{ color: '#4ade80' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tự động áp voucher giảm giá</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.25)', padding: '6px 14px', borderRadius: 12 }}>
              <ThunderboltOutlined style={{ color: '#fde047' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Giao hỏa tốc 2 giờ</span>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '16px 24px',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.25)',
          textAlign: 'center',
          flex: '1 1 200px',
          maxWidth: 260
        }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fef08a', lineHeight: 1 }}>20+</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 4 }}>Set Combo Phong Phú</div>
          <div style={{ fontSize: '0.78rem', color: '#ffedd5', marginTop: 4 }}>Học sinh • Văn phòng • Cày phim • Party</div>
        </div>
      </section>

      {/* 2. Bộ Lọc Danh Mục & Tìm Kiếm */}
      <div style={{ 
        background: '#ffffff', 
        padding: '16px 20px', 
        borderRadius: 18, 
        border: '1px solid #fed7aa',
        boxShadow: '0 4px 16px rgba(194, 65, 12, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {/* Hàng 1: Search & Chế độ xem */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo tên combo, món ăn trong combo (khô gà, bánh tráng, cơm cháy...)..."
            prefix={<SearchOutlined style={{ color: '#ea580c' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ maxWidth: 460, borderRadius: 10, height: 40 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: '0.9rem' }}>
              Hiển thị: <strong>{filteredCombos.length}</strong> combo
            </Text>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'grid', icon: <AppstoreOutlined />, label: 'Lưới' },
                { value: 'list', icon: <BarsOutlined />, label: 'Danh sách' },
              ]}
              style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}
            />
          </div>
        </div>

        {/* Hàng 2: Pills danh mục */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {COMBO_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <Button
                key={cat.key}
                type={isSelected ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  borderRadius: 20,
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  height: 36,
                  paddingInline: 16,
                  background: isSelected ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#fff',
                  borderColor: isSelected ? '#ea580c' : '#fed7aa',
                  color: isSelected ? '#fff' : '#431407',
                  boxShadow: isSelected ? '0 3px 10px rgba(234, 88, 12, 0.25)' : 'none'
                }}
              >
                {cat.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 3. Danh sách Combo */}
      {filteredCombos.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 20, border: '1px solid #fed7aa' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
          <Title level={4} style={{ color: '#9a3412', marginBottom: 8 }}>Không tìm thấy combo nào phù hợp</Title>
          <Paragraph type="secondary">Hãy thử tìm với từ khóa khác hoặc chuyển sang danh mục "Tất cả".</Paragraph>
          <Button type="primary" onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}>
            Xem tất cả combo
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <Row gutter={[20, 20]}>
          {filteredCombos.map((combo) => {
            const isFav = favorites[combo.id];
            const isAdding = addingId === combo.id;

            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={combo.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 18,
                    overflow: 'hidden',
                    border: '1.5px solid #fed7aa',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    boxShadow: '0 4px 14px rgba(194, 65, 12, 0.05)',
                    transition: 'all 0.25s ease'
                  }}
                  styles={{ body: { padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 } }}
                  cover={
                    <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden', background: '#fff7ed' }}>
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

                      {/* Badge phân khúc */}
                      <span style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: combo.badgeColor || '#ea580c',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '11px',
                        padding: '3px 9px',
                        borderRadius: 12,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}>
                        {combo.badge}
                      </span>

                      {/* Giảm % badge */}
                      <span style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: '#dc2626',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: 12,
                        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                      }}>
                        -{combo.discountPercent}%
                      </span>

                      {/* Nút yêu thích */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(combo.id, e)}
                        style={{
                          position: 'absolute',
                          bottom: 10,
                          right: 10,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                        }}
                      >
                        {isFav ? <HeartFilled style={{ color: '#ef4444' }} /> : <HeartOutlined style={{ color: '#78716c' }} />}
                      </button>
                    </div>
                  }
                >
                  {/* Rating & Sold count */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 700 }}>
                      <StarFilled />
                      <span>{combo.rating}</span>
                      <span style={{ color: '#a8a29e', fontWeight: 400 }}>({combo.reviewCount})</span>
                    </div>
                    <Text type="secondary" style={{ fontSize: '0.78rem' }}>
                      Đã bán {Number(combo.soldCount).toLocaleString()}
                    </Text>
                  </div>

                  {/* Title */}
                  <Link to={`/combo/${combo.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ 
                      fontWeight: 800, 
                      fontSize: '1.05rem', 
                      color: '#292524', 
                      lineHeight: 1.35, 
                      marginBottom: 6,
                      height: 42,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {combo.name}
                    </div>
                  </Link>

                  {/* Included items summary */}
                  <div style={{ 
                    background: '#fffaf5', 
                    borderRadius: 8, 
                    padding: '6px 8px', 
                    fontSize: '0.78rem', 
                    color: '#78716c',
                    marginBottom: 12,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4
                  }}>
                    🎁 <strong>Gồm:</strong> {combo.items?.map((it) => it.tenSanPham).join(' + ')}
                  </div>

                  {/* Spacer */}
                  <div style={{ marginTop: 'auto' }}>
                    {/* Price block */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#dc2626' }}>
                        {formatVnd(combo.comboPrice)}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#a8a29e', textDecoration: 'line-through' }}>
                        {formatVnd(combo.originalPrice)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginBottom: 12 }}>
                      Tiết kiệm {formatVnd(combo.savedAmount || 0)}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/combo/${combo.id}`} style={{ flex: 1 }}>
                        <Button 
                          block
                          style={{ borderRadius: 10, fontWeight: 700, borderColor: '#fed7aa', color: '#ea580c' }}
                        >
                          Chi tiết
                        </Button>
                      </Link>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        loading={isAdding}
                        onClick={(e) => handleQuickAddCombo(combo, e)}
                        style={{
                          borderRadius: 10,
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          border: 'none',
                          boxShadow: '0 3px 8px rgba(234, 88, 12, 0.3)'
                        }}
                        title="Thêm trọn bộ vào giỏ"
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        /* LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredCombos.map((combo) => {
            const isAdding = addingId === combo.id;

            return (
              <Card
                key={combo.id}
                hoverable
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: '1.5px solid #fed7aa',
                  boxShadow: '0 4px 14px rgba(194, 65, 12, 0.05)',
                }}
                styles={{ body: { padding: '16px' } }}
              >
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Thumbnail */}
                  <Link to={`/combo/${combo.id}`}>
                    <div style={{
                      width: 140,
                      height: 140,
                      borderRadius: 14,
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#fff7ed',
                      flexShrink: 0
                    }}>
                      <img
                        src={combo.image}
                        alt={combo.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        background: combo.badgeColor || '#ea580c',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '10px',
                        padding: '2px 7px',
                        borderRadius: 8
                      }}>
                        {combo.badge}
                      </span>
                    </div>
                  </Link>

                  {/* Information */}
                  <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Tag color="volcano" style={{ fontWeight: 800, margin: 0, borderRadius: 6 }}>
                        -{combo.discountPercent}%
                      </Tag>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
                        <StarFilled />
                        <span>{combo.rating}</span>
                        <span style={{ color: '#a8a29e', fontWeight: 400 }}>({combo.reviewCount} đánh giá)</span>
                      </div>
                      <span style={{ color: '#a8a29e', fontSize: '0.8rem' }}>• Đã bán {Number(combo.soldCount).toLocaleString()}</span>
                    </div>

                    <Link to={`/combo/${combo.id}`} style={{ textDecoration: 'none' }}>
                      <Title level={4} style={{ margin: '0 0 6px', color: '#292524', fontWeight: 800 }}>
                        {combo.name}
                      </Title>
                    </Link>

                    <Paragraph type="secondary" style={{ fontSize: '0.88rem', margin: '0 0 8px' }}>
                      {combo.tagline}
                    </Paragraph>

                    {/* Items chips */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ea580c' }}>Gồm {combo.items?.length} món:</span>
                      {combo.items?.map((it, idx) => (
                        <Tag key={idx} style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#7c2d12', borderRadius: 6, fontSize: '11px' }}>
                          {it.soLuong}x {it.tenSanPham}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626' }}>
                        {formatVnd(combo.comboPrice)}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#a8a29e', textDecoration: 'line-through' }}>
                        {formatVnd(combo.originalPrice)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>
                      Tiết kiệm {formatVnd(combo.savedAmount || 0)}
                    </div>

                    <Space size="small">
                      <Link to={`/combo/${combo.id}`}>
                        <Button style={{ borderRadius: 10, fontWeight: 700, borderColor: '#fed7aa', color: '#ea580c' }}>
                          Xem chi tiết
                        </Button>
                      </Link>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        loading={isAdding}
                        onClick={(e) => handleQuickAddCombo(combo, e)}
                        style={{
                          borderRadius: 10,
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          border: 'none',
                          boxShadow: '0 3px 8px rgba(234, 88, 12, 0.3)'
                        }}
                      >
                        Thêm vào giỏ
                      </Button>
                    </Space>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

