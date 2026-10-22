import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Tabs,
  Pagination,
  Skeleton,
  Empty,
  Popconfirm,
  Tag,
  Tooltip,
  message,
  Badge
} from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification
} from '../../features/notifications/hooks';
import { formatDate } from '../../shared/utils/formatters';

const { Title, Text, Paragraph } = Typography;

export default function NotificationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const chiChuaDoc = activeTab === 'unread';

  // Queries
  const { data: notifData, isLoading } = useNotificationsQuery({
    chiChuaDoc,
    page,
    pageSize,
  });

  const { data: unreadCount = 0 } = useUnreadCountQuery();

  // Mutations
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = notifData?.items || [];
  const totalCount = notifData?.totalCount || 0;

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id, {
      onSuccess: () => {
        message.success('Đã đánh dấu thông báo là đã đọc');
      },
      onError: () => {
        message.error('Không thể cập nhật trạng thái');
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => {
        message.success('Đã đánh dấu tất cả thông báo là đã đọc');
      },
      onError: () => {
        message.error('Thao tác không thành công');
      },
    });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        message.success('Đã xóa thông báo');
      },
      onError: () => {
        message.error('Không thể xóa thông báo');
      },
    });
  };

  const getNotificationIcon = (item) => {
    const title = (item.tieuDe || '').toLowerCase();
    const type = (item.loaiThongBao || '').toLowerCase();

    if (type.includes('don_hang') || title.includes('đơn hàng')) {
      return (
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: '#ffedd5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <ShoppingOutlined style={{ fontSize: 22, color: '#ea580c' }} />
        </div>
      );
    }

    if (type.includes('khuyen_mai') || title.includes('khuyến mãi') || title.includes('ưu đãi')) {
      return (
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <GiftOutlined style={{ fontSize: 22, color: '#d97706' }} />
        </div>
      );
    }

    return (
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: '#e0f2fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <BellOutlined style={{ fontSize: 22, color: '#0284c7' }} />
      </div>
    );
  };

  const isOrderRelated = (item) => {
    const title = (item.tieuDe || '').toLowerCase();
    const type = (item.loaiThongBao || '').toLowerCase();
    return type.includes('don_hang') || title.includes('đơn hàng');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner / Card */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          marginBottom: 24,
          border: '1px solid #fed7aa',
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)'
        }}
        bodyStyle={{ padding: '24px 28px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
              }}>
                <BellOutlined />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, color: '#9a3412', fontWeight: 700 }}>
                  Thông báo của bạn
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Cập nhật trạng thái đơn hàng, ưu đãi và tin tức mới nhất từ SnackShop.
                </Text>
              </div>
            </div>
          </div>

          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleMarkAllAsRead}
            loading={markAllAsReadMutation.isPending}
            disabled={unreadCount === 0}
            style={{
              background: unreadCount > 0 ? '#ea580c' : undefined,
              borderColor: unreadCount > 0 ? '#ea580c' : undefined,
              borderRadius: 8,
              fontWeight: 600
            }}
          >
            Đánh dấu đã đọc tất cả
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={(k) => {
          setActiveTab(k);
          setPage(1);
        }}
        items={[
          {
            key: 'all',
            label: (
              <span style={{ fontSize: 15, fontWeight: activeTab === 'all' ? 600 : 400 }}>
                Tất cả thông báo
              </span>
            ),
          },
          {
            key: 'unread',
            label: (
              <span style={{ fontSize: 15, fontWeight: activeTab === 'unread' ? 600 : 400 }}>
                Chưa đọc {unreadCount > 0 && <Badge count={unreadCount} overflowCount={99} style={{ marginLeft: 6, backgroundColor: '#ea580c' }} />}
              </span>
            ),
          },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* List */}
      {isLoading ? (
        <Card style={{ borderRadius: 12 }}>
          <Skeleton avatar active paragraph={{ rows: 3 }} />
          <Skeleton avatar active paragraph={{ rows: 3 }} style={{ marginTop: 24 }} />
        </Card>
      ) : notifications.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '40px 0' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: '#6b7280', fontSize: 15 }}>
                {activeTab === 'unread'
                  ? 'Tuyệt vời! Bạn không có thông báo chưa đọc nào.'
                  : 'Hiện bạn chưa có thông báo nào.'}
              </span>
            }
          >
            <Button
              type="primary"
              onClick={() => navigate('/san-pham')}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                border: 'none',
                marginTop: 8
              }}
            >
              Khám phá món ngon ngay
            </Button>
          </Empty>
        </Card>
      ) : (
        <Space orientation="vertical" size={14} style={{ width: '100%' }}>
          {notifications.map((item) => {
            const notifId = item.id || item.maThongBao;
            const isRead = item.daDoc;

            return (
              <Card
                key={notifId}
                hoverable
                style={{
                  borderRadius: 12,
                  border: isRead ? '1px solid #f3f4f6' : '1px solid #fed7aa',
                  borderLeft: isRead ? '4px solid #e5e7eb' : '4px solid #ea580c',
                  background: isRead ? '#ffffff' : '#fffaf5',
                  transition: 'all 0.2s ease',
                  boxShadow: isRead ? 'none' : '0 2px 8px rgba(234, 88, 12, 0.06)'
                }}
                bodyStyle={{ padding: '16px 20px' }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {getNotificationIcon(item)}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text strong style={{ fontSize: 16, color: isRead ? '#374151' : '#111827' }}>
                          {item.tieuDe}
                        </Text>
                        {!isRead && (
                          <Tag color="orange" style={{ borderRadius: 6, fontWeight: 600 }}>
                            Mới
                          </Tag>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9ca3af', fontSize: 13 }}>
                        <ClockCircleOutlined />
                        <span>{formatDate(item.ngayTao)}</span>
                      </div>
                    </div>

                    <Paragraph
                      style={{
                        margin: '8px 0 12px 0',
                        color: isRead ? '#6b7280' : '#374151',
                        fontSize: 14,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {item.noiDung}
                    </Paragraph>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      {isOrderRelated(item) && (
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => navigate('/don-hang')}
                          style={{ borderRadius: 6 }}
                        >
                          Xem đơn hàng
                        </Button>
                      )}

                      {!isRead && (
                        <Tooltip title="Đánh dấu đã đọc">
                          <Button
                            size="small"
                            type="dashed"
                            icon={<CheckOutlined />}
                            loading={markAsReadMutation.isPending && markAsReadMutation.variables === notifId}
                            onClick={() => handleMarkAsRead(notifId)}
                            style={{ borderRadius: 6, color: '#ea580c', borderColor: '#ea580c' }}
                          >
                            Đã đọc
                          </Button>
                        </Tooltip>
                      )}

                      <Popconfirm
                        title="Xóa thông báo"
                        description="Bạn có chắc chắn muốn xóa thông báo này?"
                        onConfirm={() => handleDelete(notifId)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <Tooltip title="Xóa thông báo">
                          <Button
                            size="small"
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            loading={deleteMutation.isPending && deleteMutation.variables === notifId}
                          />
                        </Tooltip>
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {totalCount > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={totalCount}
                onChange={(p) => setPage(p)}
                showTotal={(total) => `Tổng cộng ${total} thông báo`}
              />
            </div>
          )}
        </Space>
      )}
    </div>
  );
}

