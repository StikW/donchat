import { getPool } from "../db/pool.js";

function mapVariation(row) {
  return {
    sku: row.sku,
    attributes: row.attributes ?? {},
    price: row.price != null ? Number(row.price) : 0,
    stock: row.stock ?? 0,
  };
}

function mapProduct(row, variations) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    category: row.category ?? "",
    base_currency: row.base_currency ?? "EUR",
    tags: Array.isArray(row.tags) ? row.tags : [],
    variations,
  };
}

export async function listProductsSummary() {
  const pool = getPool();
  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.slug,
      p.name,
      p.category,
      p.tags,
      p.base_currency,
      COUNT(v.id)::int AS variation_count,
      COALESCE(MIN(v.price), 0)::numeric AS price_from
    FROM products p
    LEFT JOIN product_variations v ON v.product_id = p.id
    GROUP BY p.id, p.slug, p.name, p.category, p.tags, p.base_currency
    ORDER BY p.name
  `);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    tags: Array.isArray(r.tags) ? r.tags : [],
    variation_count: r.variation_count,
    price_from: r.price_from != null ? Number(r.price_from) : 0,
    currency: r.base_currency || "EUR",
  }));
}

export async function getProductByIdOrSlug(idOrSlug) {
  const pool = getPool();
  const { rows: prodRows } = await pool.query(
    `SELECT id, slug, name, description, category, base_currency, tags
     FROM products
     WHERE id = $1 OR slug = $1
     LIMIT 1`,
    [idOrSlug],
  );
  if (!prodRows.length) return null;

  const p = prodRows[0];
  const { rows: varRows } = await pool.query(
    `SELECT sku, attributes, price, stock
     FROM product_variations
     WHERE product_id = $1
     ORDER BY sku`,
    [p.id],
  );
  return mapProduct(p, varRows.map(mapVariation));
}

export async function loadFullCatalog() {
  const pool = getPool();
  const { rows: products } = await pool.query(
    `SELECT id, slug, name, description, category, base_currency, tags
     FROM products
     ORDER BY name`,
  );
  const { rows: variations } = await pool.query(
    `SELECT product_id, sku, attributes, price, stock
     FROM product_variations
     ORDER BY product_id, sku`,
  );
  const byProduct = new Map();
  for (const v of variations) {
    const list = byProduct.get(v.product_id) ?? [];
    list.push(mapVariation(v));
    byProduct.set(v.product_id, list);
  }
  return products.map((p) => mapProduct(p, byProduct.get(p.id) ?? []));
}
