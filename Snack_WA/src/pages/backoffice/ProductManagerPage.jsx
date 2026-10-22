import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Switch, 
  message, 
  Typography, 
  Popconfirm, 
  Image, 
  Tag, 
  Card,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PictureOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { 
  useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useUpdateProductStatus, 
  useDeleteProduct, 
  useCategories 
} from '../../features/catalog/hooks';

const { Option } = Select;

// Flatten category tree for select dropdown
const flattenCategories = (list = [], depth = 0) => {
  let result = [];
  for (const item of list) {
    result.push({
      id: item.maLoaiSanPham || item.maLoai || item.id,
      name: `${'— '.repeat(depth)}${item.tenLoaiSanPham || item.tenLoai}`,
      rawName: item.tenLoaiSanPham || item.tenLoai,
    });
    if (item.loaiCons && item.loaiCons.length > 0) {
      result = result.concat(flattenCategories(item.loaiCons, depth + 1));
    }
  }
  return result;
};

export default function ProductManagerPage() {
  const [params, setParams] = useState({ page: 1, pageSize: 50, keyword: '', chiHienThiSanPhamGoc: false });
  const { data, isLoading } = useProducts(params);
  const { data: categoriesData } = useCategories();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  // Watch image URL to render live preview in modal
  const watchedImageUrl = Form.useWatch('hinhAnhDaiDien', form);

  const flatCategories = useMemo(() => {
    return flattenCategories(categoriesData || []);
  }, [categoriesData]);

  const parentProducts = useMemo(() => {
    return (data?.items || []).filter(p => !p.maSanPhamCha);
  }, [data]);

  const { mutate: createProd, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProd, isPending: isUpdating } = useUpdateProduct();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateProductStatus();
  const { mutate: deleteProd, isPending: isDeleting } = useDeleteProduct();

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      form.setFieldsValue({
        tenSanPham: product.tenSanPham,
        maLoaiSanPham: product.maLoaiSanPham || product.maLoai,
        maSanPhamCha: product.maSanPhamCha || null,
        donViTinh: product.donViTinh || 'gói',
        khoiLuong: product.khoiLuong || '',
        giaBan: product.giaBan,
        hinhAnhDaiDien: product.hinhAnhDaiDien || '',
        moTa: product.moTa || '',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        donViTinh: 'gói',
        maSanPhamCha: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleCreateVariant = (parent) => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      maSanPhamCha: parent.maSanPham,
      tenSanPham: `${parent.tenSanPham} `,
      maLoaiSanPham: parent.maLoaiSanPham || parent.maLoai,
      donViTinh: parent.donViTinh || 'gói',
      hinhAnhDaiDien: parent.hinhAnhDaiDien || '',
      giaBan: parent.giaBan,
      moTa: parent.moTa || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    let rawImage = values.hinhAnhDaiDien?.trim() || null;
    if (rawImage && rawImage.includes('ibb.co/FbKjvq1V')) {
      rawImage = 'https://i.ibb.co/7JX6cND4/kho-ga-la-chanh.png';
    }

    const payload = {
      tenSanPham: values.tenSanPham.trim(),
      maLoaiSanPham: values.maLoaiSanPham,
      maSanPhamCha: values.maSanPhamCha || null,
      donViTinh: (values.donViTinh || 'gói').trim(),
      khoiLuong: values.khoiLuong?.trim() || null,
      giaBan: Number(values.giaBan) || 0,
      hinhAnhDaiDien: rawImage,
      moTa: values.moTa?.trim() || null,
    };

    if (editingProduct) {
      updateProd(
        { id: editingProduct.maSanPham, payload },
        {
          onSuccess: () => {
            message.success('Cập nhật thông tin sản phẩm thành công!');
            handleCloseModal();
          },
          onError: (err) => {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
          },
        }
      );
    } else {
      createProd(payload, {
        onSuccess: () => {
          message.success('Thêm sản phẩm mới thành công!');
          handleCloseModal();
        },
        onError: (err) => {
          message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi thêm sản phẩm.');
        },
      });
    }
  };

  const handleStatusChange = (id, currentStatus) => {
    const newStatus = currentStatus === 'dang_ban' ? 'ngung_ban' : 'dang_ban';
    updateStatus(
      { id, status: newStatus },
      {
        onSuccess: () => message.success('Cập nhật trạng thái thành công'),
        onError: (err) => message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái'),
      }
    );
  };

  const handleDeleteProduct = (id) => {
    deleteProd(id, {
      onSuccess: () => {
        message.success('Xóa sản phẩm thành công!');
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm.');
      },
    });
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'hinhAnhDaiDien',
      key: 'hinhAnhDaiDien',
      width: 75,
      render: (img) => (
        img ? (
          <Image
            src={img}
            alt="Món ăn vặt"
            width={48}
            height={64}
            style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #fed7aa' }}
            fallback="/logo.png"
          />
        ) : (
          <div style={{
            width: 48,
            height: 64,
            borderRadius: 8,
            background: '#ffedd5',
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
            border: '1px solid #fed7aa'
          }}>
            🍘
          </div>
        )
      )
    },
    { 
      title: 'Tên sản phẩm', 
      dataIndex: 'tenSanPham', 
      key: 'tenSanPham',
      render: (name, record) => (
        <div>
          <strong style={{ fontSize: '0.98rem', color: '#292524' }}>{name}</strong>
          <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {record.tenLoaiSanPham && (
              <Tag color="orange" style={{ fontSize: '11px', borderRadius: 6, margin: 0 }}>
                {record.tenLoaiSanPham}
              </Tag>
            )}
            {record.khoiLuong && (
              <Tag color="volcano" style={{ fontSize: '11px', borderRadius: 6, margin: 0 }}>
                ⚖️ {record.khoiLuong}
              </Tag>
            )}
            {record.maSanPhamCha && (
              <Tag color="blue" style={{ fontSize: '11px', borderRadius: 6, margin: 0 }}>
                Biến thể con
              </Tag>
            )}
          </div>
        </div>
      )
    },
    { 
      title: 'Giá bán', 
      dataIndex: 'giaBan', 
      key: 'giaBan',
      width: 140,
      render: (val) => (
        <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.95rem' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
        </span>
      )
    },
    { 
      title: 'ĐVT', 
      dataIndex: 'donViTinh', 
      key: 'donViTinh',
      width: 90,
      render: (val) => <Tag color="blue">{val || 'gói'}</Tag>
    },
    { 
      title: 'Tồn kho', 
      dataIndex: 'soLuongTon', 
      key: 'soLuongTon',
      width: 110,
      render: (val) => (
        <span style={{ fontWeight: 700, color: val > 0 ? '#16a34a' : '#a8a29e' }}>
          {val}
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (status, record) => (
        <Switch
          checked={status === 'dang_ban'}
          loading={isUpdatingStatus}
          onChange={() => handleStatusChange(record.maSanPham, status)}
          checkedChildren="Đang bán"
          unCheckedChildren="Ngừng bán"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {!record.maSanPhamCha && (
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => handleCreateVariant(record)}
              style={{ color: '#16a34a', fontWeight: 600, padding: 0 }}
              title="Thêm biến thể quy cách/trọng lượng cho món này"
            >
              Biến thể
            </Button>
          )}
          <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm"
            description={`Bạn có chắc chắn muốn xóa "${record.tenSanPham}"?`}
            onConfirm={() => handleDeleteProduct(record.maSanPham)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: isDeleting }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0, color: '#431407' }}>
            Quản lý Sản phẩm
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: '0.88rem' }}>
            Thêm, chỉnh sửa thông tin món ăn vặt, gán link ảnh và quản lý trạng thái bán
          </Typography.Text>
        </div>

        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => handleOpenModal()}
          style={{ 
            borderRadius: 10, 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
          }}
        >
          Thêm sản phẩm mới
        </Button>
      </Space>

      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(124, 45, 18, 0.04)' }}>
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên sản phẩm..."
            allowClear
            onSearch={(val) => setParams((p) => ({ ...p, keyword: val?.trim(), page: 1 }))}
            style={{ width: 320, borderRadius: 10 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="maSanPham"
          loading={isLoading}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total: data?.totalCount || 0,
            onChange: (page, pageSize) => setParams((p) => ({ ...p, page, pageSize })),
          }}
        />
      </Card>

      {/* Modal Thêm / Sửa sản phẩm */}
      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm món ăn vặt mới'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
        width={620}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="maSanPhamCha" 
            label="Sản phẩm gốc / Món cha (nếu đây là biến thể)"
            help="Để trống nếu là món chính. Chọn món gốc nếu đây là biến thể quy cách/trọng lượng (VD: Khô Gà Cháy Tỏi 300g)."
          >
            <Select 
              allowClear 
              placeholder="-- Đây là món chính (không phải biến thể) --"
              options={parentProducts
                .filter(p => !editingProduct || p.maSanPham !== editingProduct.maSanPham)
                .map(p => ({
                  value: p.maSanPham,
                  label: `👉 ${p.tenSanPham} ${p.khoiLuong ? `(${p.khoiLuong})` : ''}`
                }))
              }
            />
          </Form.Item>

          <Form.Item 
            name="tenSanPham" 
            label="Tên sản phẩm" 
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="VD: Khô gà lá chanh loại 1, Bánh tráng cuốn sốt me..." />
          </Form.Item>
          
          <Space align="baseline" style={{ display: 'flex', width: '100%' }}>
            <Form.Item 
              name="maLoaiSanPham" 
              label="Loại sản phẩm" 
              rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' }]} 
              style={{ flex: 1 }}
            >
              <Select placeholder="-- Chọn danh mục sản phẩm --">
                {flatCategories.map(cat => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item 
              name="donViTinh" 
              label="Đơn vị tính" 
              rules={[{ required: true, message: 'Vui lòng nhập đơn vị tính' }]} 
              style={{ width: 180 }}
            >
              <Select 
                placeholder="Chọn hoặc nhập"
                options={[
                  { value: 'gói', label: 'gói' },
                  { value: 'hộp', label: 'hộp' },
                  { value: 'lon', label: 'lon' },
                  { value: 'phần', label: 'phần' },
                  { value: 'bịch', label: 'bịch' },
                  { value: 'kg', label: 'kg' },
                ]}
              />
            </Form.Item>
          </Space>

          <Space align="baseline" style={{ display: 'flex', width: '100%' }}>
            <Form.Item 
              name="giaBan" 
              label="Giá bán" 
              rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter="VNĐ"
                min={0}
                placeholder="VD: 55000"
              />
            </Form.Item>

            <Form.Item 
              name="khoiLuong" 
              label="Trọng lượng (Quy cách)"
              style={{ width: 180 }}
            >
              <Input placeholder="VD: 150g, 300g..." />
            </Form.Item>
          </Space>

          {/* Trường link hình ảnh đã host */}
          <Form.Item 
            name="hinhAnhDaiDien" 
            label="Link ảnh sản phẩm (URL ảnh trực tiếp)"
            help="Dán URL ảnh trực tiếp (.png, .jpg, v.v.). Với ImgBB, dùng link Direct (i.ibb.co/...) thay vì link trang xem (ibb.co/...)"
          >
            <Input 
              prefix={<PictureOutlined style={{ color: '#ea580c' }} />}
              placeholder="VD: https://i.ibb.co/7JX6cND4/kho-ga-la-chanh.png" 
              allowClear
            />
          </Form.Item>

          {/* Cảnh báo và hỗ trợ nếu nhập nhầm link trang web xem ảnh của ImgBB */}
          {watchedImageUrl && watchedImageUrl.includes('ibb.co/') && !watchedImageUrl.includes('i.ibb.co/') && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16, borderRadius: 10 }}
              message="Đang dùng link trang web xem ảnh (ibb.co) thay vì link ảnh trực tiếp!"
              description={
                <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                  <div>Link dạng <code>ibb.co/...</code> là trang web HTML nên trình duyệt không tải được ảnh và tự động chuyển về logo mặc định.</div>
                  <div style={{ marginTop: 6 }}>
                    👉 <b>Cách lấy link đúng:</b> Trên trang ImgBB, bạn nhấp chuột phải vào bức ảnh &gt; chọn <b>&quot;Sao chép địa chỉ hình ảnh&quot;</b> (link đúng sẽ có dạng <code>https://i.ibb.co/...</code>).
                  </div>
                  {watchedImageUrl.includes('FbKjvq1V') && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #6ee7b7' }}>
                      <span style={{ color: '#047857', fontWeight: 600 }}>💡 Link trực tiếp của ảnh khô gà lá chanh:</span>
                      <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', margin: '4px 0', color: '#065f46' }}>
                        https://i.ibb.co/7JX6cND4/kho-ga-la-chanh.png
                      </div>
                      <Button
                        size="small"
                        type="primary"
                        style={{ background: '#059669', borderColor: '#059669', marginTop: 4 }}
                        onClick={() => form.setFieldsValue({ hinhAnhDaiDien: 'https://i.ibb.co/7JX6cND4/kho-ga-la-chanh.png' })}
                      >
                        Tự động đổi sang link trực tiếp này
                      </Button>
                    </div>
                  )}
                </div>
              }
            />
          )}

          {/* Xem trước ảnh nếu có link */}
          {watchedImageUrl && (
            <div style={{
              marginBottom: 16,
              padding: 12,
              background: '#fff7ed',
              borderRadius: 12,
              border: '1px dashed #fed7aa',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <Image 
                src={watchedImageUrl} 
                alt="Xem trước ảnh" 
                width={72} 
                height={96} 
                style={{ objectFit: 'cover', borderRadius: 8 }}
                fallback="/logo.png"
              />
              <div>
                <strong style={{ color: '#9a3412', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EyeOutlined /> Xem trước ảnh đại diện
                </strong>
                <div style={{ color: '#78716c', fontSize: '0.85rem' }}>
                  Ảnh sẽ hiển thị ngoài cửa hàng khi khách mua sắm.
                </div>
              </div>
            </div>
          )}

          <Form.Item name="moTa" label="Mô tả sản phẩm">
            <Input.TextArea 
              rows={3} 
              placeholder="Mô tả thành phần, độ cay, hương vị, hạn sử dụng..." 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
