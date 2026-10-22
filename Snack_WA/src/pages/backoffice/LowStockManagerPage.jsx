import React, { useState, useMemo } from 'react';
import { 
  Typography, 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Alert, 
  Empty,
  Input
} from 'antd';
import { 
  AlertOutlined, 
  WarningOutlined, 
  PlusOutlined, 
  ReloadOutlined, 
  CheckCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLowStock } from '../../features/inventory/hooks';

const { Title, Text } = Typography;

export default function LowStockManagerPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState({ page: 1, pageSize: 20 });
  const [keyword, setKeyword] = useState('');

  const { data: lowStockData, isLoading, refetch } = useLowStock(params);

  const rawList = useMemo(() => {
    return lowStockData?.items || lowStockData || [];
  }, [lowStockData]);

  // Filter client-side keyword if searching
  const filteredList = useMemo(() => {
    if (!keyword.trim()) return rawList;
    const lower = keyword.toLowerCase().trim();
    return rawList.filter((item) => 
      (item.tenSanPham && item.tenSanPham.toLowerCase().includes(lower)) ||
      (item.donViTinh && item.donViTinh.toLowerCase().includes(lower))
    );
  }, [rawList, keyword]);

  const outOfStockCount = useMemo(() => {
    return rawList.filter((item) => item.soLuongTon === 0).length;
  }, [rawList]);

  const criticalStockCount = useMemo(() => {
    return rawList.filter((item) => item.soLuongTon > 0 && item.soLuongTon <= 5).length;
  }, [rawList]);

  const totalCount = lowStockData?.totalCount || rawList.length;

  const handleQuickImport = (productId) => {
    navigate('/van-hanh/nhap-hang', { 
      state: { prefillProductId: productId } 
    });
  };

  const columns = [
    {
      title: 'Tên món ăn vặt',
      dataIndex: 'tenSanPham',
      key: 'tenSanPham',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: '14px', display: 'block' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Mã: {record.maSanPham ? record.maSanPham.slice(0, 8).toUpperCase() : 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'donViTinh',
      key: 'donViTinh',
      width: 120,
      render: (val) => <Tag>{val || 'gói'}</Tag>,
    },
    {
      title: 'Tồn kho hiện tại',
      dataIndex: 'soLuongTon',
      key: 'soLuongTon',
      width: 160,
      render: (val) => {
        if (val === 0) {
          return (
            <Tag color="error" style={{ fontWeight: 700, padding: '3px 10px', fontSize: '13px' }}>
              HẾT HÀNG (0)
            </Tag>
          );
        }
        if (val <= 5) {
          return (
            <Tag color="volcano" style={{ fontWeight: 700, padding: '3px 10px', fontSize: '13px' }}>
              BÁO ĐỘNG ({val})
            </Tag>
          );
        }
        return (
          <Tag color="warning" style={{ fontWeight: 600, padding: '3px 10px', fontSize: '13px' }}>
            SẮP HẾT ({val})
          </Tag>
        );
      },
    },
    {
      title: 'Tỷ lệ an toàn (ngưỡng 20)',
      key: 'safetyRatio',
      width: 200,
      render: (_, record) => {
        const percent = Math.min(100, Math.round(((record.soLuongTon || 0) / 20) * 100));
        const color = record.soLuongTon === 0 ? '#ef4444' : record.soLuongTon <= 5 ? '#f97316' : '#eab308';
        return (
          <div style={{ width: 140 }}>
            <Progress 
              percent={percent} 
              size="small" 
              strokeColor={color} 
              format={() => `${record.soLuongTon}/20`}
            />
          </div>
        );
      },
    },
    {
      title: 'Mức độ ưu tiên',
      key: 'priority',
      width: 140,
      render: (_, record) => {
        if (record.soLuongTon === 0) {
          return <Tag color="red">🔴 Khẩn cấp</Tag>;
        }
        if (record.soLuongTon <= 5) {
          return <Tag color="orange">🟠 Ưu tiên cao</Tag>;
        }
        return <Tag color="gold">🟡 Cần bổ sung</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="small"
          onClick={() => handleQuickImport(record.maSanPham)}
          style={{ 
            borderRadius: 6, 
            fontWeight: 600,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            border: 'none',
          }}
        >
          Nhập hàng
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#9a3412', fontWeight: 800 }}>
            Cảnh báo Tồn kho & Sắp hết hàng
          </Title>
          <Text type="secondary">
            Danh sách các món ăn vặt có tồn kho dưới ngưỡng an toàn (≤ 20 món) hoặc đã cạn hàng (0 món)
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Làm mới
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/van-hanh/nhap-hang')}
            size="large"
            style={{ 
              borderRadius: 10, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
            }}
          >
            Đến trang Nhập hàng
          </Button>
        </Space>
      </div>

      {/* Banner Cảnh Báo */}
      {outOfStockCount > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<AlertOutlined />}
          message={`Có ${outOfStockCount} sản phẩm đã cạn hàng hoàn toàn (tồn kho = 0)!`}
          description="Khách hàng không thể thêm các món ăn này vào giỏ hàng hoặc đặt đơn trên Web-App. Hãy tạo đơn nhập hàng ngay để tiếp tục phục vụ."
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
      )}

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Tổng sản phẩm cần nhập thêm"
              value={totalCount}
              prefix={<WarningOutlined style={{ color: '#ea580c' }} />}
              suffix="sản phẩm"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Sản phẩm đã cạn kiệt (Tồn kho = 0)"
              value={outOfStockCount}
              valueStyle={{ color: '#ef4444', fontWeight: 800 }}
              prefix={<AlertOutlined style={{ color: '#ef4444' }} />}
              suffix="sản phẩm"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Mức báo động nguy cấp (1 - 5 món)"
              value={criticalStockCount}
              valueStyle={{ color: '#f97316', fontWeight: 700 }}
              prefix={<WarningOutlined style={{ color: '#f97316' }} />}
              suffix="sản phẩm"
            />
          </Card>
        </Col>
      </Row>

      {/* Search Bar & Table */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(124, 45, 18, 0.04)' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Input
            placeholder="Tìm theo tên sản phẩm hoặc đơn vị tính..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            style={{ width: 340, borderRadius: 8 }}
          />
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Hiển thị {filteredList.length} / {totalCount} món sắp hết hàng
          </Text>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredList} 
          rowKey={(record) => record.maSanPham || record.id}
          loading={isLoading}
          locale={{ 
            emptyText: (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" align="center">
                    <CheckCircleOutlined style={{ fontSize: '28px', color: '#10b981' }} />
                    <Text strong style={{ color: '#059669' }}>
                      Tất cả sản phẩm hiện đều ở mức tồn kho dồi dào an toàn!
                    </Text>
                  </Space>
                } 
              />
            ) 
          }}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total: totalCount,
            onChange: (page, pageSize) => setParams({ page, pageSize }),
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50']
          }}
        />
      </Card>
    </div>
  );
}
