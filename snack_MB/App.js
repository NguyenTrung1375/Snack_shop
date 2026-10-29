import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootStackNavigator from './src/navigation/RootStackNavigator';
import { useAuthStore, SESSION_DURATION_MS } from './src/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: SESSION_DURATION_MS, // 15 phút cache dữ liệu theo phiên
      gcTime: 20 * 60 * 1000,
    },
  },
});

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();

    // Giám sát phiên làm việc 15 phút
    const interval = setInterval(() => {
      const { isSessionExpired, logout, token } = useAuthStore.getState();
      if (token && isSessionExpired && isSessionExpired()) {
        logout();
        Alert.alert(
          'Phiên làm việc kết thúc',
          'Phiên làm việc 15 phút của bạn đã hết hạn để bảo mật. Vui lòng đăng nhập lại.'
        );
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [initAuth]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootStackNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
