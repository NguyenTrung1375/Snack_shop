import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../constants/theme';
import {
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  updateOrderPayment,
  generateInvoice,
  cancelOrder,
  getInvoices,
  getInvoiceDetail,
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getImportOrders,
  getImportOrderDetail,
  createImportOrder,
  getLowStockReport,
  getMonthlyRevenueReport,
  getTopProductsReport,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../api/manager';
import {
  getProductThumbnail,
  getCategoryThumbnail,
  DEFAULT_SNACK_IMAGE,
} from '../constants/snackImages';

// Helper for Product Image URL
const getProductImage = (item) => {
  return getProductThumbnail(item);
};

const MODULE_TITLES = {
  don_hang: { title: 'Quản Lý Đơn Hàng', icon: '📦', badge: 'Realtime BE' },
  hoa_don: { title: 'Tra Cứu Hóa Đơn', icon: '🧾', badge: 'Đã phát hành' },
  san_pham: { title: 'Quản Lý Sản Phẩm', icon: '🍱', badge: 'Kho hàng' },
  loai_sp: { title: 'Loại Sản Phẩm', icon: '🏷️', badge: 'Danh mục' },
  khuyen_mai: { title: 'Khuyến Mãi & Voucher', icon: '🎁', badge: 'Chiến dịch' },
  nha_cung_cap: { title: 'Nhà Cung Cấp', icon: '🚚', badge: 'Đối tác' },
  nhap_hang: { title: 'Đơn Nhập Hàng', icon: '📥', badge: 'Phiếu nhập' },
  ton_kho: { title: 'Cảnh Báo Tồn Kho', icon: '⚠️', badge: 'Ngưỡng kho' },
  bao_cao: { title: 'Báo Cáo Thống Kê', icon: '📊', badge: 'Doanh thu' },
  nhan_vien: { title: 'Quản Lý Nhân Viên', icon: '👥', badge: 'Nhân sự' },
};

export default function ManagerModuleDetailModal({ visible, moduleKey, onClose, onOrderUpdated }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  // Accordion state for category tree (loaiCons)
  const [expandedCatIds, setExpandedCatIds] = useState(new Set());

  // CRUD Form Modal state
  const [crudModalVisible, setCrudModalVisible] = useState(false);
  const [crudAction, setCrudAction] = useState('create'); // 'create' | 'edit'
  const [crudModule, setCrudModule] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Aux data for pickers
  const [cachedCategories, setCachedCategories] = useState([]);
  const [cachedSuppliers, setCachedSuppliers] = useState([]);
  const [cachedProducts, setCachedProducts] = useState([]);

  // Generic Picker Modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerConfig, setPickerConfig] = useState({ title: '', options: [], onSelect: () => {} });

  const formatVnd = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const currentModule = MODULE_TITLES[moduleKey] || { title: 'Chi Tiết', icon: '⚙️', badge: '' };

  // Ensure helper data is ready for forms
  const ensureAuxData = useCallback(async () => {
    try {
      if (cachedCategories.length === 0) {
        const cats = await getCategories().catch(() => []);
        const raw = Array.isArray(cats) ? cats : (cats?.items || []);
        setCachedCategories(raw);
      }
      if (cachedSuppliers.length === 0) {
        const sups = await getSuppliers(1, 100).catch(() => ({ items: [] }));
        setCachedSuppliers(sups?.items || (Array.isArray(sups) ? sups : []));
      }
      if (cachedProducts.length === 0) {
        const prods = await getProducts({ page: 1, pageSize: 100 }).catch(() => ({ items: [] }));
        setCachedProducts(prods?.items || (Array.isArray(prods) ? prods : []));
      }
    } catch (e) {
      console.warn('Lỗi tải dữ liệu phụ trợ:', e);
    }
  }, [cachedCategories.length, cachedSuppliers.length, cachedProducts.length]);

  // Fetch data specifically for the chosen module
  const loadModuleData = useCallback(async () => {
    if (!moduleKey) return;
    setLoading(true);
    setSearchKeyword('');
    setSelectedItemDetail(null);

    try {
      if (moduleKey === 'don_hang') {
        const res = await getOrders({ page: 1, pageSize: 50 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        setDataList(items);
      } else if (moduleKey === 'hoa_don') {
        const res = await getInvoices({ page: 1, pageSize: 50 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        setDataList(items);
      } else if (moduleKey === 'san_pham') {
        const res = await getProducts({ page: 1, pageSize: 100 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        setDataList(items);
      } else if (moduleKey === 'loai_sp') {
        const res = await getCategories();
        const items = Array.isArray(res) ? res : (res?.items || []);
        setDataList(items);
      } else if (moduleKey === 'khuyen_mai') {
        const res = await getPromotions();
        const items = Array.isArray(res) ? res : (res?.items || []);
        setDataList(items);
      } else if (moduleKey === 'nha_cung_cap') {
        const res = await getSuppliers(1, 50);
        const items = res?.items || (Array.isArray(res) ? res : []);
        setDataList(items);
      } else if (moduleKey === 'nhap_hang') {
        const res = await getImportOrders(1, 50);
        const items = res?.items || (Array.isArray(res) ? res : []);
        setDataList(items);
      } else if (moduleKey === 'ton_kho') {
        const res = await getLowStockReport(1, 50);
        const items = res?.items || (Array.isArray(res) ? res : []);
        setDataList(items);
      } else if (moduleKey === 'bao_cao') {
        const [revRes, topRes] = await Promise.allSettled([
          getMonthlyRevenueReport(),
          getTopProductsReport(1, 10),
        ]);
        const rev = revRes.status === 'fulfilled' ? revRes.value : null;
        const top = topRes.status === 'fulfilled' ? topRes.value : null;
        setDataList({
          revenue: rev || [],
          topProducts: top?.items || (Array.isArray(top) ? top : []),
        });
      } else if (moduleKey === 'nhan_vien') {
        const res = await getEmployees(1, 50);
        const items = res?.items || (Array.isArray(res) ? res : []);
        setDataList(items);
      }
    } catch (err) {
      console.warn(`Lỗi khi tải dữ liệu cho module ${moduleKey}:`, err);
      setDataList(moduleKey === 'bao_cao' ? { revenue: [], topProducts: [] } : []);
    } finally {
      setLoading(false);
    }
  }, [moduleKey]);

  useEffect(() => {
    if (visible && moduleKey) {
      loadModuleData();
      ensureAuxData();
    }
  }, [visible, moduleKey, loadModuleData, ensureAuxData]);

  // Toggle Category Accordion / Dropdown
  const toggleExpandCategory = (id) => {
    setExpandedCatIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Cập nhật trạng thái đơn hàng trực tiếp
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus);
      Alert.alert('Thành công 🎉', `Đơn hàng đã được chuyển sang trạng thái: ${newStatus}`);
      setDataList((prev) =>
        Array.isArray(prev)
          ? prev.map((item) =>
              item.maDonHang === orderId || item.id === orderId
                ? { ...item, trangThaiDonHang: newStatus }
                : item
            )
          : prev
      );
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng';
      Alert.alert('Lỗi', msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // Xuất hóa đơn cho đơn hàng
  const handleGenerateInvoice = async (orderId) => {
    try {
      setUpdatingId(orderId);
      await generateInvoice(orderId);
      Alert.alert('Thành công 🎉', 'Đã xuất hóa đơn bán lẻ thành công cho đơn hàng!');
      loadModuleData();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể xuất hóa đơn cho đơn hàng này.';
      Alert.alert('Lỗi', msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // Bật / Tắt trạng thái bán của sản phẩm
  const handleToggleProductStatus = async (product) => {
    const isCurrentlyActive = product.trangThai === 'dang_ban' || product.trangThai === true || product.trangThai === undefined;
    const newStatus = isCurrentlyActive ? 'ngung_ban' : 'dang_ban';
    try {
      const id = product.maSanPham || product.id;
      setUpdatingId(id);
      await updateProductStatus(id, newStatus);
      Alert.alert(
        'Đã cập nhật',
        `Món "${product.tenSanPham}" hiện đang ở trạng thái: ${newStatus === 'dang_ban' ? 'Đang bật bán' : 'Tạm ngưng bán'}`
      );
      setDataList((prev) =>
        Array.isArray(prev)
          ? prev.map((p) =>
              (p.maSanPham === id || p.id === id)
                ? { ...p, trangThai: newStatus }
                : p
            )
          : prev
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể cập nhật trạng thái món ăn';
      Alert.alert('Lỗi', msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // Xóa mục dữ liệu
  const handleDeleteItem = (targetModule, item) => {
    const title =
      item.tenSanPham ||
      item.tenLoaiSanPham ||
      item.tenLoai ||
      item.tenNhaCungCap ||
      item.tenKhuyenMai ||
      item.hoTen ||
      'mục này';

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa "${title}" khỏi hệ thống không? Thao tác này sẽ cập nhật trực tiếp vào cơ sở dữ liệu.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const id =
                item.maSanPham ||
                item.maLoaiSanPham ||
                item.maNhaCungCap ||
                item.maCtkm ||
                item.maNguoiDung ||
                item.maNhanVien ||
                item.id;

              if (targetModule === 'loai_sp') {
                await deleteCategory(id);
              } else if (targetModule === 'san_pham') {
                await deleteProduct(id);
              } else if (targetModule === 'nha_cung_cap') {
                await deleteSupplier(id);
              } else if (targetModule === 'khuyen_mai') {
                await deletePromotion(id);
              } else if (targetModule === 'nhan_vien') {
                await deleteEmployee(id);
              }

              Alert.alert('Thành công 🎉', `Đã xóa "${title}" thành công!`);
              loadModuleData();
            } catch (err) {
              const msg = err.response?.data?.message || 'Không thể xóa mục này do đang có liên kết dữ liệu.';
              Alert.alert('Lỗi', msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Mở Form Thêm Mới
  const handleOpenCreate = (targetModule, extra = {}) => {
    setCrudModule(targetModule);
    setCrudAction('create');
    setEditingItem(null);

    ensureAuxData();

    if (targetModule === 'loai_sp') {
      setFormValues({
        tenLoaiSanPham: '',
        maLoaiCha: extra.maLoaiCha || null,
        tenLoaiCha: extra.tenLoaiCha || '',
        moTa: '',
      });
    } else if (targetModule === 'san_pham') {
      setFormValues({
        tenSanPham: '',
        maLoaiSanPham: extra.maLoaiSanPham || cachedCategories[0]?.maLoaiSanPham || '',
        donViTinh: 'gói',
        khoiLuong: '150g',
        giaBan: '25000',
        hinhAnhDaiDien: '',
        moTa: '',
      });
    } else if (targetModule === 'nha_cung_cap') {
      setFormValues({
        tenNhaCungCap: '',
        soDienThoai: '',
        email: '',
        diaChi: '',
      });
    } else if (targetModule === 'khuyen_mai') {
      setFormValues({
        tenKm: '',
        maCode: 'SNACK20',
        loaiGiamGia: 'phan_tram',
        giaTriGiam: '20',
        giaTriDonToiThieu: '100000',
        moTa: '',
      });
    } else if (targetModule === 'nhan_vien') {
      setFormValues({
        hoLot: 'Nguyễn Văn',
        ten: '',
        email: '',
        soDienThoai: '',
        matKhau: 'SnackShop@123',
        chucVu: 'Thu ngân',
        mucLuong: '7500000',
      });
    } else if (targetModule === 'nhap_hang') {
      setFormValues({
        maNhaCungCap: extra.maNhaCungCap || cachedSuppliers[0]?.maNhaCungCap || '',
        maSanPham: extra.maSanPham || cachedProducts[0]?.maSanPham || '',
        soLuongNhap: '50',
        donGiaNhap: '18000',
        ghiChu: 'Nhập kho định kỳ SnackShop',
      });
    }

    setCrudModalVisible(true);
  };

  // Mở Form Sửa
  const handleOpenEdit = (targetModule, item) => {
    setCrudModule(targetModule);
    setCrudAction('edit');
    setEditingItem(item);

    ensureAuxData();

    if (targetModule === 'loai_sp') {
      setFormValues({
        tenLoaiSanPham: item.tenLoaiSanPham || item.tenLoai || '',
        maLoaiCha: item.maLoaiCha || null,
        moTa: item.moTa || '',
      });
    } else if (targetModule === 'san_pham') {
      setFormValues({
        tenSanPham: item.tenSanPham || '',
        maLoaiSanPham: item.maLoaiSanPham || item.maLoai || '',
        donViTinh: item.donViTinh || 'gói',
        khoiLuong: item.khoiLuong || '',
        giaBan: String(item.giaBan || 0),
        hinhAnhDaiDien: item.hinhAnhDaiDien || item.hinhAnh || '',
        moTa: item.moTa || '',
      });
    } else if (targetModule === 'nha_cung_cap') {
      setFormValues({
        tenNhaCungCap: item.tenNhaCungCap || '',
        soDienThoai: item.soDienThoai || '',
        email: item.email || '',
        diaChi: item.diaChi || '',
      });
    } else if (targetModule === 'khuyen_mai') {
      setFormValues({
        tenKm: item.tenKm || item.tenKhuyenMai || '',
        maCode: item.maCode || item.maVoucher || '',
        loaiGiamGia: item.loaiGiamGia === 'so_tien' ? 'so_tien' : 'phan_tram',
        giaTriGiam: String(item.giaTriGiam || 20),
        giaTriDonToiThieu: String(item.giaTriDonToiThieu || item.donToiThieu || 0),
        moTa: item.moTa || '',
      });
    } else if (targetModule === 'nhan_vien') {
      setFormValues({
        hoLot: item.hoLot || 'Nhân viên',
        ten: item.ten || item.hoTen || '',
        email: item.email || '',
        soDienThoai: item.soDienThoai || item.sdt || '',
        chucVu: item.chucVu || 'Thu ngân',
        mucLuong: String(item.mucLuong || 0),
      });
    }

    setCrudModalVisible(true);
  };

  // Submit Form Lưu Thêm/Sửa
  const handleSaveCrud = async () => {
    try {
      setFormSubmitting(true);

      if (crudModule === 'loai_sp') {
        if (!formValues.tenLoaiSanPham?.trim()) {
          Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên loại sản phẩm.');
          return;
        }
        const payload = {
          tenLoaiSanPham: formValues.tenLoaiSanPham.trim(),
          maLoaiCha: formValues.maLoaiCha || null,
          moTa: formValues.moTa?.trim() || null,
        };

        if (crudAction === 'edit' && editingItem) {
          const id = editingItem.maLoaiSanPham || editingItem.id;
          await updateCategory(id, payload);
          Alert.alert('Thành công 🎉', 'Cập nhật loại sản phẩm thành công!');
        } else {
          await createCategory(payload);
          Alert.alert('Thành công 🎉', 'Thêm loại sản phẩm mới thành công!');
        }
      } else if (crudModule === 'san_pham') {
        if (!formValues.tenSanPham?.trim()) {
          Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên món ăn.');
          return;
        }
        if (!formValues.maLoaiSanPham) {
          Alert.alert('Thiếu thông tin', 'Vui lòng chọn loại sản phẩm.');
          return;
        }

        const payload = {
          tenSanPham: formValues.tenSanPham.trim(),
          maLoaiSanPham: formValues.maLoaiSanPham,
          donViTinh: (formValues.donViTinh || 'gói').trim(),
          khoiLuong: formValues.khoiLuong?.trim() || null,
          giaBan: Number(formValues.giaBan) || 0,
          hinhAnhDaiDien: formValues.hinhAnhDaiDien?.trim() || null,
          moTa: formValues.moTa?.trim() || null,
        };

        if (crudAction === 'edit' && editingItem) {
          const id = editingItem.maSanPham || editingItem.id;
          await updateProduct(id, payload);
          Alert.alert('Thành công 🎉', 'Cập nhật sản phẩm thành công!');
        } else {
          await createProduct(payload);
          Alert.alert('Thành công 🎉', 'Thêm sản phẩm mới vào thực đơn thành công!');
        }
      } else if (crudModule === 'nha_cung_cap') {
        if (!formValues.tenNhaCungCap?.trim()) {
          Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên nhà cung cấp.');
          return;
        }
        const payload = {
          tenNhaCungCap: formValues.tenNhaCungCap.trim(),
          soDienThoai: formValues.soDienThoai?.trim() || null,
          email: formValues.email?.trim() || null,
          diaChi: formValues.diaChi?.trim() || null,
        };

        if (crudAction === 'edit' && editingItem) {
          const id = editingItem.maNhaCungCap || editingItem.id;
          await updateSupplier(id, payload);
          Alert.alert('Thành công 🎉', 'Cập nhật nhà cung cấp thành công!');
        } else {
          await createSupplier(payload);
          Alert.alert('Thành công 🎉', 'Thêm nhà cung cấp mới thành công!');
        }
      } else if (crudModule === 'khuyen_mai') {
        if (!formValues.tenKm?.trim()) {
          Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên chương trình khuyến mãi.');
          return;
        }
        const now = new Date();
        const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 ngày

        const payload = {
          tenKm: formValues.tenKm.trim(),
          ngayBatDau: now.toISOString(),
          ngayKetThuc: end.toISOString(),
          loaiKhuyenMai: formValues.maCode ? 'voucher' : 'hoa_don',
        };

        if (formValues.maCode) {
          payload.khuyenMaiTheoVoucher = {
            tenKm: formValues.tenKm.trim(),
            maCode: formValues.maCode.trim().toUpperCase(),
            loaiGiamGia: formValues.loaiGiamGia || 'phan_tram',
            giaTriGiam: Number(formValues.giaTriGiam) || 0,
            giaTriDonToiThieu: Number(formValues.giaTriDonToiThieu) || 0,
            giamToiDa: 50000,
          };
        } else {
          payload.khuyenMaiTheoHoaDon = {
            tenKm: formValues.tenKm.trim(),
            loaiGiamGia: formValues.loaiGiamGia || 'phan_tram',
            giaTriGiam: Number(formValues.giaTriGiam) || 0,
            giaTriDonToiThieu: Number(formValues.giaTriDonToiThieu) || 0,
            giamToiDa: 50000,
          };
        }

        if (crudAction === 'edit' && editingItem) {
          const id = editingItem.maCtkm || editingItem.id;
          await updatePromotion(id, payload);
          Alert.alert('Thành công 🎉', 'Cập nhật khuyến mãi thành công!');
        } else {
          await createPromotion(payload);
          Alert.alert('Thành công 🎉', 'Tạo chương trình ưu đãi mới thành công!');
        }
      } else if (crudModule === 'nhan_vien') {
        if (!formValues.ten?.trim()) {
          Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên nhân viên.');
          return;
        }

        if (crudAction === 'edit' && editingItem) {
          const id = editingItem.maNguoiDung || editingItem.id;
          const payload = {
            hoLot: formValues.hoLot?.trim() || 'Nhân viên',
            ten: formValues.ten.trim(),
            soDienThoai: formValues.soDienThoai?.trim() || null,
            mucLuong: Number(formValues.mucLuong) || 0,
          };
          await updateEmployee(id, payload);
          Alert.alert('Thành công 🎉', 'Cập nhật nhân viên thành công!');
        } else {
          const payload = {
            hoLot: formValues.hoLot?.trim() || 'Nhân viên',
            ten: formValues.ten.trim(),
            email: formValues.email?.trim() || `nv_${Date.now()}@snackshop.local`,
            matKhau: formValues.matKhau || 'SnackShop@123',
            soDienThoai: formValues.soDienThoai?.trim() || null,
            mucLuong: Number(formValues.mucLuong) || 7500000,
          };
          await createEmployee(payload);
          Alert.alert('Thành công 🎉', 'Tạo tài khoản nhân viên mới thành công!');
        }
      } else if (crudModule === 'nhap_hang') {
        if (!formValues.maNhaCungCap) {
          Alert.alert('Thiếu thông tin', 'Vui lòng chọn nhà cung cấp.');
          return;
        }
        if (!formValues.maSanPham) {
          Alert.alert('Thiếu thông tin', 'Vui lòng chọn món ăn cần nhập kho.');
          return;
        }

        const payload = {
          maNhaCungCap: formValues.maNhaCungCap,
          ghiChu: formValues.ghiChu?.trim() || 'Phiếu nhập kho thực phẩm SnackShop',
          chiTiets: [
            {
              maSanPham: formValues.maSanPham,
              soLuongNhap: Number(formValues.soLuongNhap) || 50,
              donGiaNhap: Number(formValues.donGiaNhap) || 15000,
            },
          ],
        };

        await createImportOrder(payload);
        Alert.alert('Thành công 🎉', 'Tạo phiếu nhập kho thành công!');
      }

      setCrudModalVisible(false);
      loadModuleData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi xử lý dữ liệu máy chủ.';
      Alert.alert('Lỗi', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Helper mở Dropdown Picker
  const openPicker = (title, options, onSelect) => {
    setPickerConfig({ title, options, onSelect });
    setPickerVisible(true);
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredList = useMemo(() => {
    if (!Array.isArray(dataList)) return dataList;
    if (!searchKeyword.trim()) return dataList;
    const kw = searchKeyword.toLowerCase().trim();
    return dataList.filter((item) => {
      const textToSearch = [
        item.maCode,
        item.maDonHang,
        item.tenNguoiNhan,
        item.sdtNguoiNhan,
        item.soHoaDon,
        item.tenKhachHang,
        item.tenSanPham,
        item.tenLoai,
        item.tenLoaiSanPham,
        item.tenKhuyenMai,
        item.tenKm,
        item.maVoucher,
        item.maCode,
        item.tenNhaCungCap,
        item.maPhieu,
        item.hoTen,
        item.chucVu,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return textToSearch.includes(kw);
    });
  }, [dataList, searchKeyword]);

  // Status badge config for Orders
  const getStatusBadge = (status) => {
    switch (status) {
      case 'cho_xac_nhan':
        return { label: 'Chờ xác nhận', bg: '#fef3c7', color: '#b45309' };
      case 'da_xac_nhan':
        return { label: 'Đã xác nhận', bg: '#dbeafe', color: '#1d4ed8' };
      case 'dang_giao':
        return { label: 'Đang giao hàng', bg: '#e0e7ff', color: '#4338ca' };
      case 'da_giao':
        return { label: 'Đã giao thành công', bg: '#dcfce7', color: '#15803d' };
      case 'da_huy':
        return { label: 'Đã hủy đơn', bg: '#fee2e2', color: '#b91c1c' };
      default:
        return { label: status || 'Không rõ', bg: '#f3f4f6', color: '#4b5563' };
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.modalScreen, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1C0B04" />

        {/* TOP MODAL HEADER */}
        <View style={styles.topModalHeader}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 18 }}>{currentModule.icon}</Text>
                <Text style={styles.moduleHeaderTitle} numberOfLines={1}>
                  {currentModule.title}
                </Text>
              </View>
              <Text style={styles.moduleHeaderSubtitle}>
                Dữ liệu đồng bộ trực tiếp • Quản lý SnackShop
              </Text>
            </View>

            {/* Header Action: Add button & Refresh */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {['san_pham', 'loai_sp', 'nha_cung_cap', 'khuyen_mai', 'nhan_vien', 'nhap_hang'].includes(moduleKey) && (
                <TouchableOpacity
                  style={styles.headerAddBtn}
                  onPress={() => handleOpenCreate(moduleKey)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.headerAddBtnText}>+ Thêm</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.refreshIconBtn} onPress={loadModuleData} activeOpacity={0.7}>
                <Text style={{ fontSize: 16 }}>🔄</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search bar (except report) */}
          {moduleKey !== 'bao_cao' && (
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm mã, tên, số điện thoại..."
                placeholderTextColor="#9ca3af"
                value={searchKeyword}
                onChangeText={setSearchKeyword}
              />
              {searchKeyword.length > 0 && (
                <TouchableOpacity onPress={() => setSearchKeyword('')}>
                  <Text style={{ fontSize: 14, color: '#9ca3af', paddingHorizontal: 6 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* BODY CONTENT */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu {currentModule.title}...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
            {/* 1. MODULE: ĐƠN HÀNG (ORDERS) */}
            {moduleKey === 'don_hang' && (
              <View>
                <View style={styles.summaryBar}>
                  <Text style={styles.summaryBarText}>
                    Đang hiển thị: <Text style={{ fontWeight: '700', color: colors.primary }}>{filteredList?.length || 0}</Text> đơn hàng
                  </Text>
                </View>

                {filteredList?.map((order, idx) => {
                  const badge = getStatusBadge(order.trangThaiDonHang);
                  const isUpdating = updatingId === (order.maDonHang || order.id);

                  return (
                    <View key={order.maDonHang || idx} style={styles.cardItem}>
                      <View style={styles.cardItemHeader}>
                        <View>
                          <Text style={styles.itemCode}>📦 #{order.maCode || order.maDonHang?.slice(0, 8)}</Text>
                          <Text style={styles.itemCustomer}>
                            {order.tenNguoiNhan || 'Khách hàng'} • {order.sdtNguoiNhan || 'Không có SĐT'}
                          </Text>
                        </View>
                        <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.badgePillText, { color: badge.color }]}>{badge.label}</Text>
                        </View>
                      </View>

                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.infoLine}>
                          📍 <Text style={{ fontWeight: '700' }}>Địa chỉ:</Text> {order.diaChiGiaoHang || 'Tại quầy'}
                        </Text>
                        <Text style={styles.infoLine}>
                          💵 <Text style={{ fontWeight: '700' }}>Thanh toán:</Text>{' '}
                          {order.trangThaiThanhToan === 'da_thanh_toan' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'} (
                          {order.phuongThucThanhToan?.toUpperCase() || 'COD'})
                        </Text>
                        {order.ghiChu ? (
                          <Text style={styles.infoLine}>
                            📝 <Text style={{ fontWeight: '700' }}>Ghi chú:</Text> {order.ghiChu}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.cardDivider} />

                      <View style={styles.cardItemFooter}>
                        <View>
                          <Text style={styles.footerLabel}>Tổng thanh toán:</Text>
                          <Text style={styles.footerAmount}>{formatVnd(order.tongTienThanhToan)}</Text>
                        </View>

                        {/* Order Action Buttons */}
                        <View style={styles.orderActionsRow}>
                          {order.trangThaiDonHang === 'cho_xac_nhan' && (
                            <TouchableOpacity
                              style={[styles.actionBtn, { backgroundColor: '#16a34a' }]}
                              activeOpacity={0.8}
                              disabled={isUpdating}
                              onPress={() => handleUpdateOrderStatus(order.maDonHang || order.id, 'da_xac_nhan')}
                            >
                              {isUpdating ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <Text style={styles.actionBtnText}>✓ Duyệt đơn</Text>
                              )}
                            </TouchableOpacity>
                          )}

                          {order.trangThaiDonHang === 'da_xac_nhan' && (
                            <TouchableOpacity
                              style={[styles.actionBtn, { backgroundColor: '#2563eb' }]}
                              activeOpacity={0.8}
                              disabled={isUpdating}
                              onPress={() => handleUpdateOrderStatus(order.maDonHang || order.id, 'dang_giao')}
                            >
                              {isUpdating ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <Text style={styles.actionBtnText}>🚚 Giao hàng</Text>
                              )}
                            </TouchableOpacity>
                          )}

                          {order.trangThaiDonHang === 'dang_giao' && (
                            <TouchableOpacity
                              style={[styles.actionBtn, { backgroundColor: '#059669' }]}
                              activeOpacity={0.8}
                              disabled={isUpdating}
                              onPress={() => handleUpdateOrderStatus(order.maDonHang || order.id, 'da_giao')}
                            >
                              {isUpdating ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <Text style={styles.actionBtnText}>🏁 Hoàn tất</Text>
                              )}
                            </TouchableOpacity>
                          )}

                          {/* Xuất hóa đơn nếu đã hoàn tất giao hàng */}
                          {order.trangThaiDonHang === 'da_giao' && (
                            <TouchableOpacity
                              style={[styles.actionBtn, { backgroundColor: '#0284c7' }]}
                              activeOpacity={0.8}
                              disabled={isUpdating}
                              onPress={() => handleGenerateInvoice(order.maDonHang || order.id)}
                            >
                              <Text style={styles.actionBtnText}>🧾 Xuất HĐ</Text>
                            </TouchableOpacity>
                          )}

                          {order.trangThaiDonHang === 'cho_xac_nhan' && (
                            <TouchableOpacity
                              style={[styles.actionBtnOutline, { borderColor: '#ef4444' }]}
                              activeOpacity={0.8}
                              disabled={isUpdating}
                              onPress={() => handleUpdateOrderStatus(order.maDonHang || order.id, 'da_huy')}
                            >
                              <Text style={[styles.actionBtnOutlineText, { color: '#ef4444' }]}>Hủy đơn</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* 2. MODULE: HÓA ĐƠN (INVOICES) */}
            {moduleKey === 'hoa_don' && (
              <View>
                <View style={styles.summaryBar}>
                  <Text style={styles.summaryBarText}>
                    Tổng số hóa đơn: <Text style={{ fontWeight: '700', color: colors.primary }}>{filteredList?.length || 0}</Text> hóa đơn
                  </Text>
                </View>

                {filteredList?.map((invoice, idx) => (
                  <View key={invoice.soHoaDon || idx} style={styles.cardItem}>
                    <View style={styles.cardItemHeader}>
                      <View>
                        <Text style={[styles.itemCode, { color: '#0284c7' }]}>🧾 {invoice.soHoaDon}</Text>
                        <Text style={styles.itemSubtext}>Mã đơn liên kết: #{invoice.maCodeDonHang || invoice.maDonHang?.slice(0, 8)}</Text>
                      </View>
                      <View style={[styles.badgePill, { backgroundColor: '#e0f2fe' }]}>
                        <Text style={[styles.badgePillText, { color: '#0369a1' }]}>Đã xuất</Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.infoLine}>
                        👤 <Text style={{ fontWeight: '700' }}>Khách hàng:</Text> {invoice.tenKhachHang || 'Khách vãng lai'}
                      </Text>
                      <Text style={styles.infoLine}>
                        📅 <Text style={{ fontWeight: '700' }}>Ngày xuất:</Text>{' '}
                        {invoice.ngayLap ? new Date(invoice.ngayLap).toLocaleString('vi-VN') : 'Hôm nay'}
                      </Text>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardItemFooter}>
                      <Text style={styles.footerLabel}>Tổng tiền hóa đơn:</Text>
                      <Text style={[styles.footerAmount, { color: '#0284c7' }]}>{formatVnd(invoice.tongTien)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 3. MODULE: SẢN PHẨM (PRODUCTS) */}
            {moduleKey === 'san_pham' && (
              <View>
                <View style={styles.summaryBar}>
                  <Text style={styles.summaryBarText}>
                    Thực đơn ăn vặt: <Text style={{ fontWeight: '700', color: colors.primary }}>{filteredList?.length || 0}</Text> món
                  </Text>
                  <TouchableOpacity
                    style={styles.addBtnSmall}
                    onPress={() => handleOpenCreate('san_pham')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addBtnSmallText}>+ Thêm món mới</Text>
                  </TouchableOpacity>
                </View>

                {filteredList?.map((product, idx) => {
                  const isUpdating = updatingId === (product.maSanPham || product.id);
                  const isSelling = product.trangThai === 'dang_ban' || product.trangThai === true || product.trangThai === undefined;

                  return (
                    <View key={product.maSanPham || idx} style={styles.cardItem}>
                      <View style={styles.productRow}>
                        <View style={styles.productImageWrapper}>
                          <Image
                            source={{ uri: getProductImage(product) }}
                            style={styles.productThumbnail}
                            resizeMode="cover"
                          />
                        </View>

                        <View style={styles.productInfoCol}>
                          <View style={styles.productTitleRow}>
                            <Text style={styles.productItemTitle} numberOfLines={2}>
                              {product.tenSanPham}
                            </Text>
                            <View
                              style={[
                                styles.badgePill,
                                { backgroundColor: (product.soLuongTon ?? 0) > 10 ? '#dcfce7' : '#fee2e2' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.badgePillText,
                                  { color: (product.soLuongTon ?? 0) > 10 ? '#15803d' : '#b91c1c' },
                                ]}
                              >
                                Tồn: {product.soLuongTon ?? 0}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.productTagsRow}>
                            <View style={styles.categoryTag}>
                              <Text style={styles.categoryTagText}>
                                🏷️ {product.tenLoaiSanPham || product.loaiSanPham?.tenLoai || 'Ăn vặt'}
                              </Text>
                            </View>
                            {product.donViTinh && (
                              <View style={styles.unitTag}>
                                <Text style={styles.unitTagText}>⚖️ {product.donViTinh}</Text>
                              </View>
                            )}
                            {product.khoiLuong && (
                              <View style={[styles.unitTag, { backgroundColor: '#fef3c7' }]}>
                                <Text style={[styles.unitTagText, { color: '#b45309' }]}>{product.khoiLuong}</Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.productBottomRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                              <View style={[styles.statusDot, { backgroundColor: isSelling ? '#22c55e' : '#9ca3af' }]} />
                              <Text style={styles.statusLabelText}>
                                {isSelling ? 'Đang bật bán' : 'Tạm ngưng bán'}
                              </Text>
                            </View>
                            <Text style={styles.footerAmount}>{formatVnd(product.giaBan)}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Action Bar for Product */}
                      <View style={styles.itemActionFooter}>
                        <TouchableOpacity
                          style={[styles.actionBtnSmall, { backgroundColor: isSelling ? '#fef3c7' : '#dcfce7' }]}
                          onPress={() => handleToggleProductStatus(product)}
                          activeOpacity={0.7}
                          disabled={isUpdating}
                        >
                          <Text style={[styles.actionBtnSmallText, { color: isSelling ? '#b45309' : '#15803d' }]}>
                            {isSelling ? '⏸ Tắt bán' : '▶ Bật bán'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtnSmall, { backgroundColor: '#e0f2fe' }]}
                          onPress={() => handleOpenEdit('san_pham', product)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.actionBtnSmallText, { color: '#0369a1' }]}>✏️ Sửa</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtnSmall, { backgroundColor: '#fee2e2' }]}
                          onPress={() => handleDeleteItem('san_pham', product)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.actionBtnSmallText, { color: '#b91c1c' }]}>🗑️ Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* 4. MODULE: LOẠI SẢN PHẨM (CATEGORIES) CÓ DROPDOWN BIẾN THỂ CON */}
            {moduleKey === 'loai_sp' && (
              <View>
                <View style={styles.summaryBar}>
                  <Text style={styles.summaryBarText}>
                    Tổng số loại món: <Text style={{ fontWeight: '700', color: colors.primary }}>{filteredList?.length || 0}</Text> danh mục
                  </Text>
                  <TouchableOpacity
                    style={styles.addBtnSmall}
                    onPress={() => handleOpenCreate('loai_sp')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addBtnSmallText}>+ Thêm loại mới</Text>
                  </TouchableOpacity>
                </View>

                {filteredList?.map((cat, idx) => {
                  const catId = cat.maLoaiSanPham || cat.id || idx;
                  const hasChildren = Array.isArray(cat.loaiCons) && cat.loaiCons.length > 0;
                  const isExpanded = expandedCatIds.has(catId);

                  return (
                    <View key={catId} style={styles.cardItem}>
                      <View style={styles.cardItemHeader}>
                        <View style={styles.categoryThumbWrapper}>
                          <Image
                            source={{ uri: getCategoryThumbnail(cat) }}
                            style={styles.categoryThumbnail}
                            resizeMode="cover"
                          />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.itemCode}>🏷️ {cat.tenLoaiSanPham || cat.tenLoai || 'Loại sản phẩm'}</Text>
                            <View style={[styles.badgePill, { backgroundColor: cat.trangThai === 'ngung_hoat_dong' ? '#fee2e2' : '#dcfce7' }]}>
                              <Text style={[styles.badgePillText, { color: cat.trangThai === 'ngung_hoat_dong' ? '#b91c1c' : '#15803d' }]}>
                                {cat.trangThai === 'ngung_hoat_dong' ? 'Ngưng' : 'Hoạt động'}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.itemDescText}>{cat.moTa || 'Danh mục thức ăn vặt thơm ngon SnackShop'}</Text>

                          {/* Interactive Dropdown Button if category has child variants */}
                          {hasChildren && (
                            <TouchableOpacity
                              style={styles.dropdownToggleBtn}
                              onPress={() => toggleExpandCategory(catId)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.dropdownToggleText}>
                                {isExpanded ? '▲ Ẩn biến thể con' : `▼ Xem ${cat.loaiCons.length} biến thể con`}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {/* Action Row for Parent Category */}
                      <View style={styles.itemActionFooter}>
                        <TouchableOpacity
                          style={[styles.actionBtnSmall, { backgroundColor: '#dcfce7' }]}
                          onPress={() => handleOpenCreate('loai_sp', { maLoaiCha: catId, tenLoaiCha: cat.tenLoaiSanPham || cat.tenLoai })}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.actionBtnSmallText, { color: '#15803d' }]}>+ Thêm con</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtnSmall, { backgroundColor: '#e0f2fe' }]}
                          onPress={() => handleOpenEdit('loai_sp', cat)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.actionBtnSmallText, { color: '#0369a1' }]}>✏️ Sửa</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionBtnSmall, { backgroundColor: '#fee2e2' }]}
                          onPress={() => handleDeleteItem('loai_sp', cat)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.actionBtnSmallText, { color: '#b91c1c' }]}>🗑️ Xóa</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Dropdown Container displaying Child Variants (loaiCons) */}
                      {hasChildren && isExpanded && (
                        <View style={styles.expandedDropdownContainer}>
                          <Text style={styles.dropdownHeading}>Danh sách phân loại con:</Text>
                          {cat.loaiCons.map((sub, sIdx) => {
                            const subId = sub.maLoaiSanPham || sub.id || sIdx;
                            return (
                              <View key={subId} style={styles.childVariantRow}>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.childVariantTitle}>↳ {sub.tenLoaiSanPham || sub.tenLoai}</Text>
                                  {sub.moTa ? (
                                    <Text style={styles.childVariantDesc}>{sub.moTa}</Text>
                                  ) : null}
                                </View>
                                <View style={{ flexDirection: 'row', gap: 6 }}>
                                  <TouchableOpacity
                                    style={styles.miniActionBtn}
                                    onPress={() => handleOpenEdit('loai_sp', sub)}
                                    activeOpacity={0.7}
                                  >
                                    <Text style={styles.miniActionBtnText}>✏️</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[styles.miniActionBtn, { borderColor: '#fca5a5' }]}
                                    onPress={() => handleDeleteItem('loai_sp', sub)}
                                    activeOpacity={0.7}
                                  >
                                    <Text style={[styles.miniActionBtnText, { color: '#dc2626' }]}>🗑️</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* 5. MODULE: KHUYẾN MÃI & VOUCHER (PROMOTIONS) */}
            {moduleKey === 'khuyen_mai' && (
              <View>
                <View style={styles.summaryBar}>
                  <Text style={styles.summaryBarText}>
                    Tổng số chương trình: <Text style={{ fontWeight: '700', color: colors.primary }}>{filteredList?.length || 0}</Text> chiến dịch
                  </Text>
                  <TouchableOpacity
                    style={styles.addBtnSmall}
                    onPress={() => handleOpenCreate('khuyen_mai')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addBtnSmallText}>+ Thêm mã ưu đãi</Text>
                  </TouchableOpacity>
                </View>

                {filteredList?.map((promo, idx) => (
                  <View key={promo.id || promo.maCtkm || idx} style={styles.cardItem}>
                    <View style={styles.cardItemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productItemTitle}>🎁 {promo.tenKm || promo.tenKhuyenMai}</Text>
                        {(promo.maCode || promo.maVoucher) && (
                          <View style={styles.voucherCodeBox}>
                            <Text style={styles.voucherCodeText}>MÃ: {promo.maCode || promo.maVoucher}</Text>
                          </View>
                        )}
                      </View>
                      <View style={[styles.badgePill, { backgroundColor: '#ede9fe' }]}>
                        <Text style={[styles.badgePillText, { color: '#6d28d9' }]}>
                          {promo.trangThai || 'Đang áp dụng'}
                        </Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.infoLine}>
                        💵 <Text style={{ fontWeight: '700' }}>Mức ưu đãi:</Text>{' '}
                        {promo.loaiGiamGia === 'so_tien'
                          ? `Giảm ${formatVnd(promo.giaTriGiam)}`
                          : `Giảm ${promo.giaTriGiam || 20}%`}
                      </Text>
                      <Text style={styles.infoLine}>
                        🛒 <Text style={{ fontWeight: '700' }}>Đơn tối thiểu:</Text>{' '}
                        {formatVnd(promo.giaTriDonToiThieu || promo.donToiThieu)}
                      </Text>
                    </View>

                    {/* Action Bar for Promotion */}
                    <View style={styles.itemActionFooter}>
                      <TouchableOpacity
                        style={[styles.actionBtnSmall, { backgroundColor: '#e0f2fe' }]}
                        onPress={() => handleOpenEdit('khuyen_mai', promo)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.actionBtnSmallText, { color: '#0369a1' }]}>✏️ Sửa</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtnSmall, { backgroundColor: '#fee2e2' }]}
                        onPress={() => handleDeleteItem('khuyen_mai', promo)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.actionBtnSmallText, { color: '#b91c1c' }]}>🗑️ Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 6. MODULE: NHÀ CUNG CẤP (SUPPLIERS) */}
            {moduleKey === 'nha_cung_cap' && (
              <View>
                <View style={styles.summaryBar}>
                  <Text style={styles.summaryBarText}>
                    Đối tác cung ứng: <Text style={{ fontWeight: '700', color: colors.primary }}>{filteredList?.length || 0}</Text> nhà cung cấp
                  </Text>
                  <TouchableOpacity
                    style={styles.addBtnSmall}
                    onPress={() => handleOpenCreate('nha_cung_cap')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addBtnSmallText}>+ Thêm NCC</Text>
                  </TouchableOpacity>
                </View>

                {filteredList?.map((sup, idx) => (
                  <View key={sup.id || sup.maNhaCungCap || idx} style={styles.cardItem}>
                    <View style={styles.cardItemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productItemTitle}>🏢 {sup.tenNhaCungCap}</Text>
                        <Text style={styles.itemSubtext}>Người đại diện: {sup.nguoiLienHe || 'Trưởng đại diện'}</Text>
                      </View>
                      <View style={[styles.badgePill, { backgroundColor: '#eff6ff' }]}>
                        <Text style={[styles.badgePillText, { color: '#1d4ed8' }]}>Đối tác</Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.infoLine}>
                        📞 <Text style={{ fontWeight: '700' }}>Hotline:</Text> {sup.soDienThoai || 'Chưa cập nhật'}
                      </Text>
                      <Text style={styles.infoLine}>
                        ✉️ <Text style={{ fontWeight: '700' }}>Email:</Text> {sup.email || 'Chưa cập nhật'}
                      </Text>
                      <Text style={styles.infoLine}>
                        📍 <Text style={{ fontWeight: '700' }}>Địa chỉ:</Text> {sup.diaChi || 'TP.HCM'}
                      </Text>
                    </View>

                    {/* Action Bar for Supplier */}
                    <View style={styles.itemActionFooter}>
                      <TouchableOpacity
                        style={[styles.actionBtnSmall, { backgroundColor: '#e0f2fe' }]}
                        onPress={() => handleOpenEdit('nha_cung_cap', sup)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.actionBtnSmallText, { color: '#0369a1' }]}>✏️ Sửa</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtnSmall, { backgroundColor: '#fee2e2' }]}
                        onPress={() => handleDeleteItem('nha_cung_cap', sup)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.actionBtnSmallText, { color: '#b91c1c' }]}>🗑️ Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 7. MODULE: ĐƠN NHẬP HÀNG (IMPORT ORDERS) */}
            {moduleKey === 'nhap_hang' && (
              <View>
                <View style={styles.summaryBar}>
                  <Text style={styles.summaryBarText}>
                    Tổng số phiếu nhập: <Text style={{ fontWeight: '700', color: colors.primary }}>{filteredList?.length || 0}</Text> phiếu
                  </Text>
                  <TouchableOpacity
                    style={styles.addBtnSmall}
                    onPress={() => handleOpenCreate('nhap_hang')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addBtnSmallText}>+ Tạo phiếu nhập</Text>
                  </TouchableOpacity>
                </View>

                {filteredList?.map((receipt, idx) => (
                  <View key={receipt.maDonNhap || receipt.maPhieu || receipt.id || idx} style={styles.cardItem}>
                    <View style={styles.cardItemHeader}>
                      <View>
                        <Text style={[styles.itemCode, { color: '#4338ca' }]}>
                          📥 #{receipt.maDonNhap ? receipt.maDonNhap.slice(0, 8) : (receipt.maPhieu || `NH${idx + 1}`)}
                        </Text>
                        <Text style={styles.itemCustomer}>
                          Đối tác: {receipt.tenNhaCungCap || receipt.nhaCungCap || 'Đối tác nguồn hàng'}
                        </Text>
                      </View>
                      <View style={[styles.badgePill, { backgroundColor: '#dcfce7' }]}>
                        <Text style={[styles.badgePillText, { color: '#15803d' }]}>
                          {receipt.ngayNhapKho ? 'Đã nhập kho' : (receipt.trangThai || 'Đã nhập')}
                        </Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.infoLine}>
                        📅 <Text style={{ fontWeight: '700' }}>Thời gian:</Text>{' '}
                        {receipt.ngayNhapKho ? new Date(receipt.ngayNhapKho).toLocaleString('vi-VN') : 'Mới đây'}
                      </Text>
                      <Text style={styles.infoLine}>
                        📝 <Text style={{ fontWeight: '700' }}>Ghi chú:</Text> {receipt.ghiChu || 'Nhập kho thực phẩm'}
                      </Text>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardItemFooter}>
                      <Text style={styles.footerLabel}>Tổng giá trị nhập:</Text>
                      <Text style={[styles.footerAmount, { color: '#4338ca' }]}>
                        {formatVnd(receipt.tongTien || receipt.tongGiaTri)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 8. MODULE: CẢNH BÁO TỒN KHO (LOW STOCK) */}
            {moduleKey === 'ton_kho' && (
              <View>
                <View style={styles.summaryBar}>
                  <Text style={styles.summaryBarText}>
                    Cần nhập thêm: <Text style={{ fontWeight: '700', color: colors.primary }}>{filteredList?.length || 0}</Text> món dưới ngưỡng
                  </Text>
                </View>

                {filteredList?.map((stock, idx) => (
                  <View key={stock.id || stock.maSanPham || idx} style={styles.cardItem}>
                    <View style={styles.stockItemRow}>
                      <View style={styles.stockThumbWrapper}>
                        <Image
                          source={{ uri: getProductImage(stock) }}
                          style={styles.productThumbnail}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text style={[styles.productItemTitle, { flex: 1, marginRight: 6 }]} numberOfLines={2}>
                            {stock.tenSanPham}
                          </Text>
                          <View
                            style={[
                              styles.badgePill,
                              { backgroundColor: stock.soLuongTon <= 5 ? '#fee2e2' : '#fef3c7' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgePillText,
                                { color: stock.soLuongTon <= 5 ? '#b91c1c' : '#b45309', fontWeight: '800' },
                              ]}
                            >
                              Tồn: {stock.soLuongTon}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.itemSubtext}>
                          ĐVT: {stock.donViTinh || 'Hũ'} • Ngưỡng an toàn: 20
                        </Text>
                      </View>
                    </View>

                    {/* Action to quickly import this product */}
                    <View style={styles.itemActionFooter}>
                      <TouchableOpacity
                        style={[styles.actionBtnSmall, { backgroundColor: '#e0e7ff', flex: 1 }]}
                        onPress={() => handleOpenCreate('nhap_hang', { maSanPham: stock.maSanPham })}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.actionBtnSmallText, { color: '#4338ca', textAlign: 'center' }]}>
                          📥 Nhập thêm hàng ngay
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 9. MODULE: BÁO CÁO THỐNG KÊ (REPORTS) */}
            {moduleKey === 'bao_cao' && (
              <View>
                {(() => {
                  const revList = dataList?.revenue || [];
                  const topList = dataList?.topProducts || [];

                  return (
                    <>
                      <View style={styles.sectionTitleRow}>
                        <Text style={styles.sectionTitleModal}>📊 Doanh Thu Theo Tháng</Text>
                      </View>

                      {revList.length > 0 ? (
                        revList.map((m, idx) => (
                          <View key={m.thang || idx} style={styles.cardItem}>
                            <View style={styles.cardItemHeader}>
                              <View>
                                <Text style={styles.itemCode}>Tháng {m.thang}</Text>
                                <Text style={styles.itemSubtext}>Tổng số đơn hoàn tất: {m.soDon} đơn</Text>
                              </View>
                              <Text style={styles.footerAmount}>{formatVnd(m.doanhThu)}</Text>
                            </View>
                          </View>
                        ))
                      ) : (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                          <Text style={{ color: '#6b7280' }}>Chưa có báo cáo doanh thu theo tháng</Text>
                        </View>
                      )}

                      <View style={[styles.sectionTitleRow, { marginTop: 14 }]}>
                        <Text style={styles.sectionTitleModal}>🏆 Top Sản Phẩm Bán Chạy Nhất</Text>
                      </View>

                      {topList.length > 0 ? (
                        topList.map((prod, idx) => (
                          <View key={prod.maSanPham || idx} style={styles.cardItem}>
                            <View style={styles.cardItemHeader}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                <View style={[styles.rankCircle, { backgroundColor: idx === 0 ? '#ea580c' : '#475569' }]}>
                                  <Text style={styles.rankCircleText}>#{idx + 1}</Text>
                                </View>
                                <View style={styles.topProductThumbWrapper}>
                                  <Image
                                    source={{ uri: getProductImage(prod) }}
                                    style={styles.productThumbnail}
                                    resizeMode="cover"
                                  />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.productItemTitle} numberOfLines={1}>{prod.tenSanPham || prod.ten}</Text>
                                  <Text style={styles.itemSubtext}>
                                    Đã bán: {prod.tongSoLuongBan != null ? prod.tongSoLuongBan : (prod.soLuongBan || 0)} phần
                                  </Text>
                                </View>
                              </View>
                              <Text style={[styles.footerAmount, { fontSize: 14 }]}>
                                {formatVnd(prod.tongDoanhThu || prod.doanhThu)}
                              </Text>
                            </View>
                          </View>
                        ))
                      ) : (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                          <Text style={{ color: '#6b7280' }}>Chưa có sản phẩm bán chạy</Text>
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            )}

            {/* 10. MODULE: QUẢN LÝ NHÂN VIÊN (STAFF) */}
            {moduleKey === 'nhan_vien' && (
              <View>
                {(() => {
                  const staffList = Array.isArray(filteredList) ? filteredList : [];
                  const totalSalary = staffList.reduce((sum, emp) => sum + (Number(emp.mucLuong) || 0), 0);

                  return (
                    <>
                      <View style={styles.summaryBar}>
                        <Text style={styles.summaryBarText}>
                          Nhân sự: <Text style={{ fontWeight: '700', color: colors.primary }}>{staffList.length}</Text> người • Quỹ: {formatVnd(totalSalary)}/th
                        </Text>
                        <TouchableOpacity
                          style={styles.addBtnSmall}
                          onPress={() => handleOpenCreate('nhan_vien')}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.addBtnSmallText}>+ Thêm nhân sự</Text>
                        </TouchableOpacity>
                      </View>

                      {staffList.map((emp, idx) => {
                        const isManager = emp.vaiTro === 'quan_ly' || emp.vaiTro === 'admin';
                        const empName = emp.hoTen || `${emp.hoLot || ''} ${emp.ten || ''}`.trim() || 'Nhân viên';
                        const roleTitle = emp.vaiTro === 'admin' ? 'Admin' : emp.vaiTro === 'quan_ly' ? 'Quản lý' : (emp.chucVu || 'Nhân viên');

                        return (
                          <View key={emp.maNguoiDung || emp.id || idx} style={styles.cardItem}>
                            <View style={styles.cardItemHeader}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View
                                  style={[
                                    styles.empAvatar,
                                    { backgroundColor: isManager ? '#b91c1c' : '#2563eb' },
                                  ]}
                                >
                                  <Text style={styles.empAvatarText}>{isManager ? '👑' : 'NV'}</Text>
                                </View>
                                <View>
                                  <Text style={styles.productItemTitle}>{empName}</Text>
                                  <Text style={styles.itemSubtext}>Vị trí: {roleTitle}</Text>
                                </View>
                              </View>

                              <View style={[styles.badgePill, { backgroundColor: '#dcfce7' }]}>
                                <Text style={[styles.badgePillText, { color: '#15803d' }]}>{emp.trangThai || 'Hoạt động'}</Text>
                              </View>
                            </View>

                            <View style={{ marginTop: 8 }}>
                              <Text style={styles.infoLine}>
                                ✉️ <Text style={{ fontWeight: '700' }}>Email:</Text> {emp.email || 'Chưa có'}
                              </Text>
                              <Text style={styles.infoLine}>
                                📞 <Text style={{ fontWeight: '700' }}>Số điện thoại:</Text> {emp.soDienThoai || emp.sdt || 'Chưa có'}
                              </Text>
                              <Text style={styles.infoLine}>
                                💰 <Text style={{ fontWeight: '700' }}>Lương:</Text> {formatVnd(emp.mucLuong)}/tháng
                              </Text>
                            </View>

                            {/* Action Bar for Employee */}
                            <View style={styles.itemActionFooter}>
                              <TouchableOpacity
                                style={[styles.actionBtnSmall, { backgroundColor: '#e0f2fe' }]}
                                onPress={() => handleOpenEdit('nhan_vien', emp)}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.actionBtnSmallText, { color: '#0369a1' }]}>✏️ Sửa</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.actionBtnSmall, { backgroundColor: '#fee2e2' }]}
                                onPress={() => handleDeleteItem('nhan_vien', emp)}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.actionBtnSmallText, { color: '#b91c1c' }]}>🗑️ Xóa</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </>
                  );
                })()}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* =========================================================================
            UNIVERSAL CRUD FORM MODAL (THÊM / SỬA THEO CHUẨN WEB-APP)
        ========================================================================= */}
        <Modal
          visible={crudModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setCrudModalVisible(false)}
        >
          <View style={styles.crudModalOverlay}>
            <View style={styles.crudModalContainer}>
              {/* Modal Header */}
              <View style={styles.crudModalHeader}>
                <View>
                  <Text style={styles.crudModalTitle}>
                    {crudAction === 'create' ? '➕ Thêm mới' : '✏️ Cập nhật'}{' '}
                    {crudModule === 'loai_sp'
                      ? 'Loại Sản Phẩm'
                      : crudModule === 'san_pham'
                      ? 'Sản Phẩm'
                      : crudModule === 'nha_cung_cap'
                      ? 'Nhà Cung Cấp'
                      : crudModule === 'khuyen_mai'
                      ? 'Khuyến Mãi'
                      : crudModule === 'nhan_vien'
                      ? 'Nhân Viên'
                      : 'Phiếu Nhập Hàng'}
                  </Text>
                  <Text style={styles.crudModalSub}>Đồng bộ cơ sở dữ liệu SnackShop</Text>
                </View>
                <TouchableOpacity onPress={() => setCrudModalVisible(false)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 20, color: '#9ca3af' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.crudFormContent}>
                {/* 1. FORM LOẠI SẢN PHẨM */}
                {crudModule === 'loai_sp' && (
                  <View>
                    <Text style={styles.formFieldLabel}>Tên loại sản phẩm (*):</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="VD: Khô gà, Bánh tráng phơi sương, Da heo..."
                      placeholderTextColor="#9ca3af"
                      value={formValues.tenLoaiSanPham}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, tenLoaiSanPham: t }))}
                    />

                    <Text style={styles.formFieldLabel}>Thuộc loại cha (Dropdown):</Text>
                    <TouchableOpacity
                      style={styles.pickerSelectorBtn}
                      onPress={() => {
                        const options = [
                          { label: '-- Là danh mục gốc (không có cha) --', value: null },
                          ...cachedCategories
                            .filter((c) => !editingItem || (c.maLoaiSanPham || c.id) !== (editingItem.maLoaiSanPham || editingItem.id))
                            .map((c) => ({
                              label: `🏷️ ${c.tenLoaiSanPham || c.tenLoai}`,
                              value: c.maLoaiSanPham || c.id,
                            })),
                        ];
                        openPicker('Chọn loại cha', options, (val) => {
                          setFormValues((v) => ({ ...v, maLoaiCha: val }));
                        });
                      }}
                    >
                      <Text style={styles.pickerSelectorText}>
                        {formValues.maLoaiCha
                          ? `🏷️ ${cachedCategories.find((c) => (c.maLoaiSanPham || c.id) === formValues.maLoaiCha)?.tenLoaiSanPham || formValues.tenLoaiCha || 'Danh mục cha'}`
                          : '-- Là danh mục gốc (không có cha) --'}
                      </Text>
                      <Text style={styles.pickerSelectorArrow}>▼</Text>
                    </TouchableOpacity>

                    <Text style={styles.formFieldLabel}>Mô tả danh mục:</Text>
                    <TextInput
                      style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                      placeholder="Mô tả hương vị hoặc quy cách phân loại..."
                      placeholderTextColor="#9ca3af"
                      multiline
                      value={formValues.moTa}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, moTa: t }))}
                    />
                  </View>
                )}

                {/* 2. FORM SẢN PHẨM */}
                {crudModule === 'san_pham' && (
                  <View>
                    <Text style={styles.formFieldLabel}>Tên món ăn vặt (*):</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="VD: Bánh tráng bơ tép giòn, Khô gà lá chanh..."
                      placeholderTextColor="#9ca3af"
                      value={formValues.tenSanPham}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, tenSanPham: t }))}
                    />

                    <Text style={styles.formFieldLabel}>Loại sản phẩm (*):</Text>
                    <TouchableOpacity
                      style={styles.pickerSelectorBtn}
                      onPress={() => {
                        const options = cachedCategories.map((c) => ({
                          label: `🏷️ ${c.tenLoaiSanPham || c.tenLoai}`,
                          value: c.maLoaiSanPham || c.id,
                        }));
                        openPicker('Chọn loại sản phẩm', options, (val) => {
                          setFormValues((v) => ({ ...v, maLoaiSanPham: val }));
                        });
                      }}
                    >
                      <Text style={styles.pickerSelectorText}>
                        {cachedCategories.find((c) => (c.maLoaiSanPham || c.id) === formValues.maLoaiSanPham)?.tenLoaiSanPham ||
                          '-- Chọn loại món ăn --'}
                      </Text>
                      <Text style={styles.pickerSelectorArrow}>▼</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formFieldLabel}>Giá bán (VNĐ) (*):</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="25000"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={formValues.giaBan}
                          onChangeText={(t) => setFormValues((v) => ({ ...v, giaBan: t }))}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formFieldLabel}>Đơn vị tính:</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="gói, hũ, phần"
                          placeholderTextColor="#9ca3af"
                          value={formValues.donViTinh}
                          onChangeText={(t) => setFormValues((v) => ({ ...v, donViTinh: t }))}
                        />
                      </View>
                    </View>

                    <Text style={styles.formFieldLabel}>Khối lượng / Quy cách:</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="VD: 150g, 250g, 500g..."
                      placeholderTextColor="#9ca3af"
                      value={formValues.khoiLuong}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, khoiLuong: t }))}
                    />

                    <Text style={styles.formFieldLabel}>Đường dẫn ảnh sản phẩm (URL):</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="https://i.ibb.co/..."
                      placeholderTextColor="#9ca3af"
                      value={formValues.hinhAnhDaiDien}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, hinhAnhDaiDien: t }))}
                    />

                    {/* Live Preview Image */}
                    {formValues.hinhAnhDaiDien ? (
                      <View style={styles.previewImageContainer}>
                        <Image
                          source={{ uri: formValues.hinhAnhDaiDien }}
                          style={styles.previewImage}
                          resizeMode="cover"
                        />
                        <Text style={styles.previewLabel}>Xem trước ảnh</Text>
                      </View>
                    ) : null}

                    <Text style={styles.formFieldLabel}>Mô tả món ăn:</Text>
                    <TextInput
                      style={[styles.formInput, { height: 70, textAlignVertical: 'top' }]}
                      placeholder="Mô tả nguyên liệu, độ cay, hương vị..."
                      placeholderTextColor="#9ca3af"
                      multiline
                      value={formValues.moTa}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, moTa: t }))}
                    />
                  </View>
                )}

                {/* 3. FORM NHÀ CUNG CẤP */}
                {crudModule === 'nha_cung_cap' && (
                  <View>
                    <Text style={styles.formFieldLabel}>Tên nhà cung cấp (*):</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="VD: Nông Sản Sấy Tây Bắc, Xưởng Bánh Tráng..."
                      placeholderTextColor="#9ca3af"
                      value={formValues.tenNhaCungCap}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, tenNhaCungCap: t }))}
                    />

                    <Text style={styles.formFieldLabel}>Số điện thoại hotline:</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0901234567"
                      placeholderTextColor="#9ca3af"
                      keyboardType="phone-pad"
                      value={formValues.soDienThoai}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, soDienThoai: t }))}
                    />

                    <Text style={styles.formFieldLabel}>Email liên hệ:</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="ncc@snackshop.local"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      value={formValues.email}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, email: t }))}
                    />

                    <Text style={styles.formFieldLabel}>Địa chỉ kho / Trụ sở:</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Địa chỉ giao nhận nguồn hàng..."
                      placeholderTextColor="#9ca3af"
                      value={formValues.diaChi}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, diaChi: t }))}
                    />
                  </View>
                )}

                {/* 4. FORM KHUYẾN MÃI & VOUCHER */}
                {crudModule === 'khuyen_mai' && (
                  <View>
                    <Text style={styles.formFieldLabel}>Tên chương trình ưu đãi (*):</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="VD: Siêu Hội Ăn Vặt Giảm 20%"
                      placeholderTextColor="#9ca3af"
                      value={formValues.tenKm}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, tenKm: t }))}
                    />

                    <Text style={styles.formFieldLabel}>Mã Voucher (Để trống nếu giảm trực tiếp):</Text>
                    <TextInput
                      style={[styles.formInput, { textTransform: 'uppercase', fontWeight: '700' }]}
                      placeholder="VD: SNACK20, FREESHIP..."
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="characters"
                      value={formValues.maCode}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, maCode: t }))}
                    />

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formFieldLabel}>Mức giảm (*):</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="20"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={formValues.giaTriGiam}
                          onChangeText={(t) => setFormValues((v) => ({ ...v, giaTriGiam: t }))}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formFieldLabel}>Đơn tối thiểu (VNĐ):</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="100000"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={formValues.giaTriDonToiThieu}
                          onChangeText={(t) => setFormValues((v) => ({ ...v, giaTriDonToiThieu: t }))}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* 5. FORM NHÂN VIÊN */}
                {crudModule === 'nhan_vien' && (
                  <View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formFieldLabel}>Họ và lót:</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="Nguyễn Văn"
                          placeholderTextColor="#9ca3af"
                          value={formValues.hoLot}
                          onChangeText={(t) => setFormValues((v) => ({ ...v, hoLot: t }))}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formFieldLabel}>Tên (*):</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="Hùng"
                          placeholderTextColor="#9ca3af"
                          value={formValues.ten}
                          onChangeText={(t) => setFormValues((v) => ({ ...v, ten: t }))}
                        />
                      </View>
                    </View>

                    <Text style={styles.formFieldLabel}>Vị trí / Chức vụ:</Text>
                    <TouchableOpacity
                      style={styles.pickerSelectorBtn}
                      onPress={() => {
                        const options = [
                          { label: 'Thu ngân', value: 'Thu ngân' },
                          { label: 'Bếp / Pha chế', value: 'Bếp / Pha chế' },
                          { label: 'Quản lý ca', value: 'Quản lý ca' },
                          { label: 'Giao hàng', value: 'Giao hàng' },
                          { label: 'Kiểm kho', value: 'Kiểm kho' },
                        ];
                        openPicker('Chọn chức vụ', options, (val) => {
                          setFormValues((v) => ({ ...v, chucVu: val }));
                        });
                      }}
                    >
                      <Text style={styles.pickerSelectorText}>{formValues.chucVu || 'Thu ngân'}</Text>
                      <Text style={styles.pickerSelectorArrow}>▼</Text>
                    </TouchableOpacity>

                    <Text style={styles.formFieldLabel}>Mức lương tháng (VNĐ):</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="7500000"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      value={formValues.mucLuong}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, mucLuong: t }))}
                    />

                    <Text style={styles.formFieldLabel}>Số điện thoại:</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="0912345678"
                      placeholderTextColor="#9ca3af"
                      keyboardType="phone-pad"
                      value={formValues.soDienThoai}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, soDienThoai: t }))}
                    />

                    {crudAction === 'create' && (
                      <>
                        <Text style={styles.formFieldLabel}>Email đăng nhập (*):</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="nhanvien@snackshop.local"
                          placeholderTextColor="#9ca3af"
                          keyboardType="email-address"
                          value={formValues.email}
                          onChangeText={(t) => setFormValues((v) => ({ ...v, email: t }))}
                        />

                        <Text style={styles.formFieldLabel}>Mật khẩu khởi tạo:</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="SnackShop@123"
                          placeholderTextColor="#9ca3af"
                          secureTextEntry
                          value={formValues.matKhau}
                          onChangeText={(t) => setFormValues((v) => ({ ...v, matKhau: t }))}
                        />
                      </>
                    )}
                  </View>
                )}

                {/* 6. FORM NHẬP HÀNG */}
                {crudModule === 'nhap_hang' && (
                  <View>
                    <Text style={styles.formFieldLabel}>Nhà cung cấp (*):</Text>
                    <TouchableOpacity
                      style={styles.pickerSelectorBtn}
                      onPress={() => {
                        const options = cachedSuppliers.map((s) => ({
                          label: `🏢 ${s.tenNhaCungCap}`,
                          value: s.maNhaCungCap || s.id,
                        }));
                        openPicker('Chọn nhà cung cấp', options, (val) => {
                          setFormValues((v) => ({ ...v, maNhaCungCap: val }));
                        });
                      }}
                    >
                      <Text style={styles.pickerSelectorText}>
                        {cachedSuppliers.find((s) => (s.maNhaCungCap || s.id) === formValues.maNhaCungCap)?.tenNhaCungCap ||
                          '-- Chọn nhà cung cấp --'}
                      </Text>
                      <Text style={styles.pickerSelectorArrow}>▼</Text>
                    </TouchableOpacity>

                    <Text style={styles.formFieldLabel}>Món ăn vặt nhập kho (*):</Text>
                    <TouchableOpacity
                      style={styles.pickerSelectorBtn}
                      onPress={() => {
                        const options = cachedProducts.map((p) => ({
                          label: `🍱 ${p.tenSanPham} (${formatVnd(p.giaBan)})`,
                          value: p.maSanPham || p.id,
                        }));
                        openPicker('Chọn món ăn', options, (val) => {
                          setFormValues((v) => ({ ...v, maSanPham: val }));
                        });
                      }}
                    >
                      <Text style={styles.pickerSelectorText}>
                        {cachedProducts.find((p) => (p.maSanPham || p.id) === formValues.maSanPham)?.tenSanPham ||
                          '-- Chọn món ăn --'}
                      </Text>
                      <Text style={styles.pickerSelectorArrow}>▼</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formFieldLabel}>Số lượng nhập:</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="50"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={formValues.soLuongNhap}
                          onChangeText={(t) => setFormValues((v) => ({ ...v, soLuongNhap: t }))}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formFieldLabel}>Đơn giá nhập (VNĐ):</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder="15000"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          value={formValues.donGiaNhap}
                          onChangeText={(t) => setFormValues((v) => ({ ...v, donGiaNhap: t }))}
                        />
                      </View>
                    </View>

                    <Text style={styles.formFieldLabel}>Ghi chú đơn nhập:</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="Nhập kho bổ sung hàng bán tuần này..."
                      placeholderTextColor="#9ca3af"
                      value={formValues.ghiChu}
                      onChangeText={(t) => setFormValues((v) => ({ ...v, ghiChu: t }))}
                    />
                  </View>
                )}
              </ScrollView>

              {/* Form Buttons */}
              <View style={styles.crudModalFooter}>
                <TouchableOpacity
                  style={styles.crudCancelBtn}
                  onPress={() => setCrudModalVisible(false)}
                  disabled={formSubmitting}
                >
                  <Text style={styles.crudCancelBtnText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.crudSubmitBtn}
                  onPress={handleSaveCrud}
                  disabled={formSubmitting}
                >
                  {formSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.crudSubmitBtnText}>
                      {crudAction === 'create' ? '✓ Thêm mới ngay' : '✓ Lưu thay đổi'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* =========================================================================
            GENERIC PICKER MODAL (CHO DROPDOWN TRONG FORM)
        ========================================================================= */}
        <Modal
          visible={pickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setPickerVisible(false)}
          >
            <View style={styles.pickerContent}>
              <View style={styles.pickerHeaderRow}>
                <Text style={styles.pickerTitle}>{pickerConfig.title || 'Lựa chọn'}</Text>
                <TouchableOpacity onPress={() => setPickerVisible(false)}>
                  <Text style={{ fontSize: 18, color: '#9ca3af' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 360 }}>
                {pickerConfig.options?.map((opt, oIdx) => (
                  <TouchableOpacity
                    key={opt.value ?? oIdx}
                    style={styles.pickerOptionRow}
                    onPress={() => {
                      pickerConfig.onSelect(opt.value);
                      setPickerVisible(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalScreen: {
    flex: 1,
    backgroundColor: '#fff8f5',
  },
  topModalHeader: {
    backgroundColor: '#1C0B04',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#431407',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2a1207',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#431407',
  },
  backButtonText: {
    color: '#fed7aa',
    fontSize: 16,
    fontWeight: '800',
  },
  moduleHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  moduleHeaderSubtitle: {
    fontSize: 11,
    color: '#fed7aa',
    marginTop: 2,
  },
  headerAddBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerAddBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  refreshIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2a1207',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#431407',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1207',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 10,
    height: 38,
    borderWidth: 1,
    borderColor: '#431407',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    paddingVertical: 0,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    color: '#78350f',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollList: {
    padding: 14,
    paddingBottom: 40,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff1e8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  summaryBarText: {
    fontSize: 12,
    color: '#7c2d12',
    fontWeight: '600',
    flex: 1,
  },
  addBtnSmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  addBtnSmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  cardItem: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1c1917',
  },
  itemCustomer: {
    fontSize: 12,
    color: '#78350f',
    marginTop: 3,
    fontWeight: '600',
  },
  itemSubtext: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  itemDescText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 16,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoLine: {
    fontSize: 12,
    color: '#44403c',
    marginBottom: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f5ebe6',
    marginVertical: 10,
  },
  cardItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: 11,
    color: '#78716c',
  },
  footerAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  orderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnOutline: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350f',
  },
  itemActionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#fff1e8',
  },
  actionBtnSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtnSmallText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // PRODUCT ROW STYLES
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImageWrapper: {
    width: 68,
    height: 68,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffedd5',
    borderWidth: 1,
    borderColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productThumbnail: {
    width: '100%',
    height: '100%',
  },
  productInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  productTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1c1917',
  },
  productTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 10,
    color: '#c2410c',
    fontWeight: '700',
  },
  unitTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unitTagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabelText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '600',
  },
  // CATEGORY STYLES & DROPDOWN ACCORDION
  categoryThumbWrapper: {
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff1e8',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  categoryThumbnail: {
    width: '100%',
    height: '100%',
  },
  dropdownToggleBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  dropdownToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#c2410c',
  },
  expandedDropdownContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff8f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  dropdownHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c2d12',
    marginBottom: 6,
  },
  childVariantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#fed7aa',
  },
  childVariantTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c1917',
  },
  childVariantDesc: {
    fontSize: 11,
    color: '#78716c',
  },
  miniActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  miniActionBtnText: {
    fontSize: 12,
  },
  // VOUCHER / PROMOTIONS
  voucherCodeBox: {
    backgroundColor: '#ede9fe',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
  },
  voucherCodeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6d28d9',
  },
  // STOCK & ALERT
  stockItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockThumbWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  // REPORT
  sectionTitleRow: {
    marginBottom: 8,
  },
  sectionTitleModal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#431407',
  },
  rankCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankCircleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  topProductThumbWrapper: {
    width: 40,
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#ffedd5',
  },
  // EMPLOYEE
  empAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empAvatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  // ================= CRUD FORM MODAL STYLES =================
  crudModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  crudModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  crudModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  crudModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1c1917',
  },
  crudModalSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  crudFormContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  formFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
    marginTop: 10,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  pickerSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerSelectorText: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
    flex: 1,
  },
  pickerSelectorArrow: {
    fontSize: 10,
    color: '#64748b',
    marginLeft: 8,
  },
  previewImageContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  previewLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  crudModalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  crudCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crudCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  crudSubmitBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crudSubmitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  // GENERIC PICKER MODAL
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  pickerContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    maxHeight: 450,
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 8,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  pickerOptionRow: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  pickerOptionText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
});
