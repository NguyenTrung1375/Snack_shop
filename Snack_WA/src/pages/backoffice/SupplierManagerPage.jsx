import React, { useState } from 'react';
import { Typography, Card, Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../../features/inventory/hooks';

export default function SupplierManagerPage() {
  const [params, setParams] = useState({ page: 1, pageSize: 20, keyword: '' });
  const { data: suppliers, isLoading } = useSuppliers(params);
  const { mutate: createSupp, isPending: isCreating } = useCreateSupplier();
  const { mutate: updateSupp, isPending: isUpdating } = useUpdateSupplier();
  const { mutate: deleteSupp, isPending: isDeleting } = useDeleteSupplier();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupp, setEditingSupp] = useState(null);
  const [form] = Form.useForm();

  const handleOpenModal = (supplier = null) => {
    setEditingSupp(supplier);
    if (supplier) {
      form.setFieldsValue({
        tenNhaCungCap: supplier.tenNhaCungCap,
        diaChi: supplier.diaChi,
        soDienThoai: supplier.soDienThoai,
        email: supplier.email,
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupp(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (editingSupp) {
      updateSupp(
        { id: editingSupp.maNhaCungCap || editingSupp.id, payload: values },
        {
          onSuccess: () => {
            message.success('Cập nhật thành công!');
            handleCloseModal();
          },
          onError: () => message.error('Có lỗi xảy ra.'),
        }
      );
    } else {
      createSupp(values, {
        onSuccess: () => {
          message.success('Thêm thành công!');
          handleCloseModal();
        },
        onError: () => message.error('Có lỗi xảy ra.'),
      });
    }
  };

  const handleDelete = (id) => {
    deleteSupp(id, {
      onSuccess: () => message.success('Xóa thành công!'),
      onError: () => message.error('Không thể xóa nhà cung cấp này.'),
    });
  };

  const columns = [
    { title: 'Mã NCC', dataIndex: 'id', key: 'id', render: (_, r) => r.maNhaCungCap || r.id },
    { title: 'Tên NCC', dataIndex: 'tenNhaCungCap', key: 'tenNhaCungCap' },
    { title: 'Số điện thoại', dataIndex: 'soDienThoai', key: 'soDienThoai' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Địa chỉ', dataIndex: 'diaChi', key: 'diaChi' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>Sửa</Button>
          <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.maNhaCungCap || record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} loading={isDeleting}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Quản lý nhà cung cấp</Typography.Title>
        <Space>
          <Input.Search
            placeholder="Tìm nhà cung cấp..."
            allowClear
            onSearch={(val) => setParams(p => ({...p, keyword: val}))}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Thêm nhà cung cấp
          </Button>
        </Space>
      </Space>
      <Card bordered={false}>
        <Table 
          dataSource={suppliers?.items || suppliers || []} 
          columns={columns} 
          rowKey={(record) => record.maNhaCungCap || record.id}
          loading={isLoading}
          locale={{ emptyText: 'Chưa có dữ liệu' }}
          pagination={suppliers?.totalCount ? {
            current: params.page,
            pageSize: params.pageSize,
            total: suppliers.totalCount,
            onChange: (page, pageSize) => setParams(p => ({ ...p, page, pageSize }))
          } : false}
        />
      </Card>

      <Modal
        title={editingSupp ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="tenNhaCungCap" label="Tên nhà cung cấp" rules={[{ required: true, message: 'Nhập tên nhà cung cấp' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại" rules={[{ required: true, message: 'Nhập SĐT' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="diaChi" label="Địa chỉ">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
