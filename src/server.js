import "dotenv/config";
import express from "express";
import { getPool } from "./db/pool.js";
import { productsRouter } from "./routes/products.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

function aiError(err, _req, res, _next) {
  console.error(err);
  const code = err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" ? "DB_UNAVAILABLE" : "INTERNAL";
  res.status(500).json({
    schema_version: "1.0",
    kind: "error",
    error: {
      code,
      message:
        code === "DB_UNAVAILABLE"
          ? "No se pudo conectar a PostgreSQL. Comprueba DATABASE_URL."
          : "Error interno del servidor",
    },
  });
}

app.get("/health", async (_req, res, next) => {
  try {
    await getPool().query("SELECT 1");
    res.json({ ok: true, service: "donchat-ecommerce-api", database: "up" });
  } catch (e) {
    next(e);
  }
});

app.use("/api/products", productsRouter);

app.use((_req, res) => {
  res.status(404).json({
    schema_version: "1.0",
    kind: "error",
    error: { code: "NOT_FOUND", message: "Ruta no encontrada" },
  });
});

app.use(aiError);

async function main() {
  await getPool().query("SELECT 1");
  app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
    console.log(`  GET  /api/products`);
    console.log(`  GET  /api/products/:id`);
    console.log(`  GET  /api/products/related/search?q=...`);
    console.log(`  POST /api/products/related/search`);
  });
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
