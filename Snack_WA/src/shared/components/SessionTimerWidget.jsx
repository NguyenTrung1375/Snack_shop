import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tag, Button, Tooltip, Modal, message } from 'antd';
import { ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';
import { refreshSession } from '../../features/auth/api';

export default function SessionTimerWidget({ style = {} }) {
  const navigate = useNavigate();
  const { token, sessionExpiresAt, extendSession, clearSession } = useAuthStore();
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasWarnedRef = useRef(false);
  const isExpiredModalOpenRef = useRef(false);

  // Tính số giây còn lại của phiên làm việc
  const calculateRemaining = useCallback(() => {
    if (!token || !sessionExpiresAt) return 0;
    const diff = Math.floor((sessionExpiresAt - Date.now()) / 1000);
    return Math.max(0, diff);
  }, [token, sessionExpiresAt]);

  useEffect(() => {
    if (!token || !sessionExpiresAt) {
      setTimeLeftSec(0);
      return;
    }

    // Set initial
    setTimeLeftSec(calculateRemaining());

    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeftSec(remaining);

      // Cảnh báo khi còn dưới 2 phút (120 giây)
      if (remaining <= 120 && remaining > 110 && !hasWarnedRef.current) {
        hasWarnedRef.current = true;
        message.warning({
          content: '⚠️ Phiên làm việc của bạn còn dưới 2 phút. Hãy bấm "Gia hạn" để tiếp tục làm việc!',
          duration: 6,
        });
      }

      // Khi hết hạn (0s)
      if (remaining <= 0 && !isExpiredModalOpenRef.current) {
        isExpiredModalOpenRef.current = true;
        clearInterval(timer);
        clearSession();

        Modal.warning({
          title: 'Hết hạn phiên làm việc (15 phút)',
          content: 'Phiên làm việc bảo mật 15 phút đã kết thúc để bảo vệ an toàn thông tin hệ thống. Vui lòng đăng nhập lại để tiếp tục.',
          okText: 'Đăng nhập lại',
          onOk: () => {
            isExpiredModalOpenRef.current = false;
            navigate('/dang-nhap');
          },
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [token, sessionExpiresAt, calculateRemaining, clearSession, navigate]);

  // Xử lý gia hạn phiên
  const handleExtendSession = async () => {
    try {
      setIsRefreshing(true);
      const res = await refreshSession();
      extendSession(res.token || res.accessToken);
      hasWarnedRef.current = false;
      message.success('Đã gia hạn thêm 15 phút cho phiên làm việc!');
    } catch {
      // Nếu API refresh lỗi, vẫn cho phép gia hạn phiên client
      extendSession();
      hasWarnedRef.current = false;
      message.success('Đã thiết lập lại phiên làm việc 15 phút!');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!token || timeLeftSec <= 0) return null;

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Đổi màu theo mức độ khẩn cấp
  let tagColor = 'cyan';
  if (timeLeftSec <= 60) tagColor = 'error';
  else if (timeLeftSec <= 180) tagColor = 'warning';

  return (
    <Tooltip 
      title={
        <div style={{ fontSize: 12 }}>
          <div><strong>Phiên làm việc chuẩn: 15 phút</strong></div>
          <div>Bảo vệ an toàn thông tin & tối ưu bộ nhớ đệm cache thực đơn.</div>
          <div style={{ marginTop: 4 }}>Bấm nút xoay để gia hạn thêm 15 phút.</div>
        </div>
      }
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...style }}>
        <Tag
          icon={<ClockCircleOutlined />}
          color={tagColor}
          style={{
            margin: 0,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>Phiên: {timeFormatted}</span>
        </Tag>
        <Button
          size="small"
          type="text"
          icon={<ReloadOutlined spin={isRefreshing} />}
          onClick={handleExtendSession}
          style={{
            padding: '2px 6px',
            fontSize: 11,
            color: '#64748b',
            borderRadius: 6,
          }}
        >
          Gia hạn
        </Button>
      </div>
    </Tooltip>
  );
}

