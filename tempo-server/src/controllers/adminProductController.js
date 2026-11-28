import prisma from "../lib/prisma.js";

const PRODUCT_CODE_REGEX = /^[A-Z0-9_-]{2,20}$/;
const BARCODE_REGEX = /^[A-Za-z0-9._-]{3,50}$/;

const PRODUCT_CATEGORIES = ["TEXTBOOK", "INSTRUMENT", "ACCESSORY", "OTHER"];

export const VAT_RATE = Number(process.env.VAT_RATE ?? 7);

const PRODUCT_SELECT = {
  id: true,
  code: true,
  barcode: true,
  parentId: true,
  category: true,
  nameTh: true,
  nameEn: true,
  descriptionTh: true,
  descriptionEn: true,
  unitTh: true,
  unitEn: true,
  costPrice: true,
  sellingPrice: true,
  isVat: true,
  isHighlighted: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  parent: {
    select: {
      id: true,
      code: true,
      nameTh: true,
      nameEn: true,
    },
  },
  _count: {
    select: { subProducts: true },
  },
};

// Convert Prisma Decimal fields to JS number (or null) for clean JSON responses
function serializeProduct(product) {
  if (!product) return null;
  return {
    ...product,
    costPrice:
      product.costPrice !== null && product.costPrice !== undefined
        ? Number(product.costPrice)
        : null,
    sellingPrice:
      product.sellingPrice !== null && product.sellingPrice !== undefined
        ? Number(product.sellingPrice)
        : null,
  };
}

function clean(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

// Parse option whole integer >= min (return {value} or {error})
function parseOptionInt(raw, min, errorCode, defaultEmpty = null) {
  if (raw === null || raw === "" || raw === undefined) {
    return { value: defaultEmpty };
  }
  const num = Number(raw);
  if (!Number.isInteger(num) || num < min) {
    return { error: { code: errorCode } };
  }
  return { value: num };
}

// Parse optin decimal >= min rounded to 2 decimal places {return {value} or {error}}
function parseOptionDecimal(raw, min, errorCode, defaultEmpty = null) {
  if (raw === null || raw === "" || raw === undefined) {
    return { value: defaultEmpty };
  }
  const num = Number(raw);
  if (!Number.isFinite(num) || num < min) {
    return { error: { code: errorCode } };
  }
  const rounded = Math.round(num * 100) / 100;
  return { value: rounded };
}

function readProductInput(body, { partial = false } = {}) {
  const data = {};
  const has = (key) => body[key] !== undefined;

  // 1. Product code (required)
  if (!partial || has("code")) {
    const rawCode = clean(body.code);
    if (!rawCode) {
      return { error: { code: "MISSING_FIELDS" } };
    }
    const code = rawCode.toUpperCase();
    if (!PRODUCT_CODE_REGEX.test(code)) {
      return { error: { code: "INVALID_PRODUCT_CODE" } };
    }
    data.code = code;
  }

  // 2. Optional barcode
  if (!partial || has("barcode")) {
    const rawBarcode = clean(body.barcode);
    if (!rawBarcode) {
      data.barcode = null;
    } else {
      if (!BARCODE_REGEX.test(rawBarcode)) {
        return { error: { code: "INVALID_BARCODE" } };
      }
      data.barcode = rawBarcode;
    }
  }

  // 3. Bilingual product name
  if (!partial || has("nameTh")) {
    const nameTh = clean(body.nameTh);
    if (!nameTh) {
      return { error: { code: "MISSING_FIELDS" } };
    }
    data.nameTh = nameTh;
  }

  if (!partial || has("nameEn")) {
    const nameEn = clean(body.nameEn);
    if (!nameEn) {
      return { error: { code: "MISSING_FIELDS" } };
    }
    data.nameEn = nameEn;
  }

  // 4. Category (TEXTBOOK | INSTRUMENT | ACCESSORY | OTHER)
  if (!partial || has("category")) {
    const category = clean(body.category) || "TEXT_BOOK";
    if (!PRODUCT_CATEGORIES.includes(category)) {
      return { error: { code: "INVALID_PRODUCT_CATEGORY" } };
    }
    data.category = category;
  }

  // 5. Optional parent product ID (null = Main Product / Group)
  if (!partial || has("parentId")) {
    data.parentId = clean(body.parentId);
  }

  // 6. Bullet-point descriptions (String{})
  if (!partial || has("descriptionTh")) {
    data.descriptionTh = cleanStringArray(body.descriptionTh);
  }
  if (!partial || has("descriptionEn")) {
    data.descriptionEn = cleanStringArray(body.descriptionEn);
  }

  // 7. Bilingual counting units
  if (!partial || has("unitTh")) {
    data.unitTh = clean(body.unitTh) || "ชิ้น";
  }
  if (!partial || has("unitEn")) {
    data.unitEn = clean(body.unitEn) || "pcs";
  }

  // 8. Optional Pre-VAT Prices (Decimal(10, 2) >= 0) & VAT flag
  if (!partial || has("costPrice")) {
    const res = parseOptionDecimal(body.costPrice, 0, "INVALID_COST_PRICE");
    if (res.error) return res;
    data.costPrice = res.value;
  }

  if (!partial || has("sellingPrice")) {
    const res = parseOptionDecimal(
      body.sellingPrice,
      0,
      "INVALID_SELLING_PRICE",
    );
    if (res.error) return res;
    data.sellingPrice = res.value;
  }

  if (!partial || has("isVat")) {
    data.isVat = Boolean(body.isVat);
  }

  // Highlight flag & Sort Order (default 999)
  if (!partial || has("isHighlighted")) {
    data.isHighlighted = Boolean(body.isHighlighted);
  }

  if (!partial || has("sortOrder")) {
    const res = parseOptionInt(body.sortOrder, 0, "INVALID_SORT_ORDER", 999);
    if (res.error) return res;
    data.sortOrder = res.value;
  }

  return { data };
}

// Verify parent product exists and does not create a cirlular loop
async function validateParentProduct({ parentId, currentProductId = null }) {
  if (!parentId) return { ok: true };

  if (currentProductId && parentId === currentProductId) {
    return { error: { status: 400, code: "CANNOT_PARENT_SELF" } };
  }

  const parentProduct = await prisma.product.findUnique({
    where: { id: parentId },
    select: { id: true, parentId: true },
  });

  if (!parentProduct) {
    return { error: { status: 400, code: "PARENT_PRODUCT_NOT_FOUND" } };
  }

  if (currentProductId) {
    let cursorId = parentProduct.parentId;
    const visited = new Set([parentProduct.id]);

    while (cursorId) {
      if (cursorId === currentProductId) {
        return { error: { status: 400, code: "CIRCULAR_PRODUCT_HIERARCHY" } };
      }
      if (visited.has(cursorId)) break;
      visited.add(cursorId);

      const ancestor = await prisma.product.findUnique({
        where: { id: cursorId },
        select: { id: true, parentId: true },
      });
      cursorId = ancestor?.parentId ?? null;
    }
  }

  return { ok: true };
}

function getUniqueConflictCode(err) {
  const target = err?.meta?.target;
  const targetStr = Array.isArray(target)
    ? target.join(", ")
    : String(target || "");
  if (targetStr.includes("barcode")) {
    return "BARCODE_TAKEN";
  }
  return "PRODUCT_CODE_TAKEN";
}

// GET /api/admin/products/options
export async function getProductFormOptions(req, res) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [
        { isHighlighted: "desc" },
        { sortOrder: "asc" },
        { code: "asc" },
      ],
      select: {
        id: true,
        code: true,
        barcode: true,
        parentId: true,
        category: true,
        nameTh: true,
        nameEn: true,
        isVat: true,
        isHighlighted: true,
        sortOrder: true,
      },
    });

    res.json({
      categories: PRODUCT_CATEGORIES,
      vatRate: VAT_RATE,
      products,
    });
  } catch (err) {
    console.error("getProductFormOptions error", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}

// GET /api/admin/products
export async function listProducts(req, res) {
  try {
    const { search, category, status } = req.query;

    const where = {};
    if (category && PRODUCT_CATEGORIES.includes(category)) {
      where.category = category;
    }
    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;

    const q = clean(search);
    if (q) {
      where.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { barcode: { contains: q, mode: "insensitive" } },
        { nameTh: { contains: q, mode: "insensitive" } },
        { nameEn: { contains: q, mode: "insensitive" } },
      ];
    }

    const rawProducts = await prisma.product.findMany({
      where,
      orderBy: [
        { isHighlighted: "desc" },
        { sortOrder: "asc" },
        { code: "asc" },
      ],
      select: PRODUCT_SELECT,
    });

    res.json({
      vatRate: VAT_RATE,
      products: rawProducts.map(serializeProduct),
    });
  } catch (err) {
    console.error("listProducts error", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}

// GET /api/admin/products/:id
export async function getProduct(req, res) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: PRODUCT_SELECT,
    });

    if (!product) {
      return res.status(404).json({ code: "PRODUCT_NOT_FOUND" });
    }

    res.json({
      vatRate: VAT_RATE,
      product: serializeProduct(product),
    });
  } catch (err) {
    console.error("getProduct error", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}

// POST /api/admin/products
export async function createProduct(req, res) {
  try {
    const { data, error } = readProductInput(req.body);
    if (error) return res.status(400).json(error);

    const parentCheck = await validateParentProduct({
      parentId: data.parentId,
    });
    if (parentCheck.error) {
      return res
        .status(parentCheck.error.status)
        .json({ code: parentCheck.error.code });
    }

    const actorId = req.user.id;

    const product = await prisma.product.create({
      data: {
        ...data,
        createdById: actorId,
        updatedById: actorId,
      },
      select: PRODUCT_SELECT,
    });

    res.status(201).json({ product: serializeProduct(product) });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ code: getUniqueConflictCode(err) });
    }
    console.error("createProduct error", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}

