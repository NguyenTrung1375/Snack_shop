import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Spin } from 'antd';
import StoreLayout from '../layouts/StoreLayout';
import BackOfficeLayout from '../layouts/BackOfficeLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import RequireAuth from '../shared/auth/RequireAuth';
import RequireRole from '../shared/auth/RequireRole';
import { ROLES } from '../shared/constants/roles';
import ModulePage from '../shared/components/ModulePage';
import { ForbiddenPage, NotFoundPage } from '../pages/errors/ErrorPages';

const HomePage = lazy(() => import('../pages/store/HomePage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ProductListPage = lazy(() => import('../pages/store/ProductListPage'));
const ProductDetailPage = lazy(() => import('../pages/store/ProductDetailPage'));
const CombosPage = lazy(() => import('../pages/store/CombosPage'));
const ComboDetailPage = lazy(() => import('../pages/store/ComboDetailPage'));
const CartPage = lazy(() => import('../pages/store/CartPage'));
const CheckoutPage = lazy(() => import('../pages/store/CheckoutPage'));
const OrderHistoryPage = lazy(() => import('../pages/store/OrderHistoryPage'));
const ProfilePage = lazy(() => import('../pages/account/ProfilePage'));
const NotificationPage = lazy(() => import('../pages/store/NotificationPage'));
const UserListPage = lazy(() => import('../pages/admin/UserListPage'));
const UserDetailPage = lazy(() => import('../pages/admin/UserDetailPage'));

// Manager Pages
const ProductManagerPage = lazy(() => import('../pages/backoffice/ProductManagerPage'));
const CategoryManagerPage = lazy(() => import('../pages/backoffice/CategoryManagerPage'));
const PromotionManagerPage = lazy(() => import('../pages/backoffice/PromotionManagerPage'));
const SupplierManagerPage = lazy(() => import('../pages/backoffice/SupplierManagerPage'));
const ImportOrderManagerPage = lazy(() => import('../pages/backoffice/ImportOrderManagerPage'));
const LowStockManagerPage = lazy(() => import('../pages/backoffice/LowStockManagerPage'));
const ReportManagerPage = lazy(() => import('../pages/backoffice/ReportManagerPage'));
const OrderManagerPage = lazy(() => import('../pages/backoffice/OrderManagerPage'));
const InvoiceManagerPage = lazy(() => import('../pages/backoffice/InvoiceManagerPage'));
const EmployeeManagerPage = lazy(() => import('../pages/backoffice/EmployeeManagerPage'));

const Load = ({ children }) => <Suspense fallback={<div className="app-loading"><Spin size="large" /></div>}>{children}</Suspense>;
const Page = (props) => <ModulePage {...props} />;
const CustomerOnly = ({ children }) => <RequireAuth><RequireRole roles={[ROLES.KHACH_HANG, ROLES.NHAN_VIEN, ROLES.QUAN_LY]}>{children}</RequireRole></RequireAuth>;
const BackOfficeOnly = ({ children }) => <RequireAuth><RequireRole roles={[ROLES.NHAN_VIEN, ROLES.QUAN_LY]}>{children}</RequireRole></RequireAuth>;
const ManagerOnly = ({ children }) => <RequireAuth><RequireRole roles={[ROLES.QUAN_LY]}>{children}</RequireRole></RequireAuth>;
const AdminOnly = ({ children }) => <RequireAuth><RequireRole roles={[ROLES.ADMIN]}>{children}</RequireRole></RequireAuth>;

export default function AppRouter() {
  return <Routes>
    <Route element={<AuthLayout />}>
      <Route path="/dang-nhap" element={<Load><LoginPage /></Load>} />
      <Route path="/dang-ky" element={<Load><RegisterPage /></Load>} />
    </Route>
    
    <Route element={<StoreLayout />}>
      <Route index element={<Load><HomePage /></Load>} />
      <Route path="san-pham" element={<Load><ProductListPage /></Load>} />
      <Route path="san-pham/:id" element={<Load><ProductDetailPage /></Load>} />
      <Route path="combo" element={<Load><CombosPage /></Load>} />
      <Route path="combo/:id" element={<Load><ComboDetailPage /></Load>} />
      <Route path="gio-hang" element={<CustomerOnly><Load><CartPage /></Load></CustomerOnly>} />
      <Route path="thanh-toan" element={<CustomerOnly><Load><CheckoutPage /></Load></CustomerOnly>} />
      <Route path="don-hang" element={<CustomerOnly><Load><OrderHistoryPage /></Load></CustomerOnly>} />
      <Route path="don-hang/:id" element={<CustomerOnly><Page title="Chi tiết đơn hàng" description="Thông tin giao hàng, lịch sử, hóa đơn và đánh giá." api="GET /api/don-hang/:id" /></CustomerOnly>} />
      <Route path="tai-khoan" element={<RequireAuth><Load><ProfilePage /></Load></RequireAuth>} />
      <Route path="thong-bao" element={<RequireAuth><Load><NotificationPage /></Load></RequireAuth>} />
    </Route>
    
    <Route path="/van-hanh" element={<BackOfficeOnly><BackOfficeLayout /></BackOfficeOnly>}>
      <Route index element={<Navigate replace to="don-hang" />} />
      
      {/* Vận hành chung (Nhân viên, Quản lý) */}
      <Route path="don-hang" element={<Load><OrderManagerPage /></Load>} />
      <Route path="don-hang/:id" element={<Page title="Chi tiết đơn hàng" description="Thông tin xử lý và lịch sử trạng thái." api="GET /api/don-hang/:id" />} />
      <Route path="hoa-don" element={<Load><InvoiceManagerPage /></Load>} />
      
      {/* Quản lý chuyên sâu (Chỉ Quản lý) */}
      <Route path="san-pham" element={<ManagerOnly><Load><ProductManagerPage /></Load></ManagerOnly>} />
      <Route path="loai-san-pham" element={<ManagerOnly><Load><CategoryManagerPage /></Load></ManagerOnly>} />
      <Route path="khuyen-mai" element={<ManagerOnly><Load><PromotionManagerPage /></Load></ManagerOnly>} />
      <Route path="nha-cung-cap" element={<ManagerOnly><Load><SupplierManagerPage /></Load></ManagerOnly>} />
      <Route path="nhap-hang" element={<ManagerOnly><Load><ImportOrderManagerPage /></Load></ManagerOnly>} />
      <Route path="ton-kho" element={<ManagerOnly><Load><LowStockManagerPage /></Load></ManagerOnly>} />
      <Route path="bao-cao" element={<ManagerOnly><Load><ReportManagerPage /></Load></ManagerOnly>} />
      <Route path="nhan-vien" element={<ManagerOnly><Load><EmployeeManagerPage /></Load></ManagerOnly>} />
    </Route>
    
    <Route path="/admin" element={<AdminOnly><AdminLayout /></AdminOnly>}>
      <Route index element={<Navigate replace to="nguoi-dung" />} />
      <Route path="nguoi-dung" element={<Load><UserListPage /></Load>} />
      <Route path="nguoi-dung/:id" element={<Load><UserDetailPage /></Load>} />
    </Route>
    
    <Route path="/403" element={<ForbiddenPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
