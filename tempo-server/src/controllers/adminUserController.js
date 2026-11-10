import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

// Global roles that can be given from the staff portal for now.
// Must match values in Role enum. Students/parents come later.
const ALLOWED_ROLES = ["ADMIN", "MANAGER", "STAFF", "TEACHER"];

// Response back fieldes without password hash
const USER_SELECT = {
  id: true,
  email: true,
  fullNameTh: true,
  fullNameEn: true,
  addressTh: true,
  addressEn: true,
  taxId: true,
  dateOfBirth: true,
  phone: true,
  lineId: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
  createdAt: true,
  updatedAt: true,
};

const BRANCH_SELECT = { id: true, code: true, nameTh: true, nameEn: true };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_FIELDS = ["email", "fullNameTh", "fullNameEn"];
const OPTIONAL_TEXT_FIELDS = [
  "fullNameTh",
  "fullNameEh",
  "addressTh",
  "addressEn",
  "taxId",
  "phone",
  "lineId",
];

const SERVER_ERROR = { message: "Something went wrong, please try again." };

const emailExistsResponse = {
  code: "EMAIL_EXISTS",
  message: "This email is already in use",
};

// Treate empty string as "not provided"
function clean(value) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v === "" ? null : v;
}

function haskey(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj ?? {}, key);
}

// Read and validate user fields from the request body.
// Create (partial = false): every field is read and required fields must be filled.
// Edit (partial = true): only fields sent in the body are read and changed.
// Returns {data} or {error: {code, message}}
function readUserInput(body = {}, { partial = false } = {}) {
  const has = (key) => !partial || haskey(body, key);
  const data = {};

  if (has("email")) data.email = clean(body.email)?.toLowerCase() ?? null;
  for (const key of OPTIONAL_TEXT_FIELDS) {
    if (has(key)) data[key] = clean(body[key]);
  }
  if (has("role")) data.role = clean(body.role) || partial ? null : "STAFF";

  // Required fields: must be filled on create, can't be clear on edit
  if (REQUIRED_FIELDS.some((key) => has(key) && !data[key])) {
    return {
      error: {
        code: "MISSING_FIELDS",
        message: "Email, Thai name and English name are rerquired",
      },
    };
  }
  if (has("email") && !EMAIL_RE.test(data.email)) {
    return {
      error: { code: "INVALID_EMAIL", message: "Email format is invalid" },
    };
  }
  if (has("role") && !ALLOWED_ROLES.includes(data.role)) {
    return { error: { code: "INVALID_ROLE", message: "Role is not allowed" } };
  }
  if (data.taxId && !/^\d{13}$/.test(data.taxId)) {
    return {
      error: { code: "INVALID_TAX_ID", message: "Tax ID must be 13 digits" },
    };
  }

  // Optional date of birth("" clears it)
  if (has("dateOfBirth")) {
    const raw = clean(body.dateOfBirth);
    data.dateOfBirth = raw ? new Date(raw) : null;
    if (data.dateOfBirth && Number.isNaN(data.dateOfBirth.getTime())) {
      return {
        error: { code: "INVALID_DATE", message: "Date of birth is invalid" },
      };
    }
  }

  return { data };
}

// branchIds: not sent = don't change, [] = remove all, [ids] = replace with these
function readBranchIds(body = {}) {
  if (!haskey(body, "branchIds")) return { branchIds: undefined };

  const ids = body.branchIds;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
    return {
      error: {
        code: "INVALID_BRANCHES",
        message: "branchIds must be a list of branch ids",
      },
    };
  }
  return { branchIds: [...new Set(ids)] };
}

// All given branch ids must exists
async function branchesExists(branchIds) {
  if (!branchIds?.length) return true;
  const count = await prisma.branch.count({ where: { id: { in: branchIds } } });
  return count === branchIds.length;
}

// Branches linked to a user (inactive ones included, so the admin can see them)
function getUserBranches(userId) {
  return prisma.branch.findMany({
    where: { userAccess: { some: { userId } } },
    select: { ...BRANCH_SELECT, isActive: true },
    orderBy: { code: "asc" },
  });
}

// Update a user's branch links (inside a tranaction).
// Unchanged links keep their original createdAt / createdById.
async function replaceUserBranches(tx, userId, branchIds, actorId) {
  // Remove links that are not the new list ([] removes all)
  await tx.userBranch.deleteMany({
    where: { userId, branchId: { notIn: branchIds } },
  });
  // Add new links: ones that already exist are skipped
  if (branchIds.length) {
    await tx.userBranch.createMany({
      data: branchIds.map((branchId) => ({
        userId,
        branchId,
        createdById: actorId,
      })),
      skipDuplicates: true,
    });
  }
}

// GET /api/admin/users/options
// Data for the create/edit form dropdowns
export async function getUserFormOptions(req, res) {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      select: BRANCH_SELECT,
      orderBy: { code: "asc" },
    });
    res.json({ roles: ALLOWED_ROLES, branches });
  } catch (error) {
    console.error("User form options error:", error);
    res.status(500).json(SERVER_ERROR);
  }
}

