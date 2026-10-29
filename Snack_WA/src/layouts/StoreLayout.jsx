import React from 'react';
import { Button, Dropdown, Input, Layout, Menu, Space, Typography, Badge, Tag, QRCode } from 'antd';
import { 
  BellOutlined, 
  LogoutOutlined, 
  SearchOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  HomeOutlined, 
  AppstoreOutlined,
  DashboardOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  GiftOutlined,
  OrderedListOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../shared/auth/authStore';
import { ROLES, roleLabels } from '../shared/constants/roles';
import { useCartQuery } from '../features/cart/hooks';
import { useUnreadCountQuery } from '../features/notifications/hooks';
import SessionTimerWidget from '../shared/components/SessionTimerWidget';

const { Header, Content, Footer } = Layout;

export default function StoreLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, clearSession } = useAuthStore();
  const role = user?.vaiTro || user?.role;
  const isCustomer = role === ROLES.KHACH_HANG;
  const { data: cartItems = [] } = useCartQuery({ enabled: Boolean(token && isCustomer) });
  const totalCartCount = Array.isArray(cartItems) ? cartItems.reduce((acc, item) => acc + (item.soLuong || 1), 0) : 0;
  const { data: unreadNotifCount = 0 } = useUnreadCountQuery({ enabled: Boolean(token) });
  const [showAppBanner, setShowAppBanner] = React.useState(true);

  React.useEffect(() => {
    if (token && role === ROLES.ADMIN) {
      navigate('/admin/nguoi-dung', { replace: true });
    }
  }, [token, role, navigate]);

  if (token && role === ROLES.ADMIN) {
    return null;
  }

  const accountMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Tài khoản của tôi' },
      { key: 'orders', icon: <AppstoreOutlined />, label: 'Đơn hàng đã đặt' },
      { 
        key: 'notifications', 
        icon: <BellOutlined />, 
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 140 }}>
            <span>Thông báo</span>
            {unreadNotifCount > 0 && (
              <Badge count={unreadNotifCount} overflowCount={99} size="small" style={{ backgroundColor: '#ea580c' }} />
            )}
          </div>
        )
      },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        clearSession();
        navigate('/');
      } else if (key === 'profile') {
        navigate('/tai-khoan');
      } else if (key === 'orders') {
        navigate('/don-hang');
      } else {
        navigate('/thong-bao');
      }
    },
  };

  const homeForRole = role === ROLES.ADMIN 
    ? '/admin/nguoi-dung' 
    : [ROLES.NHAN_VIEN, ROLES.QUAN_LY].includes(role) 
      ? '/van-hanh/don-hang' 
      : '/';

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: '/san-pham',
      icon: <AppstoreOutlined />,
      label: <Link to="/san-pham">Món ăn vặt</Link>,
    },
  ];

  return (
    <Layout className="store-layout">
      {/* Shopee-style Smart App Banner */}
      {showAppBanner && (
        <div style={{
          background: 'linear-gradient(90deg, #431407 0%, #7c2d12 100%)',
          color: '#ffffff',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          position: 'relative',
          zIndex: 1001,
          flexWrap: 'wrap',
          gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img 
              src="/logo.png" 
              alt="SnackShop App" 
              style={{ width: 34, height: 34, borderRadius: 8, background: '#fff', objectFit: 'contain', padding: 2 }} 
            />
            <div>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Trải nghiệm mượt hơn trên SnackShop App</span>
                <Tag color="orange" style={{ margin: 0, fontSize: '10px', padding: '0 5px', lineHeight: '16px', borderRadius: 4 }}>
                  Tặng Voucher 30K
                </Tag>
              </div>
              <div style={{ fontSize: '11px', color: '#fed7aa' }}>
                Tải ứng dụng Android APK để đặt món nhanh, theo dõi đơn và nhận ưu đãi độc quyền
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a 
              href="/downloads/snackshop.apk" 
              download="SnackShop.apk"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#ffffff',
                padding: '6px 16px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '12px',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>📲 Tải APK</span>
            </a>
            <Button 
              type="text" 
              size="small" 
              onClick={() => setShowAppBanner(false)}
              style={{ color: '#fed7aa', minWidth: 24, padding: 0, fontSize: '14px' }}
              title="Đóng thông báo"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <Header className="store-header">
        <Link className="brand-link" to="/">
          <img src="/logo.png" alt="Snack Shop Logo" className="brand-logo-img" />
          <div className="brand-text-wrap">
            <span className="brand-title">
              Snack<span className="brand-accent">Shop</span>
            </span>
            <span className="brand-tagline">Thế Giới Ăn Vặt</span>
          </div>
        </Link>

        <Menu 
          mode="horizontal" 
          selectedKeys={[location.pathname]} 
          items={menuItems}
        />

        {!token && (
        <div className="store-search">
          <Input
            placeholder="Tìm khô gà, bánh tráng, cơm cháy..."
            prefix={<SearchOutlined style={{ color: '#ea580c' }} />}
            onPressEnter={(event) => {
              if (event.target.value.trim()) {
                navigate(`/san-pham?q=${encodeURIComponent(event.target.value.trim())}`);
              }
            }}
          />
        </div>
        )}

        <Space size="middle">
          {role === ROLES.KHACH_HANG && (
            <Badge count={totalCartCount} offset={[-2, 4]} color="#ea580c">
              <Button 
                type="default" 
                icon={<ShoppingCartOutlined style={{ color: '#ea580c', fontSize: '18px' }} />} 
                onClick={() => navigate('/gio-hang')}
                style={{ borderRadius: 10, borderColor: '#fed7aa', fontWeight: 600 }}
              >
                Giỏ hàng
              </Button>
            </Badge>
          )}

          <Badge count={unreadNotifCount} overflowCount={99} offset={[-2, 4]} color="#ea580c">
            <Button 
              type="text" 
              shape="circle"
              icon={<BellOutlined style={{ fontSize: '19px', color: '#ea580c' }} />} 
              onClick={() => token ? navigate('/thong-bao') : navigate('/dang-nhap')} 
              title="Thông báo"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Badge>

          {token && <SessionTimerWidget />}

          {token ? (
            <Dropdown menu={accountMenu} placement="bottomRight">
              <Button 
                style={{ 
                  borderRadius: 10, 
                  background: '#fff7ed', 
                  borderColor: '#fed7aa',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <UserOutlined style={{ color: '#ea580c' }} />
                <span>{user?.hoTen || user?.ten || user?.email?.split('@')[0] || 'Tài khoản'}</span>
                {role && role !== ROLES.KHACH_HANG && (
                  <Tag color="orange" style={{ margin: 0, fontSize: '11px' }}>
                    {roleLabels[role] || role}
                  </Tag>
                )}
              </Button>
            </Dropdown>
          ) : (
            <Button 
              type="primary" 
              onClick={() => navigate('/dang-nhap')}
              style={{ 
                borderRadius: 10, 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
              }}
            >
              Đăng nhập
            </Button>
          )}

          {token && role !== ROLES.KHACH_HANG && (
            <Button 
              type="dashed"
              icon={<DashboardOutlined style={{ color: '#ea580c' }} />}
              onClick={() => navigate(homeForRole)}
              style={{ borderRadius: 10, borderColor: '#ea580c', color: '#ea580c', fontWeight: 600 }}
            >
              Vận hành
            </Button>
          )}
        </Space>
      </Header>

      {/* Main Content */}
      <Content className="store-content">
        <Outlet />
      </Content>

      {/* Branded Footer */}
      <Footer className="store-footer">
        {/* Trust Badges */}
        <div className="footer-trust-bar">
          <div className="trust-item">
            <div className="trust-icon-box">
              <ThunderboltOutlined style={{ color: '#fb923c' }} />
            </div>
            <div>
              <div className="trust-title">Giao Siêu Tốc 2H</div>
              <div className="trust-desc">Nội thành nhận đồ ăn vặt ngay</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <SafetyCertificateOutlined style={{ color: '#4ade80' }} />
            </div>
            <div>
              <div className="trust-title">Chuẩn An Toàn VSTP</div>
              <div className="trust-desc">Nguyên liệu chọn lọc, sạch sẽ 100%</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <SyncOutlined style={{ color: '#38bdf8' }} />
            </div>
            <div>
              <div className="trust-title">Đổi Trả Dễ Dàng</div>
              <div className="trust-desc">Hỗ trợ 24/7 nếu sản phẩm lỗi</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <GiftOutlined style={{ color: '#f472b6' }} />
            </div>
            <div>
              <div className="trust-title">Tích Điểm Nhận Quà</div>
              <div className="trust-desc">Nhiều voucher và khuyến mãi hot</div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="footer-main-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img src="/logo.png" alt="Logo" style={{ width: 52, height: 52 }} />
              <div>
                <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>
                  Snack<span style={{ color: '#4ade80' }}>Shop</span>
                </div>
                <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                  THẾ GIỚI ĂN VẶT
                </div>
              </div>
            </div>
            <Typography.Paragraph style={{ color: '#fed7aa', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 360 }}>
              Snack Shop là thiên đường đồ ăn vặt sạch, chuẩn vị với các món ăn vặt đặc sắc nhất: Khô gà lá chanh, Bánh tráng Tây Ninh, Cơm cháy chà bông, Rong biển cháy tỏi... Luôn đồng hành trong từng khoảnh khắc giải trí và làm việc của bạn.
            </Typography.Paragraph>
          </div>

          <div>
            <div className="footer-col-title">Món Ngon Nổi Bật</div>
            <ul className="footer-links">
              <li><Link to="/san-pham">Khô gà lá chanh</Link></li>
              <li><Link to="/san-pham">Bánh tráng phơi sương</Link></li>
              <li><Link to="/san-pham">Cơm cháy chà bông</Link></li>
              <li><Link to="/san-pham">Rong biển cháy tỏi</Link></li>
              <li><Link to="/san-pham">Món ăn vặt tuổi thơ</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Về Chúng Tôi</div>
            <ul className="footer-links">
              <li><Link to="/">Giới thiệu cửa hàng</Link></li>
              <li><Link to="/san-pham">Khuyến mãi đang chạy</Link></li>
              <li><Link to="/">Chính sách bảo mật</Link></li>
              <li><Link to="/">Điều khoản dịch vụ</Link></li>
              <li><Link to="/">Hợp tác phân phối</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Liên Hệ Đặt Hàng</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#fed7aa', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PhoneOutlined style={{ color: '#fb923c' }} />
                <span>Hotline: <strong style={{ color: '#fff' }}>0988 123 456</strong> (8h00 - 22h00)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MailOutlined style={{ color: '#fb923c' }} />
                <span>Email: contact@snackshop.vn</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <EnvironmentOutlined style={{ color: '#fb923c', marginTop: 4 }} />
                <span>Chi nhánh chính: Toà nhà Tri Thức, Khu Đô Thị ĐHQG, TP. Hồ Chí Minh</span>
              </div>
            </div>

            {/* Shopee-style App Download QR Block */}
            <div style={{ marginTop: 20 }}>
              <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📲 Tải ứng dụng SnackShop</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(254, 215, 170, 0.2)' }}>
                <div style={{ background: '#fff', padding: 3, borderRadius: 6, display: 'inline-flex' }}>
                  <QRCode value="/downloads/snackshop.apk" size={68} bordered={false} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>Quét mã để tải APK</div>
                  <div style={{ color: '#fed7aa', fontSize: '0.72rem', marginBottom: 6 }}>Android 8.0 trở lên</div>
                  <a 
                    href="/downloads/snackshop.apk" 
                    download="SnackShop.apk"
                    style={{
                      background: '#ea580c',
                      color: '#fff',
                      padding: '3px 10px',
                      borderRadius: 4,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Tải APK ngay
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} Snack Shop - Thế Giới Ăn Vặt. Tất cả quyền được bảo lưu.
        </div>
      </Footer>

      {/* Bottom Navigation for Mobile */}
      <BottomNav pathname={location.pathname} token={token} cartCount={totalCartCount} />
    </Layout>
  );
}

function BottomNav({ pathname, token, cartCount }) {
  const navigate = useNavigate();

  const navItems = [
    {
      key: 'home',
      label: 'Trang chủ',
      path: '/',
      icon: <HomeOutlined />,
      active: pathname === '/',
    },
    {
      key: 'menu',
      label: 'Thực đơn',
      path: '/san-pham',
      icon: <AppstoreOutlined />,
      active: pathname.startsWith('/san-pham'),
    },
    {
      key: 'cart',
      label: 'Giỏ hàng',
      path: '/gio-hang',
      icon: (
        <Badge count={cartCount} size="small" offset={[4, -4]} color="#ea580c">
          <ShoppingCartOutlined />
        </Badge>
      ),
      active: pathname.startsWith('/gio-hang'),
    },
    {
      key: 'orders',
      label: 'Đơn hàng',
      path: '/don-hang',
      icon: <OrderedListOutlined />,
      active: pathname.startsWith('/don-hang'),
    },
    {
      key: 'account',
      label: 'Tài khoản',
      path: token ? '/tai-khoan' : '/dang-nhap',
      icon: <UserOutlined />,
      active: pathname.startsWith('/tai-khoan') || pathname === '/dang-nhap' || pathname === '/dang-ky',
    },
  ];

  return (
    <nav className="bottom-nav-bar" aria-label="Thanh điều hướng di động">
      <div className="bottom-nav-inner">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav-item ${item.active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

