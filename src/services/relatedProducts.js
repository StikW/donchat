const STOPWORDS = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "un",
  "una",
  "con",
  "para",
  "y",
  "en",
  "por",
]);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9áéíóúñü\s_-]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function tokenizeQuery(q) {
  if (!q || typeof q !== "string") return [];
  const tokens = normalize(q).filter((t) => !STOPWORDS.has(t) && t.length > 1);
  return [...new Set(tokens)];
}

function productSearchBlob(p) {
  const parts = [
    p.name,
    p.description,
    p.category,
    ...(p.tags || []),
    ...(p.variations || []).flatMap((v) => [
      v.sku,
      ...Object.values(v.attributes || {}),
    ]),
  ];
  return normalize(parts.join(" "));
}

function scoreProduct(tokens, blobSet) {
  let score = 0;
  const matched_terms = [];
  const MIN_PARTIAL_LEN = 3;

  for (const t of tokens) {
    if (blobSet.has(t)) {
      score += 2;
      matched_terms.push(t);
      continue;
    }
    if (t.length < MIN_PARTIAL_LEN) continue;

    for (const word of blobSet) {
      if (word.length < MIN_PARTIAL_LEN) continue;
      if (word.includes(t) || t.includes(word)) {
        score += 1;
        matched_terms.push(t);
        break;
      }
    }
  }
  return { score, matched_terms };
}

function summarizeForAi(p, variation_preview_max = 4) {
  const variations = (p.variations || []).slice(0, variation_preview_max).map((v) => ({
    sku: v.sku,
    attributes: v.attributes,
    price: { amount: v.price, currency: p.base_currency || "EUR" },
    in_stock: v.stock > 0,
    stock_units: v.stock,
  }));

  const price_range = (() => {
    const prices = (p.variations || []).map((v) => v.price).filter(Number.isFinite);
    if (!prices.length) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max
      ? { min, max, currency: p.base_currency || "EUR" }
      : { min, max, currency: p.base_currency || "EUR" };
  })();

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    short_description: p.description?.slice(0, 220) || "",
    category: p.category,
    tags: p.tags || [],
    variation_axes: inferVariationAxes(p.variations || []),
    price_range,
    variations_preview: variations,
    total_variations: (p.variations || []).length,
  };
}

function inferVariationAxes(variations) {
  const keys = new Set();
  for (const v of variations) {
    Object.keys(v.attributes || {}).forEach((k) => keys.add(k));
  }
  return [...keys];
}

/**
 * @param {object[]} catalog - Productos con variations[] (misma forma que el repo)
 * @param {object} opts
 * @param {string} [opts.query]
 * @param {string[]} [opts.keywords]
 * @param {number} [opts.limit]
 */
export function findRelatedProducts(catalog, { query, keywords, limit = 10 } = {}) {
  const products = Array.isArray(catalog) ? catalog : [];
  const fromKeywords = Array.isArray(keywords)
    ? keywords.flatMap((k) => tokenizeQuery(String(k)))
    : [];
  const fromQuery = query ? tokenizeQuery(query) : [];
  const tokens = [...new Set([...fromQuery, ...fromKeywords])];

  const scored = products.map((p) => {
    const blob = productSearchBlob(p);
    const blobSet = new Set(blob);
    const { score, matched_terms } = scoreProduct(tokens, blobSet);
    return { product: p, score, matched_terms };
  });

  scored.sort((a, b) => b.score - a.score);

  const relevant = scored.filter((s) => s.score > 0);
  const slice = relevant.slice(0, Math.max(1, Math.min(limit, 50)));

  return {
    tokens_used: tokens,
    matches: slice.map((s) => ({
      relevance_score: s.score,
      matched_keywords: [...new Set(s.matched_terms)],
      product: summarizeForAi(s.product),
    })),
    total_candidates_with_score: relevant.length,
  };
}
