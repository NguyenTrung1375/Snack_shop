import React, { useState, useMemo } from 'react';
import { Typography, Card, Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../features/catalog/hooks';

const { Option } = Select;

// Helper to flatten hierarchical category tree for Select dropdown
const flattenCategories = (list = [], depth = 0) => {
  let result = [];
  for (const item of list) {
    result.push({
      id: item.maLoaiSanPham || item.maLoai || item.id,
      name: `${'— '.repeat(depth)}${item.tenLoaiSanPham || item.tenLoai}`,
      rawName: item.tenLoaiSanPham || item.tenLoai,
      depth,
    });
    if (item.loaiCons && item.loaiCons.length > 0) {
      result = result.concat(flattenCategories(item.loaiCons, depth + 1));
    }
  }
  return result;
};

export default function CategoryManagerPage() {
  const { data: categories, isLoading } = useCategories();
  const { mutate: createCat, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCat, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCat, isPending: isDeleting } = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form] = Form.useForm();

  // Flattened list for parent category selector
  const flatCategoryList = useMemo(() => {
    return flattenCategories(categories || []);
  }, [categories]);

  // Open modal for Create / Edit / Add Child
  const handleOpenModal = (category = null, parentId = null) => {
    setEditingCat(category);
    if (category) {
      // Sửa loại sản phẩm
      form.setFieldsValue({
        tenLoaiSanPham: category.tenLoaiSanPham || category.tenLoai,
        maLoaiCha: category.maLoaiCha || undefined,
        moTa: category.moTa,
      });
    } else {
      // Thêm loại mới hoặc thêm loại con
      form.resetFields();
      if (parentId) {
        form.setFieldsValue({ maLoaiCha: parentId });
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCat(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    const payload = {
      maLoaiCha: values.maLoaiCha || null,
      tenLoaiSanPham: values.tenLoaiSanPham?.trim(),
      moTa: values.moTa?.trim(),
    };

    if (editingCat) {
      const id = editingCat.maLoaiSanPham || editingCat.maLoai || editingCat.id;
      updateCat(
        { id, payload },
        {
          onSuccess: () => {
            message.success('Cập nhật loại sản phẩm thành công!');
            handleCloseModal();
          },
          onError: (err) => {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
          },
        }
      );
    } else {
      createCat(payload, {
        onSuccess: () => {
          message.success(payload.maLoaiCha ? 'Thêm loại sản phẩm con thành công!' : 'Thêm loại sản phẩm mới thành công!');
          handleCloseModal();
        },
        onError: (err) => {
          message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới.');
        },
      });
    }
  };

  const handleDelete = (record) => {
    const id = record?.maLoaiSanPham || record?.maLoai || record?.id;
    if (!id) {
      message.error('Không tìm thấy mã loại sản phẩm.');
      return;
    }

    deleteCat(id, {
      onSuccess: () => {
        message.success(`Đã xóa loại sản phẩm "${record.tenLoaiSanPham || record.tenLoai}" thành công!`);
      },
      onError: (err) => {
        const errMsg = err?.response?.data?.message || 'Không thể xóa loại sản phẩm này.';
        message.error(errMsg);
      },
    });
  };

  const columns = [
    { 
      title: 'Tên loại sản phẩm', 
      dataIndex: 'tenLoaiSanPham', 
      key: 'tenLoaiSanPham',
      render: (text, record) => (
        <Space>
          <TagOutlined style={{ color: record.maLoaiCha ? '#f59e0b' : '#ea580c' }} />
          <strong style={{ fontSize: '0.95rem' }}>{text || record.tenLoai}</strong>
          {record.maLoaiCha && (
            <Tag color="gold" style={{ fontSize: '11px', borderRadius: 8 }}>
              Mục con
            </Tag>
          )}
          {record.loaiCons && record.loaiCons.length > 0 && (
            <Tag color="orange" style={{ fontSize: '11px', borderRadius: 10 }}>
              {record.loaiCons.length} loại con
            </Tag>
          )}
        </Space>
      )
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'moTa', 
      key: 'moTa',
      render: (text) => text || <span style={{ color: '#a8a29e', fontStyle: 'italic' }}>Chưa có mô tả</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (status) => (
        <Tag color={status === 'hoat_dong' ? 'green' : 'default'} style={{ borderRadius: 6 }}>
          {status === 'hoat_dong' ? 'Hoạt động' : 'Ngừng'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 240,
      render: (_, record) => {
        const currentId = record.maLoaiSanPham || record.maLoai || record.id;
        return (
          <Space size="small">
            {/* Nút thêm nhanh mục con cho chính loại này */}
            <Button 
              type="link" 
              icon={<PlusCircleOutlined />} 
              onClick={() => handleOpenModal(null, currentId)}
              style={{ color: '#16a34a', paddingInline: 4 }}
            >
              Con
            </Button>

            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleOpenModal(record)}
              style={{ paddingInline: 4 }}
            >
              Sửa
            </Button>

            <Popconfirm 
              title="Xóa loại sản phẩm"
              description={`Bạn có chắc muốn xóa loại "${record.tenLoaiSanPham || record.tenLoai}"?`}
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true, loading: isDeleting }}
            >
              <Button type="link" danger icon={<DeleteOutlined />} style={{ paddingInline: 4 }}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0, color: '#431407' }}>
            Quản lý Loại sản phẩm
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: '0.88rem' }}>
            Hỗ trợ phân cấp Danh mục Cha - Con (VD: Khô → Khô gà, Khô bò; Bánh tráng → Bánh tráng trộn, Bánh tráng cuộn)
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
          Thêm loại mới
        </Button>
      </Space>

      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(124, 45, 18, 0.04)' }}>
        <Table 
          dataSource={categories || []} 
          columns={columns} 
          rowKey={(record) => record.maLoaiSanPham || record.maLoai || record.id}
          childrenColumnName="loaiCons"
          loading={isLoading}
          locale={{ emptyText: 'Chưa có loại sản phẩm nào' }} 
        />
      </Card>

      <Modal
        title={editingCat ? 'Sửa loại sản phẩm' : form.getFieldValue('maLoaiCha') ? 'Thêm loại sản phẩm con' : 'Thêm loại sản phẩm mới'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Lựa chọn loại cha */}
          <Form.Item 
            name="maLoaiCha" 
            label="Thuộc loại cha (để trống nếu là loại gốc lớn)"
            help="Chọn danh mục cha nếu đây là sản phẩm con (VD: Khô gà thuộc loại 'Khô')"
          >
            <Select 
              allowClear 
              placeholder="-- Chọn loại cha (hoặc để trống) --"
            >
              {flatCategoryList
                // Khi đang sửa, không cho chọn chính nó làm cha
                .filter(c => !editingCat || c.id !== (editingCat.maLoaiSanPham || editingCat.maLoai || editingCat.id))
                .map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="tenLoaiSanPham" 
            label="Tên loại sản phẩm" 
            rules={[{ required: true, message: 'Vui lòng nhập tên loại sản phẩm' }]}
          >
            <Input placeholder="VD: Khô gà, Bánh tráng phơi sương, Cơm cháy..." />
          </Form.Item>
          
          <Form.Item name="moTa" label="Mô tả danh mục">
            <Input.TextArea rows={3} placeholder="Mô tả đặc trưng của loại món ăn vặt này..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
