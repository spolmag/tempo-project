import prisma from "../lib/prisma.js";

const ZONE_TYPES = [
  "RECEPTION",
  "SHOWROOM",
  "STOCK_ROOM",
  "CLASSROOM",
  "OFFICE",
  "OTHER",
];

const BRANCH_SUMMARY_SELECT = {
  id: true,
  code: true,
  nameTh: true,
  nameEn: true,
  isActive: true,
};

const ZONE_SELECT = {
  id: true,
  branchId: true,
  parentId: true,
  code: true,
  nameTh: true,
  nameEn: true,
  description: true,
  type: true,
  maxCapacity: true,
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
    select: {
      subZones: true,
    },
  },
};

const SERVER_ERROR = {
  code: "SERVER_ERROR",
  message: "Something went wrong, please try again",
};

const TEXT_FIELDS = ["code", "nameTh", "nameEn", "description", "parentId"];

function clean(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// Read and validate zone fields from req.body
// partial = false for create, partial = true for update
function readZoneInput(body, { partial = false } = {}) {
  const data = {};
  const has = (key) => body[key] !== undefined;

  for (const field of TEXT_FIELDS) {
    if (has(field)) data[field] = clean(body[field]);
  }

  // Always uppercase zone code (e.g. "piano-01" -> "PIANO-01")
  if (data.code) {
    data.code = data.code.toUpperCase();
  }

  // Validate ZoneType
  if (has("type")) {
    const type = clean(body.type);
    if (!type || !ZONE_TYPES.includes(type)) {
      return {
        error: {
          code: "INVALID_ZONE_TYPE",
          message: "Invalid zone type",
        },
      };
    }
    data.type = type;
  } else if (!partial) {
    data.type = "CLASSROOM";
  }

  // Validate maxCapacity (optional positive integer, only for classroom)
  if (has("maxCapacity")) {
    const raw = body.maxCapacity;
    if (raw === null || raw === "") {
      data.maxCapacity = null;
    } else {
      const num = Number(raw);
      if (!Number.isInteger(num) || num < 1) {
        return {
          error: {
            code: "INVALID_CAPACITY",
            message: "Max capacity must be a whole number of at least 1",
          },
        };
      }
      data.maxCapacity = num;
    }
  }

  // If type is explicitly set to non-CLASSROOM, clear maxCapacity
  if (data.type && data.type !== "CLASSROOM") {
    data.maxCapacity = null;
  }

  // Required on create; cannot be clear on update
  if (!partial && (!data.code || !data.nameTh || !data.nameEn)) {
    return {
      error: {
        code: "MISSING_FIELDS",
        message: "Zone code, Thai name, and English name are required",
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
        message: "Zone code, Thai name, and English name are required",
      },
    };
  }

  return { data };
}

// Verify parentId belongs to the same branch and does not create a circular loop
async function validateParentZone(branchId, parentId, currentZoneId = null) {
  if (!parentId) return null;

  if (currentZoneId && parentId === currentZoneId) {
    return {
      code: "INVALID_PARENT",
      message: "A zone cannot be its own parent",
    };
  }

  const parent = await prisma.zone.findUnique({
    where: { id: parentId },
    select: { id: true, branchId: true, parentId: true },
  });

  if (!parent || parent.branchId !== branchId) {
    return {
      code: "PARENT_NOT_FOUND",
      message: "Parent zone not found in this branch",
    };
  }

  // Walk up the ancestor chain to prevent circular loops (A -> B -> C -> A)
  if (currentZoneId) {
    let cursorId = parent.parentId;
    while (cursorId) {
      if (cursorId === currentZoneId) {
        return {
          code: "CIRCULAR_PARENT",
          message: "Cannot set a descendant subzone as the parent zone",
        };
      }
      const ancester = await prisma.zone.findUnique({
        where: { id: cursorId },
        select: { parentId: true },
      });
      cursorId = ancester?.parentId ?? null;
    }
  }

  return null;
}

// GET /api/admin/branches/:branchId/zones?q=&type=&active
export async function listBranchZones(req, res) {
  try {
    const { branchId } = req.params;

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: BRANCH_SUMMARY_SELECT,
    });
    if (!branch) {
      return res
        .status(404)
        .json({ code: "BRANCH_NOT_FOUND", message: "Branch not found" });
    }

    const q = clean(req.query.q);
    const type = clean(req.query.type);
    const active = req.query.active;

    const where = { branchId };
    if (type && ZONE_TYPES.includes(type)) where.type = type;
    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;
    if (q) {
      where.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { nameTh: { contains: q, mode: "insensitive" } },
        { nameEn: { contains: q, mode: "insensitive" } },
      ];
    }

    const zones = await prisma.zone.findMany({
      where,
      select: ZONE_SELECT,
      orderBy: { code: "asc" },
    });

    res.json({ branch, zones, zoneTypes: ZONE_TYPES });
  } catch (err) {
    console.error("ListBranchZones error:", err);
    res.status(500).json(SERVER_ERROR);
  }
}

