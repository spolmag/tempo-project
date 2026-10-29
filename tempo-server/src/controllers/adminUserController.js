import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

// Global roles that can be given from the staff portal for now.
// Must match values in your Role enum. Students/parents come later.
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Treate empty string as "not provided"
function clean(value) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v === "" ? null : v;
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
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
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

    const email = clean(req.body.email)?.toLowerCase();
    const fullNameTh = clean(req.body.fullNameTh);
    const fullNameEn = clean(req.body.fullNameEn);
    const role = clean(req.body.role) || "STAFF";
    const taxId = clean(req.body.taxId);

    // Required fields
    if (!email || !fullNameTh || !fullNameEn) {
      return res.status(400).json({
        code: "MISSING_FIELDS",
        message: "Email, Thai name and English name are required",
      });
    }
    if (!EMAIL_RE.test(email)) {
      return res
        .status(400)
        .json({ code: "INVALID_EMAIL", message: "Email format is invalid" });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ code: "INVALID_ROLE", message: "Role is not allowed" });
    }
    if (taxId && !/^\d{13}$/.test(taxId)) {
      return res.status(400).json({
        code: "INVALID_TAX_ID",
        message: "Tax ID must be 13 digits",
      });
    }

    // Optional date of birth
    let dateOfBirth = null;
    const dobRaw = clean(req.body.dateOfBirth);
    if (dobRaw) {
      dateOfBirth = new Date(dobRaw);
      if (Number.isNaN(dateOfBirth.getTime())) {
        return res.status(400).json({
          code: "INVALID_DATE",
          message: "Date of birth is invalid",
        });
      }
    }

    // Email must be unique
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        code: "EMAIL_EXISTS",
        message: "This email is already in use",
      });
    }

    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullNameTh,
        fullNameEn,
        addressTh: clean(req.body.addressTh),
        addressEn: clean(req.body.addressEn),
        taxId,
        dateOfBirth,
        phone: clean(req.body.phone),
        lineId: clean(req.body.lineId),
        role,
        mustChangePassword: true,
        createdById: req.user.id,
        updatedById: req.user.id,
      },
      select: USER_SELECT,
    });

    // Password is never send back
    res.status(201).json({ user });
  } catch (error) {
    // Two requests with the same email at the same time
    if (error.code === "P2002") {
      return res.status(409).json({
        code: "EMAIL_EXISTS",
        message: "This email is already in use",
      });
    }
    console.error("Create user error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
}
