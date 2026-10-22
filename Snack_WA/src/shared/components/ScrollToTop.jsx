import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Tự động cuộn màn hình lên đầu trang (top: 0) mỗi khi chuyển trang trong ứng dụng.
 * Khắc phục hiện tượng giữ nguyên vị trí cuộn của trang trước khiến người dùng bị rơi xuống đáy trang mới.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
}

