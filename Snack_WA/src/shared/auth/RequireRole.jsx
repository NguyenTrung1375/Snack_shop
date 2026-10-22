import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from './authStore';
import { ROUTES } from '../constants/routes';

export default function RequireRole({ roles, children }) {
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.user?.vaiTro || state.user?.role);

  if (isHydrating) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!token) {
    return <Navigate replace to={ROUTES.LOGIN} />;
  }

  return roles.includes(role) ? children : <Navigate replace to={ROUTES.FORBIDDEN} />;
}
