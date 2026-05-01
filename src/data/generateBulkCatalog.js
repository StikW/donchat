/**
 * Genera un catálogo grande con productos heterogéneos y variaciones (talla, color, etc.).
 * Determinista: mismo `total` produce siempre el mismo resultado.
 */

function slugify(s) {
  return String(s)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);
}

/** Pseudoaleatorio determinista 0..n-1 a partir de semilla */
function rnd(seed, n) {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return Math.floor((x - Math.floor(x)) * n);
}

function pick(seed, arr, offset = 0) {
  return arr[rnd(seed + offset, arr.length)];
}

function uniqueSku(productIndex, vIndex, prefix) {
  return `${prefix}-${String(productIndex).padStart(5, "0")}-${String(vIndex).padStart(2, "0")}`;
}

const COLORS = [
  "negro",
  "blanco",
  "azul",
  "rojo",
  "verde",
  "gris",
  "beige",
  "amarillo",
  "rosa",
  "naranja",
  "azul_marino",
  "burdeos",
];

const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"];
const CLOTH_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CAPACITY_ML = ["250", "330", "500", "750", "1000"];

function genFootwear(i) {
  const lines = ["Stride", "Urban", "Peak", "Aero", "Flex", "Nova", "Bolt", "Zen"];
  const line = pick(i, lines);
  const tipo = pick(i + 1, ["running", "trail", "urbano", "training", "walking"]);
  const id = `prod_foot_${String(i + 1).padStart(5, "0")}`;
  const name = `Zapatillas ${line} ${tipo}`;
  const slugBase = slugify(`${line}-${tipo}-${i}`);
  const slug = `${slugBase}-${i + 1}`;
  const colors = [pick(i, COLORS), pick(i + 2, COLORS), pick(i + 4, COLORS)].filter(
    (c, idx, a) => a.indexOf(c) === idx,
  );
  const startSz = rnd(i, Math.max(1, SHOE_SIZES.length - 5));
  const sizes = SHOE_SIZES.slice(startSz, Math.min(SHOE_SIZES.length, startSz + 5 + rnd(i + 3, 3)));
  const maxVar = Math.min(14, 6 + rnd(i + 88, 7));
  const variations = [];
  let vi = 0;
  outerF: for (const talla of sizes) {
    for (const color of colors) {
      variations.push({
        sku: uniqueSku(i + 1, vi, "FTW"),
        attributes: { talla, color, tipo },
        price: 59.9 + rnd(i * 17 + vi, 120),
        stock: rnd(i * 31 + vi * 7, 80),
      });
      vi++;
      if (vi >= maxVar) break outerF;
    }
  }
  return {
    id,
    slug,
    name,
    description: `${name}: amortiguación versátil, uso ${tipo}. Referencia colección ${2024 + (i % 3)}.`,
    category: "calzado",
    tags: ["zapatillas", tipo, "calzado", pick(i + 9, ["deporte", "ciudad", "outdoor"])],
    base_currency: "EUR",
    variations: variations.length ? variations : genMinimalVariation(i, "FTW", { tipo: "urbano" }),
  };
}

function genClothing(i) {
  const kinds = ["Camiseta", "Pantalón", "Sudadera", "Chaqueta", "Polo", "Short deportivo"];
  const kind = pick(i, kinds);
  const material = pick(i + 3, ["algodón", "poliéster", "mezcla", "lino", "modal_orgánico"]);
  const tipoPrenda = pick(i + 5, ["casual", "sport", "formal_ligero"]);
  const id = `prod_cloth_${String(i + 1).padStart(5, "0")}`;
  const name = `${kind} ${material} ${tipoPrenda}`;
  const slug = `${slugify(`${kind}-${material}-${i}`)}-${i + 1}`;
  const colors = [pick(i, COLORS), pick(i + 11, COLORS), pick(i + 13, COLORS)].filter(
    (c, idx, a) => a.indexOf(c) === idx,
  );
  const tallas = CLOTH_SIZES.slice(0, 4 + rnd(i, 3));
  const maxVar = 10 + rnd(i, 9);
  const variations = [];
  let vi = 0;
  outerC: for (const talla of tallas) {
    for (const color of colors) {
      variations.push({
        sku: uniqueSku(i + 1, vi, "CLT"),
        attributes: { talla, color, tipo: tipoPrenda, material },
        price: 14.9 + rnd(i + vi, 85),
        stock: rnd(i + vi * 11, 120),
      });
      vi++;
      if (vi >= maxVar) break outerC;
    }
  }
  return {
    id,
    slug,
    name,
    description: `${kind} en ${material}. Corte ${tipoPrenda}; lavado máquina según etiqueta.`,
    category: "ropa",
    tags: [slugify(kind), material, tipoPrenda, "ropa"],
    base_currency: "EUR",
    variations: variations.length ? variations : genMinimalVariation(i, "CLT", { material }),
  };
}

