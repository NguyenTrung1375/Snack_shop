/**
 * Automated React Native AST Verification Script
 * Validates AST syntax, scope & undeclared identifier references, and JSX transformation
 * across all modified/new source files in snack_MB.
 */

const fs = require('fs');
const path = require('path');

// Resolve babel dependencies from snack_MB/node_modules
const projectRoot = path.resolve(__dirname, '..');
const mbNodeModules = path.join(projectRoot, 'snack_MB', 'node_modules');

const parser = require(path.join(mbNodeModules, '@babel', 'parser'));
const traverse = require(path.join(mbNodeModules, '@babel', 'traverse')).default;
const babel = require(path.join(mbNodeModules, '@babel', 'core'));
const jsxPlugin = path.join(mbNodeModules, '@babel', 'plugin-transform-react-jsx');

const TARGET_FILES = [
  'snack_MB/src/api/products.js',
  'snack_MB/src/components/ReviewModal.js',
  'snack_MB/src/screens/OrderTrackingScreen.js',
  'snack_MB/src/screens/OrderHistoryScreen.js',
  'snack_MB/src/screens/ProductDetailScreen.js',
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
]);

let totalFiles = 0;
let passedFiles = 0;
let totalErrors = 0;

console.log('====================================================');
console.log('  AUTOMATED REACT NATIVE AST & SYNTAX VERIFICATION  ');
console.log('====================================================\n');

TARGET_FILES.forEach((relPath) => {
  totalFiles++;
  const fullPath = path.join(projectRoot, relPath);
  console.log(`[CHECKING] ${relPath}`);

  if (!fs.existsSync(fullPath)) {
    console.error(`  ❌ Error: File not found: ${relPath}`);
    totalErrors++;
    return;
  }

  const code = fs.readFileSync(fullPath, 'utf8');

  // Step 1: AST Parsing
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'classProperties',
        'objectRestSpread',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
    });
    console.log('  ✓ Step 1: AST Syntax parsed successfully');
  } catch (err) {
    console.error(`  ❌ Step 1 FAILED: Syntax Error at line ${err.loc?.line}, column ${err.loc?.column}`);
    console.error(`     ${err.message}`);
    totalErrors++;
    return;
  }

  // Step 2: Scope & Undeclared Identifiers Verification
  const undeclared = [];
  try {
    traverse(ast, {
      ReferencedIdentifier(pathNode) {
        const name = pathNode.node.name;
        if (STANDARD_GLOBALS.has(name)) return;
        if (pathNode.scope.hasBinding(name)) return;

        // Ignore JSX opening element identifier if declared or in scope
        if (pathNode.parentPath.isJSXMemberExpression()) return;

        undeclared.push({
          name,
          line: pathNode.node.loc?.start.line,
          col: pathNode.node.loc?.start.column,
        });
      },
    });

    if (undeclared.length > 0) {
      console.error(`  ❌ Step 2 FAILED: Undeclared identifiers found:`);
      undeclared.forEach((u) => {
        console.error(`     - "${u.name}" at line ${u.line}, col ${u.col}`);
      });
      totalErrors += undeclared.length;
      return;
    }
    console.log('  ✓ Step 2: Scope & Identifiers verified (0 undeclared variables)');
  } catch (err) {
    console.error(`  ❌ Step 2 FAILED during AST traversal: ${err.message}`);
    totalErrors++;
    return;
  }

  // Step 3: Babel JSX Transformation
  try {
    const transformed = babel.transformSync(code, {
      plugins: [jsxPlugin],
      filename: relPath,
    });
    if (!transformed || !transformed.code) {
      throw new Error('Empty transformation output');
    }
    console.log(`  ✓ Step 3: JSX Transformation passed (${transformed.code.length} bytes output)`);
  } catch (err) {
    console.error(`  ❌ Step 3 FAILED during JSX transform: ${err.message}`);
    totalErrors++;
    return;
  }

  passedFiles++;
  console.log(`  ==> PASSED: ${relPath}\n`);
});

console.log('====================================================');
console.log(`AST Verification Summary: ${passedFiles}/${totalFiles} files passed, ${totalErrors} errors.`);
console.log('====================================================');

if (totalErrors > 0 || passedFiles !== totalFiles) {
  process.exit(1);
} else {
  console.log('✅ ALL TARGET FILES PASSED AST & SYNTAX VERIFICATION 100%!\n');
  process.exit(0);
}
