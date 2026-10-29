import React from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Popconfirm, 
  Divider, 
  Empty, 
  Skeleton, 
  Image, 
  message, 
  Tag 
} from 'antd';
import { 
  DeleteOutlined, 
  ShoppingOutlined, 
  ArrowRightOutlined, 
  ArrowLeftOutlined, 
  SafetyCertificateOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useCartQuery, useUpdateCartItem, useRemoveFromCart } from '../../features/cart/hooks';
import { useComboCartStore } from '../../features/cart/comboCartStore';
import { formatVnd } from '../../shared/utils/formatters';

const { Title, Text, Paragraph } = Typography;

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading, isError } = useCartQuery();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart();
  const { appliedComboVouchers, getTotalComboSavings, getPrimaryComboVoucherCode } = useComboCartStore();
  const comboSavings = getTotalComboSavings ? getTotalComboSavings() : 0;

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemove(item.maGioHang);
      return;
    }
    updateItem(
      { maGioHang: item.maGioHang, soLuong: newQuantity },
      {
        onError: (err) => {
          message.error(err.response?.data?.message || 'Không thể cập nhật số lượng');
        }
      }
    );
  };

  const handleRemove = (maGioHang) => {
    removeItem(maGioHang, {
      onSuccess: () => {
        message.success('Đã xóa món khỏi giỏ hàng');
      },
      onError: (err) => {
        message.error(err.response?.data?.message || 'Không thể xóa món khỏi giỏ hàng');
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 0' }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  // Calculate pricing
  const subtotal = cartItems.reduce((acc, item) => acc + (item.thanhTien || (item.giaBan * item.soLuong)), 0);
  const effectiveComboSavings = Math.min(comboSavings, subtotal);
  const shippingFee = cartItems.length > 0 ? 20000 : 0;
  const totalAmount = Math.max(0, subtotal - effectiveComboSavings + shippingFee);

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#431407', fontWeight: 800 }}>
            🛒 Giỏ Hàng Của Bạn
          </Title>
          <Text type="secondary" style={{ fontSize: '0.95rem' }}>
            {cartItems.length > 0 
              ? `Bạn đang có ${cartItems.length} món ăn vặt thơm ngon trong giỏ` 
              : 'Chưa có món nào được chọn'}
          </Text>
        </div>

        <Link to="/san-pham">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            style={{ color: '#ea580c', fontWeight: 600 }}
          >
            Tiếp tục chọn món
          </Button>
        </Link>
      </div>

      {cartItems.length === 0 ? (
        /* Empty State */
        <Card 
          style={{ 
            borderRadius: 20, 
            textAlign: 'center', 
            padding: '48px 24px', 
            border: '1px solid #fed7aa',
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(194, 65, 12, 0.05)'
          }}
        >
          <div style={{ fontSize: 72, marginBottom: 16 }}>🍟</div>
          <Title level={3} style={{ color: '#9a3412', marginBottom: 8, fontWeight: 800 }}>
            Giỏ hàng của bạn đang đói bụng!
          </Title>
          <Paragraph type="secondary" style={{ maxWidth: 440, margin: '0 auto 24px', fontSize: '1rem' }}>
            Hãy lướt qua thực đơn với hàng trăm món ăn vặt giòn rụm và thêm vào giỏ ngay nhé.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<ShoppingOutlined />}
            onClick={() => navigate('/san-pham')}
            style={{
              height: 48,
              padding: '0 32px',
              borderRadius: 12,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
            }}
          >
            Khám phá món ngon ngay
          </Button>
        </Card>
      ) : (
        /* Cart With Items */
        <Row gutter={[24, 24]}>
          {/* List of Cart Items */}
          <Col xs={24} lg={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cartItems.map((item) => {
                const comboVoucher = (appliedComboVouchers || []).find(
                  (v) => v.itemIds && v.itemIds.includes(item.maSanPham)
                );
                const discountPercent = comboVoucher
                  ? (comboVoucher.discountPercent || Math.round((comboVoucher.savedAmount / (comboVoucher.originalPrice || 1)) * 100))
                  : null;
                const effectiveUnitPrice = discountPercent 
                  ? Math.round(item.giaBan * (1 - (discountPercent / 100))) 
                  : item.giaBan;
                const itemTotal = effectiveUnitPrice * item.soLuong;
                return (
                  <Card 
                    key={item.maGioHang} 
                    style={{ 
                      borderRadius: 16, 
                      border: '1px solid #fed7aa',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                    }}
                    styles={{ body: { padding: '16px 20px' } }}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      {/* Image 3:4 nhỏ gọn */}
                      <div 
                        style={{ 
                          width: 72, 
                          height: 96, 
                          flexShrink: 0, 
                          borderRadius: 10, 
                          overflow: 'hidden', 
                          background: '#fff7ed',
                          border: '1px solid #fed7aa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Image
                          src={item.hinhAnhDaiDien || '/logo.png'}
                          fallback="/logo.png"
                          alt={item.tenSanPham}
                          preview={false}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Product Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link to={`/san-pham/${item.maSanPham}`}>
                          <div 
                            style={{ 
                              fontWeight: 700, 
                              fontSize: '1.05rem', 
                              color: '#292524', 
                              marginBottom: 6,
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {item.tenSanPham}
                          </div>
                        </Link>

                        {/* Unit price with strikethrough if combo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ color: '#ea580c', fontWeight: 700, fontSize: '0.95rem' }}>
                            {formatVnd(effectiveUnitPrice)}
                          </span>
                          {discountPercent && (
                            <>
                              <span style={{ color: '#a8a29e', fontSize: '0.85rem', textDecoration: 'line-through' }}>
                                {formatVnd(item.giaBan)}
                              </span>
                              <Tag color="volcano" style={{ margin: 0, fontSize: '11px', fontWeight: 800, borderRadius: 4 }}>
                                -{discountPercent}%
                              </Tag>
                            </>
                          )}
                        </div>

                        {comboVoucher && (
                          <div style={{ marginBottom: 10 }}>
                            <Tag color="orange" style={{ margin: 0, fontSize: '11px', fontWeight: 700, borderRadius: 6 }}>
                              🎁 Ưu đãi theo {comboVoucher.comboName}
                            </Tag>
                          </div>
                        )}

                        {/* Quantity Controls & Delete */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #fed7aa', borderRadius: 8, background: '#fff' }}>
                            <Button
                              type="text"
                              size="small"
                              onClick={() => handleUpdateQuantity(item, item.soLuong - 1)}
                              disabled={isUpdating}
                              style={{ width: 30, height: 30, fontWeight: 700 }}
                            >
                              -
                            </Button>
                            <span style={{ width: 36, textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                              {item.soLuong}
                            </span>
                            <Button
                              type="text"
                              size="small"
                              onClick={() => handleUpdateQuantity(item, item.soLuong + 1)}
                              disabled={isUpdating}
                              style={{ width: 30, height: 30, fontWeight: 700 }}
                            >
                              +
                            </Button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ textAlign: 'right' }}>
                              <Text type="secondary" style={{ fontSize: '0.75rem', display: 'block' }}>Thành tiền</Text>
                              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#dc2626' }}>
                                {formatVnd(itemTotal)}
                              </span>
                            </div>

                            <Popconfirm
                              title="Xóa món này?"
                              description="Bạn có chắc muốn bỏ món ăn này ra khỏi giỏ?"
                              okText="Xóa"
                              cancelText="Giữ lại"
                              okButtonProps={{ danger: true }}
                              onConfirm={() => handleRemove(item.maGioHang)}
                            >
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                loading={isRemoving}
                                style={{ borderRadius: 8 }}
                              />
                            </Popconfirm>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Col>

          {/* Cart Summary Card */}
          <Col xs={24} lg={8}>
            <Card 
              style={{ 
                borderRadius: 20, 
                border: '1px solid #fed7aa',
                boxShadow: '0 8px 24px rgba(194, 65, 12, 0.08)',
                position: 'sticky',
                top: 96
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <Title level={4} style={{ color: '#431407', fontWeight: 800, marginTop: 0, marginBottom: 16 }}>
                Tóm Tắt Đơn Hàng
              </Title>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <Text type="secondary">Tạm tính tiền hàng:</Text>
                  <Text strong>{formatVnd(subtotal)}</Text>
                </div>

                {effectiveComboSavings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#16a34a' }}>
                    <span>Ưu đãi Combo đã chọn:</span>
                    <strong style={{ color: '#16a34a' }}>-{formatVnd(effectiveComboSavings)}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <Text type="secondary">Phí vận chuyển dự kiến:</Text>
                  <Text strong>{formatVnd(shippingFee)}</Text>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text strong style={{ fontSize: '1.05rem', color: '#292524' }}>Tổng thanh toán:</Text>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#dc2626' }}>
                    {formatVnd(totalAmount)}
                  </span>
                </div>
                <Text type="secondary" style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: -8 }}>
                  (Đã bao gồm VAT nếu có)
                </Text>

                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate('/thanh-toan', { state: { comboVoucherCode: getPrimaryComboVoucherCode() } })}
                  style={{
                    height: 50,
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
                    marginTop: 12
                  }}
                >
                  Tiến hành đặt hàng
                </Button>

                {/* Trust badges */}
                <div style={{ marginTop: 12, background: '#fff7ed', borderRadius: 12, padding: '12px 14px', border: '1px solid #fed7aa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#9a3412', marginBottom: 6 }}>
                    <ThunderboltOutlined style={{ color: '#ea580c' }} />
                    <span>Giao hỏa tốc 2 giờ nội thành</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#9a3412' }}>
                    <SafetyCertificateOutlined style={{ color: '#16a34a' }} />
                    <span>Đảm bảo an toàn vệ sinh thực phẩm 100%</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
