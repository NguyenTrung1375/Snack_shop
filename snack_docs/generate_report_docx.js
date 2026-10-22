const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ImageRun,
  Header,
  Footer,
  PageNumber,
  ShadingType
} = require('./temp_npm/node_modules/docx');

// Paths to images
const SGU_LOGO_PATH = path.join(__dirname, 'sgu_logo.png');
const BRAND_LOGO_PATH = path.join(__dirname, 'snack_docs', 'logo.png');
const ERD_IMAGE_PATH = path.join(__dirname, 'snack_docs', 'snack_ERD.png');
const OUTPUT_DOCX = path.join(__dirname, 'Bao_Cao_He_Thong_Thong_Tin_Doanh_Nghiep_Snack_Shop.docx');

// Styling Constants
const FONT_FAMILY = 'Times New Roman';
const PRIMARY_COLOR = '0B3C5D'; // Navy blue
const ACCENT_COLOR = 'C0392B'; // Crimson red
const TEXT_COLOR = '2C3E50';
const BORDER_COLOR = 'BDC3C7';
const HEADER_BG = 'EAECEE';
const ROW_BG_ALT = 'F8F9F9';

// Helpers
function p(text = '', opts = {}) {
  const {
    bold = false,
    italic = false,
    size = 26, // 13pt
    color = TEXT_COLOR,
    align = AlignmentType.JUSTIFIED,
    spaceBefore = 80,
    spaceAfter = 80,
    line = 320, // ~1.33 line spacing
    indent = 0,
    bullet = false
  } = opts;

  const runOpts = {
    text: text,
    font: FONT_FAMILY,
    size: size,
    bold: bold,
    italic: italic,
    color: color
  };

  const pOpts = {
    alignment: align,
    spacing: { before: spaceBefore, after: spaceAfter, line: line }
  };

  if (indent > 0) {
    pOpts.indent = { left: indent };
  }

  pOpts.children = [new TextRun(runOpts)];
  return new Paragraph(pOpts);
}

function pRuns(runs, opts = {}) {
  const {
    align = AlignmentType.JUSTIFIED,
    spaceBefore = 80,
    spaceAfter = 80,
    line = 320,
    indent = 0
  } = opts;

  return new Paragraph({
    alignment: align,
    spacing: { before: spaceBefore, after: spaceAfter, line: line },
    indent: indent > 0 ? { left: indent } : undefined,
    children: runs.map(r => new TextRun({
      text: r.text,
      font: FONT_FAMILY,
      size: r.size || 26,
      bold: r.bold || false,
      italic: r.italic || false,
      color: r.color || TEXT_COLOR
    }))
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: text,
        font: FONT_FAMILY,
        size: 32, // 16pt
        bold: true,
        color: PRIMARY_COLOR
      })
    ]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 100 },
    children: [
      new TextRun({
        text: text,
        font: FONT_FAMILY,
        size: 28, // 14pt
        bold: true,
        color: PRIMARY_COLOR
      })
    ]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 140, after: 80 },
    children: [
      new TextRun({
        text: text,
        font: FONT_FAMILY,
        size: 26, // 13pt
        bold: true,
        italic: false,
        color: '2C3E50'
      })
    ]
  });
}

function bulletItem(boldText, normalText) {
  return pRuns([
    { text: '•  ', bold: true, color: PRIMARY_COLOR },
    { text: boldText ? boldText + ' ' : '', bold: true, color: '1A252F' },
    { text: normalText, bold: false, color: TEXT_COLOR }
  ], { spaceBefore: 40, spaceAfter: 40, indent: 360 });
}

function numberedItem(num, boldText, normalText) {
  return pRuns([
    { text: `${num}. `, bold: true, color: PRIMARY_COLOR },
    { text: boldText ? boldText + ': ' : '', bold: true, color: '1A252F' },
    { text: normalText, bold: false, color: TEXT_COLOR }
  ], { spaceBefore: 60, spaceAfter: 60, indent: 360 });
}

function makeTable(headers, rows, colWidths = []) {
  const borderStyle = { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR };
  const cellBorders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
      shading: { fill: HEADER_BG, type: ShadingType.CLEAR },
      borders: cellBorders,
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: h, font: FONT_FAMILY, size: 24, bold: true, color: '1A252F' })]
        })
      ]
    }))
  });

  const dataRows = rows.map((row, rIdx) => new TableRow({
    children: row.map((cellText, cIdx) => new TableCell({
      width: colWidths[cIdx] ? { size: colWidths[cIdx], type: WidthType.DXA } : undefined,
      shading: rIdx % 2 === 1 ? { fill: ROW_BG_ALT, type: ShadingType.CLEAR } : undefined,
      borders: cellBorders,
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: cIdx === 0 && row.length > 2 ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [new TextRun({ text: String(cellText), font: FONT_FAMILY, size: 23, color: TEXT_COLOR })]
        })
      ]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    alignment: AlignmentType.CENTER
  });
}

function makeCoverPage() {
  const children = [];

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [
      new TextRun({ text: 'TRƯỜNG ĐẠI HỌC SÀI GÒN', font: FONT_FAMILY, size: 30, bold: true, color: '0E3A5D' })
    ]
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
    children: [
      new TextRun({ text: 'KHOA CÔNG NGHỆ THÔNG TIN', font: FONT_FAMILY, size: 28, bold: true, color: '1B4F72' })
    ]
  }));

  // SGU Logo
  if (fs.existsSync(SGU_LOGO_PATH)) {
    const sguLogoData = fs.readFileSync(SGU_LOGO_PATH);
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 200 },
      children: [
        new ImageRun({
          data: sguLogoData,
          transformation: { width: 140, height: 140 },
          type: 'png'
        })
      ]
    }));
  }

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 150, after: 80 },
    children: [
      new TextRun({ text: 'BÁO CÁO HỌC PHẦN', font: FONT_FAMILY, size: 28, bold: true, color: '2C3E50' })
    ]
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 240 },
    children: [
      new TextRun({ text: 'HỆ THỐNG THÔNG TIN DOANH NGHIỆP', font: FONT_FAMILY, size: 32, bold: true, color: PRIMARY_COLOR })
    ]
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 60 },
    children: [
      new TextRun({ text: 'ĐỀ TÀI:', font: FONT_FAMILY, size: 26, bold: true, color: ACCENT_COLOR })
    ]
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 360 },
    children: [
      new TextRun({
        text: 'XÂY DỰNG HỆ THỐNG THÔNG TIN QUẢN LÝ KINH DOANH VÀ BÁN LẺ ĐỒ ĂN VẶT TRỰC TUYẾN CHO DOANH NGHIỆP SNACK SHOP',
        font: FONT_FAMILY,
        size: 32,
        bold: true,
        color: PRIMARY_COLOR
      })
    ]
  }));

  // Member Table on Cover Page
  const borderNone = { style: BorderStyle.NONE, size: 0, color: 'auto' };
  const noBorders = { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone };

  const memberTable = new Table({
    width: { size: 90, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3500, type: WidthType.DXA },
            borders: noBorders,
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Sinh viên thực hiện:', font: FONT_FAMILY, size: 26, bold: true, color: '1A252F' })]
              })
            ]
          }),
          new TableCell({
            width: { size: 5500, type: WidthType.DXA },
            borders: noBorders,
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Mai Nguyễn Gia Huy', font: FONT_FAMILY, size: 26 })] }),
              new Paragraph({ children: [new TextRun({ text: 'Lê Thành Đạt', font: FONT_FAMILY, size: 26 })] }),
              new Paragraph({ children: [new TextRun({ text: 'Nguyễn Hoàng Nhật Anh', font: FONT_FAMILY, size: 26 })] }),
              new Paragraph({ children: [new TextRun({ text: 'Nguyễn Duy Hoài Trung', font: FONT_FAMILY, size: 26 })] }),
              new Paragraph({ children: [new TextRun({ text: 'Đỗ Vũ Minh Ánh', font: FONT_FAMILY, size: 26 })] })
            ]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3500, type: WidthType.DXA },
            borders: noBorders,
            children: [
              new Paragraph({
                spacing: { before: 120 },
                children: [new TextRun({ text: 'Giảng viên hướng dẫn:', font: FONT_FAMILY, size: 26, bold: true, color: '1A252F' })]
              })
            ]
          }),
          new TableCell({
            width: { size: 5500, type: WidthType.DXA },
            borders: noBorders,
            children: [
              new Paragraph({
                spacing: { before: 120 },
                children: [new TextRun({ text: 'TS. Lê Nhị Lãm Thúy', font: FONT_FAMILY, size: 26, bold: true, color: '1A252F' })]
              })
            ]
          })
        ]
      })
    ]
  });

  children.push(memberTable);

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600, after: 0 },
    children: [
      new TextRun({ text: 'Thành phố Hồ Chí Minh, năm 2026', font: FONT_FAMILY, size: 26, italic: true, color: '566573' })
    ]
  }));

  // Page break after cover page
  children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })], pageBreakBefore: true }));

  return children;
}

