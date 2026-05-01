import "dotenv/config";
import { catalog } from "../data/catalog.js";
import { getPool, closePool } from "./pool.js";

async function main() {
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
    console.log(`Seed completado: ${catalog.length} productos.`);
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
