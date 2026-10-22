import React, { useState, useMemo } from 'react';
import { 
  Alert, 
  Button, 
  Card, 
  Col, 
  Empty, 
  Input, 
  Pagination, 
  Row, 
  Select, 
  Skeleton, 
  Space, 
  Typography, 
  Tag,
  Radio,
  Dropdown
} from 'antd';
import { 
  SearchOutlined, 
  ShoppingOutlined, 
  StarFilled, 
  FilterOutlined, 
  FireOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { useProductsQuery, useCategories } from '../../features/catalog/hooks';
import { formatVnd } from '../../shared/utils/formatters';

export default function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const currentCategory = params.get('cat') || '';
  const currentKeyword = params.get('q') || '';
  const currentSort = params.get('sort') || '';
  const currentPage = Number(params.get('page') || 1);

  const filters = { 
    keyword: currentKeyword || undefined, 
    maLoai: currentCategory || undefined,
    page: currentPage, 
    pageSize: 12, 
    sapXep: currentSort || undefined 
  };

  const { data, isLoading, isError, refetch } = useProductsQuery(filters);
  const { data: rawCategories = [] } = useCategories();

  // Structured hierarchy: parent categories and their child categories
  const categoryTree = useMemo(() => {
    return (rawCategories || []).map((cat) => ({
      id: cat.maLoaiSanPham || cat.id,
      name: cat.tenLoaiSanPham || cat.name,
      children: (cat.loaiCons || cat.children || []).map((sub) => ({
        id: sub.maLoaiSanPham || sub.id,
        name: sub.tenLoaiSanPham || sub.name,
      }))
    }));
  }, [rawCategories]);

  const update = (next) => {
    const combined = { ...Object.fromEntries(params), ...next };
    const clean = Object.fromEntries(
      Object.entries(combined).filter(([, value]) => value !== undefined && value !== '')
    );
    setParams(clean);
  };

  const items = data?.items || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Page Title & Search Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        border: '1px solid #fed7aa',
        borderRadius: 20,
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FireOutlined style={{ color: '#ea580c', fontSize: 20 }} />
            <Typography.Title level={2} style={{ margin: 0, color: '#431407', fontWeight: 800 }}>
              Thực Đơn Món Ăn Vặt
            </Typography.Title>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: '0.95rem' }}>
            Hàng trăm món ăn vặt thơm ngon giòn rụm đang chờ bạn thưởng thức!
          </Typography.Text>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            allowClear
            defaultValue={currentKeyword}
            placeholder="Tìm món ăn vặt..."
            prefix={<SearchOutlined style={{ color: '#ea580c' }} />}
            onPressEnter={(event) => update({ q: event.target.value.trim(), page: 1 })}
            style={{ width: 280, borderRadius: 10 }}
          />

          <Select
            value={currentSort || undefined}
            placeholder="Sắp xếp theo"
            allowClear
            onChange={(value) => update({ sort: value, page: 1 })}
            style={{ width: 190, borderRadius: 10 }}
            options={[
              { value: 'ban_chay', label: '🔥 Bán chạy nhất' },
              { value: 'gia_asc', label: '💵 Giá: Thấp đến Cao' },
              { value: 'gia_desc', label: '💰 Giá: Cao đến Thấp' },
              { value: 'danh_gia_cao', label: '⭐ Đánh giá cao' },
              { value: 'moi_nhat', label: '✨ Mới nhất lên trước' }
            ]}
          />
        </div>
      </div>

      {/* Category Filter with Hover Dropdown */}
      {categoryTree.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: '#78716c', marginRight: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FilterOutlined style={{ color: '#ea580c' }} /> Danh mục:
          </span>

          <Button
            type={!currentCategory ? 'primary' : 'default'}
            onClick={() => update({ cat: '', page: 1 })}
            style={{ 
              borderRadius: 20, 
              fontWeight: 600,
              boxShadow: !currentCategory ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'none'
            }}
          >
            Tất cả
          </Button>

          {categoryTree.map((parent) => {
            const hasChildren = parent.children && parent.children.length > 0;
            const isParentSelected = currentCategory === parent.id;
            const activeChild = hasChildren ? parent.children.find((c) => c.id === currentCategory) : null;
            const isSelected = isParentSelected || !!activeChild;

            if (!hasChildren) {
              return (
                <Button
                  key={parent.id}
                  type={isSelected ? 'primary' : 'default'}
                  onClick={() => update({ cat: parent.id, page: 1 })}
                  style={{ 
                    borderRadius: 20, 
                    fontWeight: 600,
                    boxShadow: isSelected ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'none'
                  }}
                >
                  {parent.name}
                </Button>
              );
            }

            const menuItems = [
              {
                key: `${parent.id}-all`,
                label: (
                  <div style={{ 
                    fontWeight: isParentSelected ? 700 : 500, 
                    color: isParentSelected ? '#ea580c' : '#292524',
                    padding: '3px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span>Tất cả {parent.name}</span>
                    {isParentSelected && <Tag color="orange" style={{ margin: 0, fontSize: 10 }}>Đang chọn</Tag>}
                  </div>
                ),
                onClick: () => update({ cat: parent.id, page: 1 }),
              },
              { type: 'divider' },
              ...parent.children.map((child) => {
                const isChildSelected = currentCategory === child.id;
                return {
                  key: child.id,
                  label: (
                    <div style={{ 
                      fontWeight: isChildSelected ? 700 : 500, 
                      color: isChildSelected ? '#ea580c' : '#4b5563',
                      padding: '3px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span>↳ {child.name}</span>
                      {isChildSelected && <Tag color="orange" style={{ margin: 0, fontSize: 10 }}>Đang chọn</Tag>}
                    </div>
                  ),
                  onClick: () => update({ cat: child.id, page: 1 }),
                };
              }),
            ];

            return (
              <Dropdown
                key={parent.id}
                menu={{ items: menuItems }}
                trigger={['hover']}
                placement="bottomLeft"
              >
                <Button
                  type={isSelected ? 'primary' : 'default'}
                  onClick={() => update({ cat: parent.id, page: 1 })}
                  style={{ 
                    borderRadius: 20, 
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: isSelected ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'none'
                  }}
                >
                  <span>
                    {activeChild ? `${parent.name}: ${activeChild.name}` : parent.name}
                  </span>
                  <DownOutlined style={{ fontSize: 10, color: isSelected ? '#fff' : '#78716c' }} />
                </Button>
              </Dropdown>
            );
          })}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <Row gutter={[20, 20]}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card style={{ borderRadius: 16 }}><Skeleton active /></Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Error state */}
      {isError && (
        <Alert 
          type="error" 
          showIcon 
          message="Không thể kết nối danh sách sản phẩm" 
          description="Vui lòng kiểm tra lại dịch vụ Backend C# hoặc thử lại sau vài giây."
          action={<Button size="small" type="primary" onClick={() => refetch()}>Tải lại</Button>} 
        />
      )}

      {/* Empty state */}
      {!isLoading && !isError && items.length === 0 && (
        <Card style={{ borderRadius: 20, textAlign: 'center', padding: '48px 16px', background: '#fff' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🍿</div>
          <Typography.Title level={4} style={{ color: '#9a3412', marginBottom: 6 }}>
            Chưa tìm thấy món ăn vặt phù hợp!
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ maxWidth: 440, margin: '0 auto 20px' }}>
            Hãy thử tìm bằng từ khóa khác hoặc xóa bộ lọc danh mục để khám phá tất cả các món ngon nhé.
          </Typography.Paragraph>
          <Button 
            type="primary" 
            onClick={() => setParams({})}
            style={{ borderRadius: 10, fontWeight: 700 }}
          >
            Xem toàn bộ món ăn
          </Button>
        </Card>
      )}

      {/* Product Grid */}
      {!isLoading && items.length > 0 && (
        <>
          <Row gutter={[20, 20]}>
            {items.map((product) => {
              const isLowStock = product.soLuongTon > 0 && product.soLuongTon <= 5;
              const isOutOfStock = product.soLuongTon === 0;

              return (
                <Col xs={24} sm={12} lg={6} key={product.maSanPham}>
                  <div className="snack-card">
                    <div className="snack-card-cover">
                      <span className={`snack-card-badge ${isOutOfStock ? '' : 'badge-green'}`}>
                        {isOutOfStock ? 'HẾT HÀNG' : isLowStock ? 'SẮP HẾT' : 'CHÍNH HÃNG'}
                      </span>
                      {product.hinhAnhDaiDien ? (
                        <img 
                          src={product.hinhAnhDaiDien} 
                          alt={product.tenSanPham} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                        />
                      ) : (
                        <span className="snack-card-emoji">🍘</span>
                      )}
                    </div>

                    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        {/* Dòng 1: Tag "Bán chạy" (nền cam chữ trắng, chỉ cho 3 sản phẩm bán nhiều nhất) + Tên sản phẩm */}
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#292524', marginBottom: 10, lineHeight: 1.4, minHeight: 44 }}>
                          {product.laBanChay && (
                            <span style={{
                              display: 'inline-block',
                              background: '#ea580c',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              marginRight: 6,
                              verticalAlign: 'middle',
                              lineHeight: '16px'
                            }}>
                              Bán chạy
                            </span>
                          )}
                          <span style={{ verticalAlign: 'middle' }}>{product.tenSanPham}</span>
                        </div>

                        {/* Dòng 2: Giá (nếu giảm hiện giá giảm, giá gốc nhỏ mờ, tag % giảm nền cam pastel) */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 8px', marginBottom: 10, minHeight: 28 }}>
                          {product.giaSauGiam && product.giaSauGiam < product.giaBan ? (
                            <>
                              <span style={{ color: '#ea580c', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>
                                {formatVnd(product.giaSauGiam)}
                              </span>
                              <span style={{ textDecoration: 'line-through', color: '#a8a29e', fontSize: '0.85rem' }}>
                                {formatVnd(product.giaBan)}
                              </span>
                              <span style={{
                                background: '#fff7ed',
                                color: '#ea580c',
                                border: '1px solid #fed7aa',
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}>
                                -{product.phanTramGiam || Math.round(((product.giaBan - product.giaSauGiam) / product.giaBan) * 100)}%
                              </span>
                            </>
                          ) : (
                            <span style={{ color: '#ea580c', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1 }}>
                              {formatVnd(product.giaBan)}
                            </span>
                          )}
                        </div>

                        {/* Dòng 3: Số sao đánh giá (trái) và số lượng bán được (phải đối diện) */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <StarFilled style={{ color: '#f59e0b', fontSize: 13 }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#444' }}>
                              {product.diemTrungBinh > 0 ? product.diemTrungBinh : '5.0'}
                            </span>
                          </div>
                          <span style={{ color: '#78716c', fontSize: '0.82rem' }}>
                            Đã bán {product.daBan || 0}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Link to={`/san-pham/${product.maSanPham}`}>
                          <Button 
                            type="primary" 
                            block 
                            icon={<ShoppingOutlined />}
                            style={{ 
                              borderRadius: 10, 
                              fontWeight: 700,
                              height: 38,
                              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                              border: 'none',
                              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
                            }}
                          >
                            Xem chi tiết món
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination 
              current={data.page || filters.page} 
              pageSize={data.pageSize || filters.pageSize} 
              total={data.totalCount} 
              showSizeChanger={false} 
              onChange={(page) => update({ page })} 
            />
          </div>
        </>
      )}
    </div>
  );
}
