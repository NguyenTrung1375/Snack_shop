import React, { useState } from 'react';
import { Table, Button, Space, Select, Tag, message, Typography, Modal, Descriptions, Image, Spin } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useOrders, useUpdateOrderStatus, useUpdateOrderPayment } from '../../features/orders/hooks';
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

  // State for Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleStatusChange = (id, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    updateStatus({ id, status: newStatus }, {
      onSuccess: () => {
        message.success(newStatus === 'da_giao' ? 'Đã giao hàng và tự động xuất hóa đơn!' : 'Cập nhật trạng thái thành công');
      },
      onError: (err) => message.error(err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
    });
  };

  const handlePaymentChange = (id, isPaid) => {
    const status = isPaid ? 'da_thanh_toan' : 'chua_thanh_toan';
    updatePayment({ id, payload: { trangThaiThanhToan: status } }, {
      onSuccess: () => message.success('Cập nhật thanh toán thành công'),
      onError: () => message.error('Lỗi khi cập nhật thanh toán')
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

  const columns = [
    { title: 'Mã ĐH', dataIndex: 'maCode', key: 'maCode', render: (val) => <Text strong>{val}</Text> },
    { title: 'Khách hàng', dataIndex: 'tenNguoiNhan', key: 'tenNguoiNhan' },
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
      render: val => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
    },
    {
      title: 'Thanh toán',
      dataIndex: 'trangThaiThanhToan',
      key: 'trangThaiThanhToan',
      render: (status, record) => (
        <Select 
          value={status === 'da_thanh_toan'} 
          onChange={(val) => handlePaymentChange(record.maDonHang, val)}
          disabled={record.trangThaiDonHang === 'da_huy'}
          loading={isUpdatingPayment}
        >
          <Option value={false}>Chưa TT</Option>
          <Option value={true}>Đã TT</Option>
        </Select>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThaiDonHang',
      key: 'trangThaiDonHang',
      render: (status, record) => {
        const allowed = allowedNextStates[status] || [status];
        return (
          <Select 
            value={status} 
            onChange={(val) => handleStatusChange(record.maDonHang, status, val)}
            disabled={status === 'da_giao' || status === 'da_huy'}
            loading={isUpdatingStatus}
            style={{ width: 145 }}
          >
            {Object.keys(statusLabels).map(key => (
               <Option key={key} value={key} disabled={!allowed.includes(key)}>
                 {statusLabels[key]}
               </Option>
            ))}
          </Select>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{ background: '#ea580c', borderColor: '#ea580c' }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
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
            <Image src={item.hinhAnhDaiDien} width={40} height={40} style={{ borderRadius: 6, objectFit: 'cover' }} />
          )}
          <span>{val}</span>
        </Space>
      )
    },
    {
      title: 'Đơn giá',
      dataIndex: 'giaBan',
      key: 'giaBan',
      render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
    },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'soLuong' },
    {
      title: 'Thành tiền',
      dataIndex: 'thanhTien',
      key: 'thanhTien',
      render: (val, item) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || (item.giaBan * item.soLuong)),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Title level={4} style={{ margin: 0, color: '#431407' }}>📦 Quản lý Đơn hàng</Title>
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

      {/* Order Detail Modal */}
      <Modal
        title={`Chi tiết Đơn hàng: ${selectedOrder?.maCode || ''}`}
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={760}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailOpen(false)} style={{ background: '#ea580c', borderColor: '#ea580c' }}>
            Đóng
          </Button>
        ]}
      >
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : selectedOrder && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Mã đơn hàng">
                <strong>{selectedOrder.maCode}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {selectedOrder.ngayTao ? dayjs(selectedOrder.ngayTao).format('DD/MM/YYYY HH:mm') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn">
                <Tag color={statusColors[selectedOrder.trangThaiDonHang]}>
                  {statusLabels[selectedOrder.trangThaiDonHang] || selectedOrder.trangThaiDonHang}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                <Tag color={selectedOrder.trangThaiThanhToan === 'da_thanh_toan' ? 'green' : 'orange'}>
                  {paymentLabels[selectedOrder.trangThaiThanhToan] || selectedOrder.trangThaiThanhToan}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">
                {selectedOrder.tenNguoiNhan}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.sdtNguoiNhan}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao" span={2}>
                {selectedOrder.diaChiGiaoHang}
              </Descriptions.Item>
              {selectedOrder.ghiChu && (
                <Descriptions.Item label="Ghi chú shipper" span={2}>
                  {selectedOrder.ghiChu}
                </Descriptions.Item>
              )}
              {selectedOrder.hoaDon && (
                <Descriptions.Item label="Hóa đơn phát hành" span={2}>
                  <Tag color="cyan">Số HĐ: {selectedOrder.hoaDon.soHoaDon}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    (Xuất lúc {dayjs(selectedOrder.hoaDon.ngayXuatHoaDon).format('DD/MM/YYYY HH:mm')})
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Title level={5} style={{ marginBottom: 8 }}>📦 Danh sách món ăn ({selectedOrder.chiTiets?.length || 0})</Title>
            <Table
              columns={orderItemColumns}
              dataSource={selectedOrder.chiTiets || []}
              rowKey={(item, idx) => item.maChiTietDonHang || idx}
              pagination={false}
              size="small"
              bordered
              style={{ marginBottom: 16 }}
            />

            <div style={{ background: '#fff7ed', padding: 14, borderRadius: 8, border: '1px solid #fed7aa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Tiền món ăn:</Text>
                <Text>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.tienHang || 0)}</Text>
              </div>
              {selectedOrder.tienGiamGia > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>Giảm giá voucher:</Text>
                  <Text style={{ color: '#16a34a' }}>
                    -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.tienGiamGia)}
                  </Text>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Phí vận chuyển:</Text>
                <Text>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.phiVanChuyen || 0)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #fed7aa', paddingTop: 6 }}>
                <Text strong style={{ fontSize: 15 }}>Tổng thanh toán:</Text>
                <Text strong style={{ fontSize: 16, color: '#ea580c' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.tongTienThanhToan || 0)}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