// PATCH /api/admin/products/:id
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;

    const target = await prisma.product.findUnique({
      where: { id },
    });
    if (!target) {
      return res.status(404).json({ code: "PRODUCT_NOT_FOUND" });
    }

    const { data, error } = readProductInput(req.body, { partial: true });
    if (error) return res.status(400).json(error);

    if (data.parentId !== undefined) {
      const parentCheck = await validateParentProduct({
        parentId: data.parentId,
        currentProductId: id,
      });
      if (parentCheck.error) {
        return res
          .status(parentCheck.error.status)
          .json({ code: parentCheck.error.code });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedById: req.user.id,
      },
      select: PRODUCT_SELECT,
    });

    res.json({ product: serializeProduct(product) });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ code: getUniqueConflictCode(err) });
    }
    console.error("updateProduct error", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}

// PATCH /api/admin/products/:id/status
export async function setProductStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ code: "MISSING_FIELDS" });
    }

    const target = await prisma.product.findUnique({
      where: { id },
      include: {
        subProducts: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    });

    if (!target) {
      return res.status(404).json({ code: "PRODUCT_NOT_FOUND" });
    }

    // Prevent deactivate a parent product that still has active sub-products
    if (!isActive && target.subProducts.length > 0) {
      return res.status(400).json({ code: "HAS_ACTIVE_SUBPRODUCTS" });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        isActive,
        updatedById: req.user.id,
      },
      select: PRODUCT_SELECT,
    });

    res.json({ product: serializeProduct(product) });
  } catch (err) {
    console.error("setProductStatus error", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}
