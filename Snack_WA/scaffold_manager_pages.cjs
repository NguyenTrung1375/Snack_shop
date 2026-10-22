const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'ProductManagerPage', title: 'Quản lý sản phẩm', feature: 'catalog' },
  { name: 'CategoryManagerPage', title: 'Quản lý loại sản phẩm', feature: 'catalog' },
  { name: 'PromotionManagerPage', title: 'Quản lý khuyến mãi', feature: 'promotions' },
  { name: 'SupplierManagerPage', title: 'Nhà cung cấp', feature: 'inventory' },
  { name: 'ImportOrderManagerPage', title: 'Đơn nhập hàng', feature: 'inventory' },
  { name: 'LowStockManagerPage', title: 'Tồn kho (Sắp hết)', feature: 'inventory' },
  { name: 'ReportManagerPage', title: 'Báo cáo', feature: 'reports' },
  { name: 'OrderManagerPage', title: 'Đơn hàng', feature: 'orders' }
];

const dir = path.join(__dirname, 'src/pages/backoffice');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

pages.forEach(p => {
  const code = `import React from 'react';
import { Typography, Card, Table, Button, Space } from 'antd';

export default function ${p.name}() {
  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>${p.title}</Typography.Title>
        <Button type="primary">Thêm mới</Button>
      </Space>
      <Card bordered={false}>
        <Table dataSource={[]} columns={[{ title: 'ID', dataIndex: 'id' }]} locale={{ emptyText: 'Chưa có dữ liệu' }} />
      </Card>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(dir, `${p.name}.jsx`), code);
});
console.log('Generated manager pages');