// GET /api/admin/users?q=somchai&role=TEACHER&active=true
export async function listUsers(req, res) {
  try {
    const q = clean(req.query.q);
    const role = clean(req.query.role);
    const active = req.query.active;

    const where = {};

    if (q) {
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { fullNameTh: { contains: q, mode: "insensitive" } },
        { fullNameEn: { contains: q, mode: "insensitive" } },
      ];
    }
    if (role && ALLOWED_ROLES.includes(role)) {
      where.role = role;
    }
    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;

    const users = await prisma.user.findMany({
      where,
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    res.json({ users });
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ SERVER_ERROR });
  }
}

// GET /api/admin/users/:id
export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) {
      return res
        .status(404)
        .json({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    const branches = await getUserBranches(id);
    res.json({ user: { ...user, branches } });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json(SERVER_ERROR);
  }
}

// POST /api/admin/users
export async function createUser(req, res) {
  try {
    const defaultPassword = process.env.DEFAULT_RESET_PASSWORD;
    if (!defaultPassword || defaultPassword.length < 8) {
      console.error("DEFAULT_RESET_PASSWORD is missing or shorter than 8");
      return res
        .status(500)
        .json({ message: "Server is not configured correctly." });
    }

    const input = readUserInput(req.body);
    if (input.error) return res.status(400).json(input.error);

    const branchInput = readBranchIds(req.body);
    if (branchInput.error) return res.status(400).json(branchInput.error);
    const branchIds = branchInput.branchIds ?? [];

    // Email must be unique
    const existing = await prisma.user.findUnique({
      where: { email: input.data.email },
    });
    if (existing) return res.status(409).json(emailExistsResponse);

    if (!(await branchesExists(branchIds))) {
      return res.status(400).json({
        code: "INVALID_BRANCHES",
        message: "One or more branches do not exists",
      });
    }

    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // User and branch links are saved together, or not at all
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          ...input.data,
          passwordHash,
          mustChangePassword: true,
          createdById: req.user.id,
          updatedById: req.user.id,
        },
        select: USER_SELECT,
      });
      await replaceUserBranches(tx, created.id, branchIds, req.user.id);
      return created;
    });

    const branches = await getUserBranches(user.id);

    // Password is never sent back
    res.status(201).json({ user: { ...user, branches } });
  } catch (error) {
    // Two requests with the same email at the same time
    if (error.code === "P2002") {
      return res.status(409).json(emailExistsResponse);
    }
    console.error("Create user error:", error);
    res.status(500).json(SERVER_ERROR);
  }
}

// PATCH /api/admin/users/:id
// Send only the fields to change. "" clears an optional field.
// branchIds (optional) replaces the user's branches
export async function updateUser(req, res) {
  try {
    const { id } = req.params;

    const input = readUserInput(req.body, { partial: true });
    if (input.error) return res.status(400).json(input.error);

    const branchInput = readBranchIds(req.body);
    if (branchInput.error) return res.status(400).json(branchInput.error);
    const { branchIds } = branchInput;

    if (Object.keys(input.data).length === 0 && branchIds === undefined) {
      return res
        .status(400)
        .json({ code: "NO_CHANGES", message: "Nothing to update" });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res
        .status(404)
        .json({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    // Prevent admin from changing their own role (could lock themselves out)
    if (
      id === req.user.id &&
      input.data.role &&
      input.data.role !== targetUser.role
    ) {
      return res.status(400).json({
        code: "CANNOT_CHANGE_OWN_ROLE",
        message: "You cannot change your own role",
      });
    }

    // New email must not belong to someone else
    if (input.data.email && input.data.email !== targetUser.email) {
      const existing = await prisma.user.findUnique({
        where: { email: input.data.email },
      });
      if (existing) return res.status(409).json(emailExistsResponse);
    }

    if (!(await branchesExists(branchIds))) {
      return res.status(400).json({
        code: "INVALID_BRANCHES",
        message: "One or more branches do not exist",
      });
    }

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { ...input.data, updatedById: req.user.id },
        select: USER_SELECT,
      });
      if (branchIds !== undefined) {
        await replaceUserBranches(tx, id, branchIds, req.user.id);
      }
      return updated;
    });

    const branches = await getUserBranches(id);
    res.json({ user: { ...user, branches } });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json(emailExistsResponse);
    }
    console.error("Update user error:", error);
    res.status(500).json(SERVER_ERROR);
  }
}

// PATCH /api/admin/users/:id/status   body: { "isActive": true | false }
export async function setUserActive(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body ?? {};

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        code: "INVALID_STATUS",
        message: "isActive must be true or false",
      });
    }

    // Prevent admins from deactivate themselves
    if (id === req.user.id && isActive === false) {
      return res.status(400).json({
        code: "CANNOT_DEACTIVATE_SELF",
        message: "You cannot deactivate your own account",
      });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res
        .status(404)
        .json({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive, updatedById: req.user.id },
      select: USER_SELECT,
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Set active user error:", error);
    res.status(500).json(SERVER_ERROR);
  }
}

// POST /api/admin/users/:id/reset-password
export async function resetUserPassword(req, res) {
  try {
    const defaultPassword = process.env.DEFAULT_RESET_PASSWORD;
    if (!defaultPassword || defaultPassword.length < 8) {
      return res
        .status(500)
        .json({ message: "Server is not configured correctly." });
    }

    const { id } = req.params;
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res
        .status(404)
        .json({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: true,
        updatedById: req.user.id,
      },
      select: USER_SELECT,
    });

    res.json({ user: updatedUser, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json(SERVER_ERROR);
  }
}
