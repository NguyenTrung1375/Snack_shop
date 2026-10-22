import React, { useState, useMemo } from 'react';
import { 
  Typography, 
  Card, 
  Table, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  Space, 
  Button, 
  Tag, 
  Progress, 
  Alert, 
  Empty, 
  Tooltip 
} from 'antd';
import { 
  BarChartOutlined, 
  DollarCircleOutlined, 
  ShoppingOutlined, 
  FireOutlined, 
  ReloadOutlined, 
  TrophyOutlined, 
  InfoCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRevenueReport, useTopProductsReport } from '../../features/reports/hooks';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ReportManagerPage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(undefined);
  const [topParams, setTopParams] = useState({ page: 1, pageSize: 10 });

  const { 
    data: revenueData, 
    isLoading: isLoadingRev, 
    refetch: refetchRev 
  } = useRevenueReport(selectedYear ? { nam: selectedYear } : undefined);

  const { 
    data: topProductsData, 
    isLoading: isLoadingTop, 
    refetch: refetchTop 
  } = useTopProductsReport(topParams);

  // Safe data extraction (Guarantees array to prevent table crash)
  const revenueList = useMemo(() => {
    if (Array.isArray(revenueData)) return revenueData;
    if (revenueData && Array.isArray(revenueData.items)) return revenueData.items;
    return [];
  }, [revenueData]);

  const topProductsList = useMemo(() => {
    if (Array.isArray(topProductsData)) return topProductsData;
    if (topProductsData && Array.isArray(topProductsData.items)) return topProductsData.items;
    return [];
  }, [topProductsData]);

  const topProductsTotal = useMemo(() => {
    if (topProductsData && typeof topProductsData.totalCount === 'number') {
      return topProductsData.totalCount;
    }
    return topProductsList.length;
  }, [topProductsData, topProductsList]);

  // Overall KPI metrics
  const totalRevenue = useMemo(() => {
    return revenueList.reduce((acc, cur) => acc + (Number(cur.doanhThu) || 0), 0);
  }, [revenueList]);

  const totalDeliveredOrders = useMemo(() => {
    return revenueList.reduce((acc, cur) => acc + (Number(cur.soDon) || 0), 0);
  }, [revenueList]);

  const maxMonthRevenue = useMemo(() => {
    if (revenueList.length === 0) return 1;
    return Math.max(...revenueList.map(r => Number(r.doanhThu) || 0), 1);
  }, [revenueList]);

  const maxTopSold = useMemo(() => {
    if (topProductsList.length === 0) return 1;
    return Math.max(...topProductsList.map(p => Number(p.tongSoLuongBan) || 0), 1);
  }, [topProductsList]);

  const bestSellingProduct = topProductsList[0] || null;

  const handleRefresh = () => {
    refetchRev();
    refetchTop();
  };

  // Columns for Monthly Revenue Table
  const revColumns = [
    { 
      title: 'Kỳ báo cáo (Tháng)', 
      dataIndex: 'thang', 
      key: 'thang',
      width: 160,
      render: (val) => {
        if (!val) return 'N/A';
        const parts = val.split('-');
        const formatted = parts.length === 2 ? `Tháng ${parts[1]}/${parts[0]}` : val;
        return (
          <Tag color="blue" icon={<CalendarOutlined />} style={{ fontWeight: 600, padding: '3px 8px' }}>
            {formatted}
          </Tag>
        );
      }
    },
    { 
      title: 'Đơn hoàn thành', 
      dataIndex: 'soDon', 
      key: 'soDon',
      width: 140,
      align: 'center',
      render: (val) => (
        <Tag color="green" style={{ fontWeight: 600 }}>
          {val || 0} đơn
        </Tag>
      )
    },
    { 
      title: 'Doanh thu thực tế', 
      dataIndex: 'doanhThu', 
      key: 'doanhThu',
      render: (val) => (
        <Text strong style={{ color: '#ef4444', fontSize: '14px' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)}
        </Text>
      )
    },
    {
      title: 'Tỷ trọng',
      key: 'ratio',
      width: 150,
      render: (_, record) => {
        const percent = Math.min(100, Math.round(((Number(record.doanhThu) || 0) / maxMonthRevenue) * 100));
        return (
          <div style={{ width: 120 }}>
            <Progress percent={percent} size="small" strokeColor="#f97316" showInfo={false} />
          </div>
        );
      }
    },
    {
      title: 'Giá trị TB/Đơn',
      key: 'aov',
      align: 'right',
      render: (_, record) => {
        const rev = Number(record.doanhThu) || 0;
        const count = Number(record.soDon) || 0;
        const aov = count > 0 ? rev / count : 0;
        return (
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(aov)}
          </Text>
        );
      }
    }
  ];

  // Columns for Top Selling Products Table
  const topColumns = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (_, __, index) => {
        const actualRank = (topParams.page - 1) * topParams.pageSize + index + 1;
        if (actualRank === 1) {
          return <Tag color="gold" style={{ fontWeight: 800 }}>🥇 Top 1</Tag>;
        }
        if (actualRank === 2) {
          return <Tag color="default" style={{ fontWeight: 800 }}>🥈 Top 2</Tag>;
        }
        if (actualRank === 3) {
          return <Tag color="volcano" style={{ fontWeight: 800 }}>🥉 Top 3</Tag>;
        }
        return <Text strong style={{ color: '#64748b' }}>#{actualRank}</Text>;
      }
    },
    { 
      title: 'Tên món ăn vặt', 
      dataIndex: 'tenSanPham', 
      key: 'tenSanPham',
      render: (text) => <Text strong style={{ color: '#1e293b' }}>{text}</Text>
    },
    { 
      title: 'Đã bán', 
      dataIndex: 'tongSoLuongBan', 
      key: 'tongSoLuongBan',
      width: 130,
      align: 'center',
      render: (val) => (
        <Tag color="volcano" icon={<FireOutlined />} style={{ fontWeight: 700, padding: '2px 8px' }}>
          {val || 0} món
        </Tag>
      )
    },
    {
      title: 'Độ hot',
      key: 'hotRate',
      width: 140,
      render: (_, record) => {
        const percent = Math.min(100, Math.round(((Number(record.tongSoLuongBan) || 0) / maxTopSold) * 100));
        return (
          <div style={{ width: 110 }}>
            <Progress percent={percent} size="small" strokeColor="#ea580c" showInfo={false} />
          </div>
        );
      }
    },
    { 
      title: 'Tổng doanh số', 
      dataIndex: 'tongDoanhThu', 
      key: 'tongDoanhThu',
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#ea580c', fontSize: '14px' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)}
        </Text>
      )
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#9a3412', fontWeight: 800 }}>
            Báo cáo & Thống kê Kinh doanh
          </Title>
          <Text type="secondary">
            Phân tích số liệu doanh thu bán hàng thực tế và xếp hạng các món ăn vặt được yêu thích nhất
          </Text>
        </div>
        <Space>
          <Select
            placeholder="Lọc theo năm"
            style={{ width: 160 }}
            allowClear
            value={selectedYear}
            onChange={(val) => setSelectedYear(val)}
          >
            <Option value={currentYear}>Năm {currentYear}</Option>
            <Option value={currentYear - 1}>Năm {currentYear - 1}</Option>
            <Option value={currentYear - 2}>Năm {currentYear - 2}</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh} 
            loading={isLoadingRev || isLoadingTop}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Tổng doanh thu thực tế"
              value={totalRevenue}
              prefix={<DollarCircleOutlined style={{ color: '#10b981' }} />}
              formatter={(val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
              valueStyle={{ color: '#059669', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Tổng đơn đã giao thành công"
              value={totalDeliveredOrders}
              prefix={<ShoppingOutlined style={{ color: '#2563eb' }} />}
              suffix="đơn hàng"
              valueStyle={{ color: '#1d4ed8', fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Món ăn vặt bán chạy nhất"
              value={bestSellingProduct ? bestSellingProduct.tenSanPham : 'Chưa có dữ liệu'}
              prefix={<TrophyOutlined style={{ color: '#ea580c' }} />}
              valueStyle={{ fontSize: '16px', fontWeight: 700, color: '#9a3412' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Số lượng Top 1 đã bán"
              value={bestSellingProduct ? Number(bestSellingProduct.tongSoLuongBan) : 0}
              prefix={<FireOutlined style={{ color: '#ef4444' }} />}
              suffix="phần"
              valueStyle={{ color: '#dc2626', fontWeight: 800 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Helpful note about revenue calculation */}
      {totalDeliveredOrders === 0 && !isLoadingRev && (
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message="Lưu ý về quy tắc ghi nhận Doanh thu"
          description={
            <div>
              Hệ thống chỉ ghi nhận doanh thu từ các đơn hàng đã ở trạng thái <b>"Đã giao"</b> (hoàn thành nhận tiền).
              Nếu bạn vừa đặt đơn thử nghiệm, vui lòng vào trang{' '}
              <a onClick={() => navigate('/van-hanh/don-hang')} style={{ fontWeight: 700, color: '#ea580c' }}>
                Quản lý Đơn hàng
              </a>{' '}
              chuyển trạng thái sang <b>"Đã giao"</b> để số liệu cập nhật vào báo cáo.
            </div>
          }
          style={{ marginBottom: 24, borderRadius: 10 }}
        />
      )}

      {/* Main Content Tables */}
      <Row gutter={[16, 16]}>
        {/* Doanh thu theo tháng */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BarChartOutlined style={{ color: '#ea580c' }} />
                <span>Doanh thu theo tháng {selectedYear ? `(Năm ${selectedYear})` : ''}</span>
              </Space>
            } 
            bordered={false}
            style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(124, 45, 18, 0.04)', height: '100%' }}
          >
            <Table
              columns={revColumns}
              dataSource={revenueList}
              rowKey={(r, idx) => r.thang || idx}
              loading={isLoadingRev}
              pagination={false}
              locale={{ 
                emptyText: <Empty description="Chưa có dữ liệu doanh thu cho kỳ này." /> 
              }}
            />
          </Card>
        </Col>

        {/* Món ăn vặt bán chạy */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <FireOutlined style={{ color: '#ef4444' }} />
                <span>Top món ăn vặt bán chạy nhất</span>
              </Space>
            } 
            bordered={false}
            style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(124, 45, 18, 0.04)', height: '100%' }}
          >
            <Table
              columns={topColumns}
              dataSource={topProductsList}
              rowKey={(r, idx) => r.maSanPham || idx}
              loading={isLoadingTop}
              locale={{ 
                emptyText: <Empty description="Chưa có sản phẩm nào được bán." /> 
              }}
              pagination={{
                current: topParams.page,
                pageSize: topParams.pageSize,
                total: topProductsTotal,
                onChange: (page, pageSize) => setTopParams({ page, pageSize }),
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20']
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
