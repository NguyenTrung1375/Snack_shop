import React, { useState } from 'react';
import { Button, Form, Input, Typography, message, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../features/auth/api';
import { useAuthStore } from '../../shared/auth/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const submit = async (values) => {
    setLoading(true);
    try {
      const data = await register(values);
      setSession(data);
      message.success('Đăng ký tài khoản thành công! Bắt đầu mua sắm ngay.');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={submit} requiredMark={false} size="large">
      <Space style={{ display: 'flex', width: '100%' }} align="start">
        <Form.Item 
          label={<span style={{ fontWeight: 600 }}>Họ và tên lót</span>} 
          name="hoLot" 
          rules={[{ required: true, message: 'Nhập họ lót' }]}
          style={{ flex: 1 }}
        >
          <Input placeholder="Nguyễn Văn" />
        </Form.Item>
        <Form.Item 
          label={<span style={{ fontWeight: 600 }}>Tên</span>} 
          name="ten" 
          rules={[{ required: true, message: 'Nhập tên' }]}
          style={{ width: 140 }}
        >
          <Input placeholder="An" />
        </Form.Item>
      </Space>

      <Form.Item 
        label={<span style={{ fontWeight: 600 }}>Email</span>} 
        name="email" 
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không đúng định dạng' }
        ]}
      >
        <Input 
          prefix={<MailOutlined style={{ color: '#ea580c' }} />} 
          placeholder="snacklover@example.com" 
        />
      </Form.Item>

      <Form.Item 
        label={<span style={{ fontWeight: 600 }}>Mật khẩu</span>} 
        name="matKhau" 
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu' },
          { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
        ]}
      >
        <Input.Password 
          prefix={<LockOutlined style={{ color: '#ea580c' }} />} 
          placeholder="Ít nhất 6 ký tự" 
        />
      </Form.Item>

      <Button 
        htmlType="submit" 
        type="primary" 
        block 
        loading={loading}
        style={{
          height: 46,
          fontSize: '1rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          border: 'none',
          boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
          marginTop: 8,
        }}
      >
        Tạo tài khoản ngay
      </Button>

      <Typography.Paragraph className="auth-switch" style={{ marginTop: 20, textAlign: 'center' }}>
        Đã có tài khoản?{' '}
        <Link to="/dang-nhap" style={{ color: '#ea580c', fontWeight: 700 }}>
          <ArrowLeftOutlined style={{ fontSize: 12 }} /> Đăng nhập
        </Link>
      </Typography.Paragraph>
    </Form>
  );
}
