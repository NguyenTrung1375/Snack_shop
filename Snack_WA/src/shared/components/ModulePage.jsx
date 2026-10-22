import { Alert, Card, Empty, Space, Typography } from 'antd';

export default function ModulePage({ title, description, api }) {
  return <Space direction="vertical" size="large" className="page-stack"><div><Typography.Title level={2}>{title}</Typography.Title><Typography.Text type="secondary">{description}</Typography.Text></div><Alert type="info" showIcon message="Skeleton đã sẵn sàng" description="Trang này đã có route, layout và phân quyền. Bước tiếp theo là gắn API, hook TanStack Query và component nghiệp vụ." /><Card><Empty description={api ? `Dự kiến kết nối ${api}` : 'Chưa có dữ liệu hiển thị'} /></Card></Space>;
}
