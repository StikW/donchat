/**
 * Catálogo demo pequeño (referencia). El seed por defecto usa `generateBulkCatalog.js` (~500 ítems).
 * Para volver a pocas filas: `npm run db:seed:demo`
 */

export const catalog = [
  {
    id: "prod_run_alpha",
    slug: "zapatillas-run-alpha",
    name: "Zapatillas Run Alpha",
    description:
      "Zapatillas de running con amortiguación reactiva. Ideales para maratón y entrenamiento diario.",
    category: "calzado",
    tags: ["running", "deporte", "maratón", "amortiguación", "ligero"],
    base_currency: "EUR",
    variations: [
      {
        sku: "RUN-A-W42-BLK",
        attributes: { talla: "42", color: "negro", tipo: "running" },
        price: 119.99,
        stock: 18,
      },
      {
        sku: "RUN-A-W43-BLK",
        attributes: { talla: "43", color: "negro", tipo: "running" },
        price: 119.99,
        stock: 9,
      },
      {
        sku: "RUN-A-W42-WHT",
        attributes: { talla: "42", color: "blanco", tipo: "running" },
        price: 124.99,
        stock: 5,
      },
    ],
  },
  {
    id: "prod_run_beta",
    slug: "zapatillas-run-beta-trail",
    name: "Zapatillas Run Beta Trail",
    description:
      "Zapatillas trail con suela adherente y protección en puntera. Para senderos y terreno mixto.",
    category: "calzado",
    tags: ["trail", "running", "montaña", "senderismo", "agarre"],
    base_currency: "EUR",
    variations: [
      {
        sku: "RUN-B-W41-GRN",
        attributes: { talla: "41", color: "verde", tipo: "trail" },
        price: 139.5,
        stock: 12,
      },
      {
        sku: "RUN-B-W42-GRN",
        attributes: { talla: "42", color: "verde", tipo: "trail" },
        price: 139.5,
        stock: 7,
      },
    ],
  },
  {
    id: "prod_tee_organic",
    slug: "camiseta-organica-basica",
    name: "Camiseta orgánica básica",
    description:
      "Camiseta de algodón orgánico, corte relaxed. Disponible en varios colores.",
    category: "ropa",
    tags: ["camiseta", "algodón", "orgánico", "casual", "verano"],
    base_currency: "EUR",
    variations: [
      {
        sku: "TEE-O-S-BLU",
        attributes: { talla: "S", color: "azul", tipo: "manga_corta" },
        price: 24.9,
        stock: 40,
      },
      {
        sku: "TEE-O-M-BLU",
        attributes: { talla: "M", color: "azul", tipo: "manga_corta" },
        price: 24.9,
        stock: 35,
      },
      {
        sku: "TEE-O-L-BLK",
        attributes: { talla: "L", color: "negro", tipo: "manga_corta" },
        price: 24.9,
        stock: 22,
      },
    ],
  },
  {
    id: "prod_hoodie_fleece",
    slug: "sudadera-fleece-capucha",
    name: "Sudadera fleece con capucha",
    description:
      "Sudadera interior fleece, capucha ajustable. Abrigada para invierno y uso urbano.",
    category: "ropa",
    tags: ["sudadera", "capucha", "invierno", "abrigo", "urbano"],
    base_currency: "EUR",
    variations: [
      {
        sku: "HDF-M-GRY",
        attributes: { talla: "M", color: "gris", tipo: "capucha" },
        price: 59.0,
        stock: 15,
      },
      {
        sku: "HDF-L-NVY",
        attributes: { talla: "L", color: "azul_marino", tipo: "capucha" },
        price: 59.0,
        stock: 10,
      },
    ],
  },
  {
    id: "prod_bottle_steel",
    slug: "botella-acero-inoxidable",
    name: "Botella acero inoxidable 750 ml",
    description:
      "Botella térmica de acero inoxidable, mantiene temperatura. Para deporte y oficina.",
    category: "accesorios",
    tags: ["botella", "térmica", "deporte", "hidratar", "oficina"],
    base_currency: "EUR",
    variations: [
      {
        sku: "BTLS-750-SLV-MAT",
        attributes: { capacidad_ml: "750", color: "plateado", tipo: "mate" },
        price: 32.5,
        stock: 60,
      },
      {
        sku: "BTLS-750-BLK-GLOSS",
        attributes: { capacidad_ml: "750", color: "negro", tipo: "brillante" },
        price: 34.0,
        stock: 45,
      },
    ],
  },
];
