import React, { useState, useEffect, useMemo } from 'react';
import { 
  Typography, 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  Tag, 
  message, 
  Row, 
  Col, 
  Statistic, 
  Divider, 
  Alert, 
  Tooltip,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  InboxOutlined, 
  ShopOutlined, 
  DollarCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useImportOrders, useCreateImportOrder, useSuppliers } from '../../features/inventory/hooks';
import { useProducts } from '../../features/catalog/hooks';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ImportOrderManagerPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [params, setParams] = useState({ page: 1, pageSize: 20 });
  const { data: importOrdersData, isLoading, refetch } = useImportOrders(params);
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers({ page: 1, pageSize: 100 });
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ 
    page: 1, 
    pageSize: 500, 
    chiHienThiSanPhamGoc: false 
  });

  const { mutate: createImportOrder, isPending: isCreating } = useCreateImportOrder();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [form] = Form.useForm();

  // Watch items for live calculation
  const watchedItems = Form.useWatch('chiTiets', form);

  const suppliersList = useMemo(() => {
    return suppliersData?.items || suppliersData || [];
  }, [suppliersData]);

  const rawProducts = useMemo(() => {
    return productsData?.items || productsData || [];
  }, [productsData]);

  // Lookup map for products (including variants and parents)
  const productMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(rawProducts)) {
      rawProducts.forEach(p => map.set(p.maSanPham, p));
    }
    return map;
  }, [rawProducts]);

  // Group variants directly under their parent product for intuitive selection
  const productsList = useMemo(() => {
    if (!Array.isArray(rawProducts)) return [];

    const rootProducts = rawProducts.filter(p => !p.maSanPhamCha);
    const variants = rawProducts.filter(p => !!p.maSanPhamCha);

    const result = [];
    rootProducts.forEach(parent => {
      result.push(parent);
      const children = variants.filter(v => v.maSanPhamCha === parent.maSanPham);
      result.push(...children);
    });

    // Add any orphan variants just in case
    variants.forEach(v => {
      if (!result.some(r => r.maSanPham === v.maSanPham)) {
        result.push(v);
      }
    });

    return result;
  }, [rawProducts]);

  // Handle prefill from LowStock page
  useEffect(() => {
    if (location.state?.prefillProductId) {
      const prefillId = location.state.prefillProductId;
      setIsCreateModalOpen(true);
      form.setFieldsValue({
        chiTiets: [
          {
            maSanPham: prefillId,
            soLuong: 20,
            giaNhap: 15000,
          }
        ]
      });
      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname, form]);

  const handleOpenCreateModal = () => {
    form.resetFields();
    form.setFieldsValue({
      chiTiets: [
        {
          maSanPham: undefined,
          soLuong: 10,
          giaNhap: 20000,
        }
      ]
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    form.resetFields();
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Live order calculations
  const summaryCalculation = useMemo(() => {
    if (!watchedItems || !Array.isArray(watchedItems)) {
      return { totalItems: 0, totalQuantity: 0, grandTotal: 0 };
    }
    let totalQuantity = 0;
    let grandTotal = 0;
    let validItemsCount = 0;

    watchedItems.forEach((item) => {
      if (item && item.maSanPham) {
        validItemsCount += 1;
        const q = Number(item.soLuong) || 0;
        const p = Number(item.giaNhap) || 0;
        totalQuantity += q;
        grandTotal += q * p;
      }
    });

    return { totalItems: validItemsCount, totalQuantity, grandTotal };
  }, [watchedItems]);

  const handleSubmit = (values) => {
    const rawItems = values.chiTiets || [];
    if (rawItems.length === 0) {
      message.error('Vui lòng thêm ít nhất một sản phẩm cần nhập kho.');
      return;
    }

    // Tự động gộp số lượng nếu người dùng chọn trùng sản phẩm trên nhiều dòng
    const mergedMap = new Map();
    rawItems.forEach((item) => {
      if (!item.maSanPham) return;
      const q = Number(item.soLuong) || 0;
      const p = Number(item.giaNhap) || 0;
      if (mergedMap.has(item.maSanPham)) {
        const existing = mergedMap.get(item.maSanPham);
        const totalQ = existing.soLuong + q;
        const totalCost = (existing.soLuong * existing.giaNhap) + (q * p);
        existing.soLuong = totalQ;
        existing.giaNhap = totalQ > 0 ? Math.round((totalCost / totalQ) * 100) / 100 : p;
      } else {
        mergedMap.set(item.maSanPham, {
          maSanPham: item.maSanPham,
          soLuong: q,
          giaNhap: p,
        });
      }
    });

    const payload = {
      maNhaCungCap: values.maNhaCungCap,
      chiTiets: Array.from(mergedMap.values()),
    };

    createImportOrder(payload, {
      onSuccess: () => {
        message.success('Tạo đơn nhập hàng thành công! Số lượng tồn kho đã được tự động cập nhật.');
        handleCloseCreateModal();
      },
      onError: (err) => {
        const errorMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo đơn nhập hàng.';
        message.error(errorMsg);
      },
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'maDonNhap',
      key: 'maDonNhap',
      width: 140,
      render: (id) => (
        <Tooltip title={id}>
          <Tag color="orange" style={{ fontWeight: 600, fontFamily: 'monospace' }}>
            #{id ? id.slice(0, 8).toUpperCase() : 'N/A'}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'tenNhaCungCap',
      key: 'tenNhaCungCap',
      render: (text) => (
        <Space>
          <ShopOutlined style={{ color: '#ea580c' }} />
          <Text strong>{text || 'Chưa xác định'}</Text>
        </Space>
      ),
    },
    {
      title: 'Người lập phiếu',
      dataIndex: 'tenNhanVien',
      key: 'tenNhanVien',
      render: (text) => text || 'Quản lý kho',
    },
    {
      title: 'Ngày nhập kho',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      render: (val, record) => dayjs(val || record.ngayNhapKho).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Mặt hàng',
      key: 'itemsCount',
      render: (_, record) => (
        <Tag color="blue">{record.chiTiets?.length || 0} món</Tag>
      ),
    },
    {
      title: 'Tổng chi phí nhập',
      dataIndex: 'tongTien',
      key: 'tongTien',
      render: (val) => (
        <Text strong style={{ color: '#ef4444', fontSize: '15px' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => handleViewDetail(record)}
          style={{ color: '#ea580c', fontWeight: 600 }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // Detail table columns
  const detailColumns = [
    {
      title: 'Tên món ăn vặt',
      dataIndex: 'tenSanPham',
      key: 'tenSanPham',
      render: (text, record) => {
        const prod = productMap.get(record.maSanPham);
        const weight = record.khoiLuong || prod?.khoiLuong;
        const isVariant = prod?.maSanPhamCha;
        return (
          <div>
            <Text strong>{text}</Text>
            {weight && (
              <Tag color="cyan" style={{ marginLeft: 6, fontSize: '11px' }}>
                {weight}
              </Tag>
            )}
            {isVariant && (
              <Tag color="purple" style={{ marginLeft: 4, fontSize: '10px' }}>
                Biến thể con
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Số lượng nhập',
      dataIndex: 'soLuong',
      key: 'soLuong',
      align: 'center',
      render: (val, record) => {
        const prod = productMap.get(record.maSanPham);
        const unit = record.donViTinh || prod?.donViTinh || '';
        return (
          <Tag color="green" style={{ fontSize: '13px', padding: '2px 8px' }}>
            +{val} {unit}
          </Tag>
        );
      },
    },
    {
      title: 'Đơn giá nhập',
      dataIndex: 'giaNhap',
      key: 'giaNhap',
      align: 'right',
      render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'thanhTien',
      key: 'thanhTien',
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#ef4444' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
        </Text>
      ),
    },
  ];

  const ordersList = importOrdersData?.items || importOrdersData || [];
  const totalOrdersCount = importOrdersData?.totalCount || ordersList.length;

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#9a3412', fontWeight: 800 }}>
            Quản lý Đơn nhập hàng
          </Title>
          <Text type="secondary">
            Ghi nhận các đợt nhập món ăn vặt từ nhà cung cấp & tự động tăng số lượng tồn kho
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Làm mới
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleOpenCreateModal}
            size="large"
            style={{ 
              borderRadius: 10, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
            }}
          >
            Tạo đơn nhập hàng mới
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Tổng số phiếu nhập kho"
              value={totalOrdersCount}
              prefix={<InboxOutlined style={{ color: '#ea580c' }} />}
              suffix="đơn"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Tổng nhà cung cấp đối tác"
              value={suppliersList.length}
              prefix={<ShopOutlined style={{ color: '#2563eb' }} />}
              suffix="đối tác"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Tổng giá trị nhập (trang này)"
              value={ordersList.reduce((acc, cur) => acc + (Number(cur.tongTien) || 0), 0)}
              prefix={<DollarCircleOutlined style={{ color: '#10b981' }} />}
              formatter={(val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(124, 45, 18, 0.04)' }}>
        <Table 
          columns={columns} 
          dataSource={ordersList} 
          rowKey={(record) => record.maDonNhap || record.id}
          loading={isLoading}
          locale={{ emptyText: <Empty description="Chưa có đơn nhập hàng nào. Bấm 'Tạo đơn nhập hàng mới' để nhập kho." /> }}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total: totalOrdersCount,
            onChange: (page, pageSize) => setParams({ page, pageSize }),
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50']
          }}
        />
      </Card>

      {/* Modal Tạo đơn nhập hàng mới */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InboxOutlined style={{ color: '#ea580c', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 700 }}>Tạo phiếu nhập hàng kho</span>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={handleCloseCreateModal}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Hoàn tất nhập hàng"
        cancelText="Hủy bỏ"
        width={860}
        destroyOnClose
        okButtonProps={{
          size: 'large',
          style: {
            borderRadius: 8,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            border: 'none',
          }
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          {suppliersList.length === 0 && !isLoadingSuppliers && (
            <Alert
              type="warning"
              showIcon
              message="Chưa có Nhà cung cấp nào trong hệ thống!"
              description={
                <div>
                  Hệ thống yêu cầu mỗi đơn nhập phải gắn liền với một nhà cung cấp.{' '}
                  <a onClick={() => navigate('/van-hanh/nha-cung-cap')} style={{ fontWeight: 700, color: '#ea580c' }}>
                    Nhấn vào đây để thêm Nhà cung cấp trước
                  </a>.
                </div>
              }
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item 
            name="maNhaCungCap" 
            label={<Text strong>Nhà cung cấp đối tác</Text>} 
            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
          >
            <Select 
              placeholder="Chọn nhà cung cấp phân phối..." 
              loading={isLoadingSuppliers}
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              size="large"
            >
              {suppliersList.map((sup) => (
                <Option key={sup.maNhaCungCap || sup.id} value={sup.maNhaCungCap || sup.id}>
                  {sup.tenNhaCungCap} {sup.soDienThoai ? `(${sup.soDienThoai})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider style={{ margin: '16px 0 20px' }}>
            <Text type="secondary" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Danh sách sản phẩm nhập kho
            </Text>
          </Divider>

          <Form.List name="chiTiets">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {fields.map(({ key, name, ...restField }, index) => {
                  const currentItem = watchedItems?.[name];
                  const rowSubtotal = (Number(currentItem?.soLuong) || 0) * (Number(currentItem?.giaNhap) || 0);

                  return (
                    <Card 
                      key={key} 
                      size="small" 
                      style={{ 
                        background: '#fcfcfc', 
                        borderColor: '#fed7aa',
                        borderRadius: 10 
                      }}
                    >
                      <Row gutter={12} align="middle">
                        <Col xs={24} md={10}>
                          <Form.Item
                            {...restField}
                            name={[name, 'maSanPham']}
                            label={<span style={{ fontSize: '12px', color: '#7c2d12' }}>Sản phẩm (#{index + 1})</span>}
                            rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select 
                              placeholder="Chọn món ăn vặt..." 
                              showSearch
                              loading={isLoadingProducts}
                              filterOption={(input, option) =>
                                (option?.searchLabel ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {productsList.map((p) => {
                                const isVariant = !!p.maSanPhamCha;
                                const parent = isVariant ? productMap.get(p.maSanPhamCha) : null;
                                const searchLabel = `${p.tenSanPham} ${p.khoiLuong || ''} ${p.donViTinh || ''} ${parent?.tenSanPham || ''} ${isVariant ? 'biến thể con' : 'món gốc'}`;

                                return (
                                  <Option 
                                    key={p.maSanPham} 
                                    value={p.maSanPham}
                                    searchLabel={searchLabel}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ 
                                          fontWeight: isVariant ? 500 : 700, 
                                          color: isVariant ? '#1e293b' : '#0f172a',
                                          paddingLeft: isVariant ? 10 : 0 
                                        }}>
                                          {isVariant ? `↳ ${p.tenSanPham}` : p.tenSanPham}
                                        </span>
                                        {p.khoiLuong && (
                                          <Tag color="cyan" style={{ fontSize: '11px', margin: 0, padding: '0 6px' }}>
                                            {p.khoiLuong}
                                          </Tag>
                                        )}
                                        {isVariant ? (
                                          <Tag color="purple" style={{ fontSize: '10px', margin: 0, padding: '0 4px' }}>
                                            Biến thể con
                                          </Tag>
                                        ) : (
                                          <Tag color="blue" style={{ fontSize: '10px', margin: 0, padding: '0 4px' }}>
                                            Món gốc
                                          </Tag>
                                        )}
                                      </div>
                                      <Tag color={p.soLuongTon > 10 ? 'default' : 'orange'} style={{ fontSize: '11px', margin: 0 }}>
                                        Tồn: {p.soLuongTon ?? 0} {p.donViTinh || 'món'}
                                      </Tag>
                                    </div>
                                  </Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={12} md={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'soLuong']}
                            label={<span style={{ fontSize: '12px', color: '#7c2d12' }}>Số lượng</span>}
                            rules={[{ required: true, message: 'Nhập SL' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber 
                              min={1} 
                              max={99999}
                              style={{ width: '100%' }} 
                              placeholder="SL"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={12} md={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'giaNhap']}
                            label={<span style={{ fontSize: '12px', color: '#7c2d12' }}>Giá nhập (đ)</span>}
                            rules={[{ required: true, message: 'Nhập giá' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber 
                              min={1} 
                              step={1000}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                              style={{ width: '100%' }} 
                              placeholder="Giá nhập"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={18} md={4} style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', color: '#888', display: 'block' }}>Thành tiền</span>
                          <Text strong style={{ color: '#ea580c' }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rowSubtotal)}
                          </Text>
                        </Col>

                        <Col xs={6} md={1} style={{ textAlign: 'center' }}>
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            disabled={fields.length === 1}
                            onClick={() => remove(name)}
                          />
                        </Col>
                      </Row>
                    </Card>
                  );
                })}

                <Button 
                  type="dashed" 
                  onClick={() => add({ maSanPham: undefined, soLuong: 10, giaNhap: 20000 })} 
                  block 
                  icon={<PlusOutlined />}
                  style={{ borderRadius: 8, borderColor: '#f97316', color: '#ea580c' }}
                >
                  Thêm sản phẩm khác vào đơn nhập
                </Button>
              </div>
            )}
          </Form.List>

          {/* Summary Box */}
          <Card 
            style={{ 
              marginTop: 20, 
              background: '#fff7ed', 
              borderColor: '#ffedd5',
              borderRadius: 12 
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={2}>
                  <Text strong>Tổng kết đơn hàng nhập:</Text>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {summaryCalculation.totalItems} mặt hàng • {summaryCalculation.totalQuantity} sản phẩm nhập
                  </Text>
                </Space>
              </Col>
              <Col style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', color: '#7c2d12', display: 'block' }}>Tổng tiền thanh toán dự kiến</span>
                <Text style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summaryCalculation.grandTotal)}
                </Text>
              </Col>
            </Row>
          </Card>

          <Alert
            style={{ marginTop: 16 }}
            type="info"
            showIcon
            message="Cơ chế cộng tồn kho tự động"
            description="Sau khi đơn nhập hoàn tất, Database Trigger sẽ lập tức cộng dồn số lượng vào kho và đồng bộ trên toàn bộ cửa hàng Web-App."
          />
        </Form>
      </Modal>

      {/* Modal Xem Chi Tiết Đơn Nhập */}
      <Modal
        title={
          <Space>
            <InboxOutlined style={{ color: '#ea580c' }} />
            <span>Chi tiết Đơn nhập #{selectedOrder?.maDonNhap?.slice(0, 8).toUpperCase()}</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)} style={{ background: '#ea580c', borderColor: '#ea580c' }}>
            Đóng
          </Button>
        ]}
        width={750}
      >
        {selectedOrder && (
          <div>
            <Row gutter={[16, 12]} style={{ marginBottom: 16, background: '#fafafa', padding: 16, borderRadius: 8 }}>
              <Col span={12}>
                <Text type="secondary">Nhà cung cấp:</Text>{' '}
                <Text strong>{selectedOrder.tenNhaCungCap || 'N/A'}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Người nhập kho:</Text>{' '}
                <Text strong>{selectedOrder.tenNhanVien || 'Quản lý'}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Thời gian nhập:</Text>{' '}
                <Text>{dayjs(selectedOrder.ngayTao || selectedOrder.ngayNhapKho).format('DD/MM/YYYY HH:mm:ss')}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Mã đầy đủ:</Text>{' '}
                <Text copyable style={{ fontSize: '12px' }}>{selectedOrder.maDonNhap}</Text>
              </Col>
            </Row>

            <Table
              columns={detailColumns}
              dataSource={selectedOrder.chiTiets || []}
              rowKey={(item, idx) => item.maSanPham || idx}
              pagination={false}
              size="small"
              bordered
            />

            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Text style={{ fontSize: '15px' }}>Tổng chi phí đơn nhập: </Text>
              <Text strong style={{ fontSize: '20px', color: '#ef4444' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.tongTien || 0)}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