function genElectronics(i) {
  const items = [
    "Auriculares",
    "Altavoz portátil",
    "Ratón inalámbrico",
    "Teclado compacto",
    "Hub USB-C",
    "Cargador rápido",
  ];
  const item = pick(i, items);
  const color = pick(i + 2, COLORS);
  const conexion = pick(i + 4, ["bluetooth_5_3", "usb_c", "usb_a", "dual"]);
  const id = `prod_elec_${String(i + 1).padStart(5, "0")}`;
  const name = `${item} ${color}`;
  const slug = `${slugify(`${item}-${color}-${i}`)}-${i + 1}`;
  const variations = [];
  for (let vi = 0; vi < 2 + rnd(i, 4); vi++) {
    const attrs = {
      color: pick(i + vi, COLORS),
      conexion,
      tipo: pick(i + vi * 3, ["estándar", "pro", "mini"]),
    };
    variations.push({
      sku: uniqueSku(i + 1, vi, "ELC"),
      attributes: attrs,
      price: 19.99 + rnd(i * 9 + vi, 180),
      stock: rnd(i + vi * 13, 200),
    });
  }
  return {
    id,
    slug,
    name,
    description: `${item}. Conectividad ${conexion}. Incluye manual y garantía según fabricante.`,
    category: "electronica",
    tags: ["tecnología", slugify(item), conexion],
    base_currency: "EUR",
    variations,
  };
}

function genHome(i) {
  const items = ["Taza cerámica", "Cojín decorativo", "Manta polar", "Botella térmica", "Bol organizador"];
  const item = pick(i, items);
  const id = `prod_home_${String(i + 1).padStart(5, "0")}`;
  const slug = `${slugify(`${item}-${i}`)}-${i + 1}`;
  const variations = [];
  const acabadoTag = pick(i + 701, ["mate", "brillante", "texturizado", "melamina"]);
  const nVar = 3 + rnd(i, 8);
  for (let vi = 0; vi < nVar; vi++) {
    const capacidad_ml = pick(i + vi, CAPACITY_ML);
    const color = pick(i + vi * 2, COLORS);
    const acabado = pick(i + vi, ["mate", "brillante", "texturizado", "melamina"]);
    variations.push({
      sku: uniqueSku(i + 1, vi, "HOM"),
      attributes:
        item.includes("Botella") || item.includes("Taza")
          ? { capacidad_ml, color, acabado }
          : { dimensiones_cm: `${30 + rnd(i + vi, 40)}x${20 + rnd(i + vi, 25)}`, color, acabado },
      price: 8.5 + rnd(i + vi * 5, 55),
      stock: rnd(i * 7 + vi, 150),
    });
  }
  return {
    id,
    slug,
    name: `${item} colección ${pick(i, ["Nórdica", "Studio", "Classic"])}`,
    description: `Artículo para hogar: ${item}. Variantes en color y tamaño.`,
    category: "hogar",
    tags: ["hogar", slugify(item), acabadoTag],
    base_currency: "EUR",
    variations,
  };
}

