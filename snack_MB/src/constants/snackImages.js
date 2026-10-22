// Constants & mapping for authentic Vietnamese snack imagery

export const DEFAULT_SNACK_IMAGE = 'https://i.ibb.co/KpGNKvDB/banh-trang-bo-tep-hanh-phi.png';

export const SNACK_HERO_BANNER = 'https://i.ibb.co/kVkKH1rx/com-chay-cha-bong.png';

export const SNACK_CATEGORY_THUMBNAILS = {
  banh_trang: 'https://i.ibb.co/KpGNKvDB/banh-trang-bo-tep-hanh-phi.png',
  banh_trang_toi_rong_bien: 'https://i.ibb.co/Kj5HqtsY/banh-trang-toi-rong-bien.png',
  com_chay: 'https://i.ibb.co/kVkKH1rx/com-chay-cha-bong.png',
  da_heo: 'https://i.ibb.co/BVcxjPth/da-heo-mam-hanh.png',
  kho_ga: 'https://i.ibb.co/qMdPGF85/kho-ga-la-chanh.png',
  kho_bo: 'https://i.ibb.co/fzQ8RZp8/kho-bo-mieng-gia-vi.png',
  kho_heo: 'https://i.ibb.co/MxhcWKtW/kho-heo-mieng.png',
  rong_bien: 'https://i.ibb.co/jP36pYkZ/rong-bien-chay-toi.png',
  muc: 'https://i.ibb.co/PvZzK2r6/muc-xe-hap-nuoc-dua.png',
};

export const getCategoryThumbnail = (cat) => {
  const name = (cat?.tenLoai || cat?.tenLoaiSanPham || cat?.ten || '').toLowerCase();

  if (name.includes('bánh tráng') || name.includes('banh trang')) {
    if (name.includes('rong biển') || name.includes('tỏi')) {
      return SNACK_CATEGORY_THUMBNAILS.banh_trang_toi_rong_bien;
    }
    return SNACK_CATEGORY_THUMBNAILS.banh_trang;
  }
  if (name.includes('khô gà') || name.includes('kho ga')) {
    return SNACK_CATEGORY_THUMBNAILS.kho_ga;
  }
  if (name.includes('khô bò') || name.includes('kho bo')) {
    return SNACK_CATEGORY_THUMBNAILS.kho_bo;
  }
  if (name.includes('khô heo') || name.includes('kho heo')) {
    return SNACK_CATEGORY_THUMBNAILS.kho_heo;
  }
  if (name.includes('khô') || name.includes('kho')) {
    return SNACK_CATEGORY_THUMBNAILS.kho_ga;
  }
  if (name.includes('cơm cháy') || name.includes('com chay')) {
    return SNACK_CATEGORY_THUMBNAILS.com_chay;
  }
  if (name.includes('da heo') || name.includes('da heo')) {
    return SNACK_CATEGORY_THUMBNAILS.da_heo;
  }
  if (name.includes('rong biển') || name.includes('rong bien')) {
    return SNACK_CATEGORY_THUMBNAILS.rong_bien;
  }
  if (name.includes('mực') || name.includes('muc')) {
    return SNACK_CATEGORY_THUMBNAILS.muc;
  }

  return DEFAULT_SNACK_IMAGE;
};

export const getProductThumbnail = (item) => {
  const uri = item?.hinhAnhDaiDien || item?.hinhAnh || item?.imageUrl || item?.hinhAnhUrl;
  if (uri && typeof uri === 'string' && uri.trim().length > 0) {
    if (uri.includes('ibb.co/FbKjvq1V')) {
      return SNACK_CATEGORY_THUMBNAILS.kho_ga;
    }
    return uri;
  }
  return DEFAULT_SNACK_IMAGE;
};

