import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Form, 
  Input, 
  Button, 
  Radio, 
  Typography, 
  Divider, 
  Space, 
  Tag, 
  message, 
  Image, 
  Skeleton, 
  Alert 
} from 'antd';
import { 
  CheckCircleFilled, 
  SafetyCertificateOutlined, 
  ThunderboltOutlined, 
  DollarOutlined, 
  ShoppingOutlined, 
  ArrowLeftOutlined,
  TagOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCartQuery } from '../../features/cart/hooks';
import { useCreateOrder, useCalculateTempOrder } from '../../features/orders/hooks';
import { useAuthStore } from '../../shared/auth/authStore';
import { useComboCartStore } from '../../features/cart/comboCartStore';
import { formatVnd } from '../../shared/utils/formatters';

const { Title, Text, Paragraph } = Typography;

export default function CheckoutPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { appliedComboVouchers, clearComboVouchers, getPrimaryComboVoucherCode } = useComboCartStore();

  const { data: cartItems = [], isLoading: isLoadingCart } = useCartQuery();
  const { mutateAsync: createOrder, isPending: isSubmitting } = useCreateOrder();
  const { mutateAsync: calculateTempOrder, isPending: isCalculating } = useCalculateTempOrder();

  const [voucherCode, setVoucherCode] = useState(() => location.state?.comboVoucherCode || getPrimaryComboVoucherCode() || '');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [tempCalculation, setTempCalculation] = useState(null);
  const [calcError, setCalcError] = useState('');

  // Initial form values from user profile
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        tenNguoiNhan: user.hoTen || user.ten || '',
        sdtNguoiNhan: user.soDienThoai || '',
        diaChiGiaoHang: user.diaChi || '',
        ghiChu: '',
        phuongThucThanhToan: 'cod',
      });
    }
  }, [user, form]);

  // Recalculate whenever cart items or applied voucher changes
  const runCalculation = async (codeToApply = null) => {
    if (cartItems.length === 0) return;

    try {
      setCalcError('');
      const chiTiets = cartItems.map(item => ({
        maSanPham: item.maSanPham,
        soLuong: item.soLuong,
      }));

      const res = await calculateTempOrder({
        maVoucher: codeToApply || undefined,
        phiVanChuyen: 20000,
        chiTiets,
      });

      setTempCalculation(res);
      if (codeToApply) {
        setAppliedVoucher(codeToApply);
        message.success(`Đã áp dụng mã voucher "${codeToApply}" thành công!`);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Không thể áp dụng mã voucher này';
      setCalcError(errMsg);
      if (codeToApply) {
        message.error(errMsg);
      }
    }
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      const codeToUse = appliedVoucher || location.state?.comboVoucherCode || getPrimaryComboVoucherCode();
      if (codeToUse) {
        setVoucherCode(codeToUse);
        runCalculation(codeToUse);
      } else {
        runCalculation(null);
      }
    }
  }, [cartItems]);

  const handleApplyVoucher = async () => {
    const trimmed = voucherCode.trim().toUpperCase();
    if (!trimmed) {
      message.warning('Vui lòng nhập mã voucher');
      return;
    }
    await runCalculation(trimmed);
  };

  const handleRemoveVoucher = async () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setCalcError('');
    await runCalculation(null);
    message.info('Đã gỡ bỏ mã voucher');
  };

  const onFinish = async (values) => {
    if (cartItems.length === 0) {
      message.error('Giỏ hàng đang trống, không thể tạo đơn');
      return;
    }

    try {
      const payload = {
        tenNguoiNhan: values.tenNguoiNhan.trim(),
        sdtNguoiNhan: values.sdtNguoiNhan.trim(),
        diaChiGiaoHang: values.diaChiGiaoHang.trim(),
        ghiChu: values.ghiChu?.trim() || null,
        phiVanChuyen: 20000,
        phuongThucThanhToan: values.phuongThucThanhToan || 'cod',
        maVoucher: appliedVoucher || undefined,
        chiTiets: cartItems.map(item => ({
          maSanPham: item.maSanPham,
          soLuong: item.soLuong,
        })),
      };

      const result = await createOrder(payload);
      if (clearComboVouchers) clearComboVouchers();
      message.success(`Đặt hàng thành công! Mã đơn hàng: ${result.maCode || ''}`);
      navigate('/don-hang');
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

  if (isLoadingCart) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 0' }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Card style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center', borderRadius: 20, padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🛒</div>
        <Title level={3} style={{ color: '#9a3412', marginBottom: 8 }}>
          Giỏ hàng của bạn đang trống
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Bạn cần có ít nhất một món ăn trong giỏ hàng để tiến hành thanh toán.
        </Paragraph>
        <Button 
          type="primary" 
          size="large"
          onClick={() => navigate('/san-pham')}
          style={{
            borderRadius: 12,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            border: 'none',
          }}
        >
          Khám phá món ngon ngay
        </Button>
      </Card>
    );
  }

  // Calculate fallbacks if backend calculation is still loading
  const fallbackSubtotal = cartItems.reduce((acc, item) => acc + (item.thanhTien || (item.giaBan * item.soLuong)), 0);
  const subtotal = tempCalculation?.tienHang ?? fallbackSubtotal;
  const discount = tempCalculation?.tienGiamGia ?? 0;
  const shippingFee = tempCalculation?.phiVanChuyen ?? 20000;
  const totalAmount = tempCalculation?.tongTienThanhToan ?? (fallbackSubtotal + 20000);

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title & Back Link */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#431407', fontWeight: 800 }}>
            📦 Thanh Toán & Đặt Hàng
          </Title>
          <Text type="secondary" style={{ fontSize: '0.95rem' }}>
            Vui lòng điền thông tin người nhận và kiểm tra kỹ đơn hàng của bạn
          </Text>
        </div>

        <Link to="/gio-hang">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            style={{ color: '#ea580c', fontWeight: 600 }}
          >
            Quay lại giỏ hàng
          </Button>
        </Link>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ phuongThucThanhToan: 'cod' }}
      >
        <Row gutter={[28, 28]}>
          {/* Left Column: Delivery Form & Payment Method */}
          <Col xs={24} lg={15}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Delivery Info */}
              <Card 
                title={<span style={{ fontWeight: 800, color: '#431407', fontSize: '1.1rem' }}>📍 1. Thông Tin Nhận Hàng</span>}
                style={{ borderRadius: 18, border: '1px solid #fed7aa', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)' }}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ fontWeight: 600 }}>Họ và tên người nhận</span>}
                      name="tenNguoiNhan"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên người nhận' }]}
                    >
                      <Input placeholder="Ví dụ: Nguyễn Văn A" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}
                      name="sdtNguoiNhan"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                        { pattern: /^(0|\+?84)[3|5|7|8|9][0-9]{8}$/, message: 'Số điện thoại không đúng định dạng VN' }
                      ]}
                    >
                      <Input placeholder="Ví dụ: 0912345678" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={<span style={{ fontWeight: 600 }}>Địa chỉ giao hàng chi tiết</span>}
                  name="diaChiGiaoHang"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng' }]}
                >
                  <Input.TextArea 
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..." 
                    rows={2} 
                    style={{ borderRadius: 10 }} 
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ fontWeight: 600 }}>Ghi chú cho đơn hàng (tùy chọn)</span>}
                  name="ghiChu"
                >
                  <Input.TextArea 
                    placeholder="Ví dụ: Giao giờ hành chính, gọi điện trước khi tới, để ở bảo vệ..." 
                    rows={2} 
                    style={{ borderRadius: 10 }} 
                  />
                </Form.Item>
              </Card>

              {/* Payment Method */}
              <Card 
                title={<span style={{ fontWeight: 800, color: '#431407', fontSize: '1.1rem' }}>💳 2. Phương Thức Thanh Toán</span>}
                style={{ borderRadius: 18, border: '1px solid #fed7aa', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)' }}
              >
                <Form.Item name="phuongThucThanhToan" style={{ margin: 0 }}>
                  <Radio.Group style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div 
                      style={{ 
                        border: '2px solid #f97316', 
                        borderRadius: 12, 
                        padding: '16px', 
                        background: '#fff7ed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Radio value="cod" style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                        💵 Thanh toán tiền mặt khi nhận hàng (COD)
                      </Radio>
                      <Tag color="orange" style={{ fontWeight: 600 }}>Phổ biến nhất</Tag>
                    </div>
                  </Radio.Group>
                </Form.Item>
                <Text type="secondary" style={{ fontSize: '0.85rem', display: 'block', marginTop: 10 }}>
                  Bạn chỉ phải thanh toán khi đã nhận và kiểm tra kiện hàng từ tài xế giao hàng.
                </Text>
              </Card>

              {/* Voucher Promotion Box */}
              <Card 
                title={<span style={{ fontWeight: 800, color: '#431407', fontSize: '1.1rem' }}>🏷️ 3. Mã Giảm Giá / Voucher</span>}
                style={{ borderRadius: 18, border: '1px solid #fed7aa', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)' }}
              >
                {appliedVoucher ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag color="green" style={{ fontSize: '13px', fontWeight: 800, padding: '2px 8px' }}>
                          {appliedVoucher}
                        </Tag>
                        <Text strong style={{ color: '#166534' }}>Đã áp dụng thành công</Text>
                      </div>
                      {tempCalculation?.tenKm && (
                        <Text style={{ fontSize: '0.85rem', color: '#15803d', display: 'block', marginTop: 4 }}>
                          {tempCalculation.tenKm}
                        </Text>
                      )}
                    </div>
                    <Button 
                      type="text" 
                      danger 
                      icon={<CloseCircleOutlined />} 
                      onClick={handleRemoveVoucher}
                    >
                      Gỡ mã
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Input
                        placeholder="Nhập mã voucher (ví dụ: KHAITRUONG20)"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        onPressEnter={handleApplyVoucher}
                        prefix={<TagOutlined style={{ color: '#ea580c' }} />}
                        size="large"
                        style={{ borderRadius: 10 }}
                      />
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleApplyVoucher}
                        loading={isCalculating}
                        style={{
                          borderRadius: 10,
                          fontWeight: 700,
                          background: '#ea580c',
                          borderColor: '#ea580c',
                          minWidth: 100
                        }}
                      >
                        Áp dụng
                      </Button>
                    </div>

                    {calcError && (
                      <Alert 
                        type="error" 
                        showIcon 
                        message={calcError} 
                        style={{ marginTop: 12, borderRadius: 8 }} 
                      />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      <Text type="secondary" style={{ fontSize: '0.85rem' }}>Gợi ý mã hot:</Text>
                      {['KHAITRUONG20', 'WELCOME10', 'SNACK20'].map((code) => (
                        <Tag 
                          key={code} 
                          color="orange" 
                          style={{ cursor: 'pointer', borderRadius: 6, fontWeight: 700 }}
                          onClick={() => {
                            setVoucherCode(code);
                            runCalculation(code);
                          }}
                        >
                          + {code}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </Col>

          {/* Right Column: Order Summary */}
          <Col xs={24} lg={9}>
            <Card 
              title={<span style={{ fontWeight: 800, color: '#431407', fontSize: '1.1rem' }}>📋 Đơn Hàng ({cartItems.length} món)</span>}
              style={{ 
                borderRadius: 20, 
                border: '1px solid #fed7aa',
                boxShadow: '0 8px 24px rgba(194, 65, 12, 0.08)',
                position: 'sticky',
                top: 96
              }}
              styles={{ body: { padding: '20px' } }}
            >
              {/* Items List */}
              <div 
                style={{ 
                  maxHeight: 280, 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 12, 
                  marginBottom: 16,
                  paddingRight: 4
                }}
              >
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
                    <div 
                      key={item.maGioHang} 
                      style={{ 
                        display: 'flex', 
                        gap: 12, 
                        alignItems: 'center', 
                        paddingBottom: 10, 
                        borderBottom: '1px solid #f5f5f4' 
                      }}
                    >
                      <div 
                        style={{ 
                          width: 48, 
                          height: 64, 
                          flexShrink: 0, 
                          borderRadius: 8, 
                          overflow: 'hidden', 
                          background: '#fff7ed',
                          border: '1px solid #fed7aa'
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
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#292524', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.tenSanPham}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#78716c', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{formatVnd(effectiveUnitPrice)} x {item.soLuong}</span>
                          {discountPercent && (
                            <span style={{ textDecoration: 'line-through', color: '#a8a29e', fontSize: '0.75rem' }}>
                              {formatVnd(item.giaBan)}
                            </span>
                          )}
                        </div>
                        {comboVoucher && (
                          <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 600 }}>
                            🎁 Theo {comboVoucher.comboName}
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#dc2626' }}>
                        {formatVnd(itemTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <Text type="secondary">Tiền hàng:</Text>
                  <Text strong>{formatVnd(subtotal)}</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <Text type="secondary">Phí vận chuyển:</Text>
                  <Text strong>{formatVnd(shippingFee)}</Text>
                </div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <Text type="secondary" style={{ color: '#16a34a' }}>
                      {appliedVoucher?.startsWith('COMBO_') ? 'Ưu đãi Combo:' : 'Giảm giá voucher:'}
                    </Text>
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>
                      -{formatVnd(discount)}
                    </span>
                  </div>
                )}

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text strong style={{ fontSize: '1.1rem', color: '#292524' }}>Tổng thanh toán:</Text>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#dc2626' }}>
                    {formatVnd(totalAmount)}
                  </span>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<CheckCircleFilled />}
                  loading={isSubmitting}
                  style={{
                    height: 52,
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    border: 'none',
                    boxShadow: '0 4px 18px rgba(234, 88, 12, 0.35)',
                    marginTop: 8
                  }}
                >
                  Xác nhận đặt hàng
                </Button>

                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: '0.78rem' }}>
                    Nhấn "Xác nhận đặt hàng" đồng nghĩa với việc bạn đồng ý với các điều khoản mua sắm của Snack Shop.
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
