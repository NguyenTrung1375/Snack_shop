/**
 * Comprehensive Boundary & Validation Stress Test Harness
 * Author: Challenger 1 (Boundary & Validation Challenger)
 * Tests star ratings, comment boundaries, business integrity guards, database constraints, and race conditions.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BASE_URL = 'http://127.0.0.1:5000';
const projectRoot = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function recordResult(testId, name, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  ✓ [PASS] [${testId}] ${name}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] [${testId}] ${name}`);
    if (details) console.error(`     Details: ${details}`);
    failures.push({ testId, name, details });
  }
}

async function apiRequest(endpoint, { method = 'GET', token = null, body = null } = {}) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  const options = {
    method,
    headers,
  };
  if (body !== null) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
  } else {
    data = await res.text();
  }

  return {
    status: res.status,
    ok: res.ok,
    data,
  };
}

function cleanDatabaseReview(maChiTietDonHang) {
  try {
    execFileSync(
      'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
      [
        '-u',
        'root',
        '-pTrung1100',
        '-e',
        `USE snack_shop; DELETE FROM danh_gia_san_pham WHERE ma_chi_tiet_don_hang = '${maChiTietDonHang}';`,
      ],
      { stdio: 'ignore' }
    );
  } catch (err) {
    console.warn(`Warning: Could not clean DB review for ${maChiTietDonHang}: ${err.message}`);
  }
}

function countDatabaseReviews(maChiTietDonHang) {
  try {
    const out = execFileSync(
      'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
      [
        '-u',
        'root',
        '-pTrung1100',
        '-s',
        '-N',
        '-e',
        `USE snack_shop; SELECT COUNT(*) FROM danh_gia_san_pham WHERE ma_chi_tiet_don_hang = '${maChiTietDonHang}';`,
      ],
      { encoding: 'utf8' }
    );
    return parseInt(out.trim(), 10) || 0;
  } catch (err) {
    return -1;
  }
}

async function runAllStressTests() {
  console.log('================================================================');
  console.log('   EMPIRICAL BOUNDARY & VALIDATION STRESS TEST SUITE            ');
  console.log('   Challenger 1: Boundary & Business Integrity Verification      ');
  console.log('================================================================\n');

  // Step 0: Environment & Authentication Setup
  console.log('--- Step 0: Environment & Authentication Setup ---');
  let customerToken = null;
  let adminToken = null;

  try {
    const custLogin = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'customer@test.vn', matKhau: '123456' },
    });
    if (custLogin.status === 200 && custLogin.data?.token) {
      customerToken = custLogin.data.token;
      console.log('  ✓ Authenticated as customer (customer@test.vn)');
    } else {
      throw new Error(`Customer login failed with status ${custLogin.status}`);
    }

    const adminLogin = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@test.vn', matKhau: '123456' },
    });
    if (adminLogin.status === 200 && adminLogin.data?.token) {
      adminToken = adminLogin.data.token;
      console.log('  ✓ Authenticated as admin (admin@test.vn)');
    } else {
      throw new Error(`Admin login failed with status ${adminLogin.status}`);
    }
  } catch (err) {
    console.error(`Setup Error: ${err.message}`);
    process.exit(1);
  }

  // Target item fixtures
  const deliveredItem = {
    maChiTietDonHang: '2e953828-6c3d-4c1d-a14d-df8bbcff814a',
    maSanPham: 'bda9a98b-1cba-4dcc-bf00-06ca8f736574',
    tenSanPham: 'Khô Gà Cháy Tỏi',
  };
  const nonDeliveredItem = {
    maChiTietDonHang: '38ac4c7f-23dc-4aed-a7a6-bcfe07babe76', // order status = dang_giao
    maSanPham: '276940fd-ae6f-4546-9c47-a704a0ce6171',
  };
  const foreignItem = {
    maChiTietDonHang: 'ede13928-c986-46a6-83a6-f0e4490338c2', // owned by mixi@test.com
    maSanPham: '2490aaa4-6273-42dd-8298-a57e57e477b8',
  };

  // Clean initial state
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // -------------------------------------------------------------------------
  // SUITE 1: AUTHENTICATION & ROLE GUARDS
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 1: Authentication & Role Integrity Guards ---');

  // TC-AUTH-01: Anonymous request rejected with 401
  const resAuth01 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: 5, binhLuan: 'Test' },
  });
  recordResult(
    'TC-AUTH-01',
    'Unauthenticated POST /api/danh-gia is rejected with HTTP 401 Unauthorized',
    resAuth01.status === 401,
    `Expected status 401, got ${resAuth01.status}`
  );

  // TC-AUTH-02: Malformed Bearer token rejected with 401
  const resAuth02 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: 'Invalid.Token.String',
    body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: 5, binhLuan: 'Test' },
  });
  recordResult(
    'TC-AUTH-02',
    'Malformed JWT Bearer token is rejected with HTTP 401 Unauthorized',
    resAuth02.status === 401,
    `Expected status 401, got ${resAuth02.status}`
  );

  // TC-AUTH-03: Non-customer role (Admin) rejected with 403 Forbidden
  const resAuth03 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: adminToken,
    body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: 5, binhLuan: 'Test' },
  });
  recordResult(
    'TC-AUTH-03',
    'Non-customer role (admin) is rejected with HTTP 403 Forbidden',
    resAuth03.status === 403,
    `Expected status 403, got ${resAuth03.status}`
  );

  // -------------------------------------------------------------------------
  // SUITE 2: STAR RATING BOUNDARIES (1-5 Stars)
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 2: Star Rating Boundaries ---');

  // TC-STAR-01: soSao = 0 (rejected)
  const resStar01 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: 0, binhLuan: 'Boundary 0' },
  });
  recordResult(
    'TC-STAR-01',
    'Star rating = 0 is rejected with HTTP 400 Bad Request',
    resStar01.status === 400,
    `Expected status 400, got ${resStar01.status}`
  );

  // TC-STAR-02: soSao = -1 (negative boundary)
  const resStar02 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: -1, binhLuan: 'Negative' },
  });
  recordResult(
    'TC-STAR-02',
    'Negative star rating (-1) is rejected with HTTP 400 Bad Request',
    resStar02.status === 400,
    `Expected status 400, got ${resStar02.status}`
  );

  // TC-STAR-03: soSao = -999 (extreme negative)
  const resStar03 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: -999, binhLuan: 'Extreme neg' },
  });
  recordResult(
    'TC-STAR-03',
    'Extreme negative star rating (-999) is rejected with HTTP 400 Bad Request',
    resStar03.status === 400,
    `Expected status 400, got ${resStar03.status}`
  );

  // TC-STAR-04: soSao = 6 (above upper boundary 5)
  const resStar04 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: 6, binhLuan: 'Above 5' },
  });
  recordResult(
    'TC-STAR-04',
    'Star rating = 6 (> 5) is rejected with HTTP 400 Bad Request',
    resStar04.status === 400,
    `Expected status 400, got ${resStar04.status}`
  );

  // TC-STAR-05: soSao = 999 (extreme positive)
  const resStar05 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: 999, binhLuan: 'Extreme pos' },
  });
  recordResult(
    'TC-STAR-05',
    'Extreme positive star rating (999) is rejected with HTTP 400 Bad Request',
    resStar05.status === 400,
    `Expected status 400, got ${resStar05.status}`
  );

  // TC-STAR-06: Non-numeric string for soSao
  const resStar06 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: '{"maChiTietDonHang":"' + deliveredItem.maChiTietDonHang + '","soSao":"abc","binhLuan":"Test"}',
  });
  recordResult(
    'TC-STAR-06',
    'Non-numeric star rating ("abc") is rejected with HTTP 400 Bad Request',
    resStar06.status === 400,
    `Expected status 400, got ${resStar06.status}`
  );

  // TC-STAR-07: Floating point soSao (e.g. 4.5)
  const resStar07 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: '{"maChiTietDonHang":"' + deliveredItem.maChiTietDonHang + '","soSao":4.5,"binhLuan":"Float star"}',
  });
  recordResult(
    'TC-STAR-07',
    'Floating point star rating (4.5) is rejected with HTTP 400 Bad Request',
    resStar07.status === 400,
    `Expected status 400, got ${resStar07.status}`
  );

  // TC-STAR-08: Lower valid boundary: soSao = 1
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);
  const resStar08 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: 1, binhLuan: 'Boundary 1 star' },
  });
  recordResult(
    'TC-STAR-08',
    'Lower valid boundary star rating (1 star) is successfully accepted with HTTP 201 Created',
    resStar08.status === 201 && resStar08.data?.soSao === 1,
    `Expected 201 with soSao 1, got status ${resStar08.status}`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // TC-STAR-09: Upper valid boundary: soSao = 5
  const resStar09 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: 5, binhLuan: 'Boundary 5 stars' },
  });
  recordResult(
    'TC-STAR-09',
    'Upper valid boundary star rating (5 stars) is successfully accepted with HTTP 201 Created',
    resStar09.status === 201 && resStar09.data?.soSao === 5,
    `Expected 201 with soSao 5, got status ${resStar09.status}`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // -------------------------------------------------------------------------
  // SUITE 3: BUSINESS INTEGRITY & ORDER STATE GUARDS
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 3: Business Integrity & Order State Guards ---');

  // TC-ORDER-01: Non-existent order detail GUID
  const resOrder01 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: '00000000-0000-0000-0000-000000000000',
      soSao: 5,
      binhLuan: 'Fake order detail',
    },
  });
  recordResult(
    'TC-ORDER-01',
    'Non-existent order detail returns HTTP 404 Not Found',
    resOrder01.status === 404,
    `Expected status 404, got ${resOrder01.status}`
  );

  // TC-ORDER-02: Non-delivered order (status = dang_giao)
  const resOrder02 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: nonDeliveredItem.maChiTietDonHang,
      soSao: 5,
      binhLuan: 'Not delivered yet',
    },
  });
  recordResult(
    'TC-ORDER-02',
    'Non-delivered order (trang_thai_don_hang <> da_giao) is rejected with HTTP 400',
    resOrder02.status === 400,
    `Expected status 400, got ${resOrder02.status} (msg: ${JSON.stringify(resOrder02.data)})`
  );

  // TC-ORDER-03: Cross-customer order item ownership violation
  const resOrder03 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: foreignItem.maChiTietDonHang,
      soSao: 5,
      binhLuan: 'Not my order',
    },
  });
  recordResult(
    'TC-ORDER-03',
    'Reviewing another customer’s order item is rejected with HTTP 400',
    resOrder03.status === 400,
    `Expected status 400, got ${resOrder03.status} (msg: ${JSON.stringify(resOrder03.data)})`
  );

  // TC-ORDER-04A: Null maChiTietDonHang in body
  const resOrder04A = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: null,
      soSao: 5,
      binhLuan: 'Null detail GUID',
    },
  });
  recordResult(
    'TC-ORDER-04A',
    'Null maChiTietDonHang in body is rejected with HTTP 400 Bad Request',
    resOrder04A.status === 400,
    `Expected status 400, got ${resOrder04A.status}`
  );

  // TC-ORDER-04B: Empty string maChiTietDonHang in body
  const resOrder04B = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: '',
      soSao: 5,
      binhLuan: 'Empty string detail GUID',
    },
  });
  recordResult(
    'TC-ORDER-04B',
    'Empty string maChiTietDonHang in body is rejected with HTTP 400 Bad Request',
    resOrder04B.status === 400,
    `Expected status 400, got ${resOrder04B.status}`
  );

  // TC-ORDER-04C: Omitted maChiTietDonHang in body (defaults to Guid.Empty -> 404)
  const resOrder04C = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      soSao: 5,
      binhLuan: 'Omitted detail GUID',
    },
  });
  recordResult(
    'TC-ORDER-04C',
    'Omitted maChiTietDonHang defaults to Guid.Empty and returns HTTP 404 Not Found',
    resOrder04C.status === 404,
    `Expected status 404, got ${resOrder04C.status}`
  );

  // TC-ORDER-05: Malformed GUID format in maChiTietDonHang
  const resOrder05 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: 'not-a-valid-guid-12345',
      soSao: 5,
      binhLuan: 'Malformed GUID',
    },
  });
  recordResult(
    'TC-ORDER-05',
    'Malformed GUID format in maChiTietDonHang is rejected with HTTP 400 Bad Request',
    resOrder05.status === 400,
    `Expected status 400, got ${resOrder05.status}`
  );

  // -------------------------------------------------------------------------
  // SUITE 4: COMMENT TEXT BOUNDARIES, UNICODE, EMOJIS & SPECIAL CHARS
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 4: Comment Text Boundaries & Encoding ---');

  // TC-CMT-01: Empty comment string
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);
  const resCmt01 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: deliveredItem.maChiTietDonHang,
      soSao: 4,
      binhLuan: '',
    },
  });
  recordResult(
    'TC-CMT-01',
    'Empty comment string is permitted and creates review with HTTP 201 Created',
    resCmt01.status === 201,
    `Expected status 201, got ${resCmt01.status}`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // TC-CMT-02: Whitespace-only comment
  const resCmt02 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: deliveredItem.maChiTietDonHang,
      soSao: 5,
      binhLuan: '    \t   \n   ',
    },
  });
  recordResult(
    'TC-CMT-02',
    'Whitespace-only comment is permitted and trimmed to null/empty with HTTP 201',
    resCmt02.status === 201 && (resCmt02.data?.binhLuan === null || resCmt02.data?.binhLuan === ''),
    `Expected status 201 with null/empty comment, got status ${resCmt02.status}, binhLuan: "${resCmt02.data?.binhLuan}"`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // TC-CMT-03: Exact 500 characters comment (Upper boundary)
  const comment500 = 'A'.repeat(500);
  const resCmt03 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: deliveredItem.maChiTietDonHang,
      soSao: 5,
      binhLuan: comment500,
    },
  });
  recordResult(
    'TC-CMT-03',
    'Exact 500 characters comment boundary is successfully accepted (HTTP 201)',
    resCmt03.status === 201 && resCmt03.data?.binhLuan?.length === 500,
    `Expected status 201 and length 500, got status ${resCmt03.status}, length: ${resCmt03.data?.binhLuan?.length}`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // TC-CMT-04: Rich Unicode & Vietnamese diacritics
  const unicodeComment = 'Khô gà lá chanh cực kỳ ngon, thơm nồng mùi bơ tỏi, đậm vị, giòn rụm! Rất hài lòng.';
  const resCmt04 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: deliveredItem.maChiTietDonHang,
      soSao: 5,
      binhLuan: unicodeComment,
    },
  });
  recordResult(
    'TC-CMT-04',
    'Unicode & Vietnamese diacritics stored and returned with 100% character fidelity',
    resCmt04.status === 201 && resCmt04.data?.binhLuan === unicodeComment,
    `Expected exact match, got: ${resCmt04.data?.binhLuan}`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // TC-CMT-05: Multi-byte Emojis (UTF8MB4)
  const emojiComment = '⭐⭐⭐⭐⭐ Siêu ngon tuyệt đỉnh! 🍕🍔🍟🍗🍜💯🔥🎉';
  const resCmt05 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: deliveredItem.maChiTietDonHang,
      soSao: 5,
      binhLuan: emojiComment,
    },
  });
  recordResult(
    'TC-CMT-05',
    'Multi-byte Emojis (UTF8MB4) stored and returned without corruption',
    resCmt05.status === 201 && resCmt05.data?.binhLuan === emojiComment,
    `Expected emoji match, got: ${resCmt05.data?.binhLuan}`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // TC-CMT-06: Multi-line comment with newlines
  const multiLineComment = 'Dòng 1: Đồ ăn rất ngon.\nDòng 2: Giao hàng nhanh.\n\nDòng 3: Sẽ tiếp tục ủng hộ!';
  const resCmt06 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: deliveredItem.maChiTietDonHang,
      soSao: 5,
      binhLuan: multiLineComment,
    },
  });
  recordResult(
    'TC-CMT-06',
    'Multi-line comment preserving newlines (\\n) stored properly',
    resCmt06.status === 201 && resCmt06.data?.binhLuan === multiLineComment,
    `Expected newline match, got: ${JSON.stringify(resCmt06.data?.binhLuan)}`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // TC-CMT-07: SQL Injection and XSS strings handled safely as raw text
  const injectionComment = '<script>alert("XSS")</script>\' OR 1=1; DROP TABLE test; -- \\"&';
  const resCmt07 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: deliveredItem.maChiTietDonHang,
      soSao: 5,
      binhLuan: injectionComment,
    },
  });
  recordResult(
    'TC-CMT-07',
    'Special characters, XSS, and SQL injection payloads handled safely as raw text',
    resCmt07.status === 201 && resCmt07.data?.binhLuan === injectionComment,
    `Expected sanitized/literal match, got: ${JSON.stringify(resCmt07.data?.binhLuan)}`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // TC-CMT-08: Server tolerance for comments beyond 500 characters
  const comment600 = 'B'.repeat(600);
  const resCmt08 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: deliveredItem.maChiTietDonHang,
      soSao: 5,
      binhLuan: comment600,
    },
  });
  recordResult(
    'TC-CMT-08',
    'Backend storage accommodates >500 chars (MySQL text column) without overflow/crash',
    resCmt08.status === 201 && resCmt08.data?.binhLuan?.length === 600,
    `Expected 201, got ${resCmt08.status}`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // -------------------------------------------------------------------------
  // SUITE 5: DUPLICATE REVIEW PREVENTION, RACE CONDITIONS & AGGREGATION
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 5: Duplicate Review Prevention, Race Conditions & Aggregation ---');

  // Step 1: Create initial valid review for deliveredItem
  const activeReviewText = 'Đánh giá món ăn chuẩn vị thơm ngon!';
  const resCreateInitial = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: deliveredItem.maChiTietDonHang,
      soSao: 5,
      binhLuan: activeReviewText,
    },
  });

  // TC-DUP-01: Duplicate review on same maChiTietDonHang rejected with HTTP 400
  const resDup01 = await apiRequest('/api/danh-gia', {
    method: 'POST',
    token: customerToken,
    body: {
      maChiTietDonHang: deliveredItem.maChiTietDonHang,
      soSao: 3,
      binhLuan: 'Attempting duplicate review',
    },
  });
  recordResult(
    'TC-DUP-01',
    'Duplicate review on the same maChiTietDonHang is rejected with HTTP 400',
    resDup01.status === 400,
    `Expected status 400, got ${resDup01.status} (msg: ${JSON.stringify(resDup01.data)})`
  );

  // TC-DUP-02: Public product review endpoint GET /api/san-pham/{id}/danh-gia returns newly created review
  const resReviewsList = await apiRequest(`/api/san-pham/${deliveredItem.maSanPham}/danh-gia`);
  const foundReview = Array.isArray(resReviewsList.data) && resReviewsList.data.some(
    (r) => r.binhLuan === activeReviewText
  );
  recordResult(
    'TC-DUP-02',
    'GET /api/san-pham/{id}/danh-gia dynamically lists the created review',
    resReviewsList.status === 200 && foundReview,
    `Expected 200 with review in array, status: ${resReviewsList.status}, count: ${resReviewsList.data?.length}`
  );

  // TC-DUP-03: Product detail GET /api/san-pham/{id} reflects updated rating stats
  const resProductDetail = await apiRequest(`/api/san-pham/${deliveredItem.maSanPham}`);
  const hasValidRatingStats =
    resProductDetail.status === 200 &&
    typeof resProductDetail.data?.diemTrungBinh === 'number' &&
    resProductDetail.data?.soDanhGia >= 1;
  recordResult(
    'TC-DUP-03',
    'GET /api/san-pham/{id} dynamically reflects soDanhGia >= 1 and valid diemTrungBinh',
    hasValidRatingStats,
    `diemTrungBinh: ${resProductDetail.data?.diemTrungBinh}, soDanhGia: ${resProductDetail.data?.soDanhGia}`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // TC-RACE-01: Stress-testing concurrent parallel submissions (Race condition)
  console.log('  Testing concurrent parallel review submissions...');
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);
  const parallelCalls = [
    apiRequest('/api/danh-gia', {
      method: 'POST',
      token: customerToken,
      body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: 5, binhLuan: 'Parallel #1' },
    }),
    apiRequest('/api/danh-gia', {
      method: 'POST',
      token: customerToken,
      body: { maChiTietDonHang: deliveredItem.maChiTietDonHang, soSao: 4, binhLuan: 'Parallel #2' },
    }),
  ];
  const parallelResults = await Promise.all(parallelCalls);
  const successCount = parallelResults.filter((r) => r.status === 201).length;
  const rejectCount = parallelResults.filter((r) => r.status === 400).length;
  const dbCount = countDatabaseReviews(deliveredItem.maChiTietDonHang);

  recordResult(
    'TC-RACE-01',
    'Concurrent parallel submissions result in exactly 1 success (201) and 1 rejection (400), with 1 DB row',
    successCount === 1 && rejectCount === 1 && dbCount === 1,
    `Results: ${successCount} succeeded, ${rejectCount} rejected, ${dbCount} in DB`
  );
  cleanDatabaseReview(deliveredItem.maChiTietDonHang);

  // -------------------------------------------------------------------------
  // SUITE 6: FRONTEND COMPONENT STATIC BOUNDARIES & GUARDS
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 6: Frontend Component Static Boundaries & Guard Checks ---');

  const reviewModalCode = fs.readFileSync(
    path.join(projectRoot, 'snack_MB', 'src', 'components', 'ReviewModal.js'),
    'utf8'
  );

  // TC-FE-01: ReviewModal checks star boundaries (soSao < 1 || soSao > 5)
  recordResult(
    'TC-FE-01',
    'ReviewModal.js guards star range: soSao < 1 || soSao > 5',
    reviewModalCode.includes('soSao < 1 || soSao > 5')
  );

  // TC-FE-02: ReviewModal disables submit button when soSao === 0
  recordResult(
    'TC-FE-02',
    'ReviewModal.js disables submit button when soSao === 0',
    reviewModalCode.includes('soSao === 0 || submitting')
  );

  // TC-FE-03: ReviewModal enforces maxLength={500} on TextInput
  recordResult(
    'TC-FE-03',
    'ReviewModal.js sets maxLength={500} on TextInput',
    reviewModalCode.includes('maxLength={500}')
  );

  // TC-FE-04: ReviewModal displays live character counter
  recordResult(
    'TC-FE-04',
    'ReviewModal.js renders live counter ${binhLuan.length}/500',
    reviewModalCode.includes('{binhLuan.length}/500')
  );

  // TC-FE-05: ReviewModal guards unauthenticated users (!token)
  recordResult(
    'TC-FE-05',
    'ReviewModal.js guards against unauthenticated submissions (!token)',
    reviewModalCode.includes('if (!token)')
  );

  // TC-FE-06: OrderTrackingScreen only allows review when status === 'da_giao'
  const trackingCode = fs.readFileSync(
    path.join(projectRoot, 'snack_MB', 'src', 'screens', 'OrderTrackingScreen.js'),
    'utf8'
  );
  recordResult(
    'TC-FE-06',
    'OrderTrackingScreen.js gates review action to status === "da_giao"',
    trackingCode.includes("status === 'da_giao'") && trackingCode.includes('ct.daDanhGia')
  );

  // TC-FE-07: OrderHistoryScreen only renders review button for 'da_giao' orders
  const historyCode = fs.readFileSync(
    path.join(projectRoot, 'snack_MB', 'src', 'screens', 'OrderHistoryScreen.js'),
    'utf8'
  );
  recordResult(
    'TC-FE-07',
    'OrderHistoryScreen.js gates "Đánh giá món" button to item.trangThaiDonHang === "da_giao"',
    historyCode.includes("item.trangThaiDonHang === 'da_giao'") && historyCode.includes('Đánh giá món')
  );

  // Final Summary
  console.log('\n================================================================');
  console.log(`STRESS TEST SUMMARY: ${passedTests}/${totalTests} PASSED, ${failedTests} FAILED.`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    console.error('❌ Failures recorded:');
    failures.forEach((f) => console.error(`  - [${f.testId}] ${f.name}: ${f.details}`));
    process.exit(1);
  } else {
    console.log('🎉 ALL EMPIRICAL BOUNDARY & INTEGRITY TESTS PASSED 100%!\n');
    process.exit(0);
  }
}

runAllStressTests().catch((err) => {
  console.error('Unhandled Test Execution Error:', err);
  process.exit(1);
});
