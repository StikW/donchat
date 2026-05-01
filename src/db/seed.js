import "dotenv/config";
import { generateBulkCatalog } from "../data/generateBulkCatalog.js";
import { getPool, closePool } from "./pool.js";

const countRaw = process.env.SEED_PRODUCT_COUNT;
const count =
  countRaw != null && countRaw !== "" ? Number(countRaw) : 500;

if (!Number.isFinite(count) || count < 1 || count > 20000) {
  console.error("SEED_PRODUCT_COUNT debe ser un entero entre 1 y 20000 (por defecto 500).");
  process.exit(1);
}

async function main() {
  const catalog = generateBulkCatalog(count);
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE product_variations, products RESTART IDENTITY CASCADE");

    for (const p of catalog) {
      await client.query(
        `INSERT INTO products (id, slug, name, description, category, base_currency, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          p.id,
          p.slug,
          p.name,
          p.description ?? "",
          p.category ?? "",
          p.base_currency ?? "EUR",
          p.tags ?? [],
        ],
      );
      for (const v of p.variations || []) {
        await client.query(
          `INSERT INTO product_variations (product_id, sku, attributes, price, stock)
           VALUES ($1, $2, $3::jsonb, $4, $5)`,
          [p.id, v.sku, JSON.stringify(v.attributes ?? {}), v.price, v.stock ?? 0],
        );
      }
    }

    await client.query("COMMIT");
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM products) AS products,
        (SELECT COUNT(*)::int FROM product_variations) AS variations
    `);
    console.log(
      `Seed completado: ${rows[0].products} productos, ${rows[0].variations} variaciones en total.`,
    );
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await closePool();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
