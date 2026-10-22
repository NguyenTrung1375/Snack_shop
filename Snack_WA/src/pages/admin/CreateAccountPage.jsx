import React from 'react';
import { Card, Form, Input, Select, Button, message } from 'antd';
import { useCreateAccount } from '../../features/users/hooks';
import { ROLES } from '../../shared/constants/roles';

export default function CreateAccountPage() {
  const [form] = Form.useForm();
  const { mutate: createAcc, isPending: isLoading } = useCreateAccount();

  const onFinish = (values) => {
    createAcc(values, {
      onSuccess: () => {
        message.success('Tạo tài khoản thành công!');
        form.resetFields();
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản');
      },
    });
  };

  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <Card title="Tạo tài khoản hệ thống" style={{ width: '100%', maxWidth: 500 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Nhập họ tên" />
          </Form.Item>
          
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>
          
          <Form.Item name="matKhau" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
          
          <Form.Item name="soDienThoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          
          <Form.Item name="vaiTro" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select placeholder="Chọn vai trò">
              <Select.Option value={ROLES.KHACH_HANG}>Khách hàng</Select.Option>
              <Select.Option value={ROLES.NHAN_VIEN}>Nhân viên</Select.Option>
              <Select.Option value={ROLES.QUAN_LY}>Quản lý</Select.Option>
              <Select.Option value={ROLES.ADMIN}>Admin</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              Tạo tài khoản
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

