import { QueryClient } from '@tanstack/react-query';

// Cấu hình chu kỳ phiên làm việc 15 phút (15 minutes = 900,000ms)
export const SESSION_DURATION_MS = 15 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: SESSION_DURATION_MS, // Dữ liệu cache trong phiên 15 phút
      gcTime: 20 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});
