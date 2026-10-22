import React from 'react';
import { Card, Layout, Typography } from 'antd';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <Layout className="auth-layout">
      <Card className="auth-card" variant="borderless">
        <div className="auth-header">
          <Link to="/" style={{ display: 'inline-block' }}>
            <img 
              src="/logo.png" 
              alt="Snack Shop Logo" 
              className="auth-logo-img" 
            />
          </Link>
          <Typography.Title level={3} className="auth-title">
            Thế Giới Ăn Vặt
          </Typography.Title>
          <Typography.Paragraph className="auth-subtitle">
            Khám phá hàng trăm món ăn vặt thơm ngon, chuẩn vị và giòn rụm!
          </Typography.Paragraph>
        </div>
        <Outlet />
      </Card>
    </Layout>
  );
}
