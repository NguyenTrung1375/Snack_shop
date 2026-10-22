import React, { useState } from 'react';
import { Table, Button, Input, InputNumber, DatePicker, Select, Space, Tag, Popconfirm, message, Modal, Form, Switch } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  useUsers, 
  useUpdateUserStatus, 
  useCreateAccount, 
  useDeleteUser 
} from '../../features/users/hooks';
import { ROLES } from '../../shared/constants/roles';

const roleColors = {
  admin: 'red',
  quan_ly: 'gold',
  nhan_vien: 'blue',
  khach_hang: 'green',
};

const { Option } = Select;

export default function UserListPage() {
  const [params, setParams] = useState({ page: 1, pageSize: 20, keyword: '', vaiTro: '', trangThai: '' });
  const { data, isLoading } = useUsers(params);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUserStatus();
  
  const { mutate: createAcc, isPending: isCreating } = useCreateAccount();
  const { mutate: deleteUsr, isPending: isDeleting } = useDeleteUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOpenModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      ngayVaoLam: values.ngayVaoLam ? values.ngayVaoLam.format('YYYY-MM-DD') : undefined,
    };
    createAcc(payload, {
      onSuccess: () => {
        message.success('Tạo tài khoản thành công!');
        handleCloseModal();
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng.');
      },
    });
  };

  const handleDelete = (id) => {
    deleteUsr(id, {
      onSuccess: () => message.success('Xóa người dùng thành công!'),
      onError: (err) => message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng.'),
    });
  };

  const handleStatusChange = (id, currentStatus) => {
    const newStatus = currentStatus === 'hoat_dong' ? 'khoa' : 'hoat_dong';
    updateStatus(
      { id, trangThai: newStatus },
      {
        onSuccess: () => message.success('Cập nhật trạng thái thành công!'),
        onError: (err) => message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái.'),
      }
    );
  };

  const columns = [
    { title: 'Họ lót', dataIndex: 'hoLot', key: 'hoLot' },
    { title: 'Tên', dataIndex: 'ten', key: 'ten' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'soDienThoai', key: 'soDienThoai' },
    { title: 'Địa chỉ', dataIndex: 'diaChi', key: 'diaChi', ellipsis: true },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      render: (role) => <Tag color={roleColors[role] || 'default'}>{role}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (status, record) => {
        const isAdmin = record.vaiTro === ROLES.ADMIN;
        return (
          <Switch
            checked={status === 'hoat_dong'}
            disabled={isAdmin}
            loading={isUpdatingStatus}
            onChange={() => handleStatusChange(record.id || record.maNguoiDung, status)}
            checkedChildren="Hoạt động"
            unCheckedChildren="Khóa"
          />
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const userId = record.id || record.maNguoiDung;
        const isAdmin = record.vaiTro === ROLES.ADMIN;
        return (
          <Space size="small">
            <Link to={`/admin/nguoi-dung/${userId}`}>Chi tiết</Link>

            {!isAdmin && (
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa người dùng này không?"
                onConfirm={() => handleDelete(userId)}
              >
                <Button type="link" danger icon={<DeleteOutlined />} loading={isDeleting}>Xóa</Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Space>
          <Input.Search
            placeholder="Tìm kiếm theo tên, email, sđt..."
            allowClear
            onSearch={(val) => setParams((p) => ({ ...p, keyword: val, page: 1 }))}
            style={{ width: 280 }}
          />
          <Select
            allowClear
            placeholder="Vai trò"
            style={{ width: 150 }}
            onChange={(val) => setParams((p) => ({ ...p, vaiTro: val, page: 1 }))}
          >
            <Option value={ROLES.KHACH_HANG}>Khách hàng</Option>
            <Option value={ROLES.NHAN_VIEN}>Nhân viên</Option>
            <Option value={ROLES.QUAN_LY}>Quản lý</Option>
            <Option value={ROLES.ADMIN}>Admin</Option>
          </Select>
          <Select
            allowClear
            placeholder="Trạng thái"
            style={{ width: 150 }}
            onChange={(val) => setParams((p) => ({ ...p, trangThai: val, page: 1 }))}
          >
            <Option value="hoat_dong">Hoạt động</Option>
            <Option value="khoa">Khóa</Option>
          </Select>
        </Space>
        
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
          Tạo tài khoản
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={data?.items || []}
        rowKey={(record) => record.id || record.maNguoiDung}
        loading={isLoading}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total: data?.totalCount || 0,
          onChange: (page, pageSize) => setParams((p) => ({ ...p, page, pageSize })),
        }}
      />

      <Modal
        title="Tạo tài khoản hệ thống"
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Space align="baseline">
            <Form.Item name="hoLot" label="Họ lót" rules={[{ required: true, message: 'Nhập họ lót' }]}>
              <Input placeholder="Nhập họ lót" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="ten" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}>
              <Input placeholder="Nhập tên" style={{ width: 260 }} />
            </Form.Item>
          </Space>
          
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>
          
          <Form.Item name="matKhau" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu (tối thiểu 6 ký tự)' }, { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' }]}>
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
          
          <Form.Item name="soDienThoai" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item name="diaChi" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
          
          <Form.Item name="vaiTro" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select placeholder="Chọn vai trò">
              <Select.Option value={ROLES.KHACH_HANG}>Khách hàng</Select.Option>
              <Select.Option value={ROLES.NHAN_VIEN}>Nhân viên</Select.Option>
              <Select.Option value={ROLES.QUAN_LY}>Quản lý</Select.Option>
              <Select.Option value={ROLES.ADMIN}>Admin</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.vaiTro !== currentValues.vaiTro}
          >
            {({ getFieldValue }) => {
              const selectedRole = getFieldValue('vaiTro');
              if (selectedRole === ROLES.NHAN_VIEN || selectedRole === ROLES.QUAN_LY) {
                return (
                  <Space style={{ display: 'flex', width: '100%' }}>
                    <Form.Item name="mucLuong" label="Mức lương (VNĐ)" initialValue={0} style={{ width: 220 }}>
                      <InputNumber
                        min={0}
                        step={500000}
                        style={{ width: '100%' }}
                        formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                    <Form.Item name="ngayVaoLam" label="Ngày vào làm" style={{ width: 240 }}>
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày vào làm" />
                    </Form.Item>
                  </Space>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