// GET /api/admin/zones/:id
export async function getZone(req, res) {
  try {
    const zone = await prisma.zone.findUnique({
      where: { id: req.params.id },
      select: {
        ...ZONE_SELECT,
        branch: { select: BRANCH_SUMMARY_SELECT },
      },
    });
    if (!zone) {
      return res
        .status(404)
        .json({ code: "ZONE_NOT_FOUND", message: "Zone not found" });
    }

    // Also provide main zones in the same branch so Edit form can populate parent dropdown
    const mainZones = await prisma.zone.findMany({
      where: {
        branchId: zone.branchId,
      },
      select: {
        id: true,
        parentId: true,
        code: true,
        nameTh: true,
        nameEn: true,
        isActive: true,
      },
      orderBy: { code: "asc" },
    });

    res.json({ zone, mainZones, zoneTypes: ZONE_TYPES });
  } catch (err) {
    console.error("GetZone error:", err);
    res.status(500).json(SERVER_ERROR);
  }
}

// POST /api/admin/branches/:branchId/zones
export async function createZone(req, res) {
  try {
    const { branchId } = req.params;

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true },
    });
    if (!branch) {
      return res
        .status(404)
        .json({ code: "BRANCH_NOT_FOUND", message: "Branch not found" });
    }

    const { data, error } = readZoneInput(req.body ?? {});
    if (error) return res.status(400).json(error);

    if (data.parentId) {
      const parentError = await validateParentZone(branchId, data.parentId);
      if (parentError) return res.status(400).json(parentError);
    }

    const zone = await prisma.zone.create({
      data: {
        ...data,
        branchId,
        createdById: req.user.id,
        updatedById: req.user.id,
      },
      select: ZONE_SELECT,
    });

    res.status(201).json({ zone });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({
        code: "CODE_EXISTS",
        message: "This zone code is already in use in this branch",
      });
    }
    console.error("CreateZone error:", err);
    res.status(500).json(SERVER_ERROR);
  }
}

// PATCH /api/admin/zones/:id
export async function updateZone(req, res) {
  try {
    const zoneId = req.params.id;

    const existing = await prisma.zone.findUnique({
      where: { id: zoneId },
      select: {
        id: true,
        branchId: true,
        type: true,
        _count: { select: { subZones: true } },
      },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ code: "ZONE_NOT_FOUND", message: "Zone not found" });
    }

    const { data, error } = readZoneInput(req.body ?? {}, { partial: true });
    if (error) return res.status(400).json(error);

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ code: "NO_CHANGES", message: "No fields to update" });
    }

    // If setting a parentId, make sure this zone doesn't already have subzones
    if (data.parentId) {
      if (existing._count.subZones > 0) {
        return res.status(400).json({
          code: "HAS_SUBZONES",
          message: "A zone has subzones cannot become a subzone itself",
        });
      }
      const parentError = await validateParentZone(
        existing.branchId,
        data.parentId,
        zoneId,
      );
      if (parentError) return res.status(400).json(parentError);
    }

    // If the resulting type is not CLASSROOM, clear maxCapacity
    const nextType = data.type ?? existing.type;
    if (nextType !== "CLASSROOM") {
      data.maxCapacity = null;
    }

    const zone = await prisma.zone.update({
      where: { id: zoneId },
      data: {
        ...data,
        updatedById: req.user.id,
      },
      select: ZONE_SELECT,
    });

    res.json({ zone });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({
        code: "CODE_EXISTS",
        message: "This zone code is already in use in this branch",
      });
    }
    console.error("UpdateZone error:", err);
    res.status(500).json(SERVER_ERROR);
  }
}

// PATCH /api/admin/zones/:id/status
export async function setZoneActive(req, res) {
  try {
    const zoneId = req.params.id;
    const { isActive } = req.body ?? {};

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        code: "INVALID_STATUS",
        message: "isActive must be true or false",
      });
    }

    const existing = await prisma.zone.findUnique({
      where: { id: zoneId },
      select: { id: true },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ code: "ZONE_NOT_FOUND", message: "Zone not found" });
    }

    const zone = await prisma.zone.update({
      where: { id: zoneId },
      data: {
        isActive,
        updatedById: req.user.id,
      },
      select: ZONE_SELECT,
    });

    res.json({ zone });
  } catch (err) {
    console.error("SetZoneActive error:", err);
    res.status(500).json(SERVER_ERROR);
  }
}
