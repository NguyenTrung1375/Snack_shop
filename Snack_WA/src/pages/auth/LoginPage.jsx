import React, { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../../features/auth/api';
import { useAuthStore } from '../../shared/auth/authStore';
import { ROLES } from '../../shared/constants/roles';

const destination = (role) => ({
  [ROLES.ADMIN]: '/admin/nguoi-dung',
  [ROLES.QUAN_LY]: '/van-hanh/don-hang',
  [ROLES.NHAN_VIEN]: '/van-hanh/don-hang',
  [ROLES.KHACH_HANG]: '/',
}[role] || '/');

const getSafeRedirect = (role, redirectPath) => {
  if (role === ROLES.ADMIN) {
    return '/admin/nguoi-dung';
  }
  if (!redirectPath || redirectPath === '/403' || redirectPath.includes('/dang-nhap') || redirectPath.includes('/dang-ky')) {
    return destination(role);
  }
  if (redirectPath.startsWith('/admin')) {
    return role === ROLES.ADMIN ? redirectPath : destination(role);
  }
  if (redirectPath.startsWith('/van-hanh')) {
    if (role === ROLES.ADMIN || role === ROLES.QUAN_LY) return redirectPath;
    if (role === ROLES.NHAN_VIEN) {
      if (redirectPath.startsWith('/van-hanh/don-hang') || redirectPath.startsWith('/van-hanh/hoa-don')) {
        return redirectPath;
      }
    }
    return destination(role);
  }
  return redirectPath;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const submit = async (values) => {
    setLoading(true);
    try {
      const result = await login(values);
      setSession(result);
      message.success('Đăng nhập thành công! Chào mừng bạn trở lại.');
      const redirect = new URLSearchParams(location.search).get('redirect');
      const target = getSafeRedirect(result.vaiTro, redirect);
      navigate(target);
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={submit} requiredMark={false} size="large">
      <Form.Item 
        label={<span style={{ fontWeight: 600 }}>Email</span>} 
        name="email" 
        rules={[
          { required: true, message: 'Vui lòng nhập email của bạn' },
          { type: 'email', message: 'Email không đúng định dạng' }
        ]}
      >
        <Input 
          prefix={<MailOutlined style={{ color: '#ea580c' }} />} 
          placeholder="VD: snacklover@example.com" 
        />
      </Form.Item>

      <Form.Item 
        label={<span style={{ fontWeight: 600 }}>Mật khẩu</span>} 
        name="matKhau" 
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
      >
        <Input.Password 
          prefix={<LockOutlined style={{ color: '#ea580c' }} />} 
          placeholder="Nhập mật khẩu" 
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
        Đăng nhập ngay
      </Button>

      <Typography.Paragraph className="auth-switch" style={{ marginTop: 20, textAlign: 'center' }}>
        Chưa có tài khoản?{' '}
        <Link to="/dang-ky" style={{ color: '#ea580c', fontWeight: 700 }}>
          Đăng ký thành viên mới <ArrowRightOutlined style={{ fontSize: 12 }} />
        </Link>
      </Typography.Paragraph>
    </Form>
  );
}
