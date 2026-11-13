import prisma from "../lib/prisma.js";

const BRANCH_SELECT = {
  id: true,
  code: true,
  nameTh: true,
  nameEn: true,
  phone: true,
  addressTh: true,
  addressEn: true,
  taxId: true,
  taxBranchNo: true,
  isVatRegistered: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      zones: true,
      userAccess: true,
    },
  },
};

const SERVER_ERROR = {
  code: "SERVER_ERROR",
  message: "Something went wrong, please try again",
};

const TEXT_FIELDS = [
  "code",
  "nameTh",
  "nameEn",
  "phone",
  "addressTh",
  "addressEn",
  "taxId",
  "taxBranchNo",
];

// Trim strings; turn empty strings into null
function clean(value) {
  if (typeof value !== "string") return null;
  const trimed = value.trim();
  return trimed === "" ? null : trimed;
}

// Read and validate branch fields from req.body
// partial = false for create, partial = true for update
function readBranchInput(body, { partial = false } = {}) {
  const data = {};
  const has = (key) => body[key] !== undefined;

  for (const field of TEXT_FIELDS) {
    if (has(field)) data[field] = clean(body[field]);
  }

  // Always uppercase branch code (e.g. "bkk-01" -> "BKK-01")
  if (data.code) {
    data.code = data.code.toUpperCase();
  }

  if (has("isVatRegistered")) {
    data.isVatRegistered = Boolean(body.isVatRegistered);
  } else if (!partial) {
    data.isVatRegistered = false;
  }

  // Required on create; cannot be clean or update
  if (!partial && (!data.code || !data.nameTh || !data.nameEn)) {
    return {
      error: {
        code: "MISSING_FIELDS",
        message: "Branch code, Thai name, and English name are required",
      },
    };
  }
  if (
    partial &&
    ((has("code") && !data.code) ||
      (has("nameTh") && !data.nameTh) ||
      (has("nameEn") && !data.nameEn))
  ) {
    return {
      error: {
        code: "MISSING_FIELDS",
        message: "Branch code, Thai name, and English name cannot be empty",
      },
    };
  }

  // Thai Tax ID is 13 digits when provided
  if (data.taxId && !/^\d{13}$/.test(data.taxId)) {
    return {
      error: {
        code: "INVALID_TAX_ID",
        message: "Tax ID must be 13 digits",
      },
    };
  }

  // Thai Tax Branch No. is 5 digits when provided (e.g. "00000" for Head Office)
  if (data.taxBranchNo && !/^\d{5}$/.test(data.taxBranchNo)) {
    return {
      error: {
        code: "INVALID_TAX_BRANCH_NO",
        message: "Tax branch number must be 5 digits (e.g. 00000)",
      },
    };
  }

  return { data };
}

// GET /api/admin/branches?q=&active=
export async function listBranches(req, res) {
  try {
    const q = clean(req.query.q);
    const active = req.query.active;

    const where = {};
    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;
    if (q) {
      where.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { nameTh: { contains: q, mode: "insensitive" } },
        { nameEn: { contains: q, mode: "insensitive" } },
      ];
    }

    const branches = await prisma.branch.findMany({
      where,
      select: BRANCH_SELECT,
      orderBy: { code: "asc" },
    });

    res.json({ branches });
  } catch (err) {
    console.error("ListBranches error:", err);
    res.status(500).json(SERVER_ERROR);
  }
}

// GET /api/admin/branches/:id
export async function getBranch(req, res) {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: req.params.id },
      select: BRANCH_SELECT,
    });
    if (!branch) {
      return res
        .status(404)
        .json({ code: "BRANCH_NOT_FOUND", message: "Branch not found" });
    }
    res.json({ branch });
  } catch (err) {
    console.error("GetBranch error:", err);
    res.status(500).json(SERVER_ERROR);
  }
}

// POST /api/admin/branches
export async function createBranch(req, res) {
  try {
    const { data, error } = readBranchInput(req.body ?? {});
    if (error) return res.status(400).json(error);

    const branch = await prisma.branch.create({
      data: {
        ...data,
        createdById: req.user.id,
        updatedById: req.user.id,
      },
      select: BRANCH_SELECT,
    });

    res.status(201).json({ branch });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({
        code: "CODE_EXISTS",
        message: "This branch code is already in use",
      });
    }
    console.error("CreateBranch error:", err);
    res.status(500).json(SERVER_ERROR);
  }
}

// PATCH /api/admin/branches/:id
export async function updateBranch(req, res) {
  try {
    const branchId = req.params.id;

    const existing = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ code: "BRANCH_NOT_FOUND", message: "Branch not found" });
    }

    const { data, error } = readBranchInput(req.body ?? {}, { partial: true });
    if (error) return res.status(400).json(error);

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ code: "NO_CHANGES", message: "No fields to update" });
    }

    const branch = await prisma.branch.update({
      where: { id: branchId },
      data: {
        ...data,
        updatedById: req.user.id,
      },
      select: BRANCH_SELECT,
    });

    res.json({ branch });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({
        code: "CODE_EXISTS",
        message: "This branch code is already in use",
      });
    }
    console.error("UpdateBranch error", err);
    res.status(500).json(SERVER_ERROR);
  }
}

// PATCH /api/admin/branches/:id/active
export async function setBranchActive(req, res) {
  try {
    const branchId = req.params.id;
    const { isActive } = req.body ?? {};

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        code: "INVALID_STATUS",
        message: "isActive must be true or false",
      });
    }

    const existings = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });
    if (!existings) {
      return res
        .status(404)
        .json({ code: "BRANCH_NOT_FOUND", message: "Branch not found" });
    }

    const branch = await prisma.branch.update({
      where: { id: branchId },
      data: {
        isActive,
        updatedById: req.user.id,
      },
      select: BRANCH_SELECT,
    });

    res.json({ branch });
  } catch (err) {
    console.error("SetBranchActive error:", err);
    res.status(500).json(SERVER_ERROR);
  }
}
