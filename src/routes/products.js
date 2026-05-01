import { Router } from "express";
import {
  getProductByIdOrSlug,
  listProductsSummary,
  loadFullCatalog,
} from "../repos/productsRepo.js";
import { findRelatedProducts } from "../services/relatedProducts.js";

const router = Router();

function aiEnvelope(kind, payload) {
  return {
    schema_version: "1.0",
    kind,
    generated_at: new Date().toISOString(),
    ...payload,
  };
}

function parseLimit(raw, fallback = 10) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 50) : fallback;
}

router.get("/", async (_req, res, next) => {
  try {
    const items = await listProductsSummary();
    res.json(aiEnvelope("product_list", { count: items.length, products: items }));
  } catch (e) {
    next(e);
  }
});

router.get("/related/search", async (req, res, next) => {
  try {
    const q = req.query.q ?? req.query.query ?? "";
    const limit = parseLimit(req.query.limit, 10);
    const catalog = await loadFullCatalog();
    const result = findRelatedProducts(catalog, { query: String(q), limit });
    res.json(
      aiEnvelope("related_products", {
        query: { text: String(q), keywords: [] },
        interpretation: {
          note:
            "Los productos se ordenan por coincidencia de palabras clave con nombre, descripción, categoría, etiquetas y atributos de variaciones.",
          tokens_extracted: result.tokens_used,
        },
        result_count: result.matches.length,
        products: result.matches,
        meta: { total_candidates_with_score: result.total_candidates_with_score },
      }),
    );
  } catch (e) {
    next(e);
  }
});

router.post("/related/search", async (req, res, next) => {
  try {
    const body = req.body || {};
    const query = body.query ?? body.q ?? "";
    const keywords = Array.isArray(body.keywords) ? body.keywords : [];
    const limit = parseLimit(body.limit, 10);
    const catalog = await loadFullCatalog();
    const result = findRelatedProducts(catalog, {
      query: String(query),
      keywords,
      limit,
    });
    res.json(
      aiEnvelope("related_products", {
        query: {
          text: String(query),
          keywords: keywords.map(String),
        },
        interpretation: {
          note:
            "Coincidencias ponderadas: término exacto en el texto del producto pesa más que coincidencia parcial.",
          tokens_extracted: result.tokens_used,
        },
        result_count: result.matches.length,
        products: result.matches,
        meta: { total_candidates_with_score: result.total_candidates_with_score },
      }),
    );
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const p = await getProductByIdOrSlug(req.params.id);
    if (!p) {
      return res.status(404).json(
        aiEnvelope("error", {
          error: { code: "NOT_FOUND", message: "Producto no encontrado" },
        }),
      );
    }
    res.json(
      aiEnvelope("product_detail", {
        product: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          description: p.description,
          category: p.category,
          tags: p.tags,
          currency: p.base_currency || "EUR",
          variations: (p.variations || []).map((v) => ({
            sku: v.sku,
            attributes: v.attributes,
            price: v.price,
            stock: v.stock,
            available: v.stock > 0,
          })),
        },
      }),
    );
  } catch (e) {
    next(e);
  }
});

export { router as productsRouter };
