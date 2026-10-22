import { useEffect } from 'react';
import { ConfigProvider, App as AntdApp, Spin } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from './queryClient';
import { theme } from './theme';
import AppRouter from './router';
import ScrollToTop from '../shared/components/ScrollToTop';
import apiClient from '../shared/api/apiClient';
import { useAuthStore } from '../shared/auth/authStore';

function SessionBootstrap({ children }) {
  const token = useAuthStore((state) => state.token);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const finishHydrating = useAuthStore((state) => state.finishHydrating);

  useEffect(() => {
    if (!token) { finishHydrating(); return; }
    apiClient.get('/auth/me').then(({ data }) => setUser(data)).catch(clearSession).finally(finishHydrating);
  }, [token, setUser, clearSession, finishHydrating]);

  if (isHydrating) return <div className="app-loading"><Spin size="large" tip="Đang khởi tạo phiên làm việc..." /></div>;
  return children;
}

export default function App() {
  return (
    <ConfigProvider locale={viVN} theme={theme}>
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ScrollToTop />
            <SessionBootstrap>
              <AppRouter />
            </SessionBootstrap>
          </BrowserRouter>
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
