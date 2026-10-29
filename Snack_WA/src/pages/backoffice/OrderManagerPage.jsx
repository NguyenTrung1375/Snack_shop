import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Select, 
  Tag, 
  message, 
  Typography, 
  Drawer, 
  Descriptions, 
  Image, 
  Spin, 
  Timeline, 
  Popconfirm 
} from 'antd';
import { 
  EyeOutlined, 
  CheckCircleOutlined, 
  CarOutlined, 
  CheckOutlined, 
  CloseCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  useOrders, 
  useUpdateOrderStatus, 
  useUpdateOrderPayment,
  useGenerateInvoice,
  useCancelOrder
} from '../../features/orders/hooks';
import { getOrderDetail } from '../../features/orders/api';

const { Option } = Select;
const { Title, Text } = Typography;

const statusColors = {
  cho_xac_nhan: 'orange',
  da_xac_nhan: 'blue',
  dang_giao: 'cyan',
  da_giao: 'green',
  da_huy: 'red'
};

const statusLabels = {
  cho_xac_nhan: 'Chờ xác nhận',
  da_xac_nhan: 'Đã xác nhận',
  dang_giao: 'Đang giao',
  da_giao: 'Đã giao',
  da_huy: 'Đã hủy'
};

const paymentLabels = {
  chua_thanh_toan: 'Chưa thanh toán',
  da_thanh_toan: 'Đã thanh toán',
  da_hoan_tien: 'Đã hoàn tiền'
};

const allowedNextStates = {
  cho_xac_nhan: ['cho_xac_nhan', 'da_xac_nhan', 'da_huy'],
  da_xac_nhan: ['da_xac_nhan', 'dang_giao', 'da_huy'],
  dang_giao: ['dang_giao', 'da_giao'],
  da_giao: ['da_giao'],
  da_huy: ['da_huy']
};

