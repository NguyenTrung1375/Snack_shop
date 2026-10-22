import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  message, 
  Popconfirm, 
  Typography, 
  Tag, 
  Card, 
  Row, 
  Col, 
  Radio, 
  InputNumber, 
  Select, 
  Divider, 
  Statistic, 
  Badge, 
  Tooltip,
  Alert,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  GiftOutlined, 
  ShoppingOutlined, 
  FileTextOutlined, 
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  usePromotions, 
  useCreatePromotion, 
  useUpdatePromotion, 
  useDeletePromotion 
} from '../../features/promotions/hooks';
import { useProducts } from '../../features/catalog/hooks';

const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function PromotionManagerPage() {
  const [params, setParams] = useState({ 
    page: 1, 
    pageSize: 20, 
    keyword: '', 
    loaiKhuyenMai: undefined, 
    trangThai: undefined 
  });

  const { data: promoData, isLoading, refetch } = usePromotions(params);
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ 
    page: 1, 
    pageSize: 500, 
    chiHienThiSanPhamGoc: false 
  });

  const { mutate: createPromo, isPending: isCreating } = useCreatePromotion();
  const { mutate: updatePromo, isPending: isUpdating } = useUpdatePromotion();
  const { mutate: deletePromo, isPending: isDeleting } = useDeletePromotion();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [selectedPromoDetail, setSelectedPromoDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [form] = Form.useForm();
  const watchedLoaiKm = Form.useWatch('loaiKhuyenMai', form);
  const watchedSpList = Form.useWatch('khuyenMaiTheoSanPhams', form);

  const productsList = useMemo(() => {
    return productsData?.items || productsData || [];
  }, [productsData]);

  const productSelectOptions = useMemo(() => {
    return productsList.map((p) => {
      const isVariant = !!p.maSanPhamCha;
      const label = `${isVariant ? '↳ ' : ''}${p.tenSanPham} ${p.khoiLuong ? `(${p.khoiLuong})` : ''} ${isVariant ? '[Biến thể con]' : ''} - ${p.giaBan?.toLocaleString()} đ`;
      const searchStr = `${p.tenSanPham} ${p.khoiLuong || ''}`.toLowerCase();
      return {
        value: p.maSanPham,
        label: label,
        searchStr: searchStr,
      };
    });
  }, [productsList]);

  const rawPromos = useMemo(() => {
    return promoData?.items || promoData || [];
  }, [promoData]);

  const totalCount = promoData?.totalCount || rawPromos.length;

  // Stats calculation
  const stats = useMemo(() => {
    let dangDienRa = 0;
    let sapDienRa = 0;
    let daKetThuc = 0;
    let voucherCount = 0;

    rawPromos.forEach((p) => {
      if (p.trangThai === 'dang_dien_ra') dangDienRa++;
      else if (p.trangThai === 'sap_dien_ra') sapDienRa++;
      else if (p.trangThai === 'da_ket_thuc') daKetThuc++;

      if (p.loaiKhuyenMai === 'voucher') voucherCount++;
    });

    return { dangDienRa, sapDienRa, daKetThuc, voucherCount };
  }, [rawPromos]);

  const handleOpenModal = (promo = null) => {
    setEditingPromo(promo);
    if (promo) {
      // Fill form values for edit
      form.setFieldsValue({
        tenKm: promo.tenKm,
        dateRange: [dayjs(promo.ngayBatDau), dayjs(promo.ngayKetThuc)],
        loaiKhuyenMai: promo.loaiKhuyenMai,
        khuyenMaiTheoHoaDon: promo.khuyenMaiTheoHoaDon ? {
          loaiGiamGia: promo.khuyenMaiTheoHoaDon.loaiGiamGia,
          giaTriGiam: promo.khuyenMaiTheoHoaDon.giaTriGiam,
          giaTriDonToiThieu: promo.khuyenMaiTheoHoaDon.giaTriDonToiThieu,
          giamToiDa: promo.khuyenMaiTheoHoaDon.giamToiDa,
        } : undefined,
        khuyenMaiTheoVoucher: promo.khuyenMaiTheoVoucher ? {
          maCode: promo.khuyenMaiTheoVoucher.maCode,
          loaiGiamGia: promo.khuyenMaiTheoVoucher.loaiGiamGia,
          giaTriGiam: promo.khuyenMaiTheoVoucher.giaTriGiam,
          giaTriDonToiThieu: promo.khuyenMaiTheoVoucher.giaTriDonToiThieu,
          giamToiDa: promo.khuyenMaiTheoVoucher.giamToiDa,
          gioiHanSuDung: promo.khuyenMaiTheoVoucher.gioiHanSuDung,
          gioiHanMoiKhach: promo.khuyenMaiTheoVoucher.gioiHanMoiKhach,
        } : undefined,
        khuyenMaiTheoSanPhams: promo.khuyenMaiTheoSanPhams?.map(item => ({
          maSanPham: item.maSanPham,
          loaiGiamGia: item.loaiGiamGia,
          giaTriGiam: item.giaTriGiam,
        })) || []
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        loaiKhuyenMai: 'voucher',
        dateRange: [dayjs(), dayjs().add(7, 'day')],
        khuyenMaiTheoVoucher: {
          loaiGiamGia: 'phan_tram',
          giaTriGiam: 10,
          giaTriDonToiThieu: 50000,
          gioiHanMoiKhach: 1,
        },
        khuyenMaiTheoHoaDon: {
          loaiGiamGia: 'phan_tram',
          giaTriGiam: 10,
          giaTriDonToiThieu: 100000,
        },
        khuyenMaiTheoSanPhams: [
          {
            maSanPham: undefined,
            loaiGiamGia: 'phan_tram',
            giaTriGiam: 15,
          }
        ]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
    form.resetFields();
  };

  const handleViewDetail = (record) => {
    setSelectedPromoDetail(record);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = (values) => {
    const loai = editingPromo ? editingPromo.loaiKhuyenMai : values.loaiKhuyenMai;

    const basePayload = {
      tenKm: values.tenKm.trim(),
      ngayBatDau: values.dateRange[0].toISOString(),
      ngayKetThuc: values.dateRange[1].toISOString(),
    };

    let payload = {
      ...basePayload,
      loaiKhuyenMai: loai,
    };

    if (loai === 'hoa_don') {
      const hd = values.khuyenMaiTheoHoaDon;
      if (!hd) {
        message.error('Vui lòng điền thông tin khuyến mãi theo hóa đơn.');
        return;
      }
      payload.khuyenMaiTheoHoaDon = {
        tenKm: values.tenKm.trim(),
        loaiGiamGia: hd.loaiGiamGia,
        giaTriGiam: Number(hd.giaTriGiam) || 0,
        giaTriDonToiThieu: Number(hd.giaTriDonToiThieu) || 0,
        giamToiDa: hd.giamToiDa ? Number(hd.giamToiDa) : null,
      };
    } else if (loai === 'voucher') {
      const vc = values.khuyenMaiTheoVoucher;
      if (!vc || !vc.maCode) {
        message.error('Vui lòng nhập mã voucher.');
        return;
      }
      payload.khuyenMaiTheoVoucher = {
        tenKm: values.tenKm.trim(),
        maCode: vc.maCode.trim().toUpperCase(),
        loaiGiamGia: vc.loaiGiamGia,
        giaTriGiam: Number(vc.giaTriGiam) || 0,
        giaTriDonToiThieu: Number(vc.giaTriDonToiThieu) || 0,
        giamToiDa: vc.giamToiDa ? Number(vc.giamToiDa) : null,
        gioiHanSuDung: vc.gioiHanSuDung ? Number(vc.gioiHanSuDung) : null,
        gioiHanMoiKhach: vc.gioiHanMoiKhach ? Number(vc.gioiHanMoiKhach) : null,
      };
    } else if (loai === 'san_pham') {
      const spItems = values.khuyenMaiTheoSanPhams || [];
      if (spItems.length === 0) {
        message.error('Vui lòng chọn ít nhất một món ăn cần áp dụng khuyến mãi.');
        return;
      }

      for (let i = 0; i < spItems.length; i++) {
        const item = spItems[i];
        if (!item?.maSanPham) {
          message.error(`Món #${i + 1}: Vui lòng chọn sản phẩm áp dụng.`);
          return;
        }
        if (!item?.giaTriGiam || Number(item.giaTriGiam) <= 0) {
          message.error(`Món #${i + 1}: Vui lòng nhập mức giảm lớn hơn 0.`);
          return;
        }
        if (item.loaiGiamGia === 'phan_tram' && Number(item.giaTriGiam) > 100) {
          message.error(`Món #${i + 1}: Mức giảm % không được vượt quá 100%.`);
          return;
        }
      }

      // Check duplicate
      const pIds = spItems.map(i => i.maSanPham).filter(Boolean);
      if (new Set(pIds).size !== pIds.length) {
        message.error('Có sản phẩm bị chọn trùng lặp trong danh sách khuyến mãi.');
        return;
      }

      payload.khuyenMaiTheoSanPhams = spItems.map(item => ({
        maSanPham: item.maSanPham,
        tenKm: values.tenKm.trim(),
        loaiGiamGia: item.loaiGiamGia || 'phan_tram',
        giaTriGiam: Number(item.giaTriGiam) || 0,
      }));
    }

    if (editingPromo) {
      updatePromo(
        { id: editingPromo.maCtkm, payload },
        {
          onSuccess: () => {
            message.success('Cập nhật chương trình khuyến mãi thành công!');
            handleCloseModal();
          },
          onError: (err) => {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
          },
        }
      );
    } else {
      createPromo(payload, {
        onSuccess: () => {
          message.success('Tạo chương trình khuyến mãi thành công!');
          handleCloseModal();
        },
        onError: (err) => {
          message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo chương trình khuyến mãi.');
        },
      });
    }
  };

  const handleDelete = (id) => {
    deletePromo(id, {
      onSuccess: () => message.success('Xóa chương trình khuyến mãi thành công!'),
      onError: (err) => message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi xóa.'),
    });
  };

  const columns = [
    { 
      title: 'Tên chương trình', 
      dataIndex: 'tenKm', 
      key: 'tenKm',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>{text}</Text>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            ID: {record.maCtkm?.slice(0, 8).toUpperCase()}
          </div>
        </div>
      )
    },
    {
      title: 'Phân loại',
      dataIndex: 'loaiKhuyenMai',
      key: 'loaiKhuyenMai',
      width: 160,
      render: (type) => {
        if (type === 'san_pham') {
          return <Tag color="purple" icon={<ShoppingOutlined />}>Theo sản phẩm</Tag>;
        }
        if (type === 'hoa_don') {
          return <Tag color="blue" icon={<FileTextOutlined />}>Theo hóa đơn</Tag>;
        }
        return <Tag color="gold" icon={<GiftOutlined />}>Mã Voucher</Tag>;
      }
    },
    {
      title: 'Mức ưu đãi & Điều kiện',
      key: 'uuDai',
      render: (_, record) => {
        if (record.loaiKhuyenMai === 'voucher' && record.khuyenMaiTheoVoucher) {
          const vc = record.khuyenMaiTheoVoucher;
          const giamTxt = vc.loaiGiamGia === 'phan_tram' ? `Giảm ${vc.giaTriGiam}%` : `Giảm ${vc.giaTriGiam?.toLocaleString()} đ`;
          return (
            <Space direction="vertical" size={1}>
              <div>
                <Tag color="volcano" style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '12px', padding: '2px 8px' }}>
                  {vc.maCode}
                </Tag>
                <Text strong style={{ color: '#ea580c' }}>{giamTxt}</Text>
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Đơn từ: {vc.giaTriDonToiThieu ? `${vc.giaTriDonToiThieu.toLocaleString()} đ` : '0 đ'}
                {vc.gioiHanSuDung ? ` • Lượt: ${vc.soLuotDaDung}/${vc.gioiHanSuDung}` : ' • Lượt: Không giới hạn'}
              </Text>
            </Space>
          );
        }

        if (record.loaiKhuyenMai === 'hoa_don' && record.khuyenMaiTheoHoaDon) {
          const hd = record.khuyenMaiTheoHoaDon;
          const giamTxt = hd.loaiGiamGia === 'phan_tram' ? `Giảm ${hd.giaTriGiam}%` : `Giảm ${hd.giaTriGiam?.toLocaleString()} đ`;
          return (
            <Space direction="vertical" size={1}>
              <Text strong style={{ color: '#0284c7' }}>{giamTxt} tự động</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Áp dụng cho đơn từ {hd.giaTriDonToiThieu?.toLocaleString()} đ
                {hd.giamToiDa ? ` (tối đa ${hd.giamToiDa.toLocaleString()} đ)` : ''}
              </Text>
            </Space>
          );
        }

        if (record.loaiKhuyenMai === 'san_pham') {
          const count = record.khuyenMaiTheoSanPhams?.length || 0;
          return (
            <Space direction="vertical" size={1}>
              <Text strong style={{ color: '#7c3aed' }}>Áp dụng cho {count} món ăn vặt</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Giảm trực tiếp vào giá bán niêm yết
              </Text>
            </Space>
          );
        }

        return <Text type="secondary">N/A</Text>;
      }
    },
    { 
      title: 'Thời gian áp dụng', 
      key: 'timeRange',
      width: 220,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div><Text type="secondary">Từ:</Text> {dayjs(record.ngayBatDau).format('DD/MM/YYYY HH:mm')}</div>
          <div><Text type="secondary">Đến:</Text> {dayjs(record.ngayKetThuc).format('DD/MM/YYYY HH:mm')}</div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      render: (status) => {
        if (status === 'dang_dien_ra') {
          return <Badge status="processing" color="#10b981" text={<span style={{ color: '#059669', fontWeight: 600 }}>Đang diễn ra</span>} />;
        }
        if (status === 'sap_dien_ra') {
          return <Badge status="warning" color="#3b82f6" text={<span style={{ color: '#2563eb' }}>Sắp diễn ra</span>} />;
        }
        return <Badge status="default" color="#94a3b8" text={<span style={{ color: '#64748b' }}>Đã kết thúc</span>} />;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
            style={{ color: '#ea580c' }}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleOpenModal(record)} 
            style={{ color: '#2563eb' }}
          />
          <Popconfirm 
            title="Bạn có chắc muốn xóa chương trình khuyến mãi này?" 
            onConfirm={() => handleDelete(record.maCtkm)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} loading={isDeleting} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#9a3412', fontWeight: 800 }}>
            Quản lý Chương trình Khuyến mãi
          </Title>
          <Text type="secondary">
            Cấu hình ưu đãi giảm giá theo sản phẩm, hóa đơn mua hàng hoặc phát hành mã voucher
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
            Tạo khuyến mãi mới
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Đang diễn ra"
              value={stats.dangDienRa}
              prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: '#059669', fontWeight: 700 }}
              suffix="chương trình"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Sắp diễn ra"
              value={stats.sapDienRa}
              prefix={<ClockCircleOutlined style={{ color: '#3b82f6' }} />}
              valueStyle={{ color: '#2563eb', fontWeight: 700 }}
              suffix="chương trình"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Mã Voucher ưu đãi"
              value={stats.voucherCount}
              prefix={<GiftOutlined style={{ color: '#ea580c' }} />}
              valueStyle={{ color: '#ea580c', fontWeight: 700 }}
              suffix="chiến dịch"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Statistic
              title="Đã kết thúc"
              value={stats.daKetThuc}
              prefix={<StopOutlined style={{ color: '#94a3b8' }} />}
              suffix="chương trình"
            />
          </Card>
        </Col>
      </Row>

      {/* Filter and Search Bar */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 16px rgba(124, 45, 18, 0.04)' }}>
        <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          <Space wrap size="middle">
            <Input
              placeholder="Tìm theo tên hoặc mã voucher..."
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              style={{ width: 280, borderRadius: 8 }}
              allowClear
              onPressEnter={(e) => setParams(p => ({ ...p, keyword: e.target.value.trim(), page: 1 }))}
              onChange={(e) => {
                if (!e.target.value) setParams(p => ({ ...p, keyword: '', page: 1 }));
              }}
            />

            <Select
              placeholder="Loại khuyến mãi"
              style={{ width: 170 }}
              allowClear
              onChange={(val) => setParams(p => ({ ...p, loaiKhuyenMai: val, page: 1 }))}
            >
              <Option value="voucher">🎟️ Mã Voucher</Option>
              <Option value="hoa_don">🧾 Theo hóa đơn</Option>
              <Option value="san_pham">🍟 Theo sản phẩm</Option>
            </Select>

            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              allowClear
              onChange={(val) => setParams(p => ({ ...p, trangThai: val, page: 1 }))}
            >
              <Option value="dang_dien_ra">🟢 Đang diễn ra</Option>
              <Option value="sap_dien_ra">🔵 Sắp diễn ra</Option>
              <Option value="da_ket_thuc">⚪ Đã kết thúc</Option>
            </Select>
          </Space>

          <Text type="secondary" style={{ fontSize: '13px' }}>
            Tổng số: <Text strong>{totalCount}</Text> chương trình
          </Text>
        </div>

        {/* Table */}
        <Table 
          columns={columns} 
          dataSource={rawPromos} 
          rowKey="maCtkm"
          loading={isLoading}
          locale={{ emptyText: <Empty description="Chưa có chương trình khuyến mãi nào. Bấm 'Tạo khuyến mãi mới' để bắt đầu." /> }}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total: totalCount,
            onChange: (page, pageSize) => setParams(p => ({ ...p, page, pageSize })),
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50']
          }}
        />
      </Card>

      {/* Modal Tạo / Sửa Khuyến Mãi */}
      <Modal
        title={
          <Space>
            <GiftOutlined style={{ color: '#ea580c', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 700 }}>
              {editingPromo ? 'Cập nhật Chương trình Khuyến mãi' : 'Tạo Chương trình Khuyến mãi Mới'}
            </span>
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating}
        okText={editingPromo ? 'Lưu thay đổi' : 'Kích hoạt chương trình'}
        cancelText="Hủy bỏ"
        width={850}
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
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit} 
          onFinishFailed={(err) => {
            const firstErr = err?.errorFields?.[0]?.errors?.[0];
            message.error(firstErr || 'Vui lòng kiểm tra lại các trường thông tin bắt buộc.');
          }}
          preserve={false}
          style={{ marginTop: 16 }}
        >
          {/* General info */}
          <Row gutter={16}>
            <Col xs={24} md={14}>
              <Form.Item
                name="tenKm"
                label={<Text strong>Tên chương trình khuyến mãi</Text>}
                rules={[{ required: true, message: 'Vui lòng nhập tên chương trình' }]}
              >
                <Input placeholder="VD: Siêu hội ăn vặt mùa hè, Chào bạn mới, Tri ân khách hàng..." size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item
                name="dateRange"
                label={<Text strong>Thời gian hiệu lực</Text>}
                rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu và kết thúc' }]}
              >
                <RangePicker 
                  showTime={{ format: 'HH:mm' }} 
                  format="DD/MM/YYYY HH:mm" 
                  size="large" 
                  style={{ width: '100%' }} 
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Promotion Type Selector */}
          <Form.Item 
            name="loaiKhuyenMai" 
            label={<Text strong>Hình thức áp dụng khuyến mãi</Text>}
          >
            <Radio.Group 
              disabled={!!editingPromo} 
              buttonStyle="solid" 
              style={{ width: '100%', display: 'flex', gap: 8 }}
              onChange={(e) => {
                form.clearValidate();
                const newLoai = e.target.value;
                if (newLoai === 'san_pham') {
                  const currentList = form.getFieldValue('khuyenMaiTheoSanPhams');
                  if (!currentList || currentList.length === 0) {
                    form.setFieldValue('khuyenMaiTheoSanPhams', [
                      { maSanPham: undefined, loaiGiamGia: 'phan_tram', giaTriGiam: 15 }
                    ]);
                  }
                }
              }}
            >
              <Radio.Button value="voucher" style={{ flex: 1, textAlign: 'center', height: 'auto', padding: '10px 0', borderRadius: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>🎟️ Mã Voucher</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Khách nhập mã code khi thanh toán</div>
              </Radio.Button>
              <Radio.Button value="hoa_don" style={{ flex: 1, textAlign: 'center', height: 'auto', padding: '10px 0', borderRadius: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>🧾 Theo Hóa Đơn</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Tự động giảm khi đạt giá trị tối thiểu</div>
              </Radio.Button>
              <Radio.Button value="san_pham" style={{ flex: 1, textAlign: 'center', height: 'auto', padding: '10px 0', borderRadius: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>🍟 Theo Sản Phẩm</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Giảm giá trực tiếp từng món ăn cụ thể</div>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Divider style={{ margin: '16px 0 20px' }} />

          {/* Type 1: Voucher Details */}
          {watchedLoaiKm === 'voucher' && (
            <Card style={{ background: '#fffbeb', borderColor: '#fef3c7', borderRadius: 12 }}>
              <Title level={5} style={{ margin: '0 0 16px', color: '#92400e' }}>
                🎟️ Cấu hình Mã Voucher (Khách tự nhập)
              </Title>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={['khuyenMaiTheoVoucher', 'maCode']}
                    label={<Text strong>Mã Code áp dụng</Text>}
                    rules={watchedLoaiKm === 'voucher' ? [{ required: true, message: 'Nhập mã code (VD: BANHMI10)' }] : []}
                  >
                    <Input 
                      placeholder="VD: SNACK2026, FREESHIP, CHAOBANMOI" 
                      style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}
                      maxLength={30}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name={['khuyenMaiTheoVoucher', 'loaiGiamGia']}
                    label={<Text strong>Kiểu giảm</Text>}
                    rules={watchedLoaiKm === 'voucher' ? [{ required: true }] : []}
                  >
                    <Select>
                      <Option value="phan_tram">Phần trăm (%)</Option>
                      <Option value="so_tien">Tiền mặt (đ)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name={['khuyenMaiTheoVoucher', 'giaTriGiam']}
                    label={<Text strong>Giá trị giảm</Text>}
                    rules={watchedLoaiKm === 'voucher' ? [{ required: true, message: 'Nhập mức giảm' }] : []}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 15 hoặc 20000" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={12} md={6}>
                  <Form.Item
                    name={['khuyenMaiTheoVoucher', 'giaTriDonToiThieu']}
                    label="Đơn hàng tối thiểu (đ)"
                  >
                    <InputNumber min={0} step={10000} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name={['khuyenMaiTheoVoucher', 'giamToiDa']}
                    label="Giảm tối đa (đ - nếu %)"
                  >
                    <InputNumber min={0} step={5000} style={{ width: '100%' }} placeholder="Không giới hạn" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name={['khuyenMaiTheoVoucher', 'gioiHanSuDung']}
                    label="Tổng số lượt toàn sàn"
                  >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="Không giới hạn" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name={['khuyenMaiTheoVoucher', 'gioiHanMoiKhach']}
                    label="Lượt/khách hàng"
                  >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 1" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {/* Type 2: Hoa Don Details */}
          {watchedLoaiKm === 'hoa_don' && (
            <Card style={{ background: '#f0f9ff', borderColor: '#e0f2fe', borderRadius: 12 }}>
              <Title level={5} style={{ margin: '0 0 16px', color: '#0369a1' }}>
                🧾 Cấu hình Khuyến mãi Hóa Đơn (Tự động kích hoạt)
              </Title>
              <Row gutter={16}>
                <Col xs={12} md={8}>
                  <Form.Item
                    name={['khuyenMaiTheoHoaDon', 'loaiGiamGia']}
                    label={<Text strong>Kiểu giảm giá</Text>}
                    rules={watchedLoaiKm === 'hoa_don' ? [{ required: true }] : []}
                  >
                    <Select>
                      <Option value="phan_tram">Phần trăm (%)</Option>
                      <Option value="so_tien">Tiền mặt (đ)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Item
                    name={['khuyenMaiTheoHoaDon', 'giaTriGiam']}
                    label={<Text strong>Mức giảm</Text>}
                    rules={watchedLoaiKm === 'hoa_don' ? [{ required: true, message: 'Nhập mức giảm' }] : []}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 10 hoặc 30000" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name={['khuyenMaiTheoHoaDon', 'giaTriDonToiThieu']}
                    label={<Text strong>Đơn tối thiểu để áp dụng (đ)</Text>}
                    rules={watchedLoaiKm === 'hoa_don' ? [{ required: true, message: 'Nhập đơn tối thiểu' }] : []}
                  >
                    <InputNumber min={0} step={20000} style={{ width: '100%' }} placeholder="VD: 150000" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name={['khuyenMaiTheoHoaDon', 'giamToiDa']}
                    label="Mức giảm tối đa (đ - nếu tính theo %)"
                  >
                    <InputNumber min={0} step={10000} style={{ width: '100%' }} placeholder="Để trống nếu không giới hạn" />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                type="info"
                showIcon
                message="Khách hàng không cần nhập mã!"
                description="Khi tổng tiền giỏ hàng đạt ngưỡng tối thiểu trên, hệ thống sẽ tự động trừ khuyến mãi tốt nhất cho khách khi thanh toán."
              />
            </Card>
          )}

          {/* Type 3: San Pham Details */}
          {watchedLoaiKm === 'san_pham' && (
            <Card style={{ background: '#faf5ff', borderColor: '#f3e8ff', borderRadius: 12 }}>
              <Title level={5} style={{ margin: '0 0 16px', color: '#6b21a8' }}>
                🍟 Cấu hình Khuyến mãi theo Sản Phẩm (Giảm trực tiếp giá bán)
              </Title>

              <Form.List name="khuyenMaiTheoSanPhams">
                {(fields, { add, remove }) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {fields.map(({ key, name, ...restField }, idx) => {
                      const itemData = watchedSpList?.[name];
                      const chosenProduct = productsList.find(p => p.maSanPham === itemData?.maSanPham);
                      let estimatedPrice = chosenProduct ? chosenProduct.giaBan : null;

                      if (chosenProduct && itemData?.giaTriGiam) {
                        if (itemData.loaiGiamGia === 'phan_tram') {
                          estimatedPrice = Math.max(0, chosenProduct.giaBan - (chosenProduct.giaBan * itemData.giaTriGiam / 100));
                        } else {
                          estimatedPrice = Math.max(0, chosenProduct.giaBan - itemData.giaTriGiam);
                        }
                      }

                      return (
                        <Card key={key} size="small" style={{ borderRadius: 8, borderColor: '#e9d5ff' }}>
                          <Row gutter={12} align="middle">
                            <Col xs={24} md={10}>
                              <Form.Item
                                {...restField}
                                name={[name, 'maSanPham']}
                                label={`Món ăn vặt (#${idx + 1})`}
                                rules={watchedLoaiKm === 'san_pham' ? [{ required: true, message: 'Vui lòng chọn món' }] : []}
                                style={{ marginBottom: 0 }}
                              >
                                <Select
                                  placeholder="Chọn món áp dụng..."
                                  showSearch
                                  loading={isLoadingProducts}
                                  options={productSelectOptions}
                                  filterOption={(input, option) => {
                                    const term = input.toLowerCase().trim();
                                    return (
                                      (option?.searchStr ?? '').includes(term) ||
                                      (option?.label ?? '').toLowerCase().includes(term)
                                    );
                                  }}
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={12} md={4}>
                              <Form.Item
                                {...restField}
                                name={[name, 'loaiGiamGia']}
                                label="Kiểu giảm"
                                rules={watchedLoaiKm === 'san_pham' ? [{ required: true }] : []}
                                style={{ marginBottom: 0 }}
                              >
                                <Select>
                                  <Option value="phan_tram">%</Option>
                                  <Option value="so_tien">VNĐ</Option>
                                </Select>
                              </Form.Item>
                            </Col>

                            <Col xs={12} md={4}>
                              <Form.Item
                                {...restField}
                                name={[name, 'giaTriGiam']}
                                label="Mức giảm"
                                rules={watchedLoaiKm === 'san_pham' ? [{ required: true, message: 'Nhập mức giảm' }] : []}
                                style={{ marginBottom: 0 }}
                              >
                                <InputNumber 
                                  min={1} 
                                  max={itemData?.loaiGiamGia === 'phan_tram' ? 100 : undefined} 
                                  style={{ width: '100%' }} 
                                  placeholder="Mức giảm" 
                                />
                              </Form.Item>
                            </Col>

                            <Col xs={20} md={5}>
                              {chosenProduct && (
                                <div style={{ fontSize: '11px', textAlign: 'right' }}>
                                  <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                                    {chosenProduct.giaBan?.toLocaleString()} đ
                                  </span>
                                  <span style={{ color: '#ea580c', fontWeight: 700, marginLeft: 6 }}>
                                    → {estimatedPrice?.toLocaleString()} đ
                                  </span>
                                </div>
                              )}
                            </Col>

                            <Col xs={4} md={1} style={{ textAlign: 'center' }}>
                              <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                disabled={fields.length === 1}
                                onClick={() => remove(name)}
                              />
                            </Col>
                          </Row>
                        </Card>
                      );
                    })}

                    <Button 
                      type="dashed" 
                      onClick={() => add({ maSanPham: undefined, loaiGiamGia: 'phan_tram', giaTriGiam: 10 })} 
                      block 
                      icon={<PlusOutlined />}
                      style={{ borderRadius: 8, borderColor: '#a855f7', color: '#7e22ce' }}
                    >
                      Thêm sản phẩm khác vào khuyến mãi
                    </Button>
                  </div>
                )}
              </Form.List>
            </Card>
          )}
        </Form>
      </Modal>

      {/* Modal Xem Chi Tiết Khuyến Mãi */}
      <Modal
        title={
          <Space>
            <GiftOutlined style={{ color: '#ea580c' }} />
            <span>Chi tiết Khuyến mãi: {selectedPromoDetail?.tenKm}</span>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)} style={{ background: '#ea580c', borderColor: '#ea580c' }}>
            Đóng
          </Button>
        ]}
        width={750}
      >
        {selectedPromoDetail && (
          <div>
            <Row gutter={[16, 12]} style={{ marginBottom: 16, background: '#fafafa', padding: 16, borderRadius: 8 }}>
              <Col span={12}>
                <Text type="secondary">Phân loại:</Text>{' '}
                <Text strong>
                  {selectedPromoDetail.loaiKhuyenMai === 'voucher' && 'Mã Voucher'}
                  {selectedPromoDetail.loaiKhuyenMai === 'hoa_don' && 'Khuyến mãi theo hóa đơn'}
                  {selectedPromoDetail.loaiKhuyenMai === 'san_pham' && 'Khuyến mãi theo sản phẩm'}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Trạng thái:</Text>{' '}
                <Text strong>{selectedPromoDetail.trangThai}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Thời gian bắt đầu:</Text>{' '}
                <Text>{dayjs(selectedPromoDetail.ngayBatDau).format('DD/MM/YYYY HH:mm')}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Thời gian kết thúc:</Text>{' '}
                <Text>{dayjs(selectedPromoDetail.ngayKetThuc).format('DD/MM/YYYY HH:mm')}</Text>
              </Col>
            </Row>

            {/* If Voucher */}
            {selectedPromoDetail.khuyenMaiTheoVoucher && (
              <Card title="Chi tiết Voucher" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    Mã code: <Tag color="volcano" style={{ fontWeight: 800 }}>{selectedPromoDetail.khuyenMaiTheoVoucher.maCode}</Tag>
                  </Col>
                  <Col span={12}>
                    Mức giảm: <b>{selectedPromoDetail.khuyenMaiTheoVoucher.giaTriGiam} {selectedPromoDetail.khuyenMaiTheoVoucher.loaiGiamGia === 'phan_tram' ? '%' : 'đ'}</b>
                  </Col>
                  <Col span={12}>
                    Đơn tối thiểu: <b>{selectedPromoDetail.khuyenMaiTheoVoucher.giaTriDonToiThieu?.toLocaleString()} đ</b>
                  </Col>
                  <Col span={12}>
                    Giảm tối đa: <b>{selectedPromoDetail.khuyenMaiTheoVoucher.giamToiDa ? `${selectedPromoDetail.khuyenMaiTheoVoucher.giamToiDa.toLocaleString()} đ` : 'Không giới hạn'}</b>
                  </Col>
                  <Col span={12}>
                    Đã sử dụng: <b>{selectedPromoDetail.khuyenMaiTheoVoucher.soLuotDaDung} / {selectedPromoDetail.khuyenMaiTheoVoucher.gioiHanSuDung || '∞'} lượt</b>
                  </Col>
                  <Col span={12}>
                    Giới hạn mỗi khách: <b>{selectedPromoDetail.khuyenMaiTheoVoucher.gioiHanMoiKhach || 'Không giới hạn'}</b>
                  </Col>
                </Row>
              </Card>
            )}

            {/* If Hoa Don */}
            {selectedPromoDetail.khuyenMaiTheoHoaDon && (
              <Card title="Chi tiết Khuyến mãi Hóa Đơn" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    Đơn hàng tối thiểu: <b>{selectedPromoDetail.khuyenMaiTheoHoaDon.giaTriDonToiThieu?.toLocaleString()} đ</b>
                  </Col>
                  <Col span={12}>
                    Mức giảm: <b>{selectedPromoDetail.khuyenMaiTheoHoaDon.giaTriGiam} {selectedPromoDetail.khuyenMaiTheoHoaDon.loaiGiamGia === 'phan_tram' ? '%' : 'đ'}</b>
                  </Col>
                  <Col span={12}>
                    Giảm tối đa: <b>{selectedPromoDetail.khuyenMaiTheoHoaDon.giamToiDa ? `${selectedPromoDetail.khuyenMaiTheoHoaDon.giamToiDa.toLocaleString()} đ` : 'Không giới hạn'}</b>
                  </Col>
                </Row>
              </Card>
            )}

            {/* If San Pham */}
            {selectedPromoDetail.khuyenMaiTheoSanPhams?.length > 0 && (
              <Card title="Danh sách Món ăn vặt áp dụng" size="small">
                <Table
                  dataSource={selectedPromoDetail.khuyenMaiTheoSanPhams}
                  rowKey="maSanPham"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: 'Tên món', dataIndex: 'tenSanPham', key: 'tenSanPham' },
                    { 
                      title: 'Giá gốc', 
                      dataIndex: 'giaBan', 
                      key: 'giaBan',
                      render: val => `${val?.toLocaleString()} đ`
                    },
                    { 
                      title: 'Mức giảm', 
                      key: 'giam',
                      render: (_, r) => `${r.giaTriGiam} ${r.loaiGiamGia === 'phan_tram' ? '%' : 'đ'}`
                    },
                    { 
                      title: 'Giá sau giảm', 
                      dataIndex: 'giaSauGiam', 
                      key: 'giaSauGiam',
                      render: val => <Text strong style={{ color: '#ea580c' }}>{val?.toLocaleString()} đ</Text>
                    },
                  ]}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
