import React from 'react';
import { 
  AppstoreOutlined, 
  BarChartOutlined, 
  FileTextOutlined, 
  InboxOutlined, 
  ShoppingOutlined, 
  TagOutlined, 
  TruckOutlined, 
  TeamOutlined,
  ShopOutlined,
  LogoutOutlined,
  UserOutlined,
  AlertOutlined,
  BellOutlined
} from '@ant-design/icons';
import { Layout, Menu, Typography, Space, Button, Tag, Dropdown } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../shared/auth/authStore';
import { ROLES, roleLabels } from '../shared/constants/roles';

const { Sider, Content, Header } = Layout;

export default function BackOfficeLayout() {
  const location = useLocation(); 
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();
  const role = user?.vaiTro || user?.role; 
  const isManager = role === ROLES.QUAN_LY;

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân', onClick: () => navigate('/tai-khoan') },
      { key: 'notifications', icon: <BellOutlined />, label: 'Thông báo', onClick: () => navigate('/thong-bao') },
      { key: 'shop', icon: <ShopOutlined />, label: 'Về cửa hàng chính', onClick: () => navigate('/') },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout }
    ]
  };

  const items = [
    { 
      key: '/van-hanh/don-hang', 
      icon: <ShoppingOutlined />, 
      label: <Link to="/van-hanh/don-hang">Quản lý Đơn hàng</Link> 
    }, 
    { 
      key: '/van-hanh/hoa-don', 
      icon: <FileTextOutlined />, 
      label: <Link to="/van-hanh/hoa-don">Tra cứu Hóa đơn</Link> 
    }, 
    ...(isManager ? [
      { type: 'divider', style: { borderColor: 'rgba(254, 215, 170, 0.15)' } }, 
      { 
        key: '/van-hanh/san-pham', 
        icon: <AppstoreOutlined />, 
        label: <Link to="/van-hanh/san-pham">Sản phẩm</Link> 
      }, 
      { 
        key: '/van-hanh/loai-san-pham', 
        icon: <TagOutlined />, 
        label: <Link to="/van-hanh/loai-san-pham">Loại sản phẩm</Link> 
      }, 
      { 
        key: '/van-hanh/khuyen-mai', 
        icon: <TagOutlined />, 
        label: <Link to="/van-hanh/khuyen-mai">Khuyến mãi & Voucher</Link> 
      }, 
      { 
        key: '/van-hanh/nha-cung-cap', 
        icon: <TruckOutlined />, 
        label: <Link to="/van-hanh/nha-cung-cap">Nhà cung cấp</Link> 
      }, 
      { 
        key: '/van-hanh/nhap-hang', 
        icon: <InboxOutlined />, 
        label: <Link to="/van-hanh/nhap-hang">Đơn nhập hàng</Link> 
      }, 
      { 
        key: '/van-hanh/ton-kho', 
        icon: <AlertOutlined />, 
        label: <Link to="/van-hanh/ton-kho">Cảnh báo Tồn kho</Link> 
      }, 
      { 
        key: '/van-hanh/bao-cao', 
        icon: <BarChartOutlined />, 
        label: <Link to="/van-hanh/bao-cao">Báo cáo Thống kê</Link> 
      },
      { 
        key: '/van-hanh/nhan-vien', 
        icon: <TeamOutlined />, 
        label: <Link to="/van-hanh/nhan-vien">Quản lý Nhân viên</Link> 
      }
    ] : [])
  ];

  return (
    <Layout className="office-layout" style={{ minHeight: '100vh' }}>
      <Sider 
        breakpoint="lg" 
        collapsedWidth="0" 
        width={240}
        style={{ 
          background: 'linear-gradient(180deg, #2b1308 0%, #1c0b04 100%)',
          borderRight: '1px solid #431407' 
        }}
      >
        <div className="office-brand-header">
          <img src="/logo.png" alt="Logo" className="office-brand-logo" />
          <div className="office-brand-text">
            <span className="office-brand-name">
              Snack<span style={{ color: '#4ade80' }}>Shop</span>
            </span>
            <span className="office-brand-role">
              {isManager ? 'Khu Vực Quản Lý' : 'Khu Vực Nhân Viên'}
            </span>
          </div>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={items}
          style={{ 
            background: 'transparent',
            paddingTop: 8,
            fontWeight: 500
          }} 
        />
      </Sider>

      <Layout style={{ background: '#fffaf5' }}>
        <Header className="office-header">
          <Space>
            <Typography.Title level={4} style={{ margin: 0, color: '#431407' }}>
              {isManager ? 'Trung Tâm Điều Hành Cửa Hàng' : 'Bàn Làm Việc Nhân Viên'}
            </Typography.Title>
            <Tag color={isManager ? 'gold' : 'green'} style={{ fontWeight: 700, borderRadius: 12 }}>
              {roleLabels[role] || role}
            </Tag>
          </Space>

          <Space size="middle">
            <Link to="/">
              <Button 
                type="default" 
                icon={<ShopOutlined style={{ color: '#ea580c' }} />}
                style={{ borderRadius: 8, borderColor: '#fed7aa', fontWeight: 600 }}
              >
                Về cửa hàng
              </Button>
            </Link>

            <Dropdown menu={userMenu} placement="bottomRight">
              <Button 
                type="text" 
                icon={<UserOutlined style={{ color: '#ea580c' }} />}
                style={{ fontWeight: 600 }}
              >
                {user?.hoTen || user?.ten || user?.email?.split('@')[0]}
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content className="office-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
