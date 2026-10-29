import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  Input, 
  Button, 
  Space, 
  Descriptions, 
  Table, 
  Drawer, 
  Tag, 
  Image, 
  Spin 
} from 'antd';
import { SearchOutlined, PrinterOutlined } from '@ant-design/icons';
import { useInvoices } from '../../features/orders/hooks';
import { getInvoice } from '../../features/orders/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function InvoiceManagerPage() {
  const [params, setParams] = useState({ page: 1, pageSize: 20, search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const { data, isLoading } = useInvoices(params);

  const handleSearch = () => {
    setParams((p) => ({ ...p, search: searchInput.trim(), page: 1 }));
  };

  const handleReset = () => {
    setSearchInput('');
    setParams({ page: 1, pageSize: 20, search: '' });
  };

  const showDetail = async (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
    try {
      setLoadingDetail(true);
      const invoiceId = invoice.soHoaDon || invoice.maHoaDon;
      if (invoiceId) {
        const detail = await getInvoice(invoiceId);
        if (detail) {
          setSelectedInvoice(detail);
        }
      }
    } catch {
      // Use invoice as fallback
    } finally {
      setLoadingDetail(false);
    }
  };

  // Columns definition: ALL CELLS are clickable and point to the right-side detail drawer
  const columns = [
    {
      title: 'Số Hóa Đơn',
      dataIndex: 'soHoaDon',
      key: 'soHoaDon',
      render: (val) => (
        <Tag color="blue" style={{ fontWeight: 700, fontSize: 13, borderRadius: 6, padding: '2px 8px' }}>
          🧾 {val}
        </Tag>
      ),
    },
    {
      title: 'Mã Đơn Hàng',
      dataIndex: 'maCodeDonHang',
      key: 'maCodeDonHang',
      render: (val, record) => (
        <Text strong style={{ color: '#ea580c' }}>
          #{val || record.maDonHang?.slice(0, 8)}
        </Text>
      ),
    },
    {
      title: 'Khách Hàng',
      key: 'khachHang',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>{record.tenKhachHang || 'Khách vãng lai'}</div>
          {record.sdtKhachHang && <Text type="secondary" style={{ fontSize: 11 }}>{record.sdtKhachHang}</Text>}
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
          <Text strong style={{ color: '#c2410c' }}>
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
  ];

  const itemColumns = [
    { 
      title: 'Tên món', 
      dataIndex: 'tenSanPham', 
      key: 'tenSanPham',
      render: (val, item) => (
        <Space>
          {item.hinhAnhDaiDien && (
            <Image src={item.hinhAnhDaiDien} width={40} height={40} style={{ borderRadius: 6, objectFit: 'cover' }} />
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
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'soLuong', width: 80, align: 'center' },
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
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#431407' }}>🧾 Quản Lý & Tra Cứu Hóa Đơn</Title>
        <Text type="secondary">
          👆 Nhấn vào bất kỳ ô nào trong hàng để mở ngăn chi tiết hóa đơn bên tay phải màn hình
        </Text>
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
        onRow={(record) => ({
          onClick: () => {
            showDetail(record);
          },
          style: { cursor: 'pointer' },
        })}
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

      {/* Right-side Slide-over Pop-up Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 }}>
            <Space size="middle">
              <span style={{ fontSize: 22 }}>🧾</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#431407' }}>
                  Chi tiết Hóa đơn #{selectedInvoice?.soHoaDon || ''}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Xuất lúc: {selectedInvoice?.ngayXuatHoaDon ? dayjs(selectedInvoice.ngayXuatHoaDon).format('DD/MM/YYYY HH:mm:ss') : '—'}
                </Text>
              </div>
            </Space>
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6, fontWeight: 700 }}>
              ĐÃ XUẤT
            </Tag>
          </div>
        }
        placement="right"
        width={700}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              In hóa đơn
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 14, color: '#64748b' }}>Đang tải chi tiết hóa đơn từ máy chủ...</div>
          </div>
        ) : selectedInvoice && (
          <div>
            <Descriptions 
              title={<span style={{ color: '#431407', fontWeight: 700, fontSize: 14 }}>📄 Chứng từ bán lẻ</span>} 
              bordered 
              size="small" 
              column={2} 
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Số hóa đơn">
                <Tag color="blue" style={{ fontWeight: 700 }}>{selectedInvoice.soHoaDon}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xuất">
                {selectedInvoice.ngayXuatHoaDon ? dayjs(selectedInvoice.ngayXuatHoaDon).format('DD/MM/YYYY HH:mm') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng">
                <strong style={{ color: '#ea580c' }}>#{selectedInvoice.maCodeDonHang || selectedInvoice.maDonHang?.slice(0, 8)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Người thực hiện">
                {selectedInvoice.tenNhanVien || 'Hệ thống tự động'}
              </Descriptions.Item>
              <Descriptions.Item label="Khách nhận hàng">
                <Text strong>{selectedInvoice.tenKhachHang || 'Khách vãng lai'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedInvoice.sdtKhachHang ? (
                  <a href={`tel:${selectedInvoice.sdtKhachHang}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                    📞 {selectedInvoice.sdtKhachHang}
                  </a>
                ) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao" span={2}>
                {selectedInvoice.diaChiGiaoHang || 'Tại quầy / Cửa hàng'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 20 }}>
              <Title level={5} style={{ marginBottom: 10, color: '#431407' }}>
                📦 Chi tiết món ăn ({(selectedInvoice.chiTiets || []).length})
              </Title>
              <Table
                columns={itemColumns}
                dataSource={selectedInvoice.chiTiets || []}
                rowKey={(item, idx) => item.maChiTietDonHang || idx}
                pagination={false}
                size="small"
                bordered
              />
            </div>

            <div style={{ background: '#fff7ed', padding: 16, borderRadius: 10, border: '1px solid #fed7aa', marginBottom: 20 }}>
              {Number(selectedInvoice.tienGiamGia) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text>Tiền giảm giá voucher:</Text>
                  <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>
                    -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice.tienGiamGia)}
                  </Text>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text>Phí vận chuyển:</Text>
                <Text>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice.phiVanChuyen || 0)}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #fed7aa', paddingTop: 8, marginTop: 4 }}>
                <Text strong style={{ fontSize: 15 }}>Tổng tiền thanh toán:</Text>
                <Text strong style={{ fontSize: 18, color: '#ea580c' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedInvoice.tongTienThanhToan || selectedInvoice.tongTien || 0)}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
