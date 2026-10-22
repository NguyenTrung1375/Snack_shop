import React, { useState } from 'react';
import { 
  Card, 
  Tag, 
  Typography, 
  Button, 
  Space, 
  Tabs, 
  Modal, 
  Input, 
  Radio, 
  Pagination, 
  Skeleton, 
  Empty, 
  Image, 
  Divider, 
  Row, 
  Col, 
  message 
} from 'antd';
import { 
  ShoppingOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  CloseCircleOutlined, 
  CarOutlined, 
  ExclamationCircleOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useMyOrdersQuery, useCancelOrder } from '../../features/orders/hooks';
import { orderStatuses, paymentStatuses } from '../../shared/constants/orderStatus';
import { formatVnd, formatDate } from '../../shared/utils/formatters';

const { Title, Text, Paragraph } = Typography;

const statusConfig = {
  cho_xac_nhan: { label: 'Chờ xác nhận', color: 'gold', icon: <ClockCircleOutlined /> },
  da_xac_nhan: { label: 'Đã xác nhận', color: 'blue', icon: <CheckCircleOutlined /> },
  dang_giao: { label: 'Đang giao hàng', color: 'cyan', icon: <CarOutlined /> },
  da_giao: { label: 'Giao thành công', color: 'green', icon: <CheckCircleOutlined /> },
  da_huy: { label: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> },
};

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Cancel modal state
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Tôi muốn thay đổi món ăn');
  const [customReason, setCustomReason] = useState('');

  // Fetch orders
  const params = {
    page,
    pageSize,
    trangThai: currentTab === 'all' ? undefined : currentTab,
  };

  const { data, isLoading, isError, refetch } = useMyOrdersQuery(params);
  const { mutateAsync: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const orders = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleOpenCancelModal = (order) => {
    setSelectedOrderToCancel(order);
    setCancelReason('Tôi muốn thay đổi món ăn');
    setCustomReason('');
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderToCancel) return;

    const finalReason = cancelReason === 'Khác' 
      ? (customReason.trim() || 'Lý do khác') 
      : cancelReason;

    try {
      await cancelOrder({
        id: selectedOrderToCancel.maDonHang,
        lyDoHuy: finalReason,
      });
      message.success(`Đã hủy đơn hàng #${selectedOrderToCancel.maCode || ''} thành công!`);
      setCancelModalVisible(false);
      setSelectedOrderToCancel(null);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể hủy đơn hàng này');
    }
  };

  const tabItems = [
    { key: 'all', label: 'Tất cả đơn hàng' },
    { key: 'cho_xac_nhan', label: 'Chờ xác nhận' },
    { key: 'da_xac_nhan', label: 'Đã xác nhận' },
    { key: 'dang_giao', label: 'Đang giao' },
    { key: 'da_giao', label: 'Đã giao' },
    { key: 'da_huy', label: 'Đã hủy' },
  ];

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#431407', fontWeight: 800 }}>
            🧾 Đơn Hàng Của Tôi
          </Title>
          <Text type="secondary" style={{ fontSize: '0.95rem' }}>
            Theo dõi tiến trình xử lý và lịch sử đặt hàng của bạn
          </Text>
        </div>

        <Button
          type="primary"
          icon={<ShoppingOutlined />}
          onClick={() => navigate('/san-pham')}
          style={{
            borderRadius: 10,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            border: 'none',
          }}
        >
          Tiếp tục mua sắm
        </Button>
      </div>

      {/* Tabs Filter */}
      <Card 
        style={{ borderRadius: 16, border: '1px solid #fed7aa', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
        styles={{ body: { padding: '8px 16px 0 16px' } }}
      >
        <Tabs
          activeKey={currentTab}
          onChange={(key) => {
            setCurrentTab(key);
            setPage(1);
          }}
          items={tabItems}
        />
      </Card>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map((n) => (
            <Card key={n} style={{ borderRadius: 16 }}>
              <Skeleton active avatar paragraph={{ rows: 3 }} />
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card 
          style={{ 
            borderRadius: 20, 
            textAlign: 'center', 
            padding: '56px 24px', 
            border: '1px solid #fed7aa',
            background: '#ffffff'
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
          <Title level={3} style={{ color: '#9a3412', marginBottom: 8, fontWeight: 800 }}>
            Chưa có đơn hàng nào
          </Title>
          <Paragraph type="secondary" style={{ maxWidth: 420, margin: '0 auto 24px' }}>
            {currentTab === 'all' 
              ? 'Bạn chưa đặt đơn hàng nào tại Snack Shop. Hãy khám phá ngay các món ăn vặt giòn ngon nhé!'
              : 'Không có đơn hàng nào ở trạng thái này.'}
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<ShoppingOutlined />}
            onClick={() => navigate('/san-pham')}
            style={{
              borderRadius: 12,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              height: 46
            }}
          >
            Khám phá món ngon ngay
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map((order) => {
            const statusInfo = statusConfig[order.trangThaiDonHang] || { label: order.trangThaiDonHang, color: 'default', icon: null };
            const canCancel = order.trangThaiDonHang === 'cho_xac_nhan';
            const isPaid = order.trangThaiThanhToan === 'da_thanh_toan';

            return (
              <Card
                key={order.maDonHang}
                style={{
                  borderRadius: 18,
                  border: '1px solid #fed7aa',
                  boxShadow: '0 4px 16px rgba(194, 65, 12, 0.05)',
                  overflow: 'hidden'
                }}
                styles={{ body: { padding: '20px 24px' } }}
              >
                {/* Header: Order Code & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16, borderBottom: '1px solid #f5f5f4', paddingBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#431407' }}>
                      Đơn hàng #{order.maCode || order.maDonHang.substring(0, 8).toUpperCase()}
                    </span>
                    <Text type="secondary" style={{ fontSize: '0.88rem' }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {formatDate(order.ngayTao)}
                    </Text>
                  </div>

                  <Space size="small">
                    <Tag 
                      color={isPaid ? 'green' : 'orange'} 
                      style={{ borderRadius: 6, fontWeight: 700, margin: 0 }}
                    >
                      {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN (COD)'}
                    </Tag>
                    <Tag 
                      color={statusInfo.color} 
                      icon={statusInfo.icon}
                      style={{ borderRadius: 6, fontWeight: 700, padding: '4px 10px', fontSize: '13px', margin: 0 }}
                    >
                      {statusInfo.label}
                    </Tag>
                  </Space>
                </div>

                {/* Products in this order */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {(order.chiTiets || []).map((detail) => (
                    <div 
                      key={detail.maChiTietDonHang || detail.maSanPham}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: 16,
                        padding: '10px 14px',
                        background: '#fafaf9',
                        borderRadius: 12,
                        border: '1px solid #f5f5f4'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                        <div 
                          style={{ 
                            width: 52, 
                            height: 68, 
                            flexShrink: 0, 
                            borderRadius: 8, 
                            overflow: 'hidden', 
                            background: '#fff7ed',
                            border: '1px solid #fed7aa'
                          }}
                        >
                          <Image
                            src={detail.hinhAnhDaiDien || '/logo.png'}
                            fallback="/logo.png"
                            alt={detail.tenSanPham}
                            preview={false}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <Link to={`/san-pham/${detail.maSanPham}`}>
                            <div style={{ fontWeight: 700, color: '#292524', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {detail.tenSanPham}
                            </div>
                          </Link>
                          <div style={{ fontSize: '0.82rem', color: '#78716c', marginTop: 2 }}>
                            Số lượng: <strong style={{ color: '#ea580c' }}>x{detail.soLuong}</strong>
                            <span style={{ margin: '0 8px' }}>•</span>
                            Đơn giá: {formatVnd(detail.donGia)}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#dc2626', flexShrink: 0 }}>
                        {formatVnd(detail.thanhTien || detail.donGia * detail.soLuong)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery details and Order Total */}
                <Row gutter={[16, 16]} align="bottom" style={{ borderTop: '1px solid #f5f5f4', paddingTop: 14 }}>
                  <Col xs={24} md={14}>
                    <div style={{ fontSize: '0.85rem', color: '#57534e', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UserOutlined style={{ color: '#ea580c' }} />
                        <span>Người nhận: <strong>{order.tenNguoiNhan}</strong> - {order.sdtNguoiNhan}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <EnvironmentOutlined style={{ color: '#ea580c', marginTop: 2 }} />
                        <span>Địa chỉ: {order.diaChiGiaoHang}</span>
                      </div>
                      {order.ghiChu && (
                        <div style={{ fontStyle: 'italic', color: '#78716c', marginTop: 2 }}>
                          Ghi chú: "{order.ghiChu}"
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col xs={24} md={10}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      {order.tienGiamGia > 0 && (
                        <div style={{ fontSize: '0.85rem', color: '#16a34a' }}>
                          Voucher giảm: -{formatVnd(order.tienGiamGia)}
                        </div>
                      )}
                      <div style={{ fontSize: '0.85rem', color: '#78716c' }}>
                        Phí giao hàng: {formatVnd(order.phiVanChuyen || 20000)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                        <Text strong style={{ fontSize: '1rem', color: '#292524' }}>Tổng tiền:</Text>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626' }}>
                          {formatVnd(order.tongTienThanhToan)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        {canCancel && (
                          <Button
                            danger
                            onClick={() => handleOpenCancelModal(order)}
                            style={{ borderRadius: 8, fontWeight: 600 }}
                          >
                            Hủy đơn hàng
                          </Button>
                        )}
                        <Button
                          type="default"
                          onClick={() => navigate('/san-pham')}
                          style={{ borderRadius: 8, fontWeight: 600, borderColor: '#fed7aa', color: '#ea580c' }}
                        >
                          Mua lại món
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            );
          })}

          {/* Pagination */}
          {totalCount > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={totalCount}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
            <ExclamationCircleOutlined />
            <span>Xác nhận hủy đơn hàng</span>
          </div>
        }
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        confirmLoading={isCancelling}
        onOk={handleConfirmCancel}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
      >
        <div style={{ padding: '8px 0' }}>
          <Paragraph>
            Bạn có chắc muốn hủy đơn hàng <strong>#{selectedOrderToCancel?.maCode || ''}</strong>?
          </Paragraph>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Vui lòng chọn lý do hủy:
          </Text>
          <Radio.Group
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <Radio value="Tôi muốn thay đổi món ăn">Tôi muốn thay đổi món ăn</Radio>
            <Radio value="Tôi muốn đổi địa chỉ nhận hàng">Tôi muốn đổi địa chỉ nhận hàng</Radio>
            <Radio value="Thời gian giao hàng không phù hợp">Thời gian giao hàng không phù hợp</Radio>
            <Radio value="Tìm thấy giá rẻ hơn ở nơi khác">Tìm thấy giá rẻ hơn ở nơi khác</Radio>
            <Radio value="Khác">Lý do khác...</Radio>
          </Radio.Group>

          {cancelReason === 'Khác' && (
            <Input.TextArea
              placeholder="Nhập lý do hủy của bạn..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
              style={{ marginTop: 12, borderRadius: 8 }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
