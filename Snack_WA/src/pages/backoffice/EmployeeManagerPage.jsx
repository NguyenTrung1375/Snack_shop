import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  message, 
  Popconfirm, 
  Typography, 
  Tag, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Tooltip,
  Empty,
  Avatar
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LockOutlined,
  UnlockOutlined,
  TeamOutlined, 
  UserOutlined, 
  DollarCircleOutlined, 
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  useEmployees, 
  useCreateEmployee, 
  useUpdateEmployee,
  useDeleteEmployee,
  useUpdateUserStatus 
} from '../../features/users/hooks';
import { useAuthStore } from '../../shared/auth/authStore';
import { ROLES } from '../../shared/constants/roles';

const { Title, Text } = Typography;

export default function EmployeeManagerPage() {
  const { user } = useAuthStore();
  const currentUserId = user?.maNguoiDung || user?.id;
  const currentRole = user?.vaiTro || user?.role;
  const isManager = currentRole === ROLES.QUAN_LY;

  const [params, setParams] = useState({ page: 1, pageSize: 20, keyword: '' });
  const [keywordInput, setKeywordInput] = useState('');
  
  const { data, isLoading, refetch } = useEmployees(params);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();

  const { mutate: createEmp, isPending: isCreating } = useCreateEmployee();
  const { mutate: updateEmp, isPending: isUpdating } = useUpdateEmployee();
  const { mutate: deleteEmp, isPending: isDeleting } = useDeleteEmployee();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUserStatus();

  const employeesList = useMemo(() => {
    return data?.items || (Array.isArray(data) ? data : []);
  }, [data]);

  const totalEmployees = data?.totalCount || employeesList.length;

  // Filter client-side keyword if searching
  const filteredEmployees = useMemo(() => {
    if (!keywordInput.trim()) return employeesList;
    const lower = keywordInput.toLowerCase().trim();
    return employeesList.filter((emp) => {
      const fullName = `${emp.hoLot || ''} ${emp.ten || ''}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const phone = (emp.soDienThoai || '').toLowerCase();
      return fullName.includes(lower) || email.includes(lower) || phone.includes(lower);
    });
  }, [employeesList, keywordInput]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalSalary = employeesList.reduce((acc, cur) => acc + (Number(cur.mucLuong) || 0), 0);
    const activeCount = employeesList.filter(e => e.trangThai === 'hoat_dong' || !e.trangThai).length;
    return { totalSalary, activeCount };
  }, [employeesList]);

  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee);
    if (employee) {
      form.setFieldsValue({
        hoLot: employee.hoLot,
        ten: employee.ten,
        email: employee.email,
        soDienThoai: employee.soDienThoai,
        mucLuong: employee.mucLuong,
        ngayVaoLam: employee.ngayVaoLam ? dayjs(employee.ngayVaoLam) : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        mucLuong: 7000000,
        ngayVaoLam: dayjs(),
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    const payload = {
      hoLot: values.hoLot.trim(),
      ten: values.ten.trim(),
      email: values.email?.trim().toLowerCase(),
      soDienThoai: values.soDienThoai?.trim() || null,
      mucLuong: Number(values.mucLuong) || 0,
      ngayVaoLam: values.ngayVaoLam ? values.ngayVaoLam.format('YYYY-MM-DD') : null,
    };

    if (editingEmployee) {
      const empId = editingEmployee.maNguoiDung || editingEmployee.id;
      const updatePayload = {
        hoLot: payload.hoLot,
        ten: payload.ten,
        soDienThoai: payload.soDienThoai,
        mucLuong: payload.mucLuong,
        ngayVaoLam: payload.ngayVaoLam,
      };

      updateEmp(
        { id: empId, ...updatePayload },
        {
          onSuccess: () => {
            message.success('Cập nhật thông tin nhân viên thành công!');
            handleCloseModal();
          },
          onError: (err) => {
            const errorMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi cập nhật.';
            message.error(errorMsg);
          },
        }
      );
    } else {
      payload.matKhau = values.matKhau;
      createEmp(payload, {
        onSuccess: () => {
          message.success('Thêm nhân viên mới thành công!');
          handleCloseModal();
        },
        onError: (err) => {
          const errorMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi thêm nhân viên.';
          message.error(errorMsg);
        },
      });
    }
  };

  const handleDelete = (id) => {
    deleteEmp(id, {
      onSuccess: () => message.success('Xóa nhân viên thành công!'),
      onError: (err) => {
        const errorMsg = err?.response?.data?.message || err?.message || 'Không thể xóa nhân viên này.';
        message.error(errorMsg);
      },
    });
  };

  const handleToggleStatus = (record) => {
    const targetId = record.maNguoiDung || record.id;
    const isCurrentlyActive = record.trangThai === 'hoat_dong' || !record.trangThai;
    const newStatus = isCurrentlyActive ? 'ngung_hoat_dong' : 'hoat_dong';

    updateStatus(
      { id: targetId, trangThai: newStatus },
      {
        onSuccess: () => {
          message.success(isCurrentlyActive ? 'Đã khóa tài khoản nhân viên!' : 'Đã mở khóa tài khoản nhân viên!');
        },
        onError: (err) => {
          const errorMsg = err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái tài khoản.';
          message.error(errorMsg);
        }
      }
    );
  };

  const columns = [
    { 
      title: 'Mã NV', 
      key: 'id', 
      width: 120,
      render: (_, r) => {
        const rawId = r.maNguoiDung || r.id;
        return (
          <Tooltip title={rawId}>
            <Tag color="orange" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
              #{rawId ? rawId.slice(0, 8).toUpperCase() : 'N/A'}
            </Tag>
          </Tooltip>
        );
      }
    },
    { 
      title: 'Nhân sự', 
      key: 'hoTen', 
      render: (_, r) => {
        const isManagerRole = r.vaiTro === 'quan_ly';
        const isAdminRole = r.vaiTro === 'admin';
        return (
          <Space>
            <Avatar style={{ backgroundColor: isAdminRole ? '#dc2626' : isManagerRole ? '#2563eb' : '#f97316' }} icon={<UserOutlined />}>
              {(r.ten || '').slice(0, 1).toUpperCase()}
            </Avatar>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>
                  {r.hoTen || `${r.hoLot || ''} ${r.ten || ''}`.trim()}
                </Text>
                {isAdminRole && <Tag color="red" style={{ fontSize: '11px', margin: 0 }}>Quản trị viên</Tag>}
                {isManagerRole && <Tag color="blue" style={{ fontSize: '11px', margin: 0 }}>Quản lý</Tag>}
                {!isAdminRole && !isManagerRole && <Tag color="cyan" style={{ fontSize: '11px', margin: 0 }}>Nhân viên</Tag>}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>{r.email}</Text>
            </div>
          </Space>
        );
      }
    },
    { 
      title: 'Số điện thoại', 
      dataIndex: 'soDienThoai', 
      key: 'soDienThoai',
      width: 130,
      render: (val) => val || <Text type="secondary">Chưa có</Text>
    },
    { 
      title: 'Mức lương', 
      dataIndex: 'mucLuong', 
      key: 'mucLuong',
      width: 150,
      render: (val) => (
        <Text strong style={{ color: '#ea580c', fontSize: '14px' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)}
        </Text>
      )
    },
    {
      title: 'Ngày vào làm',
      dataIndex: 'ngayVaoLam',
      key: 'ngayVaoLam',
      width: 130,
      render: (val) => val ? dayjs(val).format('DD/MM/YYYY') : <Text type="secondary">Chưa có</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (status) => {
        if (status === 'ngung_hoat_dong' || status === 'bi_khoa') {
          return <Tag color="error">🔴 Đã khóa</Tag>;
        }
        return <Tag color="success">🟢 Đang làm việc</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 170,
      render: (_, record) => {
        const targetId = record.maNguoiDung || record.id;
        const isSelf = targetId === currentUserId;
        const isTargetManager = record.vaiTro === 'quan_ly';
        const isTargetAdmin = record.vaiTro === 'admin';

        // Quy tắc bảo vệ: Quản lý không được sửa / khóa / xóa tài khoản cùng cấp quản lý hoặc admin
        const cannotModify = isManager && (isTargetAdmin || (isTargetManager && !isSelf));
        const isLocked = record.trangThai === 'ngung_hoat_dong' || record.trangThai === 'bi_khoa';

        return (
          <Space size="small">
            {/* Nút Sửa */}
            {cannotModify ? (
              <Tooltip title="Không được phép sửa tài khoản cùng cấp quản lý">
                <Button type="text" disabled icon={<EditOutlined />} />
              </Tooltip>
            ) : (
              <Tooltip title="Chỉnh sửa thông tin">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => handleOpenModal(record)}
                  style={{ color: '#2563eb' }}
                />
              </Tooltip>
            )}

            {/* Nút Khóa / Mở Khóa */}
            {cannotModify ? (
              <Tooltip title="Không thể khóa tài khoản cùng cấp quản lý">
                <Button type="text" disabled icon={<LockOutlined />} />
              </Tooltip>
            ) : isLocked ? (
              <Popconfirm
                title="Mở khóa tài khoản?"
                description={`Cho phép nhân viên "${record.hoTen}" đăng nhập lại vào hệ thống.`}
                onConfirm={() => handleToggleStatus(record)}
                okText="Mở khóa"
                cancelText="Hủy"
              >
                <Tooltip title="Mở khóa tài khoản">
                  <Button 
                    type="text" 
                    icon={<UnlockOutlined />} 
                    loading={isUpdatingStatus}
                    style={{ color: '#10b981' }}
                  />
                </Tooltip>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Khóa tài khoản nhân viên?"
                description={`Nhân viên "${record.hoTen}" sẽ bị vô hiệu hóa quyền đăng nhập.`}
                onConfirm={() => handleToggleStatus(record)}
                okText="Khóa ngay"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Khóa tài khoản">
                  <Button 
                    type="text" 
                    icon={<LockOutlined />} 
                    loading={isUpdatingStatus}
                    style={{ color: '#f97316' }}
                  />
                </Tooltip>
              </Popconfirm>
            )}

            {/* Nút Xóa */}
            {cannotModify ? (
              <Tooltip title="Không thể xóa tài khoản cùng cấp quản lý">
                <Button type="text" disabled icon={<DeleteOutlined />} />
              </Tooltip>
            ) : (
              <Popconfirm 
                title="Xác nhận xóa nhân viên?" 
                description={`Tài khoản và thông tin nhân viên "${record.hoTen}" sẽ bị xóa vĩnh viễn.`}
                onConfirm={() => handleDelete(targetId)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Xóa nhân viên">
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    loading={isDeleting} 
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#9a3412', fontWeight: 800 }}>
            Quản lý Nhân sự & Nhân viên
          </Title>
          <Text type="secondary">
            Danh sách nhân viên bán hàng, quản lý kho và quản lý trạng thái tài khoản của Snack Shop
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Làm mới
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => handleOpenModal()}
            size="large"
            style={{ 
              borderRadius: 10, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
            }}
          >
            Thêm nhân viên mới
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Tổng số nhân sự"
              value={totalEmployees}
              prefix={<TeamOutlined style={{ color: '#2563eb' }} />}
              suffix="nhân viên"
              valueStyle={{ fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Đang làm việc"
              value={stats.activeCount}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              suffix="người"
              valueStyle={{ color: '#059669', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Tổng quỹ lương tháng"
              value={stats.totalSalary}
              prefix={<DollarCircleOutlined style={{ color: '#ea580c' }} />}
              formatter={(val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
              valueStyle={{ color: '#ea580c', fontWeight: 800 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table Card */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(124, 45, 18, 0.04)' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Input
            placeholder="Tìm theo họ tên, email hoặc số điện thoại..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            allowClear
            style={{ width: 360, borderRadius: 8 }}
          />
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Hiển thị <Text strong>{filteredEmployees.length}</Text> / {totalEmployees} nhân sự
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey={(record) => record.maNguoiDung || record.id}
          loading={isLoading}
          locale={{ emptyText: <Empty description="Chưa có nhân viên nào trong danh sách." /> }}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total: totalEmployees,
            onChange: (page, pageSize) => setParams((p) => ({ ...p, page, pageSize })),
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50']
          }}
        />
      </Card>

      {/* Modal Thêm / Sửa Nhân viên */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#ea580c', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 700 }}>
              {editingEmployee ? 'Chỉnh sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
            </span>
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
        okText={editingEmployee ? 'Lưu thay đổi' : 'Tạo tài khoản nhân viên'}
        cancelText="Hủy bỏ"
        width={650}
        destroyOnClose
        okButtonProps={{
          size: 'large',
          style: {
            borderRadius: 8,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            border: 'none',
          }
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="hoLot" 
                label={<Text strong>Họ lót</Text>} 
                rules={[{ required: true, message: 'Vui lòng nhập họ lót' }]}
              >
                <Input placeholder="VD: Nguyễn Văn" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="ten" 
                label={<Text strong>Tên</Text>} 
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="VD: An" size="large" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item 
            name="email" 
            label={<Text strong>Email đăng nhập</Text>} 
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không đúng định dạng' }
            ]}
          >
            <Input 
              placeholder="VD: an.nguyen@snackshop.vn" 
              size="large" 
              disabled={!!editingEmployee} 
            />
          </Form.Item>
          
          {!editingEmployee && (
            <Form.Item 
              name="matKhau" 
              label={<Text strong>Mật khẩu khởi tạo</Text>} 
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
              ]}
            >
              <Input.Password placeholder="Tối thiểu 6 ký tự..." size="large" />
            </Form.Item>
          )}
          
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="soDienThoai" 
                label={<Text strong>Số điện thoại</Text>}
              >
                <Input placeholder="VD: 0987654321" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="ngayVaoLam" 
                label={<Text strong>Ngày vào làm</Text>}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item 
            name="mucLuong" 
            label={<Text strong>Mức lương cơ bản (VNĐ)</Text>} 
            rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              size="large"
              min={0}
              step={500000}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VNĐ"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
