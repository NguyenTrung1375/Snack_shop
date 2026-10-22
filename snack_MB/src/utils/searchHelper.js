// Utility for Vietnamese accent removal, fuzzy matching, and Shopee-style semantic search

export const removeVietnameseTones = (str) => {
  if (!str) return '';
  let res = str.toString();
  // Normalize Unicode
  res = res.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Specific Vietnamese characters
  res = res.replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'));
  // Remove redundant whitespace
  return res.toLowerCase().trim();
};

export const tokenize = (str) => {
  if (!str) return [];
  const normalized = removeVietnameseTones(str);
  return normalized
    .split(/[\s,._\-+/]+/)
    .filter((w) => w.length > 0);
};

export const POPULAR_SEARCH_KEYWORDS = [
  'Bánh tráng',
  'Khô gà lá chanh',
  'Cơm cháy đáy nồi',
  'Khô bò sốt me',
  'Bim bim khoai tây',
  'Mực cán cay',
];

/**
 * Shopee-style Semantic Search for Products
 * Matches across:
 * 1. Product title (accented & tone-stripped)
 * 2. Product title without spaces (e.g., 'banhtrang' matches 'Bánh tráng')
 * 3. Individual token / word matching
 * 4. Product description
 * 5. Category name
 * 
 * Returns matched products sorted by relevance score.
 */
export const semanticSearchProducts = (products = [], query = '', categories = []) => {
  if (!query || !query.trim()) {
    return products;
  }

  const rawQuery = query.trim().toLowerCase();
  const cleanQuery = removeVietnameseTones(rawQuery);
  const compactQuery = cleanQuery.replace(/\s+/g, '');
  const tokens = tokenize(rawQuery);

  if (tokens.length === 0) return products;

  // Build category lookup map
  const catMap = new Map();
  if (Array.isArray(categories)) {
    categories.forEach((cat) => {
      const name = cat.tenLoaiSanPham || cat.tenLoai || '';
      catMap.set(cat.maLoaiSanPham, removeVietnameseTones(name));
      if (cat.loaiCons) {
        cat.loaiCons.forEach((child) => {
          const childName = child.tenLoaiSanPham || child.tenLoai || '';
          catMap.set(child.maLoaiSanPham, removeVietnameseTones(childName));
        });
      }
    });
  }

  const scoredList = [];

  for (const p of products) {
    let score = 0;
    const title = (p.tenSanPham || '').toLowerCase();
    const cleanTitle = removeVietnameseTones(title);
    const compactTitle = cleanTitle.replace(/\s+/g, '');
    const desc = removeVietnameseTones(p.moTa || '');
    const catName = p.maLoaiSanPham ? (catMap.get(p.maLoaiSanPham) || '') : '';

    // 1. Exact match title
    if (cleanTitle === cleanQuery) {
      score += 120;
    }
    // 2. Title starts with query
    else if (cleanTitle.startsWith(cleanQuery)) {
      score += 90;
    }
    // 3. Title contains full phrase
    else if (cleanTitle.includes(cleanQuery)) {
      score += 70;
    }
    // 4. Compact matching (no spaces, e.g., 'banhtrang' -> 'bánh tráng')
    else if (compactTitle.includes(compactQuery) || compactQuery.includes(compactTitle)) {
      score += 60;
    }

    // 5. Token-based matching
    let tokenMatches = 0;
    for (const token of tokens) {
      if (cleanTitle.includes(token)) {
        tokenMatches += 1;
        score += 25;
      } else if (desc.includes(token)) {
        score += 8;
      } else if (catName.includes(token)) {
        score += 15;
      }
    }

    // Bonus if ALL tokens match in title
    if (tokens.length > 1 && tokenMatches === tokens.length) {
      score += 35;
    }

    // 6. Category exact / partial match
    if (catName && (catName.includes(cleanQuery) || cleanQuery.includes(catName))) {
      score += 30;
    }

    if (score > 0) {
      // Small bonus for popularity / sales
      const salesBonus = Math.min(10, (p.daBan || 0) * 0.1);
      scoredList.push({
        product: p,
        score: score + salesBonus,
      });
    }
  }

  // Sort by score descending
  scoredList.sort((a, b) => b.score - a.score);
  return scoredList.map((item) => item.product);
};

/**
 * Get suggestions based on query for autocomplete
 */
export const getSearchSuggestions = (query = '', products = [], limit = 5) => {
  if (!query || !query.trim()) {
    return POPULAR_SEARCH_KEYWORDS.slice(0, limit);
  }

  const cleanQuery = removeVietnameseTones(query);
  const compactQuery = cleanQuery.replace(/\s+/g, '');
  const suggestions = new Set();

  for (const p of products) {
    const title = p.tenSanPham || '';
    const cleanTitle = removeVietnameseTones(title);
    const compactTitle = cleanTitle.replace(/\s+/g, '');

    if (cleanTitle.includes(cleanQuery) || compactTitle.includes(compactQuery)) {
      suggestions.add(title);
      if (suggestions.size >= limit) break;
    }
  }

  return Array.from(suggestions);
};