function buildDocument() {
  const docChildren = [];

  // Cover Page
  docChildren.push(...makeCoverPage());

  // MỤC LỤC
  docChildren.push(h1('MỤC LỤC'));
  const tocItems = [
    ['LỜI MỞ ĐẦU', 'ii'],
    ['LỜI CẢM ƠN', 'iii'],
    ['Chương 1. Giới thiệu chung', '1'],
    ['  1.1. Giới thiệu về doanh nghiệp Snack Shop', '1'],
    ['  1.2. Mô hình và các hoạt động kinh doanh của doanh nghiệp', '1'],
    ['  1.3. Cơ cấu tổ chức và nhân sự của doanh nghiệp', '2'],
    ['  1.4. Bảng khảo sát hệ thống thông tin của doanh nghiệp', '3'],
    ['Chương 2. Phân tích hệ thống', '4'],
    ['  2.1. Mô tả hệ thống thông tin doanh nghiệp', '4'],
    ['    2.1.1. Mục tiêu và phạm vi hệ thống', '4'],
    ['    2.1.2. Cơ chế phân quyền người dùng (RBAC)', '4'],
    ['    2.1.3. Các phân hệ chức năng cốt lõi', '5'],
    ['    2.1.4. Danh mục 13 đặc điểm chính của hệ thống', '6'],
    ['    2.1.5. Mô tả chi tiết 13 đặc điểm chính', '7'],
    ['  2.2. Sơ đồ phân rã chức năng (BFD)', '12'],
    ['  2.3. Sơ đồ luồng dữ liệu (DFD)', '14'],
    ['    2.3.1. Sơ đồ ngữ cảnh (DFD Mức 0)', '14'],
    ['    2.3.2. Sơ đồ DFD Mức 1', '15'],
    ['    2.3.3. Sơ đồ DFD Mức 2', '16'],
    ['Chương 3. Thiết kế hệ thống', '17'],
    ['  3.1. Cơ sở dữ liệu hệ thống', '17'],
    ['    3.1.1. Mô hình quan hệ thực thể (ERD)', '17'],
    ['    3.1.2. Danh mục 15 bảng dữ liệu chính', '18'],
    ['    3.1.3. Các ràng buộc logic và cơ chế Trigger tự động', '20'],
    ['    3.1.4. Các khung nhìn (Views) phục vụ báo cáo quản trị', '22'],
    ['  3.2. Thiết kế giao diện hệ thống', '23'],
    ['Chương 4. Cài đặt và bảo trì hệ thống', '25'],
    ['  4.1. Kiến trúc kỹ thuật và môi trường cài đặt', '25'],
    ['  4.2. Kịch bản kiểm thử nghiệp vụ then chốt', '26'],
    ['  4.3. Quy trình vận hành và bảo trì hệ thống', '27'],
    ['Chương 5. Tổng kết và hướng phát triển', '28'],
    ['  5.1. Đánh giá ưu điểm và nhược điểm', '28'],
    ['  5.2. Hướng phát triển trong tương lai', '29']
  ];

  tocItems.forEach(([title, page]) => {
    docChildren.push(pRuns([
      { text: title, bold: title.startsWith('Chương') || title.startsWith('LỜI') },
      { text: ' ' + '.'.repeat(Math.max(10, 80 - title.length * 2)) + ' ' },
      { text: page, bold: true }
    ], { spaceBefore: 30, spaceAfter: 30 }));
  });

  docChildren.push(new Paragraph({ pageBreakBefore: true }));

  // LỜI MỞ ĐẦU
  docChildren.push(h1('LỜI MỞ ĐẦU'));
  docChildren.push(p('Trong bối cảnh nền kinh tế số và thương mại điện tử phát triển bùng nổ, việc ứng dụng công nghệ thông tin vào công tác quản trị và vận hành chuỗi phân phối không còn là một lựa chọn bổ sung mà đã trở thành yếu tố sống còn quyết định năng lực cạnh tranh của doanh nghiệp bán lẻ. Đối với mô hình kinh doanh đồ ăn vặt đóng gói trực tuyến như Snack Shop, đặc thù sản phẩm có vòng quay nhanh, số lượng chủng loại hàng hóa đa dạng, đối tượng khách hàng tập trung vào giới trẻ (học sinh, sinh viên, nhân viên văn phòng) và lượng đơn hàng phát sinh liên tục trong ngày, việc quản lý thủ công qua sổ sách hay các bảng tính Excel rời rạc nhanh chóng bộc lộ các bất cập: sai lệch tồn kho, thất thoát doanh thu, tốc độ xử lý đơn hàng chậm và thiếu tính liên kết dữ liệu giữa các khâu mua hàng, kho bãi và kế toán.'));
  docChildren.push(p('Xuất phát từ yêu cầu thực tiễn đó, kết hợp với các kiến thức chuyên môn nền tảng được trang bị trong học phần Hệ thống thông tin doanh nghiệp, nhóm nghiên cứu đã lựa chọn và triển khai đề tài: "Xây dựng hệ thống thông tin quản lý kinh doanh và bán lẻ đồ ăn vặt trực tuyến cho doanh nghiệp Snack Shop".'));
  docChildren.push(p('Mục tiêu trọng tâm của đề tài là xây dựng một hệ sinh thái thông tin hoàn chỉnh, khép kín, bao gồm cổng mua sắm trực tuyến đa kênh (Web Storefront & Mobile App) giúp khách hàng dễ dàng tìm kiếm món ăn, áp dụng khuyến mãi, đặt hàng và theo dõi vận đơn; đồng thời cung cấp cổng vận hành nội bộ (Back-Office) hiện đại giúp nhân viên kho xử lý đơn hàng, nhập xuất kho, và cung cấp bảng điều khiển thông minh giúp ban quản lý giám sát doanh thu, lượng hàng bán chạy và tình trạng tồn kho theo thời gian thực. Đồ án ứng dụng kiến trúc phân tầng chuẩn mực Clean Architecture với ASP.NET Core Web API (.NET 8), hệ cơ sở dữ liệu MySQL 8 với cơ chế bảo đảm toàn vẹn dữ liệu ở mức cơ sở dữ liệu (Triggers, Views, Constraints), cùng giao diện React 18 / Ant Design 5 và Mobile-First PWA.'));

  // LỜI CẢM ƠN
  docChildren.push(h1('LỜI CẢM ƠN'));
  docChildren.push(p('Để hoàn thành đề tài đồ án này một cách trọn vẹn, nhóm chúng em xin gửi lời cảm ơn chân thành và sâu sắc nhất đến Ban Giám hiệu Trường Đại học Sài Gòn cùng quý Thầy/Cô Khoa Công nghệ Thông tin đã tạo môi trường học tập năng động, cung cấp những nền tảng tri thức vững chắc về công nghệ phần mềm, phân tích thiết kế hệ thống và cơ sở dữ liệu doanh nghiệp trong suốt thời gian học tập tại trường.'));
  docChildren.push(p('Đặc biệt, nhóm xin gửi lời tri ân sâu sắc nhất tới Cô TS. Lê Nhị Lãm Thúy – giảng viên trực tiếp phụ trách và hướng dẫn học phần Hệ thống thông tin doanh nghiệp. Trong suốt quá trình thực hiện đồ án, sự hướng dẫn tận tình, những định hướng kiến trúc chuẩn xác, các đóng góp phản biện chuyên sâu và các yêu cầu nghiêm túc về mặt nghiệp vụ của Cô chính là kim chỉ nam giúp nhóm định hình bài toán thực tế, vượt qua các khó khăn kỹ thuật và từng bước hoàn thiện đồ án này.'));
  docChildren.push(p('Dù đã nỗ lực hết mình với tinh thần làm việc nghiêm túc, nhưng do giới hạn về thời gian và kinh nghiệm thực tiễn, báo cáo và sản phẩm phần mềm chắc chắn không tránh khỏi những thiếu sót nhất định. Nhóm rất mong nhận được những lời nhận xét, đánh giá và chỉ dẫn quý báu từ Cô để nhóm có thể đúc rút kinh nghiệm, hoàn thiện năng lực phân tích và kỹ năng xây dựng hệ thống phần mềm trong tương lai.'));

  docChildren.push(new Paragraph({ pageBreakBefore: true }));

  // CHƯƠNG 1
  docChildren.push(h1('Chương 1. Giới thiệu chung'));
  docChildren.push(h2('1.1. Giới thiệu về doanh nghiệp Snack Shop'));
  docChildren.push(p('Snack Shop là doanh nghiệp bán lẻ thế hệ mới chuyên cung cấp các mặt hàng đồ ăn vặt đóng gói sẵn tại thị trường Việt Nam (các sản phẩm tiêu biểu: khô gà lá chanh, khô bò miếng cay, khô mực rim me, bánh tráng phơi sương, cơm cháy chà bông, rong biển sấy tỏi ớt...).'));
  docChildren.push(p('Nhắm đến đối tượng khách hàng mục tiêu là học sinh, sinh viên, thanh niên và giới văn phòng – những đối tượng ưa chuộng sự tiện lợi, tốc độ và thường xuyên sử dụng điện thoại thông minh để đặt hàng – Snack Shop lựa chọn chiến lược vận hành 100% trực tuyến (Direct-to-Consumer / D2C E-commerce). Doanh nghiệp không đầu tư chi phí lớn vào mặt bằng cửa hàng hay không gian phục vụ truyền thống mà tập trung toàn bộ nguồn lực vào việc tối ưu kho vận trung tâm, kiểm soát chất lượng sản phẩm nhập kho, đa dạng hóa chủng loại và đẩy mạnh các kênh bán hàng trực tuyến đa nền tảng.'));

  // Embed brand logo if exists
  if (fs.existsSync(BRAND_LOGO_PATH)) {
    const brandData = fs.readFileSync(BRAND_LOGO_PATH);
    docChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [
        new ImageRun({
          data: brandData,
          transformation: { width: 120, height: 120 },
          type: 'png'
        })
      ]
    }));
    docChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [new TextRun({ text: 'Hình 1.1: Biểu trưng nhận diện thương hiệu chuỗi đồ ăn vặt Snack Shop', font: FONT_FAMILY, size: 22, italic: true, color: '566573' })]
    }));
  }

  docChildren.push(h2('1.2. Mô hình và các hoạt động kinh doanh của doanh nghiệp'));
  docChildren.push(p('Doanh nghiệp vận hành theo mô hình bán lẻ trực tiếp từ kho hàng trung tâm đến tay người tiêu dùng cuối cùng thông qua các nền tảng số. Hàng hóa là các loại đồ ăn vặt đã được chế biến, đóng gói đạt chuẩn vệ sinh an toàn thực phẩm nhập từ các xưởng sản xuất uy tín. Các hoạt động kinh doanh chủ yếu bao gồm:'));
  docChildren.push(bulletItem('Tìm kiếm nguồn hàng và mua hàng nhập kho:', 'Hợp tác với các nhà cung cấp/xưởng chế biến đồ ăn vặt uy tín, quản lý danh mục nhà cung cấp, kiểm tra chất lượng và tiến hành nhập kho hàng hóa theo lô.'));
  docChildren.push(bulletItem('Quản lý danh mục và chiến dịch bán lẻ:', 'Thiết lập bảng giá, tổ chức danh mục món ăn theo phân cấp, triển khai các chương trình khuyến mãi giảm giá trực tiếp, chiết khấu theo giỏ hàng hoặc phát hành mã Voucher.'));
  docChildren.push(bulletItem('Tiếp nhận, xử lý và đóng gói đơn hàng:', 'Tiếp nhận đơn hàng từ Storefront Web và Mobile App, kiểm tra tình trạng thanh toán, đối soát tồn kho, nhặt hàng tại kho, đóng gói, in hóa đơn và dán mã vận đơn.'));
  docChildren.push(bulletItem('Giao vận và hoàn tất đơn hàng:', 'Bàn giao kiện hàng đóng gói sẵn cho đơn vị vận chuyển (shipper), theo dõi lộ trình và cập nhật trạng thái đơn hàng cho khách.'));
  docChildren.push(bulletItem('Chăm sóc khách hàng và hậu mãi:', 'Tiếp nhận phản hồi, đánh giá chất lượng sản phẩm từ khách hàng đã mua và giải quyết khiếu nại.'));
  docChildren.push(bulletItem('Kế toán, đối soát và báo cáo quản trị:', 'Quản lý chi phí nhập hàng, doanh thu bán lẻ, thống kê các mặt hàng bán chạy và cảnh báo lượng hàng tồn kho chạm ngưỡng an toàn.'));

  docChildren.push(h2('1.3. Cơ cấu tổ chức và nhân sự của doanh nghiệp'));
  docChildren.push(p('Nhằm duy trì bộ máy vận hành tinh gọn, linh hoạt nhưng đạt hiệu quả cao, cơ cấu nhân sự của Snack Shop được tổ chức thành 4 vị trí then chốt:'));
  docChildren.push(bulletItem('Quản trị viên (Admin):', 'Nắm toàn quyền thiết lập hệ sinh thái công nghệ, quản lý tài khoản người dùng, phân quyền bảo mật, cấu hình tham số hệ thống và bảo trì cơ sở dữ liệu.'));
  docChildren.push(bulletItem('Quản lý cửa hàng (Manager):', 'Chịu trách nhiệm giám sát toàn bộ hoạt động kinh doanh, quyết định giá bán, tạo lập các chương trình khuyến mãi/voucher, theo dõi báo cáo doanh thu và đưa ra dự báo nhập hàng.'));
  docChildren.push(bulletItem('Nhân viên kho và xử lý đơn (Staff):', 'Thực hiện nghiệp vụ nhập kho từ nhà cung cấp, kiểm tra đơn hàng mới, nhặt hàng, đóng gói, xuất hóa đơn và bàn giao hàng cho đối tác vận chuyển.'));
  docChildren.push(bulletItem('Kế toán:', 'Theo dõi dòng tiền, đối soát thanh toán trực tuyến/COD, kiểm tra giá vốn nhập kho và hỗ trợ chốt doanh số theo chu kỳ.'));

  docChildren.push(h2('1.4. Bảng khảo sát hệ thống thông tin của doanh nghiệp'));
  docChildren.push(p('Dưới đây là bảng phân tích khảo sát chi tiết hiện trạng các quy trình nghiệp vụ của doanh nghiệp Snack Shop trước và sau khi triển khai hệ thống thông tin mới:'));

  const surveyTable = makeTable(
    ['STT', 'Quy trình nghiệp vụ', 'Hiện trạng xử lý thủ công', 'Vấn đề & Rủi ro gặp phải', 'Giải pháp từ Hệ thống mới'],
    [
      ['1', 'Bán hàng & Đặt hàng', 'Nhận đơn qua tin nhắn mạng xã hội hoặc bảng tính Excel rời rạc.', 'Dễ sót đơn, nhầm địa chỉ giao hàng, khách hàng không tra cứu được tiến trình.', 'Cung cấp Web Storefront & Mobile App tự phục vụ 24/7; tự động tính tổng tiền; mã đơn chuẩn hóa.'],
      ['2', 'Kiểm soát tồn kho', 'Ghi chép sổ kho thủ công hoặc kiểm đếm định kỳ cuối tuần.', 'Bán vượt quá số lượng tồn kho (overselling), thất thoát hàng, không kịp nhập hàng.', 'Ràng buộc trừ tồn kho tức thời bằng Database Trigger; tự động hoàn kho khi hủy đơn; View cảnh báo.'],
      ['3', 'Khuyến mãi & Voucher', 'Nhân viên tự nhớ mã giảm giá và tính trừ thủ công cho khách.', 'Dễ nhầm lẫn, khách dùng gian lận nhiều lần, không kiểm soát được ngân sách chiết khấu.', 'Động cơ khuyến mãi tự động phân loại theo SP, theo đơn và Voucher code; kiểm tra chặt chẽ số lần dùng.'],
      ['4', 'Quản lý nhập hàng', 'Lưu trữ các hóa đơn giấy từ nhà cung cấp trong bìa hồ sơ.', 'Khó tra cứu lịch sử giá nhập, không thống kê được biến động công nợ và giá vốn hàng bán.', 'Số hóa phiếu nhập kho liên kết nhà cung cấp; tự động tính tổng tiền và tự động cộng dồn số lượng tồn.'],
      ['5', 'Đánh giá & Phản hồi', 'Khách phản hồi qua tin nhắn, dễ bị trôi tin nhắn.', 'Thiếu sự minh bạch, không tổng hợp được điểm uy tín thực tế của từng món ăn vặt.', 'Hệ thống đánh giá 5 sao có điều kiện: chỉ cho phép đánh giá khi đơn hàng đã giao thành công.'],
      ['6', 'Báo cáo & Thống kê', 'Cuối tháng kế toán mất 2-3 ngày tổng hợp số liệu từ các file Excel.', 'Số liệu chậm trễ, không theo thời gian thực, dễ sai sót công thức tính toán.', 'Báo cáo doanh thu, lợi nhuận, mặt hàng bán chạy hiển thị trực quan theo thời gian thực trên Dashboard.']
    ],
    [600, 1600, 2200, 2300, 2600]
  );
  docChildren.push(surveyTable);

  docChildren.push(new Paragraph({ pageBreakBefore: true }));

  // CHƯƠNG 2
  docChildren.push(h1('Chương 2. Phân tích hệ thống'));
  docChildren.push(h2('2.1. Mô tả hệ thống thông tin doanh nghiệp'));
  docChildren.push(h3('2.1.1. Mục tiêu và phạm vi hệ thống'));
  docChildren.push(p('Hệ thống thông tin quản lý kinh doanh và bán lẻ đồ ăn vặt trực tuyến cho Snack Shop được xây dựng nhằm:'));
  docChildren.push(bulletItem('Số hóa toàn diện chu trình bán lẻ:', 'Từ khâu nhập kho, niêm yết danh mục, kích cầu khuyến mãi, đặt hàng, xử lý kho vận đến chăm sóc khách hàng.'));
  docChildren.push(bulletItem('Tự động hóa các nghiệp vụ tính toán chi phí:', 'Trừ/hoàn tồn kho và xuất hóa đơn với độ chính xác tuyệt đối ở tầng cơ sở dữ liệu.'));
  docChildren.push(bulletItem('Nâng cao trải nghiệm khách hàng:', 'Thông qua giao diện Web hiện đại và ứng dụng di động Mobile-First thân thiện, dễ sử dụng.'));
  docChildren.push(bulletItem('Cung cấp bức tranh toàn cảnh:', 'Cho ban quản lý giúp đưa ra quyết định nhập hàng và định giá kịp thời thông qua hệ thống báo cáo thông minh.'));

  docChildren.push(h3('2.1.2. Cơ chế phân quyền người dùng (Role-Based Access Control - RBAC)'));
  docChildren.push(p('Hệ thống phân chia 4 nhóm tác nhân với ma trận phân quyền bảo mật rõ rệt:'));
  docChildren.push(bulletItem('Khách hàng (khach_hang):', 'Đăng ký/đăng nhập, duyệt thực đơn, tìm kiếm món, quản lý giỏ hàng, áp dụng voucher, đặt hàng, theo dõi lịch sử và trạng thái đơn hàng, nhận thông báo, viết đánh giá sản phẩm sau khi đã nhận hàng thành công.'));
  docChildren.push(bulletItem('Nhân viên vận hành (nhan_vien):', 'Tiếp nhận đơn hàng mới, cập nhật trạng thái đơn (xác nhận, giao hàng), xuất hóa đơn bán lẻ, quản lý nhà cung cấp, lập phiếu nhập kho hàng hóa từ nhà cung cấp.'));
  docChildren.push(bulletItem('Quản lý cửa hàng (quan_ly):', 'Toàn quyền quản lý danh mục và sản phẩm (thêm/sửa/ngừng bán), quản lý các chương trình khuyến mãi & voucher, tra cứu danh sách sản phẩm sắp hết hàng, xem bảng điều khiển báo cáo doanh thu theo tháng và danh sách món ăn bán chạy nhất.'));
  docChildren.push(bulletItem('Quản trị viên hệ thống (admin):', 'Toàn quyền truy cập mọi phân hệ, quản lý danh sách người dùng, cấp phát tài khoản nhân viên/quản lý, khóa/mở tài khoản vi phạm và quản trị an toàn hệ thống.'));

  docChildren.push(h3('2.1.3. Các phân hệ chức năng cốt lõi'));
  docChildren.push(p('Hệ thống được cấu trúc thành 5 phân hệ tương tác mật thiết:'));
  docChildren.push(bulletItem('1. Phân hệ Danh mục & Sản phẩm:', 'Quản lý cây danh mục đa cấp, chi tiết sản phẩm, đơn vị tính, thư viện hình ảnh và tính điểm sao trung bình.'));
  docChildren.push(bulletItem('2. Phân hệ Giỏ hàng & Khuyến mãi:', 'Xử lý logic chọn món, lưu trữ giỏ hàng cá nhân hóa, động cơ áp dụng khuyến mãi sản phẩm, chiết khấu hóa đơn và kiểm soát mã voucher.'));
  docChildren.push(bulletItem('3. Phân hệ Đơn hàng & Kho vận:', 'Tiếp nhận đơn hàng, ràng buộc trừ/hoàn tồn kho tự động, truy vết lịch sử đổi trạng thái đơn và xuất hóa đơn bán hàng.'));
  docChildren.push(bulletItem('4. Phân hệ Chuỗi cung ứng & Nhập hàng:', 'Quản lý thông tin nhà cung cấp, lập phiếu nhập kho và tự động cộng dồn số lượng tồn kho.'));
  docChildren.push(bulletItem('5. Phân hệ Tương tác & Báo cáo:', 'Đánh giá chất lượng món ăn (verified purchase), trung tâm thông báo thời gian thực và dashboard báo cáo phân tích kinh doanh.'));

  docChildren.push(h3('2.1.4. Danh mục 13 đặc điểm chính của hệ thống'));
  docChildren.push(p('Toàn bộ giải pháp công nghệ và nghiệp vụ của dự án SnackShop được chuẩn hóa thành 13 đặc điểm chính đánh số từ 1 đến 13 như sau:'));
  const featureList = [
    ['1', 'Xác thực bảo mật và phân quyền truy cập đa tầng theo vai trò (RBAC - Role-Based Access Control)'],
    ['2', 'Quản lý danh mục phân cấp cha – con và danh mục món ăn vặt đa thuộc tính'],
    ['3', 'Quản lý giỏ hàng trực tuyến cá nhân hóa và kiểm tra tình trạng kho tức thời'],
    ['4', 'Động cơ khuyến mãi đa hình thức (Theo sản phẩm, Theo hóa đơn và Mã Voucher giảm giá)'],
    ['5', 'Quy trình đặt hàng tự động hóa và đối soát tài chính minh bạch'],
    ['6', 'Kiểm soát toàn vẹn tồn kho và chống gian lận đặt hàng bằng Database Trigger'],
    ['7', 'Quản lý vòng đời và truy vết lịch sử trạng thái đơn hàng (Order Lifecycle & Audit Trail)'],
    ['8', 'Quản lý phát hành hóa đơn bán lẻ và hỗ trợ quyết toán kế toán'],
    ['9', 'Quản lý chuỗi cung ứng, hồ sơ nhà cung cấp và quy trình nhập kho hàng hóa'],
    ['10', 'Hệ thống đánh giá, nhận xét chất lượng món ăn gắn liền với lịch sử mua hàng'],
    ['11', 'Trung tâm quản lý thông báo đẩy nội bộ hướng sự kiện'],
    ['12', 'Báo cáo phân tích hiệu quả kinh doanh thông minh và cảnh báo ngưỡng tồn kho'],
    ['13', 'Kiến trúc triển khai đa nền tảng hiện đại (Web Storefront, Back-Office và Mobile App)']
  ];
  featureList.forEach(([num, title]) => {
    docChildren.push(numberedItem(num, title, ''));
  });

  docChildren.push(h3('2.1.5. Mô tả chi tiết 13 đặc điểm chính'));

  const detailedFeatures = [
    {
      num: 1,
      title: 'Xác thực bảo mật và phân quyền truy cập đa tầng theo vai trò (RBAC)',
      desc: 'Hệ thống triển khai xác thực người dùng dựa trên chuẩn token JWT (JSON Web Token) kết hợp thuật toán băm mật khẩu bảo mật cao BCrypt. Áp dụng mô hình thừa kế quan hệ trong cơ sở dữ liệu: bảng cha nguoi_dung lưu trữ thông tin định danh và tài khoản, các bảng con nhan_vien (chứa mức lương, ngày vào làm) và khach_hang kế thừa thông qua khóa chính đồng thời là khóa ngoại (ON DELETE CASCADE). Cơ chế xác thực phân cấp rõ rệt 4 nhóm quyền hạn: admin, quan_ly, nhan_vien, khach_hang. Mọi yêu cầu HTTP gửi đến API đều được giải mã token tập trung qua middleware để đối soát quyền trước khi thực thi controller.'
    },
    {
      num: 2,
      title: 'Quản lý danh mục phân cấp cha – con và danh mục món ăn vặt đa thuộc tính',
      desc: 'Bảng loai_san_pham hỗ trợ quan hệ đệ quy cha – con thông qua cột ma_loai_cha. Điều này cho phép doanh nghiệp tổ chức danh mục linh hoạt (Ví dụ: Danh mục cha "Đồ khô đóng gói" chứa danh mục con "Khô gà", "Khô bò", "Cơm cháy"). Bảng san_pham quản lý chi tiết: tên món, mã loại, mô tả thành phần, quy cách đóng gói (don_vi_tinh), giá bán niêm yết và số lượng tồn hiện có trong kho. Quản lý hình ảnh độc lập qua bảng hinh_anh_san_pham, cho phép một món ăn có nhiều ảnh chụp cận cảnh, xác định ảnh chính (la_anh_chinh = 1) và sắp xếp thứ tự hiển thị (thu_tu_hien_thi).'
    },
    {
      num: 3,
      title: 'Quản lý giỏ hàng trực tuyến cá nhân hóa và kiểm tra tình trạng kho tức thời',
      desc: 'Giỏ hàng được lưu trữ bền vững tại bảng chi_tiet_gio_hang với ràng buộc duy nhất UNIQUE(ma_khach_hang, ma_san_pham), đảm bảo mỗi món ăn chỉ xuất hiện 1 dòng cho mỗi khách hàng. Khi khách hàng thay đổi số lượng, hệ thống kiểm tra ngay với so_luong_ton trong bảng san_pham. Nếu người dùng yêu cầu số lượng vượt quá khả năng đáp ứng, hệ thống sẽ từ chối và cảnh báo trực tiếp trên giao diện.'
    },
    {
      num: 4,
      title: 'Động cơ khuyến mãi đa hình thức và quản lý voucher giảm giá',
      desc: 'Doanh nghiệp có thể cấu hình 3 loại hình khuyến mãi kế thừa từ bảng cha chuong_trinh_khuyen_mai: (1) khuyen_mai_theo_san_pham: Giảm trực tiếp theo % hoặc tiền mặt trên từng món ăn cụ thể; (2) khuyen_mai_theo_hoa_don: Áp dụng khi tổng đơn hàng đạt gia_tri_don_toi_thieu, có thiết lập mức giảm trần giam_toi_da; (3) khuyen_mai_theo_voucher: Khách hàng nhập mã code (ma_code). Trigger trg_don_hang_bi sẽ kiểm tra tính hợp lệ: thời gian hiệu lực, tổng số lượt sử dụng toàn hệ thống (gioi_han_su_dung) và giới hạn số lần sử dụng của riêng từng khách hàng (gioi_han_moi_khach).'
    },
    {
      num: 5,
      title: 'Quy trình đặt hàng tự động hóa và đối soát tài chính minh bạch',
      desc: 'Đơn hàng được định danh bởi khóa chính UUID và mã hiển thị trực quan ma_code (VD: DH202610...). Hệ thống tự động tính toán tổng tiền thanh toán qua cột tính toán lưu trữ: tong_tien_thanh_toan = tien_hang + phi_van_chuyen - tien_giam_gia. Bảng don_hang hỗ trợ 4 phương thức thanh toán: cod, chuyen_khoan, vi_dien_tu, the cùng trạng thái thanh toán và thông tin giao nhận chi tiết.'
    },
    {
      num: 6,
      title: 'Kiểm soát toàn vẹn tồn kho và chống gian lận đặt hàng bằng Database Trigger',
      desc: 'Khi đặt hàng: Trigger trg_ctdh_bi kiểm tra tồn kho tại thời điểm thêm chi tiết đơn; nếu không đủ tồn lập tức kích hoạt SIGNAL SQLSTATE 45000. Ngay sau khi thêm thành công, trigger trg_ctdh_ai tự động trừ số lượng tồn tại bảng san_pham và cập nhật lại tien_hang của đơn. Khi hủy đơn hàng: Nếu trạng thái đơn hàng chuyển sang da_huy, trigger trg_don_hang_au sẽ tự động quét danh sách sản phẩm đã đặt và cộng trả lại số lượng tồn kho nguyên vẹn, đồng thời hoàn lại 1 lượt dùng cho voucher nếu có.'
    },
    {
      num: 7,
      title: 'Quản lý vòng đời và truy vết lịch sử trạng thái đơn hàng (Order Lifecycle & Audit Trail)',
      desc: 'Vòng đời đơn hàng trải qua 5 trạng thái tuần tự: cho_xac_nhan -> da_xac_nhan -> dang_giao -> da_giao (hoặc da_huy). Mỗi lần chuyển đổi trạng thái, trigger trg_don_hang_au tự động ghi một bản ghi vào lich_su_don_hang, lưu vết mã người thao tác (nguoi_thuc_hien thông qua biến phiên @nguoi_thuc_hien), trạng thái mới, thời gian và ghi chú. Ràng buộc nghiệp vụ: Trigger trg_don_hang_bu tuyệt đối ngăn chặn việc khôi phục một đơn hàng đã ở trạng thái da_huy.'
    },
    {
      num: 8,
      title: 'Quản lý phát hành hóa đơn bán lẻ và hỗ trợ quyết toán kế toán',
      desc: 'Bảng hoa_don quản lý việc xuất chứng từ bán lẻ với số hóa đơn duy nhất (so_hoa_don). Trigger trg_hoa_don_bi tự động tính tổng tiền hóa đơn từ tổng chi tiết đơn hàng và kiểm tra tính hợp lệ: ném lỗi ngăn chặn nếu đơn hàng đã bị hủy. Lưu trữ thông tin nhân viên xuất hóa đơn, số hóa đơn duy nhất để phục vụ công tác kiểm toán nội bộ.'
    },
    {
      num: 9,
      title: 'Quản lý chuỗi cung ứng, hồ sơ nhà cung cấp và quy trình nhập kho hàng hóa',
      desc: 'Quản lý danh mục đối tác cung cấp đồ ăn vặt qua bảng nha_cung_cap. Phiếu nhập kho được lưu trong don_nhap_hang và chi_tiet_nhap_hang. Tự động hóa: Trigger trg_ctnh_ai tự động tăng số lượng tồn kho của các sản phẩm tương ứng và tự động tính lũy kế tong_tien cho đơn nhập kho mà không cần tính toán thủ công.'
    },
    {
      num: 10,
      title: 'Hệ thống đánh giá, nhận xét chất lượng món ăn gắn liền với lịch sử mua hàng',
      desc: 'Khách hàng có thể cho điểm số sao (1 đến 5 sao) và để lại bình luận cho sản phẩm đã mua qua bảng danh_gia_san_pham. Cơ chế bảo đảm tính trung thực (Verified Purchase): Trigger trg_danh_gia_bi kiểm tra chặt chẽ, chỉ cho phép đánh giá nếu sản phẩm đó thuộc một đơn hàng có trạng thái là da_giao. Khóa duy nhất uq_danh_gia_ctdh bảo đảm mỗi dòng sản phẩm đã mua chỉ được đánh giá duy nhất một lần. Điểm đánh giá được tự động tổng hợp thông qua View v_san_pham_hien_thi để hiển thị điểm sao trung bình ra ngoài trang chủ.'
    },
    {
      num: 11,
      title: 'Trung tâm quản lý thông báo đẩy nội bộ hướng sự kiện',
      desc: 'Bảng thong_bao lưu trữ các thông báo riêng biệt cho từng người dùng. Khi đơn hàng được tạo hoặc cập nhật trạng thái, trigger trên bảng don_hang tự động phát sinh thông báo đẩy tương ứng cho khách hàng (ví dụ: "Đơn hàng DH... đã được tạo", "Đơn hàng đang được giao"). Hỗ trợ theo dõi cờ trạng thái da_doc (0/1) giúp giao diện hiển thị badge số lượng tin mới.'
    },
    {
      num: 12,
      title: 'Báo cáo phân tích hiệu quả kinh doanh thông minh và cảnh báo ngưỡng tồn kho',
      desc: 'Hệ thống tích hợp sẵn các View tối ưu hóa cao trong MySQL: v_san_pham_hien_thi (hiển thị danh mục món ăn kèm điểm đánh giá sao trung bình và số lượng đánh giá); v_doanh_thu_theo_thang (thống kê doanh thu thuần và số lượng đơn hàng hoàn thành theo tháng/năm); v_san_pham_ban_chay (xếp hạng danh sách các món ăn vặt có số lượng bán và doanh thu cao nhất); v_san_pham_sap_het_hang (tự động lọc các sản phẩm có tồn kho dưới 10 đơn vị để cảnh báo nhập hàng).'
    },
    {
      num: 13,
      title: 'Kiến trúc triển khai đa nền tảng hiện đại (Web Storefront, Back-Office và Mobile App)',
      desc: 'Backend ASP.NET Core 8 Web API xây dựng theo Clean Architecture (Domain, Application, Infrastructure, API) đảm bảo tính mở rộng và dễ bảo trì. Frontend Web là ứng dụng SPA (Single Page Application) sử dụng React 18, Vite, Ant Design 5, TanStack Query và Zustand với 2 phân vùng rõ rệt: Storefront cho khách hàng và Back-Office cho nhân viên/quản lý. Mobile Client phát triển theo tư duy Mobile-First, tích hợp PWA và bộ thiết kế UI chuẩn hóa từ Google Stitch với gam màu chủ đạo cam rực rỡ và vàng phô mai, tối ưu trải nghiệm vuốt chạm trên điện thoại.'
    }
  ];

  detailedFeatures.forEach(f => {
    docChildren.push(h3(`2.1.5.${f.num}. Đặc điểm ${f.num}: ${f.title}`));
    docChildren.push(p(f.desc));
  });

  docChildren.push(h2('2.2. Sơ đồ phân rã chức năng (BFD - Business Function Diagram)'));
  docChildren.push(p('Sơ đồ phân rã chức năng (BFD) thể hiện cấu trúc cây phân cấp toàn diện của hệ thống từ chức năng gốc đến các chức năng thành phần mức 1 và mức 2:'));

  const bfdTable = makeTable(
    ['Chức năng Cấp 1', 'Chức năng Cấp 2', 'Nghiệp vụ chi tiết Cấp 3'],
    [
      ['1.0 Quản trị hệ thống & Người dùng', '1.1 Xác thực & Tài khoản\n1.2 Quản trị phân quyền', 'Đăng ký, Đăng nhập, Đổi mật khẩu, JWT Token.\nPhân quyền RBAC (Admin, Manager, Staff, Customer), Khóa/Mở tài khoản.'],
      ['2.0 Quản lý danh mục & Món ăn', '2.1 Phân cấp loại món\n2.2 Hồ sơ món ăn', 'Quản lý cây danh mục cha - con (loai_san_pham).\nThêm/sửa món ăn vặt, bảng giá, đơn vị tính, thư viện nhiều ảnh.'],
      ['3.0 Bán hàng & Xử lý đơn hàng', '3.1 Giỏ hàng & Voucher\n3.2 Xử lý đơn & Hóa đơn', 'Thêm giỏ hàng, kiểm tra tồn, áp mã giảm giá.\nTiếp nhận đơn, trừ kho tự động, chuyển trạng thái, xuất hóa đơn bán lẻ.'],
      ['4.0 Quản lý kho & Cung ứng', '4.1 Nhà cung cấp\n4.2 Nhập kho hàng hóa', 'Quản lý hồ sơ đối tác xưởng đồ ăn vặt.\nLập phiếu nhập kho theo lô, trigger tự động cộng dồn số lượng tồn.'],
      ['5.0 Khuyến mãi & Chăm sóc KH', '5.1 Động cơ khuyến mãi\n5.2 Đánh giá & Thông báo', 'Thiết lập giảm giá theo SP, theo hóa đơn, phát hành voucher code.\nĐánh giá 5 sao (verified purchase), trung tâm thông báo thời gian thực.'],
      ['6.0 Báo cáo & Thống kê', '6.1 Báo cáo doanh thu\n6.2 Phân tích kinh doanh', 'Báo cáo doanh số theo tháng/năm (v_doanh_thu_theo_thang).\nTop món bán chạy (v_san_pham_ban_chay), cảnh báo hàng sắp hết.']
    ],
    [2600, 2600, 4100]
  );
  docChildren.push(bfdTable);

  docChildren.push(h2('2.3. Sơ đồ luồng dữ liệu (DFD - Data Flow Diagram)'));
  docChildren.push(h3('2.3.1. Sơ đồ ngữ cảnh (DFD Mức 0)'));
  docChildren.push(p('Sơ đồ ngữ cảnh xác định ranh giới hệ thống với 3 thực thể ngoài chính: Khách hàng, Nhân viên / Quản lý và Nhà cung cấp:'));
  docChildren.push(bulletItem('Khách hàng gửi đến hệ thống:', 'Thông tin đăng ký, yêu cầu đăng nhập, giỏ hàng, thông tin đặt hàng, mã voucher, yêu cầu hủy đơn, đánh giá sản phẩm.'));
  docChildren.push(bulletItem('Hệ thống phản hồi cho Khách hàng:', 'Thực đơn món ăn vặt, kết quả áp mã giảm giá, hóa đơn điện tử, thông báo tiến độ giao hàng, lịch sử đơn mua.'));
  docChildren.push(bulletItem('Nhân viên / Quản lý gửi đến hệ thống:', 'Thông tin món ăn mới, giá bán niêm yết, chương trình khuyến mãi, cập nhật trạng thái đơn hàng, phiếu nhập kho.'));
  docChildren.push(bulletItem('Hệ thống phản hồi cho Nhân viên / Quản lý:', 'Danh sách đơn hàng mới cần xử lý, hóa đơn xuất bán, cảnh báo tồn kho sắp hết, biểu đồ báo cáo doanh thu theo tháng.'));
  docChildren.push(bulletItem('Nhà cung cấp tương tác:', 'Gửi thông tin báo giá, bàn giao hàng hóa kèm chứng từ nhập kho cho nhân viên vận hành.'));

  docChildren.push(h3('2.3.2. Sơ đồ DFD Mức 1'));
  docChildren.push(p('Ở mức 1, toàn bộ hệ thống được phân rã thành 6 tiến trình nghiệp vụ chính gắn liền với 5 kho dữ liệu lưu trữ:'));
  docChildren.push(bulletItem('Tiến trình 1.0 (Xác thực & Phân quyền):', 'Xử lý đăng nhập, cấp phát JWT Token và đối soát dữ liệu với Kho D1 (Người dùng & Nhân viên).'));
  docChildren.push(bulletItem('Tiến trình 2.0 (Quản lý Danh mục & Sản phẩm):', 'Tiếp nhận cập nhật món ăn từ quản lý, đồng bộ vào Kho D2 (Danh mục & Món ăn) và cung cấp danh mục hiển thị cho khách.'));
  docChildren.push(bulletItem('Tiến trình 3.0 (Bán hàng & Xử lý đơn hàng):', 'Xử lý đặt hàng, kiểm tra trừ tồn từ Kho D2, áp dụng chiết khấu từ Kho D5, lưu trữ đơn hàng & lịch sử vào Kho D3.'));
  docChildren.push(bulletItem('Tiến trình 4.0 (Quản lý Kho & Nhập hàng):', 'Lập phiếu nhập kho, lưu vào Kho D4 (Kho & Nhà cung cấp) và kích hoạt trigger tự động cộng dồn số lượng tồn vào Kho D2.'));
  docChildren.push(bulletItem('Tiến trình 5.0 (Khuyến mãi & Tương tác khách hàng):', 'Cấu hình voucher/khuyến mãi, tiếp nhận đánh giá món ăn sau khi giao hàng thành công và phát thông báo.'));
  docChildren.push(bulletItem('Tiến trình 6.0 (Báo cáo & Thống kê):', 'Truy vấn tổng hợp từ Kho D3 (Đơn hàng) và Kho D2 (Tồn kho) để kết xuất số liệu doanh thu và hàng bán chạy.'));

  docChildren.push(h3('2.3.3. Sơ đồ DFD Mức 2'));
  docChildren.push(p('Tiến trình 3.0 (Xử lý đơn hàng & Bán lẻ) được phân rã thành 5 tiến trình con mức 2:'));
  docChildren.push(bulletItem('3.1 Thêm món vào Giỏ hàng:', 'Ghi nhận lựa chọn của khách hàng vào bảng chi_tiet_gio_hang, đối soát tức thời với số lượng tồn kho.'));
  docChildren.push(bulletItem('3.2 Tạm tính & Kiểm tra Voucher:', 'Kiểm tra tính hợp lệ của mã giảm giá (thời gian hiệu lực, trần giảm giá, số lần đã dùng) và tính toán số tiền giảm.'));
  docChildren.push(bulletItem('3.3 Lưu đơn hàng & Trừ tồn kho:', 'Tạo bản ghi trong don_hang, chi_tiet_don_hang. Trigger trg_ctdh_bi và trg_ctdh_ai tự động kiểm tra và trừ tồn kho.'));
  docChildren.push(bulletItem('3.4 Cập nhật Trạng thái & Ghi lịch sử:', 'Nhân viên chuyển trạng thái đơn (xác nhận, đang giao, đã giao). Trigger tự động ghi nhật ký vào lich_su_don_hang.'));
  docChildren.push(bulletItem('3.5 Xuất hóa đơn bán lẻ:', 'Nhân viên phát hành hóa đơn tại bảng hoa_don, hệ thống kiểm tra ngăn chặn xuất hóa đơn cho các đơn hàng đã hủy.'));

  docChildren.push(new Paragraph({ pageBreakBefore: true }));

  // CHƯƠNG 3
  docChildren.push(h1('Chương 3. Thiết kế hệ thống'));
  docChildren.push(h2('3.1. Cơ sở dữ liệu hệ thống'));
  docChildren.push(h3('3.1.1. Mô hình quan hệ thực thể (ERD)'));
  docChildren.push(p('Cơ sở dữ liệu của hệ thống được chuẩn hóa ở mức 3NF (Third Normal Form) gồm 15 bảng quan hệ chặt chẽ. Dưới đây là sơ đồ quan hệ thực thể (ERD) hoàn chỉnh của hệ thống SnackShop:'));

  if (fs.existsSync(ERD_IMAGE_PATH)) {
    const erdData = fs.readFileSync(ERD_IMAGE_PATH);
    docChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [
        new ImageRun({
          data: erdData,
          transformation: { width: 550, height: 350 },
          type: 'png'
        })
      ]
    }));
    docChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [new TextRun({ text: 'Hình 3.1: Sơ đồ quan hệ thực thể (ERD) cơ sở dữ liệu hệ thống SnackShop', font: FONT_FAMILY, size: 22, italic: true, color: '566573' })]
    }));
  }

  docChildren.push(h3('3.1.2. Danh mục 15 bảng dữ liệu chính'));
  const tablesList = [
    ['1', 'nguoi_dung', 'Lưu tài khoản định danh chung, email độc nhất, mật khẩu băm BCrypt, vai trò và trạng thái.'],
    ['2', 'nhan_vien', 'Kế thừa từ nguoi_dung, lưu thông tin nhân sự vận hành: mức lương, ngày vào làm.'],
    ['3', 'khach_hang', 'Kế thừa từ nguoi_dung, định danh khách hàng mua sắm đồ ăn vặt.'],
    ['4', 'loai_san_pham', 'Danh mục món ăn hỗ trợ phân cấp cha - con thông qua khóa ngoại đệ quy ma_loai_cha.'],
    ['5', 'san_pham', 'Hồ sơ món ăn: tên món, mã loại, đơn vị tính, giá niêm yết, số lượng tồn kho khả dụng.'],
    ['6', 'hinh_anh_san_pham', 'Thư viện hình ảnh của từng món ăn, cờ ảnh đại diện chính và thứ tự hiển thị.'],
    ['7', 'nha_cung_cap', 'Danh mục các đối tác/xưởng cung cấp đồ ăn vặt đóng gói nhập sẵn.'],
    ['8', 'don_nhap_hang', 'Phiếu nhập kho hàng hóa từ nhà cung cấp, lưu tổng tiền nhập do trigger tự động cộng dồn.'],
    ['9', 'chi_tiet_nhap_hang', 'Chi tiết số lượng và đơn giá nhập từng món, tính thanh_tien tự động qua cột generated.'],
    ['10', 'chi_tiet_gio_hang', 'Món ăn trong giỏ hàng khách hàng, khóa duy nhất UNIQUE(ma_khach_hang, ma_san_pham).'],
    ['11', 'chuong_trinh_khuyen_mai', 'Bảng cha quản lý thời gian hiệu lực và tên chiến dịch khuyến mãi.'],
    ['12', 'khuyen_mai_theo_voucher', 'Kế thừa khuyến mãi: lưu mã code, % hoặc số tiền giảm, trần giảm, giới hạn lượt dùng.'],
    ['13', 'don_hang', 'Đơn đặt hàng: mã hiển thị ma_code, tổng tiền thanh toán tự động, phương thức thanh toán, trạng thái.'],
    ['14', 'chi_tiet_don_hang', 'Danh sách món đặt trong đơn, đơn giá tại thời điểm mua, thanh_tien generated.'],
    ['15', 'hoa_don', 'Chứng từ thanh toán bán lẻ gắn với đơn hàng, lưu số hóa đơn duy nhất và nhân viên xuất.']
  ];

  const dbTable = makeTable(
    ['STT', 'Tên bảng (Table Name)', 'Mô tả ý nghĩa nghiệp vụ'],
    tablesList,
    [800, 2800, 5700]
  );
  docChildren.push(dbTable);

  docChildren.push(h3('3.1.3. Các ràng buộc logic và cơ chế Trigger tự động'));
  docChildren.push(p('Để đảm bảo tính toàn vẹn tuyệt đối của dữ liệu kinh doanh, hệ thống đã cài đặt 8 Stored Triggers quan trọng:'));
  docChildren.push(bulletItem('trg_ctdh_bi (BEFORE INSERT chi_tiet_don_hang):', 'Kiểm tra so_luong_ton của sản phẩm trong kho. Nếu tồn kho không đủ đáp ứng, ném mã lỗi SQLSTATE 45000: "Không đủ tồn kho cho sản phẩm được đặt".'));
  docChildren.push(bulletItem('trg_ctdh_ai (AFTER INSERT chi_tiet_don_hang):', 'Tự động trừ số lượng tồn kho tương ứng trong bảng san_pham và cập nhật lại tien_hang của don_hang.'));
  docChildren.push(bulletItem('trg_don_hang_au (AFTER UPDATE don_hang):', 'Khi trạng thái đơn hàng chuyển sang da_huy, trigger tự động hoàn trả số lượng tồn kho cho toàn bộ sản phẩm trong đơn, đồng thời giảm 1 lượt đã dùng của voucher. Khi chuyển trạng thái khác, tự động ghi nhật ký vào lich_su_don_hang và gửi thông báo mới.'));
  docChildren.push(bulletItem('trg_don_hang_bu (BEFORE UPDATE don_hang):', 'Ngăn chặn tuyệt đối việc chuyển trạng thái đối với các đơn hàng đã hủy: "Đơn hàng đã hủy, không thể khôi phục trạng thái".'));
  docChildren.push(bulletItem('trg_ctnh_ai (AFTER INSERT chi_tiet_nhap_hang):', 'Tự động cộng dồn số lượng tồn kho sản phẩm khi nhập hàng và cập nhật tổng tiền cho don_nhap_hang.'));
  docChildren.push(bulletItem('trg_danh_gia_bi (BEFORE INSERT danh_gia_san_pham):', 'Kiểm tra điều kiện khách hàng chỉ được đánh giá sản phẩm nếu đơn hàng đã ở trạng thái da_giao.'));
  docChildren.push(bulletItem('trg_hoa_don_bi (BEFORE INSERT hoa_don):', 'Ngăn chặn xuất hóa đơn cho các đơn hàng đã bị hủy và tự động tính tổng tiền từ chi tiết đơn hàng.'));

  docChildren.push(h3('3.1.4. Các khung nhìn (Views) phục vụ báo cáo quản trị'));
  docChildren.push(p('Cơ sở dữ liệu được tối ưu hóa với 4 Views truy vấn thông minh:'));
  docChildren.push(bulletItem('v_san_pham_hien_thi:', 'Kết hợp bảng sản phẩm với loại sản phẩm và tự động tính điểm số sao trung bình (diem_trung_binh) cùng tổng số lượt nhận xét.'));
  docChildren.push(bulletItem('v_doanh_thu_theo_thang:', 'Tổng hợp doanh thu thuần, số lượng đơn hàng giao thành công theo chu kỳ tháng và năm.'));
  docChildren.push(bulletItem('v_san_pham_ban_chay:', 'Xếp hạng danh sách các món ăn vặt có tổng số lượng bán và tổng doanh thu cao nhất để hỗ trợ chiến lược nhập hàng.'));
  docChildren.push(bulletItem('v_san_pham_sap_het_hang:', 'Tự động lọc các sản phẩm có số lượng tồn kho chạm ngưỡng cảnh báo (<= 10 đơn vị).'));

  docChildren.push(h2('3.2. Thiết kế giao diện hệ thống'));
  docChildren.push(h3('3.2.1. Giao diện Web Bán hàng (Storefront) & Mobile App'));
  docChildren.push(p('Giao diện khách hàng được thiết kế theo tư duy Mobile-First dựa trên bộ nhận diện thương hiệu chuẩn từ Google Stitch:'));
  docChildren.push(bulletItem('Bảng màu nhận diện ấm áp:', 'Màu chủ đạo cam rực rỡ (#F97316), màu nhấn vàng phô mai (#F59E0B) và đỏ ớt cay (#EF4444) kích thích vị giác và tạo sự thân thiện.'));
  docChildren.push(bulletItem('Trang chủ & Thực đơn:', 'Banner carousel khuyến mãi lớn, danh mục món ăn dạng thẻ trực quan, bộ lọc nhanh theo loại món, thanh tìm kiếm thông minh và nút thêm nhanh vào giỏ.'));
  docChildren.push(bulletItem('Trang chi tiết món ăn:', 'Trưng bày thư viện ảnh sắc nét, ô tùy chọn khối lượng đóng gói (150g, 300g, 500g), tình trạng kho khả dụng, điểm sao trung bình và danh sách đánh giá từ người mua trước.'));
  docChildren.push(bulletItem('Giỏ hàng & Đặt hàng:', 'Giao diện tóm tắt đơn hàng rõ ràng, kiểm tra mã voucher trực tiếp (real-time validation), hỗ trợ chọn địa chỉ nhận hàng và hình thức thanh toán COD hoặc trực tuyến.'));
  docChildren.push(bulletItem('Theo dõi vận đơn & Thông báo:', 'Thanh tiến trình trực quan (Timeline) 4 bước: Chờ xác nhận -> Đã xác nhận -> Đang giao -> Hoàn thành. Tab thông báo phân loại tin đơn hàng và ưu đãi.'));

  docChildren.push(h3('3.2.2. Giao diện Vận hành & Quản trị (Back-Office)'));
  docChildren.push(p('Giao diện Back-Office được xây dựng trên thư viện Ant Design 5 chuyên nghiệp:'));
  docChildren.push(bulletItem('Dashboard Quản lý:', 'Biểu đồ trực quan hóa doanh thu theo thời gian, thống kê tỷ lệ hoàn thành đơn hàng, bảng xếp hạng món ăn bán chạy nhất.'));
  docChildren.push(bulletItem('Phân hệ Đơn hàng:', 'Bảng danh sách đơn hàng đa tiêu chí (mã đơn, khách hàng, ngày tạo, trạng thái), chức năng đổi trạng thái nhanh kèm modal xác nhận an toàn, nút in hóa đơn 1 chạm.'));
  docChildren.push(bulletItem('Phân hệ Kho hàng:', 'Màn hình lập phiếu nhập kho theo lô, tự động điền đơn giá và thành tiền; màn hình cảnh báo các món ăn sắp hết hàng.'));
  docChildren.push(bulletItem('Phân hệ Khuyến mãi:', 'Giao diện tạo mới chương trình khuyến mãi theo sản phẩm, theo hóa đơn hoặc voucher với các ô nhập điều kiện trực quan.'));

  docChildren.push(new Paragraph({ pageBreakBefore: true }));

  // CHƯƠNG 4
  docChildren.push(h1('Chương 4. Cài đặt và bảo trì hệ thống'));
  docChildren.push(h2('4.1. Kiến trúc kỹ thuật và môi trường cài đặt'));
  docChildren.push(p('Hệ thống được thiết kế theo mô hình phân tầng Clean Architecture kết hợp các công nghệ tiên tiến nhất hiện nay:'));
  docChildren.push(bulletItem('Backend (.NET 8):', 'Xây dựng bằng ASP.NET Core 8 Web API chia thành 4 dự án độc lập: SnackShop.Domain (Entities, Enums), SnackShop.Application (DTOs, Services, FluentValidation), SnackShop.Infrastructure (EF Core 8, Pomelo MySQL, Security BCrypt/JWT), SnackShop.API (Controllers, Middlewares).'));
  docChildren.push(bulletItem('Frontend Web (React 18 + Vite):', 'Xây dựng với Vite cho tốc độ khởi động nhanh, Ant Design 5 cung cấp hệ thống Design Tokens và linh kiện phong phú, TanStack Query quản lý server-state và caching thông minh, Zustand quản lý auth-state.'));
  docChildren.push(bulletItem('Cơ sở dữ liệu (MySQL 8):', 'Sử dụng MySQL Server 8.0 với engine InnoDB, bảng mã utf8mb4_unicode_ci hỗ trợ tiếng Việt có dấu hoàn hảo.'));

  docChildren.push(h2('4.2. Kịch bản kiểm thử nghiệp vụ then chốt'));
  docChildren.push(p('Dưới đây là bảng tổng hợp kết quả thực thi các ca kiểm thử (Test Cases) quan trọng nhằm bảo đảm tính đúng đắn của hệ thống:'));

  const testTable = makeTable(
    ['Mã TC', 'Kịch bản kiểm thử', 'Dữ liệu đầu vào', 'Kết quả mong đợi', 'Kết quả thực tế', 'Đánh giá'],
    [
      ['TC-01', 'Đặt hàng vượt quá số lượng tồn kho', 'Khô gà lá chanh tồn: 5 gói. Khách đặt mua: 10 gói.', 'Hệ thống chặn tạo đơn, trigger ném mã lỗi 45000: "Không đủ tồn kho...".', 'API trả về mã HTTP 400 kèm thông báo rõ ràng.', 'ĐẠT'],
      ['TC-02', 'Áp dụng mã Voucher hợp lệ', 'Đơn hàng 250.000 VNĐ. Áp voucher giảm 10% (tối đa 30.000 VNĐ).', 'Giảm 25.000 VNĐ. Tổng tiền thanh toán tự động tính = 225.000 VNĐ + ship.', 'Số tiền giảm và tổng thanh toán khớp chính xác.', 'ĐẠT'],
      ['TC-03', 'Sử dụng Voucher quá số lần cho phép', 'Voucher giới hạn 1 lần/khách. Khách đặt đơn thứ 2 với cùng mã.', 'Hệ thống từ chối áp dụng, báo "Khách hàng đã dùng hết số lần cho phép...".', 'Trigger chặn thành công, đơn hàng không được lưu.', 'ĐẠT'],
      ['TC-04', 'Hủy đơn hàng và kiểm tra hoàn tồn kho', 'Hủy đơn hàng chứa 3 gói Cơm cháy chà bông.', 'Số lượng tồn của món tự động tăng thêm 3 gói; voucher được hoàn lại 1 lượt.', 'Tồn kho và lượt voucher được phục hồi ngay tức khắc.', 'ĐẠT'],
      ['TC-05', 'Đánh giá món khi đơn chưa giao', 'Khách đánh giá món trong đơn hàng đang ở trạng thái dang_giao.', 'Từ chối cho phép gửi đánh giá: "Chỉ được đánh giá khi đơn hàng đã giao".', 'Giao diện khóa chức năng đánh giá với đơn chưa giao.', 'ĐẠT']
    ],
    [800, 1800, 2100, 2100, 1800, 700]
  );
  docChildren.push(testTable);

  docChildren.push(h2('4.3. Quy trình vận hành và bảo trì hệ thống'));
  docChildren.push(p('Để hệ thống vận hành liên tục và ổn định 24/7, nhóm xây dựng quy trình bảo trì gồm 3 trụ cột:'));
  docChildren.push(bulletItem('1. Giám sát nhật ký (Centralized Logging):', 'Tầng Middleware tự động bắt toàn bộ Exception chưa được xử lý, ghi log chi tiết lỗi kèm StackTrace vào tệp nhật ký hàng ngày để đội ngũ kỹ thuật khắc phục sự cố kịp thời.'));
  docChildren.push(bulletItem('2. Sao lưu tự động (Automated Backup):', 'Thiết lập cron job tự động chạy tiện ích mysqldump vào lúc 02:00 sáng mỗi ngày, nén tệp sao lưu có mã hóa và tải lên dịch vụ lưu trữ đám mây.'));
  docChildren.push(bulletItem('3. Tối ưu hóa định kỳ:', 'Định kỳ rà soát hiệu năng các chỉ mục khóa ngoại (Index), dọn dẹp các bản ghi thông báo đã đọc quá 90 ngày nhằm giải phóng dung lượng lưu trữ.'));

  docChildren.push(new Paragraph({ pageBreakBefore: true }));

  // CHƯƠNG 5
  docChildren.push(h1('Chương 5. Tổng kết và hướng phát triển'));
  docChildren.push(h2('5.1. Đánh giá ưu điểm và nhược điểm'));
  docChildren.push(h3('5.1.1. Ưu điểm'));
  docChildren.push(bulletItem('Kiến trúc chuẩn mực, khả năng mở rộng cao:', 'Sự kết hợp giữa Clean Architecture trên Backend .NET 8 và cấu trúc feature-driven trên Frontend React giúp mã nguồn mạch lạc, dễ mở rộng tính năng mới mà không gây ảnh hưởng đến các module cũ.'));
  docChildren.push(bulletItem('Bảo vệ toàn vẹn dữ liệu từ gốc:', 'Thay vì chỉ kiểm tra ở tầng ứng dụng, các logic sống còn (trừ/hoàn tồn kho, tính tiền, khóa đơn hủy, kiểm tra đánh giá) đều được cài đặt trực tiếp bằng Stored Triggers trong MySQL 8, loại trừ hoàn toàn nguy cơ sai lệch số liệu khi có nhiều người cùng đặt hàng đồng thời.'));
  docChildren.push(bulletItem('Trải nghiệm người dùng mượt mà:', 'Giao diện Storefront và Mobile App thân thiện, tốc độ tải trang cực nhanh nhờ Vite và TanStack Query; giao diện Back-Office tối ưu hóa công việc hàng ngày cho nhân viên kho.'));
  docChildren.push(bulletItem('Bảo mật phân quyền toàn diện:', 'Mô hình RBAC 4 vai trò kết hợp mã hóa BCrypt và JWT bảo vệ tuyệt đối dữ liệu nội bộ của doanh nghiệp.'));

  docChildren.push(h3('5.1.2. Nhược điểm'));
  docChildren.push(bulletItem('Chưa tích hợp cổng thanh toán trực tuyến thực tế:', 'Hệ thống hiện tại mới ghi nhận phương thức thanh toán chứ chưa kết nối Webhook trực tiếp với các cổng VNPAY, MoMo.'));
  docChildren.push(bulletItem('Chưa có thông báo thời gian thực 2 chiều (Real-time):', 'Việc cập nhật trạng thái đơn hàng hiện vẫn dựa trên cơ chế nạp lại dữ liệu (Query Invalidation) thay vì đẩy trực tiếp qua WebSocket/SignalR.'));

  docChildren.push(h2('5.2. Hướng phát triển trong tương lai'));
  docChildren.push(p('Nhằm nâng cao năng lực cạnh tranh cho Snack Shop trong giai đoạn mở rộng chuỗi, nhóm định hướng các mục tiêu phát triển tiếp theo:'));
  docChildren.push(bulletItem('1. Tích hợp cổng thanh toán trực tuyến VNPAY & MoMo:', 'Kết nối API thanh toán chính thức với cơ chế IPN (Instant Payment Notification) tự động đối soát trạng thái giao dịch ngân hàng.'));
  docChildren.push(bulletItem('2. Triển khai SignalR thời gian thực:', 'Tích hợp thư viện ASP.NET Core SignalR để cập nhật vị trí shipper và rung chuông thông báo đơn hàng mới cho nhân viên kho tức thì.'));
  docChildren.push(bulletItem('3. Ứng dụng Trí tuệ nhân tạo (AI):', 'Xây dựng thuật toán gợi ý món ăn (Recommendation System) dựa trên lịch sử mua sắm và hành vi duyệt món của từng khách hàng.'));
  docChildren.push(bulletItem('4. Quản lý đa kho hàng (Multi-warehouse):', 'Nâng cấp hệ thống để hỗ trợ quản lý nhiều chi nhánh kho tại các quận/huyện, tự động phân bổ đơn hàng cho kho gần khách hàng nhất để rút ngắn thời gian giao đồ ăn vặt.'));

  // Create Document instance with header & footer
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 20mm
              bottom: 1134, // 20mm
              left: 1701, // 30mm
              right: 1134 // 20mm
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'Trường Đại học Sài Gòn - Báo cáo Hệ thống thông tin doanh nghiệp (Snack Shop)',
                    font: FONT_FAMILY,
                    size: 18,
                    italic: true,
                    color: '7F8C8D'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120 },
                children: [
                  new TextRun({
                    text: 'Trang ',
                    font: FONT_FAMILY,
                    size: 20,
                    color: '7F8C8D'
                  }),
                  PageNumber.CURRENT,
                  new TextRun({
                    text: ' / ',
                    font: FONT_FAMILY,
                    size: 20,
                    color: '7F8C8D'
                  }),
                  PageNumber.TOTAL_PAGES
                ]
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  });
}

async function main() {
  console.log('Generating document...');
  const doc = buildDocument();
  console.log('Packing document into docx buffer...');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_DOCX, buffer);
  console.log(`Successfully generated Word report at: ${OUTPUT_DOCX}`);
}

main().catch(err => {
  console.error('Error generating docx:', err);
  process.exit(1);
});