function genSports(i) {
  const items = ["Balón fútbol", "Balón baloncesto", "Raqueta paddle", "Esterilla yoga", "Cuerda saltar"];
  const item = pick(i, items);
  const id = `prod_sport_${String(i + 1).padStart(5, "0")}`;
  const slug = `${slugify(`${item}-${i}`)}-${i + 1}`;
  const variations = [];
  const sizes = pick(i, [["talla_3", "talla_4", "talla_5"], ["reglamento", "junior"], ["standard"]]);
  for (let vi = 0; vi < sizes.length + rnd(i, 3); vi++) {
    variations.push({
      sku: uniqueSku(i + 1, vi, "SPT"),
      attributes: {
        tamaño: sizes[vi % sizes.length] || pick(vi, sizes),
        color: pick(i + vi, COLORS),
        superficie: pick(i + vi, ["interior", "exterior", "mixta"]),
      },
      price: 12 + rnd(i + vi, 90),
      stock: rnd(i * 5 + vi * 3, 100),
    });
  }
  return {
    id,
    slug,
    name: item,
    description: `Material deportivo ${item}. Uso ${pick(i, ["entrenamiento", "competición", "recreativo"])}.`,
    category: "deportes",
    tags: ["deporte", slugify(item), "fitness"],
    base_currency: "EUR",
    variations: variations.length ? variations : genMinimalVariation(i, "SPT", {}),
  };
}

function genBeauty(i) {
  const items = ["Crema hidratante", "Sérum facial", "Protector solar", "Champú nutritivo", "Bálsamo labial"];
  const item = pick(i, items);
  const id = `prod_beauty_${String(i + 1).padStart(5, "0")}`;
  const slug = `${slugify(`${item}-${i}`)}-${i + 1}`;
  const variations = [];
  const vols = ["30ml", "50ml", "100ml", "200ml"];
  for (let vi = 0; vi < 4 + rnd(i, 5); vi++) {
    variations.push({
      sku: uniqueSku(i + 1, vi, "BTY"),
      attributes: {
        volumen: pick(i + vi, vols),
        tipo_piel: pick(i + vi, ["mixta", "seca", "grasa", "sensible"]),
        fragancia: pick(i + vi, ["neutral", "floral", "cítrica", "sin_perfume"]),
      },
      price: 6.9 + rnd(i + vi * 2, 45),
      stock: rnd(i + vi * 17, 200),
    });
  }
  return {
    id,
    slug,
    name: item,
    description: `${item}; dermatológicamente testado según ficha técnica ${1000 + i}.`,
    category: "belleza",
    tags: ["belleza", "cuidado_personal", slugify(item)],
    base_currency: "EUR",
    variations,
  };
}

function genToy(i) {
  const items = ["Figura articulada", "Juego mesa", "Peluche", "Set construcción", "Instrumento juguete"];
  const item = pick(i, items);
  const id = `prod_toy_${String(i + 1).padStart(5, "0")}`;
  const slug = `${slugify(`${item}-${i}`)}-${i + 1}`;
  const variations = [];
  const edades = ["3-5_años", "6-8_años", "9-12_años", "+12_años"];
  for (let vi = 0; vi < 3 + rnd(i, 6); vi++) {
    variations.push({
      sku: uniqueSku(i + 1, vi, "TOY"),
      attributes: {
        edad_recomendada: pick(i + vi, edades),
        tema: pick(i + vi, ["animales", "espacio", "princesas", "vehículos", "ciencia"]),
        piezas: pick(i + vi, ["12_pzs", "48_pzs", "120_pzs", "300_pzs"]),
      },
      price: 9.99 + rnd(i + vi, 70),
      stock: rnd(i * 3 + vi * 19, 90),
    });
  }
  return {
    id,
    slug,
    name: `${item} serie ${pick(i, ["Explorer", "Junior", "Magic"])}`,
    description: `Juguete ${item}. Normativa CE referencia lote simulado ${20000 + i}.`,
    category: "juguetes",
    tags: ["juguete", slugify(item), "infantil"],
    base_currency: "EUR",
    variations,
  };
}

function genMinimalVariation(i, prefix, extraAttrs) {
  return [
    {
      sku: uniqueSku(i + 1, 0, prefix),
      attributes: { color: pick(i, COLORS), ...extraAttrs },
      price: 25 + rnd(i, 50),
      stock: 10 + rnd(i, 40),
    },
  ];
}

const GENERATORS = [genFootwear, genClothing, genElectronics, genHome, genSports, genBeauty, genToy];

/**
 * @param {number} [total=500]
 * @returns {Array<{id, slug, name, description, category, tags, base_currency, variations}>}
 */
export function generateBulkCatalog(total = 500) {
  const products = [];
  for (let i = 0; i < total; i++) {
    const gen = GENERATORS[i % GENERATORS.length];
    products.push(gen(i));
  }
  return products;
}
