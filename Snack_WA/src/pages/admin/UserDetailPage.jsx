import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Spin, Typography, Space, Modal, Form, Input, Select, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useUser, useUpdateUser } from '../../features/users/hooks';
import { ROLES } from '../../shared/constants/roles';

dayjs.extend(utc);

const roleColors = {
  admin: 'red',
  quan_ly: 'gold',
  nhan_vien: 'blue',
  khach_hang: 'green',
};

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useUser(id);
  const { mutate: updateUsr, isPending: isUpdating } = useUpdateUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  if (isError) return <Typography.Text type="danger">Lỗi tải thông tin người dùng</Typography.Text>;
  if (!user) return <Typography.Text>Không tìm thấy người dùng</Typography.Text>;

  const handleOpenModal = () => {
    form.setFieldsValue({
      hoLot: user.hoLot,
      ten: user.ten,
      email: user.email,
      soDienThoai: user.soDienThoai,
      diaChi: user.diaChi,
      vaiTro: user.vaiTro,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    updateUsr(
      { id: user.id || user.maNguoiDung, ...values },
      {
        onSuccess: () => {
          message.success('Cập nhật người dùng thành công!');
          handleCloseModal();
        },
        onError: () => message.error('Có lỗi xảy ra khi cập nhật (Kiểm tra lỗi Backend API).'),
      }
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={handleOpenModal}>
          Sửa thông tin
        </Button>
      </Space>

      <Card title="Chi tiết người dùng" bordered={false}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã người dùng" span={2}>{user.id || user.maNguoiDung}</Descriptions.Item>
          <Descriptions.Item label="Họ lót">{user.hoLot}</Descriptions.Item>
          <Descriptions.Item label="Tên">{user.ten}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{user.soDienThoai || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>{user.diaChi || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <Tag color={roleColors[user.vaiTro] || 'default'}>
              {user.vaiTro === ROLES.ADMIN ? 'Admin' : 
               user.vaiTro === ROLES.QUAN_LY ? 'Quản lý' : 
               user.vaiTro === ROLES.NHAN_VIEN ? 'Nhân viên' : 'Khách hàng'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={user.trangThai === 'hoat_dong' ? 'green' : 'red'}>
              {user.trangThai === 'hoat_dong' ? 'Hoạt động' : 'Bị khóa'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {user.ngayTao ? dayjs.utc(user.ngayTao).local().format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {user.ngayCapNhat ? dayjs.utc(user.ngayCapNhat).local().format('DD/MM/YYYY HH:mm:ss') : 'Chưa cập nhật'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Sửa thông tin người dùng"
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={isUpdating}
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
            <Input placeholder="Nhập địa chỉ email" disabled />
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
        </Form>
      </Modal>
    </div>
  );
}
