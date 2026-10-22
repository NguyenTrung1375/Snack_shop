import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Descriptions, 
  Tag, 
  Button, 
  Spin, 
  Typography, 
  Space, 
  Form, 
  Input, 
  Tabs, 
  Row, 
  Col, 
  Avatar, 
  message, 
  Divider, 
  Popconfirm 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EditOutlined, 
  SaveOutlined, 
  RollbackOutlined, 
  LogoutOutlined, 
  SafetyCertificateOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useProfile, useUpdateProfile, useChangePassword } from '../../features/auth/hooks';
import { useAuthStore } from '../../shared/auth/authStore';
import { ROLES, roleLabels } from '../../shared/constants/roles';

const { Title, Text, Paragraph } = Typography;

const roleBadgeColors = {
  [ROLES.ADMIN]: '#ef4444',
  [ROLES.QUAN_LY]: '#f59e0b',
  [ROLES.NHAN_VIEN]: '#3b82f6',
  [ROLES.KHACH_HANG]: '#10b981',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { clearSession } = useAuthStore();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  const [isEditing, setIsEditing] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (profile) {
      profileForm.setFieldsValue({
        hoLot: profile.hoLot,
        ten: profile.ten,
        email: profile.email,
        soDienThoai: profile.soDienThoai,
        diaChi: profile.diaChi,
      });
    }
  }, [profile, profileForm]);

  const handleUpdateProfile = (values) => {
    updateProfile(
      {
        hoLot: values.hoLot,
        ten: values.ten,
        soDienThoai: values.soDienThoai,
        diaChi: values.diaChi,
      },
      {
        onSuccess: () => {
          message.success('Cập nhật thông tin cá nhân thành công!');
          setIsEditing(false);
          refetch();
        },
        onError: (err) => {
          message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin.');
        },
      }
    );
  };

  const handleChangePassword = (values) => {
    changePassword(
      {
        matKhauCu: values.matKhauCu,
        matKhauMoi: values.matKhauMoi,
      },
      {
        onSuccess: () => {
          message.success('Đổi mật khẩu thành công!');
          passwordForm.resetFields();
        },
        onError: (err) => {
          message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
        },
      }
    );
  };

  const handleLogout = () => {
    clearSession();
    message.info('Đã đăng xuất tài khoản.');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Đang tải thông tin cá nhân..." />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <Typography.Title level={4} type="danger">
          Không thể tải thông tin tài khoản
        </Typography.Title>
        <Paragraph>Vui lòng đăng nhập lại hoặc thử lại sau.</Paragraph>
        <Button type="primary" onClick={() => navigate('/dang-nhap')}>
          Đến trang đăng nhập
        </Button>
      </div>
    );
  }

  const role = profile.vaiTro;
  const roleName = roleLabels[role] || role;
  const roleColor = roleBadgeColors[role] || '#6b7280';

  const tabItems = [
    {
      key: 'info',
      label: (
        <span>
          <UserOutlined /> Hồ sơ cá nhân
        </span>
      ),
      children: (
        <div>
          {!isEditing ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => setIsEditing(true)}
                  style={{ borderRadius: 8, background: '#ea580c', borderColor: '#ea580c' }}
                >
                  Chỉnh sửa thông tin
                </Button>
              </div>

              <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }} size="middle">
                <Descriptions.Item label="Mã tài khoản" span={2}>
                  <Text copyable code>{profile.maNguoiDung}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Họ lót">{profile.hoLot || '-'}</Descriptions.Item>
                <Descriptions.Item label="Tên">{profile.ten || '-'}</Descriptions.Item>
                <Descriptions.Item label="Họ và tên" span={2}>
                  <Text strong>{profile.hoTen || `${profile.hoLot} ${profile.ten}`}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {profile.soDienThoai ? (
                    <Text copyable>{profile.soDienThoai}</Text>
                  ) : (
                    <Text type="secondary">Chưa cập nhật</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {profile.diaChi || <Text type="secondary">Chưa cập nhật</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  <Tag color={roleColor} style={{ fontWeight: 600, padding: '2px 10px', borderRadius: 12 }}>
                    {roleName}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={profile.trangThai === 'hoat_dong' ? 'green' : 'red'}>
                    {profile.trangThai === 'hoat_dong' ? 'Đang hoạt động' : 'Đã bị khóa'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo tài khoản">
                  {profile.ngayTao ? dayjs(profile.ngayTao).format('DD/MM/YYYY HH:mm') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Lần cập nhật gần nhất">
                  {profile.ngayCapNhat ? dayjs(profile.ngayCapNhat).format('DD/MM/YYYY HH:mm') : 'Chưa có'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          ) : (
            <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    name="hoLot" 
                    label="Họ lót" 
                    rules={[{ required: true, message: 'Vui lòng nhập họ lót' }]}
                  >
                    <Input placeholder="Nhập họ lót" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    name="ten" 
                    label="Tên" 
                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                  >
                    <Input placeholder="Nhập tên" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Email (Không thể thay đổi)" name="email">
                <Input disabled size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="soDienThoai" label="Số điện thoại">
                    <Input placeholder="Nhập số điện thoại" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="diaChi" label="Địa chỉ">
                    <Input placeholder="Nhập địa chỉ nhận hàng / liên hệ" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Space style={{ marginTop: 12 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={isUpdatingProfile}
                  size="large"
                  style={{ background: '#ea580c', borderColor: '#ea580c', borderRadius: 8 }}
                >
                  Lưu thay đổi
                </Button>
                <Button 
                  icon={<RollbackOutlined />} 
                  onClick={() => setIsEditing(false)}
                  size="large"
                  style={{ borderRadius: 8 }}
                >
                  Hủy
                </Button>
              </Space>
            </Form>
          )}
        </div>
      ),
    },
    {
      key: 'password',
      label: (
        <span>
          <LockOutlined /> Đổi mật khẩu
        </span>
      ),
      children: (
        <div style={{ maxWidth: 500, margin: '16px 0' }}>
          <Paragraph type="secondary">
            Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh tối thiểu 6 ký tự.
          </Paragraph>

          <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
            <Form.Item
              name="matKhauCu"
              label="Mật khẩu hiện tại"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu cũ của bạn" size="large" />
            </Form.Item>

            <Form.Item
              name="matKhauMoi"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                { min: 6, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
            </Form.Item>

            <Form.Item
              name="xacNhanMatKhau"
              label="Xác nhận mật khẩu mới"
              dependencies={['matKhauMoi']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('matKhauMoi') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu mới" size="large" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SafetyCertificateOutlined />} 
                loading={isChangingPassword}
                size="large"
                style={{ background: '#ea580c', borderColor: '#ea580c', borderRadius: 8, width: '100%' }}
              >
                Cập nhật mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      {/* Profile Header Banner */}
      <Card 
        style={{ 
          marginBottom: 24, 
          borderRadius: 16, 
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '1px solid #fed7aa',
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)'
        }}
      >
        <Row align="middle" gutter={[24, 16]}>
          <Col xs={24} sm={4} style={{ textAlign: 'center' }}>
            <Avatar 
              size={84} 
              style={{ 
                backgroundColor: roleColor, 
                fontSize: 32, 
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {(profile.ten ? profile.ten[0] : 'U').toUpperCase()}
            </Avatar>
          </Col>
          <Col xs={24} sm={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Title level={3} style={{ margin: 0, color: '#431407' }}>
                {profile.hoTen || `${profile.hoLot} ${profile.ten}`}
              </Title>
              <Tag color={roleColor} style={{ fontWeight: 700, borderRadius: 12, padding: '2px 10px' }}>
                {roleName}
              </Tag>
            </div>
            <Paragraph style={{ margin: '6px 0 0', color: '#78716c' }}>
              {profile.email} {profile.soDienThoai ? `• ${profile.soDienThoai}` : ''}
            </Paragraph>
          </Col>
          <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
            <Popconfirm
              title="Bạn có chắc chắn muốn đăng xuất không?"
              onConfirm={handleLogout}
              okText="Đăng xuất"
              cancelText="Hủy"
            >
              <Button danger icon={<LogoutOutlined />} style={{ borderRadius: 8 }}>
                Đăng xuất
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      </Card>

      {/* Role specific quick shortcuts */}
      <Card style={{ marginBottom: 24, borderRadius: 12, border: '1px solid #f3f4f6' }}>
        <Title level={5} style={{ margin: '0 0 12px', color: '#57534e' }}>
          Lối tắt dành cho tài khoản {roleName}:
        </Title>
        <Space wrap size="middle">
          {role === ROLES.ADMIN && (
            <>
              <Link to="/admin/nguoi-dung">
                <Button type="primary" icon={<CrownOutlined />} style={{ borderRadius: 8, background: '#ef4444', borderColor: '#ef4444' }}>
                  Quản trị người dùng (Admin)
                </Button>
              </Link>
              <Link to="/van-hanh/don-hang">
                <Button icon={<ShoppingOutlined />} style={{ borderRadius: 8 }}>
                  Khu vực vận hành
                </Button>
              </Link>
              <Link to="/van-hanh/bao-cao">
                <Button icon={<AppstoreOutlined />} style={{ borderRadius: 8 }}>
                  Báo cáo doanh thu
                </Button>
              </Link>
            </>
          )}

          {role === ROLES.QUAN_LY && (
            <>
              <Link to="/van-hanh/don-hang">
                <Button type="primary" icon={<ShoppingOutlined />} style={{ borderRadius: 8, background: '#f59e0b', borderColor: '#f59e0b' }}>
                  Quản lý đơn hàng
                </Button>
              </Link>
              <Link to="/van-hanh/san-pham">
                <Button icon={<AppstoreOutlined />} style={{ borderRadius: 8 }}>
                  Quản lý sản phẩm
                </Button>
              </Link>
              <Link to="/van-hanh/nhan-vien">
                <Button icon={<UserOutlined />} style={{ borderRadius: 8 }}>
                  Quản lý nhân viên
                </Button>
              </Link>
              <Link to="/van-hanh/bao-cao">
                <Button icon={<AppstoreOutlined />} style={{ borderRadius: 8 }}>
                  Báo cáo tổng hợp
                </Button>
              </Link>
            </>
          )}

          {role === ROLES.NHAN_VIEN && (
            <>
              <Link to="/van-hanh/don-hang">
                <Button type="primary" icon={<ShoppingOutlined />} style={{ borderRadius: 8, background: '#3b82f6', borderColor: '#3b82f6' }}>
                  Quản lý đơn hàng
                </Button>
              </Link>
              <Link to="/van-hanh/hoa-don">
                <Button icon={<AppstoreOutlined />} style={{ borderRadius: 8 }}>
                  Tra cứu hóa đơn
                </Button>
              </Link>
            </>
          )}

          <Link to="/don-hang">
            <Button icon={<ShoppingOutlined />} style={{ borderRadius: 8 }}>
              Đơn hàng của tôi
            </Button>
          </Link>
          <Link to="/gio-hang">
            <Button icon={<ShoppingOutlined />} style={{ borderRadius: 8 }}>
              Giỏ hàng
            </Button>
          </Link>
          <Link to="/san-pham">
            <Button icon={<AppstoreOutlined />} style={{ borderRadius: 8 }}>
              Mua đồ ăn vặt
            </Button>
          </Link>
        </Space>
      </Card>

      {/* Main Tabs */}
      <Card style={{ borderRadius: 16, border: '1px solid #fed7aa', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <Tabs items={tabItems} defaultActiveKey="info" size="large" />
      </Card>
    </div>
  );
}

