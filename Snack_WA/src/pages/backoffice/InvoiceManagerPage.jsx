import React, { useState } from 'react';
import { Typography, Card, Input, Button, Space, Descriptions, Table, Modal, Tag, Empty } from 'antd';
import { SearchOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import { useInvoices } from '../../features/orders/hooks';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function InvoiceManagerPage() {
  const [params, setParams] = useState({ page: 1, pageSize: 20, search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useInvoices(params);

  const handleSearch = () => {
    setParams((p) => ({ ...p, search: searchInput.trim(), page: 1 }));
  };

  const handleReset = () => {
    setSearchInput('');
    setParams({ page: 1, pageSize: 20, search: '' });
  };

  const showDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Số Hóa Đơn',
      dataIndex: 'soHoaDon',
      key: 'soHoaDon',
      render: (val) => <Tag color="blue" style={{ fontWeight: 700, fontSize: 13 }}>{val}</Tag>,
    },
    {
      title: 'Mã Đơn Hàng',
      dataIndex: 'maCodeDonHang',
      key: 'maCodeDonHang',
      render: (val, record) => <Text strong>{val || record.maDonHang?.slice(0, 8)}</Text>,
    },
    {
      title: 'Khách Hàng',
      key: 'khachHang',
      render: (_, record) => (
        <div>
          <div>{record.tenKhachHang || 'Khách vãng lai'}</div>
          {record.sdtKhachHang && <Text type="secondary" style={{ fontSize: 12 }}>{record.sdtKhachHang}</Text>}
        </div>
      ),
    },
    {
      title: 'Ngày Xuất',
      dataIndex: 'ngayXuatHoaDon',
      key: 'ngayXuatHoaDon',
      render: (val) => (val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'tongTienThanhToan',
      key: 'tongTienThanhToan',
      render: (val, record) => {
        const total = val || record.tongTien || 0;
        return (
          <Text strong style={{ color: '#ea580c' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
          </Text>
        );
      },
    },
    {
      title: 'Người Xuất',
      dataIndex: 'tenNhanVien',
      key: 'tenNhanVien',
      render: (val) => val || <Text type="secondary">Hệ thống tự động</Text>,
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
          style={{ background: '#ea580c', borderColor: '#ea580c' }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const itemColumns = [
    { title: 'Tên món', dataIndex: 'tenSanPham', key: 'tenSanPham' },
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
      render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#431407' }}>🧾 Quản Lý & Tra Cứu Hóa Đơn</Title>
        <Text type="secondary">Danh sách hóa đơn bán hàng đã được phát hành tự động hoặc thủ công</Text>
      </div>

      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 12 }}>
        <Space wrap>
          <Input
            placeholder="Tìm theo số HĐ, mã đơn hàng, tên khách, SĐT..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 340 }}
            allowClear
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} style={{ background: '#ea580c', borderColor: '#ea580c' }}>
            Tìm kiếm
          </Button>
          {params.search && (
            <Button onClick={handleReset}>
              Xem tất cả
            </Button>
          )}
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey="maHoaDon"
        loading={isLoading}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total: data?.totalCount || 0,
          showTotal: (total) => `Tổng cộng ${total} hóa đơn`,
          onChange: (page, pageSize) => setParams((p) => ({ ...p, page, pageSize })),
        }}
        bordered
        style={{ background: '#fff', borderRadius: 12 }}
      />

      {/* Invoice Detail Modal */}
      <Modal
        title={`Chi tiết Hóa đơn: ${selectedInvoice?.soHoaDon || ''}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={720}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
            In hóa đơn
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsModalOpen(false)} style={{ background: '#ea580c', borderColor: '#ea580c' }}>
            Đóng
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Số hóa đơn">
                <Tag color="blue">{selectedInvoice.soHoaDon}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xuất">
                {selectedInvoice.ngayXuatHoaDon ? dayjs(selectedInvoice.ngayXuatHoaDon).format('DD/MM/YYYY HH:mm') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng">
                <strong>{selectedInvoice.maCodeDonHang || selectedInvoice.maDonHang}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">
                {selectedInvoice.tenNhanVien || 'Hệ thống tự động'}
              </Descriptions.Item>
              <Descriptions.Item label="Khách nhận hàng">
                {selectedInvoice.tenKhachHang || 'Khách vãng lai'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedInvoice.sdtKhachHang || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao" span={2}>
                {selectedInvoice.diaChiGiaoHang || '—'}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>📦 Chi tiết món ăn</Title>
            <Table
              columns={itemColumns}
              dataSource={selectedInvoice.chiTiets || []}
              rowKey="maChiTietDonHang"
              pagination={false}
              size="small"
              bordered
              style={{ marginBottom: 16 }}
            />

            <div style={{ background: '#fff7ed', padding: 14, borderRadius: 8, border: '1px solid #fed7aa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Tiền giảm giá voucher:</Text>
                <Text style={{ color: '#16a34a' }}>
                  -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice.tienGiamGia || 0)}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>Phí vận chuyển:</Text>
                <Text>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice.phiVanChuyen || 0)}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #fed7aa', paddingTop: 6 }}>
                <Text strong style={{ fontSize: 15 }}>Tổng tiền thanh toán:</Text>
                <Text strong style={{ fontSize: 16, color: '#ea580c' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice.tongTienThanhToan || selectedInvoice.tongTien || 0)}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
