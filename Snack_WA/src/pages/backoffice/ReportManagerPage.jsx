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
  Alert, 
  Empty, 
  Tabs,
  DatePicker,
  Radio
} from 'antd';
import { 
  BarChartOutlined, 
  DollarCircleOutlined, 
  ShoppingOutlined, 
  FireOutlined, 
  ReloadOutlined, 
  TrophyOutlined, 
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  AccountBookOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { 
  useRevenueReport, 
  useTopProductsReport,
  useDateRangeReport,
  useQuarterProfitReport,
  useEmployeeReport,
  useCustomerReport,
  useProductQuarterReport
} from '../../features/reports/hooks';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ReportManagerPage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // Tab State
  const [activeTab, setActiveTab] = useState('profit-quarter');

  // Year filters
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [quarterYear, setQuarterYear] = useState(currentYear);
  const [productYear, setProductYear] = useState(currentYear);

  // Date Range filter (Mục a)
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('year'),
    dayjs().endOf('day')
  ]);

  // Object Type (Mục c: Nhân viên vs Khách hàng)
  const [partnerType, setPartnerType] = useState('nhan_vien');

  // Top products pagination
  const [topParams, setTopParams] = useState({ page: 1, pageSize: 10 });

  // --- API Queries ---
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

  // a) Thống kê khoảng ngày
  const {
    data: dateRangeData,
    isLoading: isLoadingDateRange,
    refetch: refetchDateRange
  } = useDateRangeReport({
    tuNgay: dateRange?.[0] ? dateRange[0].startOf('day').toISOString() : undefined,
    denNgay: dateRange?.[1] ? dateRange[1].endOf('day').toISOString() : undefined
  });

  // b) Thu - Chi - Lợi nhuận theo Quý & Năm
  const {
    data: quarterProfitData,
    isLoading: isLoadingQuarter,
    refetch: refetchQuarter
  } = useQuarterProfitReport({ nam: quarterYear });

  // c1) Nhân viên
  const {
    data: employeeData,
    isLoading: isLoadingEmployee,
    refetch: refetchEmployee
  } = useEmployeeReport();

  // c2) Khách hàng
  const {
    data: customerData,
    isLoading: isLoadingCustomer,
    refetch: refetchCustomer
  } = useCustomerReport();

  // d) Sản phẩm theo Quý
  const {
    data: productQuarterData,
    isLoading: isLoadingProductQuarter,
    refetch: refetchProductQuarter
  } = useProductQuarterReport({ nam: productYear });

  // Safe data extraction
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

  const bestSellingProduct = topProductsList[0] || null;

  const handleRefreshAll = () => {
    refetchRev();
    refetchTop();
    refetchDateRange();
    refetchQuarter();
    refetchEmployee();
    refetchCustomer();
    refetchProductQuarter();
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // ==========================================
  // TAB 1: BẢNG THU - CHI - LỢI NHUẬN (MỤC B TRÊN BẢNG)
  // ==========================================
  const quarterRows = quarterProfitData?.rows || [];
  const quarterColumns = [
    {
      title: 'Chỉ tiêu',
      dataIndex: 'chiTieu',
      key: 'chiTieu',
      width: 220,
      fixed: 'left',
      render: (val, record) => {
        const isProfit = record.maChiTieu === 'loi_nhuan';
        const isThu = record.maChiTieu === 'tong_thu';
        return (
          <div style={{ fontWeight: isProfit ? 800 : 600, fontSize: isProfit ? '15px' : '14px', color: isProfit ? '#0284c7' : (isThu ? '#059669' : '#ea580c') }}>
            {isProfit && <RiseOutlined style={{ marginRight: 6 }} />}
            {isThu && <DollarCircleOutlined style={{ marginRight: 6 }} />}
            {!isProfit && !isThu && <AccountBookOutlined style={{ marginRight: 6 }} />}
            {val}
          </div>
        );
      }
    },
    {
      title: 'Quý 1 (Q1)',
      dataIndex: 'q1',
      key: 'q1',
      align: 'right',
      render: (val, record) => (
        <span style={{ fontWeight: record.maChiTieu === 'loi_nhuan' ? 700 : 500, whiteSpace: 'nowrap' }}>
          {formatMoney(val)}
        </span>
      )
    },
    {
      title: 'Quý 2 (Q2)',
      dataIndex: 'q2',
      key: 'q2',
      align: 'right',
      render: (val, record) => (
        <span style={{ fontWeight: record.maChiTieu === 'loi_nhuan' ? 700 : 500, whiteSpace: 'nowrap' }}>
          {formatMoney(val)}
        </span>
      )
    },
    {
      title: 'Quý 3 (Q3)',
      dataIndex: 'q3',
      key: 'q3',
      align: 'right',
      render: (val, record) => (
        <span style={{ fontWeight: record.maChiTieu === 'loi_nhuan' ? 700 : 500, whiteSpace: 'nowrap' }}>
          {formatMoney(val)}
        </span>
      )
    },
    {
      title: 'Quý 4 (Q4)',
      dataIndex: 'q4',
      key: 'q4',
      align: 'right',
      render: (val, record) => (
        <span style={{ fontWeight: record.maChiTieu === 'loi_nhuan' ? 700 : 500, whiteSpace: 'nowrap' }}>
          {formatMoney(val)}
        </span>
      )
    },
    {
      title: 'Tổng cộng (TC)',
      dataIndex: 'tongCong',
      key: 'tongCong',
      align: 'right',
      render: (val, record) => {
        const isProfit = record.maChiTieu === 'loi_nhuan';
        return (
          <span style={{ 
            fontWeight: 800, 
            fontSize: isProfit ? '15px' : '14px',
            color: isProfit ? (val >= 0 ? '#10b981' : '#ef4444') : '#1e293b',
            whiteSpace: 'nowrap'
          }}>
            {formatMoney(val)}
          </span>
        );
      }
    }
  ];

  // ==========================================
  // TAB 2: THỐNG KÊ TỪ NGÀY A ĐẾN NGÀY B (MỤC A TRÊN BẢNG)
  // ==========================================
  const dateRangeInvoices = dateRangeData?.danhSachHoaDon || [];
  const dateRangeColumns = [
    {
      title: 'Số Hóa đơn',
      dataIndex: 'soHoaDon',
      key: 'soHoaDon',
      width: 140,
      render: (val) => <Tag color="blue" style={{ fontWeight: 700 }}>{val}</Tag>
    },
    {
      title: 'Mã Đơn hàng',
      dataIndex: 'maCodeDonHang',
      key: 'maCodeDonHang',
      width: 140,
      render: (val) => <Text code>{val}</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'tenKhachHang',
      key: 'tenKhachHang',
      render: (val) => <Text strong style={{ color: '#1e293b' }}>{val}</Text>
    },
    {
      title: 'Nhân viên lập HĐ',
      dataIndex: 'tenNhanVien',
      key: 'tenNhanVien',
      render: (val) => <Text type="secondary">{val || 'Hệ thống'}</Text>
    },
    {
      title: 'Ngày xuất HĐ',
      dataIndex: 'ngayXuatHoaDon',
      key: 'ngayXuatHoaDon',
      width: 170,
      render: (val) => (
        <span style={{ fontSize: '13px' }}>
          <CalendarOutlined style={{ marginRight: 5, color: '#ea580c' }} />
          {dayjs(val).format('DD/MM/YYYY HH:mm')}
        </span>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tongTien',
      key: 'tongTien',
      align: 'right',
      width: 160,
      render: (val) => (
        <Text strong style={{ color: '#ef4444', fontSize: '14px', whiteSpace: 'nowrap' }}>
          {formatMoney(val)}
        </Text>
      )
    }
  ];

  // ==========================================
  // TAB 3: BẢNG DOANH THU THEO NHÂN VIÊN & KHÁCH HÀNG (MỤC C TRÊN BẢNG)
  // ==========================================
  const currentPartnerData = partnerType === 'nhan_vien' ? employeeData : customerData;
  const partnerYears = currentPartnerData?.danhSachNam || [2024, 2025, 2026];
  const partnerRows = currentPartnerData?.items || [];
  const partnerGrandTotal = currentPartnerData?.tongCongToanBo;

  const partnerColumns = [
    {
      title: partnerType === 'nhan_vien' ? 'Nhân viên (NV)' : 'Khách hàng (KH)',
      dataIndex: 'tenDoiTuong',
      key: 'tenDoiTuong',
      width: 240,
      fixed: 'left',
      render: (val, record) => (
        <Space>
          <Tag color={partnerType === 'nhan_vien' ? 'purple' : 'cyan'} style={{ fontWeight: 700 }}>
            {record.maDinhDanh}
          </Tag>
          <Text strong style={{ color: '#1e293b' }}>{val}</Text>
        </Space>
      )
    },
    ...partnerYears.map(year => ({
      title: `Năm ${year}`,
      key: `year_${year}`,
      align: 'right',
      render: (_, record) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {formatMoney(record.doanhThuTheoNam?.[year.toString()] || 0)}
        </span>
      )
    })),
    {
      title: 'Tổng cộng (TC)',
      dataIndex: 'tongCong',
      key: 'tongCong',
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#ea580c', fontSize: '14px', whiteSpace: 'nowrap' }}>
          {formatMoney(val)}
        </Text>
      )
    }
  ];

  // ==========================================
  // TAB 4: BẢNG DOANH THU SẢN PHẨM THEO QUÝ (MỤC D TRÊN BẢNG)
  // ==========================================
  const productRows = productQuarterData?.items || [];
  const productGrandTotal = productQuarterData?.tongCongToanBo;
  const productColumns = [
    {
      title: 'Sản phẩm (SP)',
      dataIndex: 'tenSanPham',
      key: 'tenSanPham',
      width: 280,
      fixed: 'left',
      render: (val, _, idx) => (
        <Space>
          <Tag color="volcano" style={{ fontWeight: 700 }}>SP{idx + 1}</Tag>
          <Text strong style={{ color: '#1e293b' }}>{val}</Text>
        </Space>
      )
    },
    {
      title: 'Quý 1 (Q1)',
      dataIndex: 'q1',
      key: 'q1',
      align: 'right',
      render: (val) => <span style={{ whiteSpace: 'nowrap' }}>{formatMoney(val)}</span>
    },
    {
      title: 'Quý 2 (Q2)',
      dataIndex: 'q2',
      key: 'q2',
      align: 'right',
      render: (val) => <span style={{ whiteSpace: 'nowrap' }}>{formatMoney(val)}</span>
    },
    {
      title: 'Quý 3 (Q3)',
      dataIndex: 'q3',
      key: 'q3',
      align: 'right',
      render: (val) => <span style={{ whiteSpace: 'nowrap' }}>{formatMoney(val)}</span>
    },
    {
      title: 'Quý 4 (Q4)',
      dataIndex: 'q4',
      key: 'q4',
      align: 'right',
      render: (val) => <span style={{ whiteSpace: 'nowrap' }}>{formatMoney(val)}</span>
    },
    {
      title: 'Tổng cộng (TC)',
      dataIndex: 'tongCong',
      key: 'tongCong',
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#ea580c', fontSize: '14px', whiteSpace: 'nowrap' }}>
          {formatMoney(val)}
        </Text>
      )
    }
  ];

  // ==========================================
  // TAB 5: BÁO CÁO THÁNG & BÁN CHẠY (BẢNG GỐC)
  // ==========================================
  const revColumns = [
    { 
      title: 'Kỳ báo cáo (Tháng)', 
      dataIndex: 'thang', 
      key: 'thang',
      width: 150,
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
      width: 130,
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
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#ef4444', fontSize: '14px', whiteSpace: 'nowrap' }}>
          {formatMoney(val)}
        </Text>
      )
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
          <Text type="secondary" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
            {formatMoney(aov)}
          </Text>
        );
      }
    }
  ];

  const topColumns = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 85,
      align: 'center',
      render: (_, __, index) => {
        const actualRank = (topParams.page - 1) * topParams.pageSize + index + 1;
        if (actualRank === 1) return <Tag color="gold" style={{ fontWeight: 800 }}>🥇 Top 1</Tag>;
        if (actualRank === 2) return <Tag color="default" style={{ fontWeight: 800 }}>🥈 Top 2</Tag>;
        if (actualRank === 3) return <Tag color="volcano" style={{ fontWeight: 800 }}>🥉 Top 3</Tag>;
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
      width: 120,
      align: 'center',
      render: (val) => (
        <Tag color="volcano" icon={<FireOutlined />} style={{ fontWeight: 700, padding: '2px 8px', whiteSpace: 'nowrap' }}>
          {val || 0} món
        </Tag>
      )
    },
    { 
      title: 'Tổng doanh số', 
      dataIndex: 'tongDoanhThu', 
      key: 'tongDoanhThu',
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#ea580c', fontSize: '14px', whiteSpace: 'nowrap' }}>
          {formatMoney(val)}
        </Text>
      )
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#9a3412', fontWeight: 800 }}>
            Báo cáo & Thống kê Kinh doanh
          </Title>
          <Text type="secondary">
            Phân tích số liệu doanh thu bán hàng thực tế, chi phí nhập hàng, lợi nhuận và xếp hạng các món ăn vặt
          </Text>
        </div>
        <Space>
          <Button 
            type="primary"
            icon={<ReloadOutlined />} 
            onClick={handleRefreshAll} 
            loading={isLoadingRev || isLoadingTop || isLoadingQuarter || isLoadingDateRange}
            style={{ borderRadius: 8, background: '#ea580c', borderColor: '#ea580c' }}
          >
            Làm mới tất cả
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
              formatter={(val) => formatMoney(val)}
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
              valueStyle={{ fontSize: '15px', fontWeight: 700, color: '#9a3412' }}
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

      {/* Tabs theo 4 dạng bài toán của Giảng viên */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(124, 45, 18, 0.04)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            // ==========================================
            // THU - CHI - LỢI NHUẬN THEO QUÝ & NĂM
            // ==========================================
            {
              key: 'profit-quarter',
              label: (
                <span style={{ fontWeight: 600 }}>
                  <RiseOutlined /> Thu - Chi & Lợi nhuận (Quý/Năm)
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#431407' }}>
                        Ma trận Thống kê HĐ (Thu) - PNH (Chi) - Lợi nhuận
                      </Title>
                      <Text type="secondary">
                        Thống kê tổng tiền Hóa đơn (Thu), Đơn nhập hàng (Chi) và Lợi nhuận thực tế theo từng Quý
                      </Text>
                    </div>
                    <Space>
                      <span>Chọn năm:</span>
                      <Select
                        value={quarterYear}
                        onChange={setQuarterYear}
                        style={{ width: 140 }}
                      >
                        <Option value={currentYear}>Năm {currentYear}</Option>
                        <Option value={currentYear - 1}>Năm {currentYear - 1}</Option>
                        <Option value={currentYear - 2}>Năm {currentYear - 2}</Option>
                      </Select>
                    </Space>
                  </div>

                  <Table
                    columns={quarterColumns}
                    dataSource={quarterRows}
                    rowKey="maChiTieu"
                    loading={isLoadingQuarter}
                    pagination={false}
                    bordered
                    scroll={{ x: 700 }}
                  />
                </div>
              )
            },

            // ==========================================
            // THỐNG KÊ THEO KHOẢNG NGÀY
            // ==========================================
            {
              key: 'date-range',
              label: (
                <span style={{ fontWeight: 600 }}>
                  <CalendarOutlined /> Doanh thu theo Khoảng ngày
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#431407' }}>
                        Thống kê Tổng tiền Hóa đơn theo Khoảng Thời Gian
                      </Title>
                      <Text type="secondary">
                        Chọn ngày bắt đầu và ngày kết thúc để tổng hợp doanh thu và danh sách hóa đơn
                      </Text>
                    </div>
                    <Space>
                      <span>Khoảng ngày:</span>
                      <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        format="DD/MM/YYYY"
                        allowClear={false}
                      />
                      <Button onClick={() => refetchDateRange()} icon={<ReloadOutlined />}>Tra cứu</Button>
                    </Space>
                  </div>

                  {/* Summary row for date range */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', borderRadius: 10 }}>
                        <Statistic
                          title="Tổng doanh thu hóa đơn trong kỳ"
                          value={dateRangeData?.tongDoanhThu || 0}
                          formatter={formatMoney}
                          valueStyle={{ color: '#16a34a', fontWeight: 700 }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ background: '#eff6ff', borderColor: '#bfdbfe', borderRadius: 10 }}>
                        <Statistic
                          title="Tổng số hóa đơn đã xuất"
                          value={dateRangeData?.tongSoHoaDon || 0}
                          suffix="hóa đơn"
                          valueStyle={{ color: '#2563eb', fontWeight: 700 }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Table
                    columns={dateRangeColumns}
                    dataSource={dateRangeInvoices}
                    rowKey="maHoaDon"
                    loading={isLoadingDateRange}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ x: 800 }}
                    locale={{ emptyText: <Empty description="Không có hóa đơn nào trong khoảng ngày đã chọn." /> }}
                  />
                </div>
              )
            },

            // ==========================================
            // DOANH THU THEO NHÂN VIÊN & KHÁCH HÀNG
            // ==========================================
            {
              key: 'partner-yearly',
              label: (
                <span style={{ fontWeight: 600 }}>
                  <TeamOutlined /> Doanh thu theo Nhân viên / Khách hàng
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#431407' }}>
                        Bảng Ma Trận Doanh Thu {partnerType === 'nhan_vien' ? 'theo Nhân viên' : 'theo Khách hàng'} qua các Năm
                      </Title>
                      <Text type="secondary">
                        Theo dõi tổng doanh số hóa đơn do từng nhân viên tạo ra hoặc theo từng khách hàng qua 2024, 2025, 2026
                      </Text>
                    </div>
                    <Radio.Group
                      value={partnerType}
                      onChange={(e) => setPartnerType(e.target.value)}
                      buttonStyle="solid"
                    >
                      <Radio.Button value="nhan_vien">
                        <UserOutlined /> Thống kê theo Nhân viên
                      </Radio.Button>
                      <Radio.Button value="khach_hang">
                        <TeamOutlined /> Thống kê theo Khách hàng
                      </Radio.Button>
                    </Radio.Group>
                  </div>

                  <Table
                    columns={partnerColumns}
                    dataSource={partnerRows}
                    rowKey={(r) => r.maDinhDanh || r.maDoiTuong}
                    loading={partnerType === 'nhan_vien' ? isLoadingEmployee : isLoadingCustomer}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ x: 800 }}
                    summary={() => {
                      if (!partnerGrandTotal) return null;
                      return (
                        <Table.Summary.Row style={{ background: '#fff7ed', fontWeight: 800 }}>
                          <Table.Summary.Cell index={0}>
                            <Tag color="orange" style={{ fontWeight: 800 }}>TC</Tag>
                            <span>Tổng cộng toàn bộ</span>
                          </Table.Summary.Cell>
                          {partnerYears.map((yr, idx) => (
                            <Table.Summary.Cell key={yr} index={idx + 1} align="right">
                              <span style={{ color: '#ea580c', whiteSpace: 'nowrap' }}>
                                {formatMoney(partnerGrandTotal.doanhThuTheoNam?.[yr.toString()] || 0)}
                              </span>
                            </Table.Summary.Cell>
                          ))}
                          <Table.Summary.Cell index={partnerYears.length + 1} align="right">
                            <span style={{ color: '#ea580c', fontSize: '15px', whiteSpace: 'nowrap' }}>
                              {formatMoney(partnerGrandTotal.tongCong || 0)}
                            </span>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      );
                    }}
                  />
                </div>
              )
            },

            // ==========================================
            // DOANH THU SẢN PHẨM THEO QUÝ & NĂM
            // ==========================================
            {
              key: 'product-quarter',
              label: (
                <span style={{ fontWeight: 600 }}>
                  <FireOutlined /> Doanh số Sản phẩm theo Quý
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#431407' }}>
                        Ma trận Thống kê Doanh thu Sản phẩm theo từng Quý
                      </Title>
                      <Text type="secondary">
                        Chi tiết doanh số bán của từng món ăn vặt chia theo 4 Quý trong năm
                      </Text>
                    </div>
                    <Space>
                      <span>Chọn năm:</span>
                      <Select
                        value={productYear}
                        onChange={setProductYear}
                        style={{ width: 140 }}
                      >
                        <Option value={currentYear}>Năm {currentYear}</Option>
                        <Option value={currentYear - 1}>Năm {currentYear - 1}</Option>
                        <Option value={currentYear - 2}>Năm {currentYear - 2}</Option>
                      </Select>
                    </Space>
                  </div>

                  <Table
                    columns={productColumns}
                    dataSource={productRows}
                    rowKey={(r, i) => r.maSanPham || i}
                    loading={isLoadingProductQuarter}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ x: 800 }}
                    summary={() => {
                      if (!productGrandTotal) return null;
                      return (
                        <Table.Summary.Row style={{ background: '#fff7ed', fontWeight: 800 }}>
                          <Table.Summary.Cell index={0}>
                            <Tag color="volcano" style={{ fontWeight: 800 }}>TC</Tag>
                            <span>Tổng cộng toàn bộ</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <span style={{ color: '#ea580c', whiteSpace: 'nowrap' }}>{formatMoney(productGrandTotal.q1)}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} align="right">
                            <span style={{ color: '#ea580c', whiteSpace: 'nowrap' }}>{formatMoney(productGrandTotal.q2)}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3} align="right">
                            <span style={{ color: '#ea580c', whiteSpace: 'nowrap' }}>{formatMoney(productGrandTotal.q3)}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4} align="right">
                            <span style={{ color: '#ea580c', whiteSpace: 'nowrap' }}>{formatMoney(productGrandTotal.q4)}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={5} align="right">
                            <span style={{ color: '#ea580c', fontSize: '15px', whiteSpace: 'nowrap' }}>{formatMoney(productGrandTotal.tongCong)}</span>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      );
                    }}
                  />
                </div>
              )
            },

            // ==========================================
            // TAB 5: BÁO CÁO THÁNG & BÁN CHẠY (TỔNG QUAN)
            // ==========================================
            {
              key: 'overview-month',
              label: (
                <span style={{ fontWeight: 600 }}>
                  <BarChartOutlined /> 📊 Doanh thu Tháng & Món bán chạy
                </span>
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <Space>
                      <span>Lọc theo năm:</span>
                      <Select
                        placeholder="Tất cả năm"
                        style={{ width: 140 }}
                        allowClear
                        value={selectedYear}
                        onChange={(val) => setSelectedYear(val)}
                      >
                        <Option value={currentYear}>Năm {currentYear}</Option>
                        <Option value={currentYear - 1}>Năm {currentYear - 1}</Option>
                        <Option value={currentYear - 2}>Năm {currentYear - 2}</Option>
                      </Select>
                    </Space>
                  </div>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <Card 
                        title={
                          <Space>
                            <BarChartOutlined style={{ color: '#ea580c' }} />
                            <span>Doanh thu theo tháng {selectedYear ? `(Năm ${selectedYear})` : ''}</span>
                          </Space>
                        } 
                        bordered
                        style={{ borderRadius: 12, height: '100%' }}
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

                    <Col xs={24} lg={12}>
                      <Card 
                        title={
                          <Space>
                            <FireOutlined style={{ color: '#ef4444' }} />
                            <span>Top món ăn vặt bán chạy nhất</span>
                          </Space>
                        } 
                        bordered
                        style={{ borderRadius: 12, height: '100%' }}
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
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
