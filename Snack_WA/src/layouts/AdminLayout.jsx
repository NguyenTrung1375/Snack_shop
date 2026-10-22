import React from 'react';
import { UserOutlined, ShopOutlined, LogoutOutlined } from '@ant-design/icons';
import { Layout, Menu, Typography, Space, Button, Tag, Dropdown } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../shared/auth/authStore';

const { Sider, Content, Header } = Layout;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();

  const handleLogout = () => {
    clearSession();
    navigate('/dang-nhap');
  };

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout }
    ]
  };

  const items = [
    { 
      key: '/admin/nguoi-dung', 
      icon: <UserOutlined />, 
      label: <Link to="/admin/nguoi-dung">Quản lý Người dùng</Link> 
    }
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
            <span className="office-brand-role" style={{ color: '#f87171' }}>
              Quản Trị Viên (Admin)
            </span>
          </div>
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={items}
          style={{ background: 'transparent', paddingTop: 8 }} 
        />
      </Sider>

      <Layout style={{ background: '#fffaf5' }}>
        <Header className="office-header">
          <Space>
            <Typography.Title level={4} style={{ margin: 0, color: '#431407' }}>
              Quản Trị Hệ Thống Toàn Quyền
            </Typography.Title>
            <Tag color="red" style={{ fontWeight: 700, borderRadius: 12 }}>
              ADMIN
            </Tag>
          </Space>

          <Space size="middle">
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
