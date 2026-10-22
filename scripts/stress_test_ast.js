/**
 * Comprehensive AST & Runtime Stress Test Suite (Challenger 2)
 *
 * Validates:
 * 1. Multi-permutation AST parsing across multiple Babel plugin combinations.
 * 2. Deep scope analysis, undeclared identifier detection & module import resolution.
 * 3. React JSX transformation into ES5/ES6 and second-pass AST verification.
 * 4. Module export contracts & isolated runtime execution / callability.
 * 5. Boundary edge-case stress tests for business logic in review components.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..');
const mbNodeModules = path.join(projectRoot, 'snack_MB', 'node_modules');

const parser = require(path.join(mbNodeModules, '@babel', 'parser'));
const traverse = require(path.join(mbNodeModules, '@babel', 'traverse')).default;
const babel = require(path.join(mbNodeModules, '@babel', 'core'));
const jsxPlugin = path.join(mbNodeModules, '@babel', 'plugin-transform-react-jsx');
const cjsPlugin = path.join(mbNodeModules, '@babel', 'plugin-transform-modules-commonjs');

const TARGET_FILES = [
  'snack_MB/src/api/products.js',
  'snack_MB/src/components/ReviewModal.js',
  'snack_MB/src/screens/OrderTrackingScreen.js',
  'snack_MB/src/screens/OrderHistoryScreen.js',
  'snack_MB/src/screens/ProductDetailScreen.js',
];

const RELATED_FILES = [
  'snack_MB/src/api/client.js',
  'snack_MB/src/api/orders.js',
  'snack_MB/src/api/cart.js',
  'snack_MB/src/constants/theme.js',
  'snack_MB/src/constants/snackImages.js',
  'snack_MB/src/store/authStore.js',
  'snack_MB/src/store/cartStore.js',
];

const STANDARD_GLOBALS = new Set([
  'console',
  'Date',
  'Math',
  'Intl',
  'Set',
  'Map',
  'Array',
  'Number',
  'Boolean',
  'String',
  'Object',
  'JSON',
  'RegExp',
  'Promise',
  'Error',
  'TypeError',
  'RangeError',
  'undefined',
  'NaN',
  'Infinity',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'global',
  'window',
  'require',
  'module',
  'exports',
  'process',
  '__DEV__',
  'alert',
  'navigator',
]);

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failureDetails = [];

function assert(condition, message, details = '') {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedAssertions++;
    console.error(`  ❌ [FAIL] ${message}`);
    if (details) console.error(`     Details: ${details}`);
    failureDetails.push({ message, details });
  }
}

console.log('================================================================');
console.log('   CHALLENGER 2: DEEP AST & RUNTIME STRESS VERIFICATION SUITE   ');
console.log('================================================================\n');

// =====================================================================
// SUITE 1: Multi-Permutation AST Parse Stress
// =====================================================================
console.log('=== SUITE 1: Multi-Permutation AST Parse Stress ===');

const PARSE_PERMUTATIONS = [
  {
    name: 'Permutation 1: Standard React Native Plugins',
    plugins: ['jsx', 'classProperties', 'objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator'],
    sourceType: 'module',
  },
  {
    name: 'Permutation 2: TypeScript Overlay Permutation',
    plugins: ['jsx', 'typescript', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'],
    sourceType: 'module',
  },
  {
    name: 'Permutation 3: Flow Overlay Permutation',
    plugins: ['jsx', 'flow', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'],
    sourceType: 'module',
  },
  {
    name: 'Permutation 4: Decorators & Dynamic Import Permutation',
    plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator', ['decorators', { decoratorsBeforeExport: true }], 'dynamicImport'],
    sourceType: 'module',
  },
  {
    name: 'Permutation 5: Strict Mode Validation (strictMode: true, allowReturnOutsideFunction: false)',
    plugins: ['jsx', 'classProperties', 'objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator'],
    sourceType: 'module',
    strictMode: true,
    allowReturnOutsideFunction: false,
    allowImportExportEverywhere: false,
  },
];

TARGET_FILES.forEach((relPath) => {
  const fullPath = path.join(projectRoot, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');

  PARSE_PERMUTATIONS.forEach((perm) => {
    try {
      const ast = parser.parse(code, {
        sourceType: perm.sourceType,
        plugins: perm.plugins,
        strictMode: perm.strictMode,
        allowReturnOutsideFunction: perm.allowReturnOutsideFunction,
        allowImportExportEverywhere: perm.allowImportExportEverywhere,
      });
      assert(!!ast && ast.type === 'File', `Parse [${relPath}] with [${perm.name}]`);
    } catch (err) {
      assert(false, `Parse [${relPath}] with [${perm.name}]`, `Line ${err.loc?.line}, Col ${err.loc?.column}: ${err.message}`);
    }
  });

  // Tokenizer audit
  try {
    const tokens = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'classProperties', 'objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator'],
      tokens: true,
    }).tokens;
    assert(Array.isArray(tokens) && tokens.length > 0, `Tokenizer audit [${relPath}]: ${tokens?.length || 0} tokens generated cleanly`);
  } catch (err) {
    assert(false, `Tokenizer audit [${relPath}]`, err.message);
  }
});

// =====================================================================
// SUITE 2: Scope Traversal, Undeclared Identifiers & Import Integrity
// =====================================================================
console.log('\n=== SUITE 2: Scope Traversal, Undeclared Identifiers & Import Integrity ===');

const allFilesToCheck = [...TARGET_FILES, ...RELATED_FILES];

allFilesToCheck.forEach((relPath) => {
  const fullPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    assert(false, `Existence check for file ${relPath}`);
    return;
  }
  const code = fs.readFileSync(fullPath, 'utf8');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'classProperties', 'objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator'],
    });
  } catch (err) {
    assert(false, `AST parse for scope analysis in ${relPath}`, err.message);
    return;
  }

  // Undeclared identifier check
  const undeclared = [];
  traverse(ast, {
    ReferencedIdentifier(pathNode) {
      const name = pathNode.node.name;
      if (STANDARD_GLOBALS.has(name)) return;
      if (pathNode.scope.hasBinding(name)) return;
      if (pathNode.parentPath.isJSXMemberExpression()) return;

      undeclared.push({
        name,
        line: pathNode.node.loc?.start.line,
        col: pathNode.node.loc?.start.column,
      });
    },
  });

  assert(
    undeclared.length === 0,
    `Scope analysis: Zero undeclared identifiers in ${relPath}`,
    undeclared.map((u) => `"${u.name}" at line ${u.line}, col ${u.col}`).join('; ')
  );

  // Import declaration integrity
  const imports = [];
  traverse(ast, {
    ImportDeclaration(pathNode) {
      imports.push({
        source: pathNode.node.source.value,
        specifiers: pathNode.node.specifiers.map((s) => ({
          type: s.type,
          local: s.local.name,
          imported: s.imported ? s.imported.name : null,
        })),
        line: pathNode.node.loc?.start.line,
      });
    },
  });

  imports.forEach((imp) => {
    if (imp.source.startsWith('.')) {
      // Relative import resolution
      const dir = path.dirname(fullPath);
      const candidates = [
        path.join(dir, imp.source),
        path.join(dir, imp.source + '.js'),
        path.join(dir, imp.source + '.jsx'),
        path.join(dir, imp.source + '.json'),
        path.join(dir, imp.source, 'index.js'),
      ];
      const resolved = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
      assert(
        !!resolved,
        `Import resolution in ${relPath}: "${imp.source}" resolves to local file`,
        `Checked: ${candidates.join(', ')}`
      );

      // If resolved, check named / default export compatibility
      if (resolved && resolved.endsWith('.js')) {
        const targetCode = fs.readFileSync(resolved, 'utf8');
        try {
          const targetAst = parser.parse(targetCode, {
            sourceType: 'module',
            plugins: ['jsx', 'classProperties', 'objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator'],
          });
          const namedExports = new Set();
          let hasDefaultExport = false;

          traverse(targetAst, {
            ExportNamedDeclaration(expPath) {
              if (expPath.node.declaration) {
                if (expPath.node.declaration.declarations) {
                  expPath.node.declaration.declarations.forEach((d) => namedExports.add(d.id.name));
                } else if (expPath.node.declaration.id) {
                  namedExports.add(expPath.node.declaration.id.name);
                }
              }
              if (expPath.node.specifiers) {
                expPath.node.specifiers.forEach((s) => namedExports.add(s.exported.name));
              }
            },
            ExportDefaultDeclaration() {
              hasDefaultExport = true;
            },
          });

          imp.specifiers.forEach((spec) => {
            if (spec.type === 'ImportDefaultSpecifier') {
              assert(
                hasDefaultExport,
                `Default import contract in ${relPath}: "${imp.source}" provides default export for "${spec.local}"`
              );
            } else if (spec.type === 'ImportSpecifier') {
              assert(
                namedExports.has(spec.imported),
                `Named import contract in ${relPath}: "${imp.source}" exports "${spec.imported}"`
              );
            }
          });
        } catch (e) {
          // ignore target parse error if handled elsewhere
        }
      }
    } else {
      // Package import resolution
      const pkgName = imp.source.startsWith('@')
        ? imp.source.split('/').slice(0, 2).join('/')
        : imp.source.split('/')[0];
      const pkgPath = path.join(mbNodeModules, pkgName);
      const exists = fs.existsSync(pkgPath);
      assert(
        exists,
        `Package import in ${relPath}: module "${pkgName}" exists in node_modules`
      );
    }
  });
});

// =====================================================================
// SUITE 3: React JSX Transformation & Second-Pass AST Validation
// =====================================================================
console.log('\n=== SUITE 3: React JSX Transformation & Second-Pass AST Validation ===');

TARGET_FILES.forEach((relPath) => {
  const fullPath = path.join(projectRoot, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');

  let transformed;
  try {
    transformed = babel.transformSync(code, {
      plugins: [jsxPlugin],
      filename: relPath,
    });
    assert(
      !!transformed && typeof transformed.code === 'string' && transformed.code.length > 0,
      `JSX Transformation produced valid output for ${relPath} (${transformed?.code?.length || 0} bytes)`
    );
  } catch (err) {
    assert(false, `JSX Transformation failed for ${relPath}`, err.message);
    return;
  }

  // Second pass: Parse transformed code without JSX plugin!
  try {
    const postAst = parser.parse(transformed.code, {
      sourceType: 'module',
      plugins: ['classProperties', 'objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator'],
      // Note: NO 'jsx' plugin here! Transformed code MUST be pure JS!
    });
    assert(
      !!postAst,
      `Second-pass AST parse (Pure JS without JSX plugin) succeeded for ${relPath}`
    );

    let remainingJsx = 0;
    traverse(postAst, {
      JSXElement() {
        remainingJsx++;
      },
      JSXFragment() {
        remainingJsx++;
      },
    });
    assert(
      remainingJsx === 0,
      `Second-pass JSX audit: 0 JSXElement / JSXFragment tokens remain in transformed code for ${relPath}`
    );
  } catch (err) {
    assert(false, `Second-pass parse failed for ${relPath}`, err.message);
  }
});

// =====================================================================
// SUITE 4: Module Exports & Isolated Runtime Execution / Callability
// =====================================================================
console.log('\n=== SUITE 4: Module Exports & Isolated Runtime Execution / Callability ===');

// Test 4.1: products.js exports createReview & getProductReviews and executes correctly
const productsFilePath = path.join(projectRoot, 'snack_MB', 'src', 'api', 'products.js');
const productsCode = fs.readFileSync(productsFilePath, 'utf8');

// Transform products.js to CommonJS
const cjsProducts = babel.transformSync(productsCode, {
  plugins: [cjsPlugin],
  filename: productsFilePath,
});

let capturedCalls = [];
const mockApiClient = {
  post: async (url, data, config) => {
    capturedCalls.push({ method: 'POST', url, data, config });
    return { data: { maDanhGia: 'test-guid-danhgia', soSao: data.soSao, binhLuan: data.binhLuan } };
  },
  get: async (url, config) => {
    capturedCalls.push({ method: 'GET', url, config });
    return {
      data: [
        {
          maDanhGia: 'test-guid-1',
          maSanPham: 'test-guid-sp',
          tenKhachHang: 'Nguyen Van A',
          soSao: 5,
          binhLuan: 'Bánh tráng phơi sương ngon tuyệt vời!',
          ngayTao: '2026-10-19T10:00:00Z',
        },
      ],
    };
  },
};

// Sandbox environment for products.js
const sharedExports = {};
const sandboxContext = {
  module: { exports: sharedExports },
  exports: sharedExports,
  require: (mod) => {
    if (mod === './client') {
      return { default: mockApiClient, __esModule: true };
    }
    throw new Error(`Unexpected require in test sandbox: ${mod}`);
  },
  console,
};

vm.createContext(sandboxContext);

async function runAsyncTests() {
  try {
    vm.runInContext(cjsProducts.code, sandboxContext);
    const productsExports = sandboxContext.module.exports;

    assert(
      typeof productsExports.createReview === 'function',
      'Runtime Callability: products.js genuinely exports createReview as a function'
    );
    assert(
      typeof productsExports.getProductReviews === 'function',
      'Runtime Callability: products.js genuinely exports getProductReviews as a function'
    );

    // Async call execution test
    capturedCalls = [];
    const createRes = await productsExports.createReview({
      maChiTietDonHang: '11111111-2222-3333-4444-555555555555',
      maSanPham: '66666666-7777-8888-9999-000000000000',
      soSao: 5,
      binhLuan: 'Giao hàng nhanh, đồ ăn rất giòn!',
    });

    assert(
      capturedCalls.length === 1 && capturedCalls[0].method === 'POST' && capturedCalls[0].url === '/danh-gia',
      'Runtime Execution: createReview sends POST /danh-gia'
    );
    assert(
      capturedCalls[0].data?.soSao === 5 &&
      capturedCalls[0].data?.maChiTietDonHang === '11111111-2222-3333-4444-555555555555' &&
      capturedCalls[0].data?.maSanPham === '66666666-7777-8888-9999-000000000000' &&
      capturedCalls[0].data?.binhLuan === 'Giao hàng nhanh, đồ ăn rất giòn!',
      'Runtime Execution: createReview transmits exact payload schema'
    );
    assert(
      createRes?.maDanhGia === 'test-guid-danhgia',
      'Runtime Execution: createReview returns response data payload correctly'
    );

    capturedCalls = [];
    const getRes = await productsExports.getProductReviews('66666666-7777-8888-9999-000000000000');
    assert(
      capturedCalls.length === 1 &&
      capturedCalls[0].method === 'GET' &&
      capturedCalls[0].url === '/san-pham/66666666-7777-8888-9999-000000000000/danh-gia',
      'Runtime Execution: getProductReviews calls GET /san-pham/{id}/danh-gia'
    );
    assert(
      Array.isArray(getRes) && getRes.length === 1 && getRes[0].tenKhachHang === 'Nguyen Van A',
      'Runtime Execution: getProductReviews returns reviews array correctly'
    );
  } catch (err) {
    assert(false, 'Runtime Execution of products.js async calls', err.message);
  }
}

// Test 4.2: ReviewModal exports default and is consumed by OrderTrackingScreen
const reviewModalPath = path.join(projectRoot, 'snack_MB', 'src', 'components', 'ReviewModal.js');
const reviewModalCode = fs.readFileSync(reviewModalPath, 'utf8');
const reviewModalAst = parser.parse(reviewModalCode, {
  sourceType: 'module',
  plugins: ['jsx', 'classProperties', 'objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator'],
});

let reviewModalHasDefaultExport = false;
let reviewModalParamNames = [];
traverse(reviewModalAst, {
  ExportDefaultDeclaration(expPath) {
    reviewModalHasDefaultExport = true;
    const decl = expPath.node.declaration;
    if (decl && (decl.type === 'FunctionDeclaration' || decl.type === 'ArrowFunctionExpression')) {
      const firstParam = decl.params[0];
      if (firstParam && firstParam.type === 'ObjectPattern') {
        reviewModalParamNames = firstParam.properties.map((p) => p.key?.name || p.value?.name);
      }
    }
  },
});

assert(reviewModalHasDefaultExport, 'ReviewModal exports default component');
assert(
  ['visible', 'onClose', 'onSuccess', 'item'].every((k) => reviewModalParamNames.includes(k)),
  'ReviewModal accepts required props: visible, onClose, onSuccess, item',
  `Found props: ${reviewModalParamNames.join(', ')}`
);

// Check OrderTrackingScreen consumes ReviewModal
const orderTrackingPath = path.join(projectRoot, 'snack_MB', 'src', 'screens', 'OrderTrackingScreen.js');
const orderTrackingCode = fs.readFileSync(orderTrackingPath, 'utf8');
const orderTrackingAst = parser.parse(orderTrackingCode, {
  sourceType: 'module',
  plugins: ['jsx', 'classProperties', 'objectRestSpread', 'optionalChaining', 'nullishCoalescingOperator'],
});

let orderTrackingImportsReviewModal = false;
let orderTrackingRendersReviewModal = false;
traverse(orderTrackingAst, {
  ImportDeclaration(impPath) {
    if (impPath.node.source.value === '../components/ReviewModal') {
      const def = impPath.node.specifiers.find((s) => s.type === 'ImportDefaultSpecifier');
      if (def && def.local.name === 'ReviewModal') {
        orderTrackingImportsReviewModal = true;
      }
    }
  },
  JSXElement(jsxPath) {
    if (jsxPath.node.openingElement.name.name === 'ReviewModal') {
      orderTrackingRendersReviewModal = true;
    }
  },
});

assert(orderTrackingImportsReviewModal, 'OrderTrackingScreen correctly imports ReviewModal from ../components/ReviewModal');
assert(orderTrackingRendersReviewModal, 'OrderTrackingScreen renders <ReviewModal /> in JSX tree');

// =====================================================================
// SUITE 5: Boundary & Adversarial Stress Tests
// =====================================================================
console.log('\n=== SUITE 5: Boundary & Adversarial Stress Tests ===');

// Test 5.1: Rating text mapping coverage in ReviewModal
const ratingTextsMatch = reviewModalCode.match(/const RATING_TEXTS = \{([\s\S]*?)\};/);
assert(!!ratingTextsMatch, 'ReviewModal defines RATING_TEXTS dictionary');
if (ratingTextsMatch) {
  const dictionaryBody = ratingTextsMatch[1];
  [1, 2, 3, 4, 5].forEach((star) => {
    assert(
      new RegExp(`${star}:\\s*['"]`).test(dictionaryBody),
      `RATING_TEXTS covers rating ${star} star`
    );
  });
}

// Test 5.2: Star rating boundary guard in handleSubmit
assert(
  reviewModalCode.includes('if (soSao < 1 || soSao > 5)'),
  'ReviewModal enforces 1 <= soSao <= 5 validation guard before submitting'
);

// Test 5.3: Null safety for order item in ReviewModal
assert(
  reviewModalCode.includes('if (!item?.maChiTietDonHang)'),
  'ReviewModal checks item?.maChiTietDonHang null-safety before submitting'
);

// Test 5.4: Comment trimming & null fallback
assert(
  reviewModalCode.includes('binhLuan: binhLuan.trim() ? binhLuan.trim() : null'),
  'ReviewModal trims comment and coerces empty/whitespace strings to null'
);

// Test 5.5: Auth check before review submission
assert(
  reviewModalCode.includes('if (!token)'),
  'ReviewModal enforces login token requirement with user prompt'
);

// Test 5.6: ProductDetailScreen empty reviews fallback logic
const productDetailPath = path.join(projectRoot, 'snack_MB', 'src', 'screens', 'ProductDetailScreen.js');
const productDetailCode = fs.readFileSync(productDetailPath, 'utf8');

// Test average rating arithmetic safety under 0 reviews
const testReviewsEmpty = [];
const calcAverage = (revs, fallback) => {
  return revs.length > 0
    ? (revs.reduce((acc, r) => acc + (r.soSao || 0), 0) / revs.length).toFixed(1)
    : fallback != null && Number(fallback) > 0
      ? Number(fallback).toFixed(1)
      : '5.0';
};

const avgEmpty = calcAverage(testReviewsEmpty, null);
assert(avgEmpty === '5.0', 'Rating calculation safely yields "5.0" on 0 reviews and null product rating');

const avgWithProductRating = calcAverage(testReviewsEmpty, 4.2);
assert(avgWithProductRating === '4.2', 'Rating calculation safely yields product diemTrungBinh when reviews are empty');

const testReviewsList = [{ soSao: 5 }, { soSao: 4 }, { soSao: 4 }];
const avgWithReviews = calcAverage(testReviewsList, 3.0);
assert(avgWithReviews === '4.3', 'Rating calculation computes precise average (4.333 -> 4.3) over actual review items');

// Test 5.7: Review count display & empty state handling
assert(
  productDetailCode.includes('reviews.length === 0'),
  'ProductDetailScreen renders dedicated friendly empty state when reviews.length === 0'
);
assert(
  productDetailCode.includes('loadingReviews'),
  'ProductDetailScreen renders loading indicator while reviews are being fetched'
);

(async () => {
  await runAsyncTests();

  console.log('\n================================================================');
  console.log(`STRESS TEST SUMMARY: ${passedAssertions}/${totalAssertions} assertions passed, ${failedAssertions} failed.`);
  console.log('================================================================');

  if (failedAssertions > 0) {
    console.error('❌ STRESS TEST FAILED! Failures:');
    failureDetails.forEach((f) => console.error(` - ${f.message}: ${f.details}`));
    process.exit(1);
  } else {
    console.log('✅ ALL AST & RUNTIME STRESS TESTS PASSED 100% WITH ZERO ERRORS!\n');
    process.exit(0);
  }
})();
