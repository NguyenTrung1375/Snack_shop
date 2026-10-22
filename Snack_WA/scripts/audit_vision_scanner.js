import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

function getExecutablePath() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Không tìm thấy Chrome hoặc Edge trên hệ thống!');
}

const OUTPUT_DIR = 'C:\\Users\\nguye\\.gemini\\antigravity\\brain\\a9144fdb-4509-47c0-bb32-d61e7c257c58\\audit';

const TARGET_PAGES = [
  { name: 'homepage', path: '/', label: 'Trang chủ' },
  { name: 'products', path: '/san-pham', label: 'Thực đơn & Sản phẩm' },
  { name: 'cart', path: '/gio-hang', label: 'Giỏ hàng' }
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }
];

async function runAudit() {
  const executablePath = getExecutablePath();
  console.log(`[Audit Scanner] Trình duyệt: ${executablePath}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--hide-scrollbars']
  });

  const auditReport = {
    timestamp: new Date().toISOString(),
    pagesScanned: [],
    totalErrors: 0,
    totalWarnings: 0,
    screenshots: []
  };

  try {
    const page = await browser.newPage();

    for (const target of TARGET_PAGES) {
      const pageResult = {
        name: target.name,
        label: target.label,
        url: `http://localhost:3000${target.path}`,
        consoleErrors: [],
        consoleWarnings: [],
        networkFailures: [],
        brokenImages: [],
        overflowIssues: [],
        viewports: []
      };

      const onConsole = (msg) => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
          pageResult.consoleErrors.push(text);
          auditReport.totalErrors++;
        } else if (type === 'warning') {
          pageResult.consoleWarnings.push(text);
          auditReport.totalWarnings++;
        }
      };

      const onPageError = (err) => {
        pageResult.consoleErrors.push(err.toString());
        auditReport.totalErrors++;
      };

      const onRequestFailed = (req) => {
        pageResult.networkFailures.push({
          url: req.url(),
          failure: req.failure() ? req.failure().errorText : 'Unknown'
        });
        auditReport.totalErrors++;
      };

      page.on('console', onConsole);
      page.on('pageerror', onPageError);
      page.on('requestfailed', onRequestFailed);

      for (const vp of VIEWPORTS) {
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          isMobile: vp.isMobile,
          deviceScaleFactor: vp.deviceScaleFactor
        });

        console.log(`[Audit Scanner] Quét ${target.label} (${target.path}) trên ${vp.name}...`);
        try {
          await page.goto(pageResult.url, { waitUntil: 'networkidle2', timeout: 15000 });
        } catch {
          // Continue if timeout
        }

        // Wait for skeleton or API settle
        try {
          await page.waitForFunction(() => {
            const skeletons = document.querySelectorAll('.ant-skeleton');
            return skeletons.length === 0;
          }, { timeout: 6000 });
        } catch {
          // If skeleton persists or doesn't exist, wait extra 2s
          await new Promise((r) => setTimeout(r, 2000));
        }

        // Final settle
        await new Promise((r) => setTimeout(r, 1500));

        // Layout & DOM checks
        const layoutAudit = await page.evaluate((vpName) => {
          const brokenImgs = [];
          document.querySelectorAll('img').forEach((img) => {
            if (img.src && (!img.complete || img.naturalWidth === 0)) {
              brokenImgs.push(img.src);
            }
          });

          const hasHorizontalOverflow = document.documentElement.scrollWidth > window.innerWidth;
          const overflowDelta = document.documentElement.scrollWidth - window.innerWidth;

          return {
            brokenImgs,
            hasHorizontalOverflow,
            overflowDelta,
            documentHeight: document.documentElement.scrollHeight
          };
        }, vp.name);

        if (layoutAudit.brokenImgs.length > 0) {
          pageResult.brokenImages.push(...layoutAudit.brokenImgs);
        }

        if (layoutAudit.hasHorizontalOverflow) {
          pageResult.overflowIssues.push({
            viewport: vp.name,
            deltaPx: layoutAudit.overflowDelta
          });
          auditReport.totalWarnings++;
        }

        const screenshotFilename = `${target.name}_${vp.name}.png`;
        const screenshotFullPath = path.join(OUTPUT_DIR, screenshotFilename);

        await page.screenshot({
          path: screenshotFullPath,
          fullPage: true
        });

        console.log(`[Audit Scanner] Đã lưu screenshot: ${screenshotFullPath}`);

        pageResult.viewports.push({
          viewport: vp.name,
          screenshot: screenshotFullPath,
          filename: screenshotFilename,
          height: layoutAudit.documentHeight,
          hasOverflow: layoutAudit.hasHorizontalOverflow
        });

        auditReport.screenshots.push({
          page: target.name,
          viewport: vp.name,
          path: screenshotFullPath
        });
      }

      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      page.off('requestfailed', onRequestFailed);

      auditReport.pagesScanned.push(pageResult);
    }

    const reportPath = path.join(OUTPUT_DIR, 'audit_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2), 'utf-8');
    console.log(`[Audit Scanner] Báo cáo hoàn tất: ${reportPath}`);
    console.log(`[Audit Scanner] Tổng lỗi: ${auditReport.totalErrors}, Tổng cảnh báo: ${auditReport.totalWarnings}`);
  } finally {
    await browser.close();
  }
}

runAudit().catch((err) => {
  console.error('[Audit Scanner Lỗi]:', err);
  process.exit(1);
});