export default function OrderManagerPage() {
  const [params, setParams] = useState({ page: 1, pageSize: 20 });
  const { data, isLoading } = useOrders(params);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus();
  const { mutate: updatePayment, isPending: isUpdatingPayment } = useUpdateOrderPayment();
  const { mutate: generateInvoice, isPending: isGeneratingInvoice } = useGenerateInvoice();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  // State for Right-side Order Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleStatusChange = (id, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    updateStatus({ id, status: newStatus }, {
      onSuccess: () => {
        message.success(newStatus === 'da_giao' ? 'Đã giao hàng và tự động xuất hóa đơn!' : 'Cập nhật trạng thái thành công');
        if (selectedOrder && selectedOrder.maDonHang === id) {
          setSelectedOrder((prev) => prev ? ({ ...prev, trangThaiDonHang: newStatus }) : null);
          getOrderDetail(id).then((fresh) => {
            if (fresh) setSelectedOrder(fresh);
          }).catch(() => {});
        }
      },
      onError: (err) => message.error(err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
    });
  };

  const handlePaymentChange = (id, isPaid) => {
    const status = isPaid ? 'da_thanh_toan' : 'chua_thanh_toan';
    updatePayment({ id, payload: { trangThaiThanhToan: status } }, {
      onSuccess: () => {
        message.success('Cập nhật thanh toán thành công');
        if (selectedOrder && selectedOrder.maDonHang === id) {
          setSelectedOrder((prev) => prev ? ({ ...prev, trangThaiThanhToan: status }) : null);
        }
      },
      onError: () => message.error('Lỗi khi cập nhật thanh toán')
    });
  };

  const handleCreateInvoice = (id) => {
    generateInvoice(id, {
      onSuccess: () => {
        message.success('Đã xuất hóa đơn bán lẻ thành công!');
        getOrderDetail(id).then((fresh) => {
          if (fresh) setSelectedOrder(fresh);
        }).catch(() => {});
      },
      onError: (err) => message.error(err?.response?.data?.message || 'Không thể xuất hóa đơn cho đơn hàng này')
    });
  };

  const handleCancelOrder = (id) => {
    cancelOrder({ id, lyDoHuy: 'Hủy theo yêu cầu của quản lý Back-Office' }, {
      onSuccess: () => {
        message.success('Đã hủy đơn hàng và hoàn trả tồn kho!');
        setSelectedOrder((prev) => prev ? ({ ...prev, trangThaiDonHang: 'da_huy' }) : null);
        getOrderDetail(id).then((fresh) => {
          if (fresh) setSelectedOrder(fresh);
        }).catch(() => {});
      },
      onError: (err) => message.error(err?.response?.data?.message || 'Không thể hủy đơn hàng')
    });
  };

  const handleViewDetail = async (record) => {
    setSelectedOrder(record);
    setIsDetailOpen(true);
    try {
      setLoadingDetail(true);
      const detail = await getOrderDetail(record.maDonHang);
      if (detail) {
        setSelectedOrder(detail);
      }
    } catch {
      // Use record as fallback
    } finally {
      setLoadingDetail(false);
    }
  };

  // Columns definition: ALL CELLS are clickable and point to the right-side detail drawer
  const columns = [
    { 
      title: 'Mã ĐH', 
      dataIndex: 'maCode', 
      key: 'maCode', 
      render: (val) => (
        <Text strong style={{ color: '#ea580c' }}>
          #{val}
        </Text>
      )
    },
    { 
      title: 'Khách hàng', 
      dataIndex: 'tenNguoiNhan', 
      key: 'tenNguoiNhan',
      render: (val, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>{val || 'Khách hàng'}</div>
          {record.sdtNguoiNhan && (
            <div style={{ fontSize: 11, color: '#64748b' }}>{record.sdtNguoiNhan}</div>
          )}
        </div>
      )
    },
    { 
      title: 'Ngày tạo', 
      dataIndex: 'ngayTao', 
      key: 'ngayTao',
      render: val => dayjs(val).format('DD/MM/YYYY HH:mm')
    },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'tongTienThanhToan', 
      key: 'tongTienThanhToan',
      render: val => (
        <Text strong style={{ color: '#c2410c' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
        </Text>
      )
    },
    {
      title: 'Thanh toán',
      dataIndex: 'trangThaiThanhToan',
      key: 'trangThaiThanhToan',
      render: (status) => (
        <Tag 
          color={status === 'da_thanh_toan' ? 'green' : 'orange'} 
          style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }}
        >
          {paymentLabels[status] || status}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThaiDonHang',
      key: 'trangThaiDonHang',
      render: (status) => (
        <Tag 
          color={statusColors[status]} 
          style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }}
        >
          {statusLabels[status] || status}
        </Tag>
      )
    },
  ];

  const orderItemColumns = [
    {
      title: 'Món ăn',
      dataIndex: 'tenSanPham',
      key: 'tenSanPham',
      render: (val, item) => (
        <Space>
          {item.hinhAnhDaiDien && (
            <Image src={item.hinhAnhDaiDien} width={42} height={42} style={{ borderRadius: 6, objectFit: 'cover' }} />
          )}
          <span style={{ fontWeight: 600 }}>{val}</span>
        </Space>
      )
    },
    {
      title: 'Đơn giá',
      dataIndex: 'giaBan',
      key: 'giaBan',
      render: (val, item) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || item.donGia || 0),
    },
    { title: 'SL', dataIndex: 'soLuong', key: 'soLuong', width: 60, align: 'center' },
    {
      title: 'Thành tiền',
      dataIndex: 'thanhTien',
      key: 'thanhTien',
      render: (val, item) => (
        <Text strong style={{ color: '#ea580c' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || ((item.giaBan || item.donGia || 0) * item.soLuong))}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#431407' }}>📦 Quản lý Đơn hàng</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            👆 Nhấn vào bất kỳ ô nào trong hàng để mở ngăn chi tiết bên tay phải màn hình
          </Text>
        </div>
        <Select 
          placeholder="Lọc trạng thái" 
          allowClear 
          style={{ width: 200 }}
          onChange={val => setParams(p => ({ ...p, trangThai: val, page: 1 }))}
        >
          {Object.keys(statusLabels).map(key => (
            <Option key={key} value={key}>{statusLabels[key]}</Option>
          ))}
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey="maDonHang"
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => {
            handleViewDetail(record);
          },
          style: { cursor: 'pointer' },
        })}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total: data?.totalCount || 0,
          showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
          onChange: (page, pageSize) => setParams((p) => ({ ...p, page, pageSize })),
        }}
        bordered
        style={{ background: '#fff', borderRadius: 12 }}
      />

      {/* Right-side Slide-over Pop-up Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
            <Space size="middle">
              <span style={{ fontSize: 22 }}>📦</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#431407' }}>
                  Chi tiết Đơn hàng #{selectedOrder?.maCode || selectedOrder?.maDonHang?.slice(0, 8) || ''}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Đặt lúc: {selectedOrder?.ngayTao ? dayjs(selectedOrder.ngayTao).format('DD/MM/YYYY HH:mm:ss') : '—'}
                </Text>
              </div>
            </Space>
            {selectedOrder?.trangThaiDonHang && (
              <Tag 
                color={statusColors[selectedOrder.trangThaiDonHang]} 
                style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6, fontWeight: 700 }}
              >
                {statusLabels[selectedOrder.trangThaiDonHang] || selectedOrder.trangThaiDonHang}
              </Tag>
            )}
          </div>
        }
        placement="right"
        width={700}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {selectedOrder?.maDonHang}
            </Text>
            <Button onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 14, color: '#64748b' }}>Đang tải dữ liệu chi tiết đơn hàng từ máy chủ...</div>
          </div>
        ) : selectedOrder && (
          <div>
            {/* Quick Actions & Status Control Bar */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Cập nhật trạng thái đơn:</Text>
                  <Select 
                    value={selectedOrder.trangThaiDonHang} 
                    onChange={(val) => handleStatusChange(selectedOrder.maDonHang, selectedOrder.trangThaiDonHang, val)}
                    disabled={selectedOrder.trangThaiDonHang === 'da_giao' || selectedOrder.trangThaiDonHang === 'da_huy'}
                    loading={isUpdatingStatus}
                    style={{ width: 175 }}
                  >
                    {Object.keys(statusLabels).map(key => {
                      const allowed = allowedNextStates[selectedOrder.trangThaiDonHang] || [selectedOrder.trangThaiDonHang];
                      return (
                        <Option key={key} value={key} disabled={!allowed.includes(key)}>
                          {statusLabels[key]}
                        </Option>
                      );
                    })}
                  </Select>
                </Space>

                <Space direction="vertical" size={2}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Trạng thái thanh toán:</Text>
                  <Select 
                    value={selectedOrder.trangThaiThanhToan === 'da_thanh_toan'} 
                    onChange={(val) => handlePaymentChange(selectedOrder.maDonHang, val)}
                    disabled={selectedOrder.trangThaiDonHang === 'da_huy'}
                    loading={isUpdatingPayment}
                    style={{ width: 175 }}
                  >
                    <Option value={false}>⏳ Chưa thanh toán</Option>
                    <Option value={true}>✅ Đã thanh toán</Option>
                  </Select>
                </Space>
              </div>

              {/* Status Action Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                {selectedOrder.trangThaiDonHang === 'cho_xac_nhan' && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    style={{ background: '#16a34a', borderColor: '#16a34a' }}
                    onClick={() => handleStatusChange(selectedOrder.maDonHang, 'cho_xac_nhan', 'da_xac_nhan')}
                    loading={isUpdatingStatus}
                  >
                    ✓ Xác nhận duyệt đơn
                  </Button>
                )}
                {selectedOrder.trangThaiDonHang === 'da_xac_nhan' && (
                  <Button
                    type="primary"
                    icon={<CarOutlined />}
                    style={{ background: '#2563eb', borderColor: '#2563eb' }}
                    onClick={() => handleStatusChange(selectedOrder.maDonHang, 'da_xac_nhan', 'dang_giao')}
                    loading={isUpdatingStatus}
                  >
                    🚚 Bàn giao vận chuyển
                  </Button>
                )}
                {selectedOrder.trangThaiDonHang === 'dang_giao' && (
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    style={{ background: '#059669', borderColor: '#059669' }}
                    onClick={() => handleStatusChange(selectedOrder.maDonHang, 'dang_giao', 'da_giao')}
                    loading={isUpdatingStatus}
                  >
                    🏁 Hoàn tất giao hàng
                  </Button>
                )}
                {selectedOrder.trangThaiDonHang === 'da_giao' && !selectedOrder.hoaDon && (
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    style={{ background: '#0284c7', borderColor: '#0284c7' }}
                    onClick={() => handleCreateInvoice(selectedOrder.maDonHang)}
                    loading={isGeneratingInvoice}
                  >
                    🧾 Xuất hóa đơn bán lẻ
                  </Button>
                )}
                {['cho_xac_nhan', 'da_xac_nhan'].includes(selectedOrder.trangThaiDonHang) && (
                  <Popconfirm
                    title="Hủy đơn hàng này?"
                    description="Bạn có chắc chắn muốn hủy đơn hàng này không? Tồn kho sẽ được tự động hoàn lại."
                    onConfirm={() => handleCancelOrder(selectedOrder.maDonHang)}
                    okText="Hủy đơn"
                    cancelText="Quay lại"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<CloseCircleOutlined />} loading={isCancelling}>
                      ✕ Hủy đơn
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </div>

            {/* Customer & Shipping Section */}
            <Descriptions 
              title={<span style={{ color: '#431407', fontWeight: 700, fontSize: 14 }}>👤 Thông tin giao nhận</span>} 
              bordered 
              size="small" 
              column={2} 
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Người nhận">
                <Text strong>{selectedOrder.tenNguoiNhan}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <a href={`tel:${selectedOrder.sdtNguoiNhan}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                  📞 {selectedOrder.sdtNguoiNhan}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao" span={2}>
                <Text>{selectedOrder.diaChiGiaoHang || 'Tại quầy / Cửa hàng'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức TT">
                <Tag color="purple">{selectedOrder.phuongThucThanhToan?.toUpperCase() || 'COD'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái TT">
                <Tag color={selectedOrder.trangThaiThanhToan === 'da_thanh_toan' ? 'green' : 'orange'}>
                  {paymentLabels[selectedOrder.trangThaiThanhToan] || selectedOrder.trangThaiThanhToan}
                </Tag>
              </Descriptions.Item>
              {selectedOrder.ghiChu && (
                <Descriptions.Item label="Ghi chú shipper" span={2}>
                  <Text style={{ fontStyle: 'italic', color: '#b45309' }}>{selectedOrder.ghiChu}</Text>
                </Descriptions.Item>
              )}
              {selectedOrder.hoaDon && (
                <Descriptions.Item label="Hóa đơn phát hành" span={2}>
                  <Tag color="cyan">🧾 Số HĐ: {selectedOrder.hoaDon.soHoaDon}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    (Xuất lúc {dayjs(selectedOrder.hoaDon.ngayXuatHoaDon).format('DD/MM/YYYY HH:mm')})
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Ordered Food Items Table */}
            <div style={{ marginBottom: 20 }}>
              <Title level={5} style={{ marginBottom: 10, color: '#431407' }}>
                🍱 Danh sách món ăn ({(selectedOrder.chiTiets || selectedOrder.chiTietDonHangs || []).length})
              </Title>
              <Table
                columns={orderItemColumns}
                dataSource={selectedOrder.chiTiets || selectedOrder.chiTietDonHangs || []}
                rowKey={(item, idx) => item.maChiTietDonHang || idx}
                pagination={false}
                size="small"
                bordered
              />
            </div>

            {/* Pricing Summary Breakdown */}
            <div style={{ background: '#fff7ed', padding: 16, borderRadius: 10, border: '1px solid #fed7aa', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text>Tiền món ăn:</Text>
                <Text strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.tienHang || 0)}</Text>
              </div>
              {Number(selectedOrder.tienGiamGia) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text>Giảm giá voucher:</Text>
                  <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>
                    -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.tienGiamGia)}
                  </Text>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text>Phí vận chuyển:</Text>
                <Text>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.phiVanChuyen || 0)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #fed7aa', paddingTop: 8, marginTop: 4 }}>
                <Text strong style={{ fontSize: 15 }}>Tổng thanh toán:</Text>
                <Text strong style={{ fontSize: 18, color: '#ea580c' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.tongTienThanhToan || 0)}
                </Text>
              </div>
            </div>

            {/* Order Timeline History */}
            {selectedOrder.lichSus && selectedOrder.lichSus.length > 0 && (
              <div>
                <Title level={5} style={{ marginBottom: 12, color: '#431407' }}>⏱️ Lịch sử xử lý đơn hàng</Title>
                <Timeline
                  items={selectedOrder.lichSus.map((hist) => ({
                    color: hist.trangThaiMoi === 'da_giao' ? 'green' : hist.trangThaiMoi === 'da_huy' ? 'red' : 'blue',
                    children: (
                      <div>
                        <Text strong>{statusLabels[hist.trangThaiMoi] || hist.trangThaiMoi}</Text>
                        {hist.ghiChu ? <span style={{ color: '#64748b', marginLeft: 8 }}>({hist.ghiChu})</span> : null}
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                          {hist.thoiGianThayDoi ? dayjs(hist.thoiGianThayDoi).format('DD/MM/YYYY HH:mm:ss') : ''}
                        </div>
                      </div>
                    )
                  }))}
                />
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
