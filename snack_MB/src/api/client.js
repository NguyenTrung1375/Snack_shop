import axios from 'axios';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

// IP Wi-Fi hiện tại của máy tính chạy Backend (được cập nhật tự động khi khởi chạy)
export const CURRENT_LAN_IP = '192.168.31.153';
export const API_PORT = '5000';
export const STORAGE_KEY_API_URL = '@snackshop_custom_api_url';

/**
 * Tự động phát hiện IP của máy tính đang chạy Expo Metro Packager
 * Khi điện thoại kết nối với Expo Go, Expo luôn biết IP của máy tính phát bundle.
 */
export const getAutoDetectedHost = () => {
  try {
    // 1. expoConfig.hostUri (Expo SDK 49, 50, 51, 52+) e.g. "192.168.31.155:8081"
    const hostUri = Constants?.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }

    // 2. manifest2 / manifest debuggerHost (Expo Go)
    const debuggerHost =
      Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants?.manifest?.debuggerHost;
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }

    // 3. experienceUrl e.g. "exp://192.168.31.155:8081"
    const expUrl = Constants?.experienceUrl;
    if (expUrl) {
      const match = expUrl.match(/^[a-z]+:\/\/([^:/]+)/i);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }

    // 4. NativeModules.SourceCode.scriptURL
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^:/]+)/i);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
};

export const getInitialBaseUrl = () => {
  if (Platform.OS === 'web') {
    return `http://localhost:${API_PORT}/api`;
  }
  const autoHost = getAutoDetectedHost();
  const host = autoHost || CURRENT_LAN_IP;
  return `http://${host}:${API_PORT}/api`;
};

export const DEV_API_URL = getInitialBaseUrl();

export const apiClient = axios.create({
  baseURL: DEV_API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Nạp URL tuỳ chỉnh đã lưu trong AsyncStorage (nếu người dùng từng đặt thủ công)
AsyncStorage.getItem(STORAGE_KEY_API_URL)
  .then((saved) => {
    if (saved && saved.trim()) {
      apiClient.defaults.baseURL = saved.trim();
    }
  })
  .catch(() => {});

// Danh sách tất cả các IP ứng viên khả dĩ để tự động dò tìm
export const getCandidateHosts = () => {
  const autoHost = getAutoDetectedHost();
  const list = [
    autoHost,
    CURRENT_LAN_IP,
    '192.168.31.153',
    '192.168.31.155',
    '172.16.30.173',
    '10.0.2.2',
    'localhost',
  ].filter(Boolean);
  return Array.from(new Set(list));
};

let isProbing = false;

/**
 * Tự động thăm dò danh sách các IP ứng viên để tìm ra địa chỉ Backend đang phản hồi tốt nhất
 */
export const autoDiscoverWorkingHost = async () => {
  if (isProbing) return null;
  isProbing = true;
  try {
    const candidates = getCandidateHosts();
    for (const host of candidates) {
      const testUrl = `http://${host}:${API_PORT}/api/san-pham?pageSize=1`;
      try {
        const res = await axios.get(testUrl, { timeout: 2200 });
        if (res.status === 200) {
          const workingUrl = `http://${host}:${API_PORT}/api`;
          apiClient.defaults.baseURL = workingUrl;
          await AsyncStorage.setItem(STORAGE_KEY_API_URL, workingUrl);
          return workingUrl;
        }
      } catch (err) {
        // Thử ứng viên tiếp theo
      }
    }
  } finally {
    isProbing = false;
  }
  return null;
};

/**
 * Đặt URL kết nối máy chủ thủ công từ giao diện
 */
export const setCustomApiUrl = async (urlOrIp) => {
  if (!urlOrIp || !urlOrIp.trim()) return { success: false, message: 'URL/IP không hợp lệ' };
  let formatted = urlOrIp.trim();

  // Tự động thêm http:// và /api nếu người dùng chỉ gõ địa chỉ IP (ví dụ: 192.168.1.5)
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = `http://${formatted}:${API_PORT}/api`;
  }
  if (!formatted.endsWith('/api') && !formatted.includes('/api/')) {
    formatted = formatted.replace(/\/+$/, '') + '/api';
  }

  try {
    const res = await axios.get(`${formatted}/san-pham?pageSize=1`, { timeout: 3500 });
    if (res.status === 200) {
      apiClient.defaults.baseURL = formatted;
      await AsyncStorage.setItem(STORAGE_KEY_API_URL, formatted);
      return { success: true, url: formatted };
    }
  } catch (e) {
    return {
      success: false,
      error: e.message || 'Không thể kết nối đến địa chỉ này',
      url: formatted,
    };
  }
  return { success: false, url: formatted };
};

/**
 * Khôi phục URL tự động dò tìm
 */
export const resetToAutoDetectedUrl = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY_API_URL);
  const defaultUrl = getInitialBaseUrl();
  apiClient.defaults.baseURL = defaultUrl;
  return defaultUrl;
};

// Gắn Token xác thực vào Request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor tự động xử lý khi bị Network Error (do máy tính đổi IP mạng Wi-Fi)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isNetworkError =
      error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED';

    // Nếu gặp lỗi mạng và chưa thử tự động dò tìm IP
    if (isNetworkError && originalRequest && !originalRequest._retriedWithAutoDiscover) {
      originalRequest._retriedWithAutoDiscover = true;
      const discoveredUrl = await autoDiscoverWorkingHost();
      if (discoveredUrl) {
        originalRequest.baseURL = discoveredUrl;
        return apiClient(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const checkBackendHealth = async () => {
  try {
    const res = await apiClient.get('/san-pham?pageSize=1');
    return { success: true, data: res.data, url: apiClient.defaults.baseURL };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      url: apiClient.defaults.baseURL,
    };
  }
};

export default apiClient;
