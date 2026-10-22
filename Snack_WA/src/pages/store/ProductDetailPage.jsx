import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Tag, 
  Button, 
  InputNumber, 
  Space, 
  Divider, 
  Breadcrumb, 
  Image, 
  message, 
  Skeleton, 
  Alert,
  Tabs,
  Empty
} from 'antd';
import { 
  ShoppingCartOutlined, 
  ThunderboltOutlined, 
  StarFilled, 
  SafetyCertificateOutlined, 
  SyncOutlined, 
  ArrowLeftOutlined,
  CheckCircleFilled,
  HeartOutlined,
  ShareAltOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct, useProductReviews } from '../../features/catalog/hooks';
import { useAddToCart } from '../../features/cart/hooks';
import { useAuthStore } from '../../shared/auth/authStore';
import { formatVnd } from '../../shared/utils/formatters';

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [quantity, setQuantity] = useState(1);

  // Cuộn ngay lên đầu trang khi mở chi tiết món ăn
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const { data: reviews = [], isLoading: isLoadingReviews } = useProductReviews(id);
  const { mutateAsync: addToCart, isPending: isAdding } = useAddToCart();
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (product) {
      if (product.bienThes && product.bienThes.length > 0) {
        const found = product.bienThes.find((b) => b.maSanPham === product.maSanPham);
        setSelectedVariant(found || product.bienThes[0]);
      } else {
        setSelectedVariant(product);
      }
    }
  }, [product]);

  const currentItem = selectedVariant || product;

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 0' }}>
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center' }}>
        <Alert
          type="error"
          showIcon
          message="Không tìm thấy sản phẩm"
          description="Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh."
          action={
            <Button orientation="right" type="primary" onClick={() => navigate('/san-pham')}>
              Quay lại thực đơn
            </Button>
          }
        />
      </div>
    );
  }

  const isOutOfStock = (currentItem?.soLuongTon ?? 0) <= 0;
  const isLowStock = (currentItem?.soLuongTon ?? 0) > 0 && (currentItem?.soLuongTon ?? 0) <= 5;

  const handleAction = async (isBuyNow = false) => {
    if (!token) {
      message.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/dang-nhap');
      return;
    }

    try {
      await addToCart({
        maSanPham: currentItem.maSanPham,
        soLuong: quantity,
      });

      if (isBuyNow) {
        navigate('/thanh-toan');
      } else {
        const title = currentItem.khoiLuong ? `${product.tenSanPham} (${currentItem.khoiLuong})` : currentItem.tenSanPham;
        message.success(`Đã thêm ${quantity} "${title}" vào giỏ hàng!`);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Breadcrumb
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: <Link to="/san-pham">Món ăn vặt</Link> },
            { title: product.tenSanPham },
          ]}
        />
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/san-pham')}
          style={{ color: '#ea580c', fontWeight: 600 }}
        >
          Quay lại thực đơn
        </Button>
      </div>

      {/* Main Product Card */}
      <Card 
        style={{ 
          borderRadius: 20, 
          border: '1px solid #fed7aa',
          boxShadow: '0 8px 24px rgba(194, 65, 12, 0.06)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: 'clamp(20px, 3vw, 40px)' } }}
      >
        <Row gutter={[40, 32]} align="top">
          {/* Cột trái: Ảnh 3:4 sắc nét */}
          <Col xs={24} md={10} lg={9}>
            <div style={{ position: 'relative' }}>
              <div 
                style={{ 
                  borderRadius: 16, 
                  overflow: 'hidden', 
                  aspectRatio: '3 / 4', 
                  background: 'linear-gradient(180deg, #fffaf5 0%, #ffedd5 100%)',
                  border: '1px solid #fed7aa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                }}
              >
                <Image
                  src={product.hinhAnhDaiDien || '/logo.png'}
                  fallback="/logo.png"
                  alt={product.tenSanPham}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block'
                  }}
                  preview={{
                    mask: <div style={{ fontSize: '14px', fontWeight: 600 }}>🔍 Phóng to ảnh</div>
                  }}
                />
              </div>

              {/* Badges on Image */}
              <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                {isOutOfStock ? (
                  <Tag color="error" style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700, borderRadius: 8 }}>
                    HẾT HÀNG
                  </Tag>
                ) : isLowStock ? (
                  <Tag color="warning" style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700, borderRadius: 8 }}>
                    CHỈ CÒN {currentItem.soLuongTon} {currentItem.donViTinh || 'HỘP'}
                  </Tag>
                ) : null}
              </div>
            </div>
          </Col>

          {/* Cột phải: Thông tin sản phẩm & Mua hàng */}
          <Col xs={24} md={14} lg={15}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                {/* Category & Rating */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <Space size="middle">
                    {product.tenLoaiSanPham && (
                      <Tag 
                        color="orange" 
                        style={{ 
                          fontSize: '13px', 
                          fontWeight: 700, 
                          padding: '4px 12px', 
                          borderRadius: 20,
                          background: '#fff7ed',
                          borderColor: '#fed7aa',
                          color: '#c2410c'
                        }}
                      >
                        🏷️ {product.tenLoaiSanPham}
                      </Tag>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: '#78716c' }}>
                      <StarFilled style={{ color: '#f59e0b', fontSize: 16 }} />
                      <strong style={{ color: '#292524' }}>
                        {product.diemTrungBinh > 0 ? product.diemTrungBinh : '5.0'}
                      </strong>
                      <span>({product.soDanhGia || 0} đánh giá)</span>
                    </span>
                  </Space>
                  <Space size="small">
                    {product.laBanChay && (
                      <Tag 
                        style={{ 
                          fontSize: '12px', 
                          fontWeight: 800, 
                          padding: '2px 8px', 
                          borderRadius: 6,
                          background: '#ea580c',
                          color: '#ffffff',
                          border: 'none'
                        }}
                      >
                        Bán chạy
                      </Tag>
                    )}
                    {product.daBan > 0 && (
                      <Tag color="green" style={{ borderRadius: 6, fontWeight: 600 }}>
                        Đã bán {product.daBan}
                      </Tag>
                    )}
                  </Space>
                </div>

                {/* Product Title */}
                <Title level={2} style={{ color: '#292524', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.25 }}>
                  {product.tenSanPham}
                </Title>

                {/* Price Display */}
                <div 
                  style={{ 
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', 
                    borderRadius: 14, 
                    padding: '16px 20px', 
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    gap: 12,
                    border: '1px solid #fed7aa'
                  }}
                >
                  {currentItem.giaSauGiam && currentItem.giaSauGiam < currentItem.giaBan ? (
                    <>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: '#dc2626', lineHeight: 1 }}>
                        {formatVnd(currentItem.giaSauGiam)}
                      </span>
                      <span style={{ textDecoration: 'line-through', color: '#a8a29e', fontSize: '1.1rem' }}>
                        {formatVnd(currentItem.giaBan)}
                      </span>
                      <span style={{
                        background: '#fff7ed',
                        color: '#ea580c',
                        border: '1px solid #fed7aa',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        -{currentItem.phanTramGiam || Math.round(((currentItem.giaBan - currentItem.giaSauGiam) / currentItem.giaBan) * 100)}%
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#dc2626', lineHeight: 1 }}>
                      {formatVnd(currentItem.giaBan)}
                    </span>
                  )}
                  <span style={{ color: '#78716c', fontSize: '0.95rem' }}>
                    / {currentItem.donViTinh || 'hộp'}
                  </span>
                  {currentItem.khoiLuong && (
                    <Tag color="orange" style={{ fontSize: '13px', fontWeight: 700, padding: '2px 10px', borderRadius: 8 }}>
                      Khối lượng: {currentItem.khoiLuong}
                    </Tag>
                  )}
                </div>

                {/* Weight / Variant Selector (chọn trọng lượng/biến thể) */}
                {product.bienThes && product.bienThes.length > 1 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text strong style={{ color: '#44403c', fontSize: '0.95rem' }}>
                        ⚖️ Chọn trọng lượng / phân loại:
                      </Text>
                      <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                        (Chọn quy cách đóng gói phù hợp)
                      </Text>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {product.bienThes.map((variant) => {
                        const isSelected = currentItem?.maSanPham === variant.maSanPham;
                        const isVarOutOfStock = variant.soLuongTon <= 0;
                        const displayPrice = variant.giaSauGiam && variant.giaSauGiam < variant.giaBan ? variant.giaSauGiam : variant.giaBan;
                        return (
                          <div
                            key={variant.maSanPham}
                            onClick={() => {
                              if (!isVarOutOfStock) {
                                setSelectedVariant(variant);
                                setQuantity(1);
                              }
                            }}
                            style={{
                              padding: '10px 18px',
                              borderRadius: 12,
                              textAlign: 'center',
                              cursor: isVarOutOfStock ? 'not-allowed' : 'pointer',
                              border: isSelected ? '2px solid #ea580c' : '1.5px solid #fed7aa',
                              background: isSelected 
                                ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' 
                                : isVarOutOfStock ? '#f9fafb' : '#ffffff',
                              boxShadow: isSelected ? '0 4px 14px rgba(234, 88, 12, 0.18)' : '0 2px 6px rgba(0,0,0,0.02)',
                              opacity: isVarOutOfStock ? 0.6 : 1,
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              minWidth: 100,
                              gap: 2,
                              position: 'relative'
                            }}
                          >
                            <span style={{ 
                              fontWeight: 800, 
                              fontSize: '15px', 
                              color: isSelected ? '#c2410c' : isVarOutOfStock ? '#9ca3af' : '#292524' 
                            }}>
                              {variant.khoiLuong || variant.tenSanPham}
                            </span>
                            <span style={{ 
                              fontSize: '13px', 
                              fontWeight: 700,
                              color: isSelected ? '#ea580c' : isVarOutOfStock ? '#9ca3af' : '#78716c' 
                            }}>
                              {formatVnd(displayPrice)}
                            </span>
                            {variant.giaSauGiam && variant.giaSauGiam < variant.giaBan && (
                              <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 800 }}>
                                -{variant.phanTramGiam}%
                              </span>
                            )}
                            {isVarOutOfStock ? (
                              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: 2 }}>
                                Tạm hết
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 500, marginTop: 2 }}>
                                Còn {variant.soLuongTon}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Info */}
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}>
                  <Text strong style={{ color: '#78716c' }}>Tình trạng kho:</Text>
                  {isOutOfStock ? (
                    <Text type="danger" strong>Tạm hết hàng</Text>
                  ) : (
                    <Text style={{ color: '#16a34a', fontWeight: 700 }}>
                      <CheckCircleFilled style={{ marginRight: 6 }} />
                      Còn hàng ({currentItem.soLuongTon} {currentItem.donViTinh || 'hộp'} sẵn có)
                    </Text>
                  )}
                </div>

                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Text strong style={{ color: '#78716c' }}>Số lượng:</Text>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #fed7aa', borderRadius: 8, overflow: 'hidden' }}>
                      <Button 
                        type="text" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        style={{ width: 36, height: 36, fontWeight: 700 }}
                      >
                        -
                      </Button>
                      <InputNumber
                        min={1}
                        max={currentItem.soLuongTon || 99}
                        value={quantity}
                        onChange={(val) => setQuantity(val || 1)}
                        controls={false}
                        style={{ width: 50, textAlign: 'center', border: 'none', boxShadow: 'none' }}
                      />
                      <Button 
                        type="text" 
                        onClick={() => setQuantity(Math.min(currentItem.soLuongTon || 99, quantity + 1))}
                        disabled={quantity >= (currentItem.soLuongTon || 99)}
                        style={{ width: 36, height: 36, fontWeight: 700 }}
                      >
                        +
                      </Button>
                    </div>
                    <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                      (Tối đa {currentItem.soLuongTon || 99} món)
                    </Text>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                  <Button
                    size="large"
                    icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
                    disabled={isOutOfStock}
                    loading={isAdding}
                    onClick={() => handleAction(false)}
                    style={{
                      flex: '1 1 180px',
                      height: 48,
                      borderRadius: 12,
                      borderColor: '#f97316',
                      color: '#ea580c',
                      fontWeight: 700,
                      background: '#fff7ed'
                    }}
                  >
                    Thêm vào giỏ hàng
                  </Button>

                  <Button
                    type="primary"
                    size="large"
                    icon={<ThunderboltOutlined style={{ fontSize: 20 }} />}
                    disabled={isOutOfStock}
                    loading={isAdding}
                    onClick={() => handleAction(true)}
                    style={{
                      flex: '1 1 180px',
                      height: 48,
                      borderRadius: 12,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(234, 88, 12, 0.3)'
                    }}
                  >
                    Mua ngay
                  </Button>
                </div>
              </div>

              {/* Guarantees Box */}
              <div 
                style={{ 
                  background: '#fafaf9', 
                  borderRadius: 14, 
                  padding: '16px 20px', 
                  border: '1px solid #e7e5e4',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ThunderboltOutlined style={{ color: '#ea580c', fontSize: 20 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#292524' }}>Giao nhanh 2H</div>
                    <div style={{ fontSize: '0.78rem', color: '#78716c' }}>Hỏa tốc khu vực nội thành</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SafetyCertificateOutlined style={{ color: '#16a34a', fontSize: 20 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#292524' }}>Chuẩn ATVSTP</div>
                    <div style={{ fontSize: '0.78rem', color: '#78716c' }}>100% nguyên liệu sạch</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SyncOutlined style={{ color: '#0284c7', fontSize: 20 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#292524' }}>Đổi trả nếu lỗi</div>
                    <div style={{ fontSize: '0.78rem', color: '#78716c' }}>Hỗ trợ hoàn tiền nhanh</div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Description & Reviews Section */}
      <Card 
        style={{ 
          borderRadius: 20, 
          border: '1px solid #fed7aa',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
        }}
        styles={{ body: { padding: '24px 32px' } }}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: <span style={{ fontWeight: 700, fontSize: '1rem' }}>Mô tả sản phẩm</span>,
              children: (
                <div style={{ padding: '12px 0', fontSize: '0.98rem', lineHeight: 1.8, color: '#44403c' }}>
                  {product.moTa ? (
                    <Paragraph style={{ whiteSpace: 'pre-line', fontSize: '1rem', color: '#292524' }}>
                      {product.moTa}
                    </Paragraph>
                  ) : (
                    <div style={{ color: '#78716c', fontStyle: 'italic', padding: '16px 0' }}>
                      Chưa có mô tả chi tiết cho sản phẩm này.
                    </div>
                  )}
                </div>
              )
            },
            {
              key: '2',
              label: (
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Đánh giá & Nhận xét ({product.soDanhGia > 0 ? `${product.diemTrungBinh} ★ (${product.soDanhGia})` : '0'})
                </span>
              ),
              children: (
                <div style={{ padding: '12px 0' }}>
                  {reviews && reviews.length > 0 ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: '#fff7ed', borderRadius: 12 }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ea580c', lineHeight: 1 }}>
                          {product.diemTrungBinh > 0 ? product.diemTrungBinh : '5.0'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', gap: 4, color: '#f59e0b', fontSize: 16, marginBottom: 4 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarFilled 
                                key={i} 
                                style={{ color: i < Math.round(product.diemTrungBinh || 5) ? '#f59e0b' : '#d1d5db' }} 
                              />
                            ))}
                          </div>
                          <Text type="secondary">
                            Dựa trên {reviews.length} lượt đánh giá từ khách hàng đã mua
                          </Text>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {reviews.map((rev) => (
                          <div key={rev.maDanhGia} style={{ borderBottom: '1px solid #f5f5f4', paddingBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text strong>{rev.tenKhachHang || 'Khách hàng'}</Text>
                              <Text type="secondary" style={{ fontSize: '0.8rem' }}>
                                {rev.ngayTao ? new Date(rev.ngayTao).toLocaleDateString('vi-VN') : ''}
                              </Text>
                            </div>
                            <div style={{ display: 'flex', gap: 2, color: '#f59e0b', fontSize: 12, marginBottom: 6 }}>
                              {Array.from({ length: rev.soSao || 5 }).map((_, i) => (
                                <StarFilled key={i} />
                              ))}
                            </div>
                            <Paragraph style={{ margin: 0, color: '#57534e' }}>
                              {rev.binhLuan || '(Khách hàng không để lại nhận xét chi tiết)'}
                            </Paragraph>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Empty 
                      description="Chưa có đánh giá nào cho sản phẩm này." 
                      style={{ padding: '32px 0' }} 
                    />
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
