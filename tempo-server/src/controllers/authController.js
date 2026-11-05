import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { STAFF_ROLES } from "../lib/roles.js";

const BRANCH_SELECT = { id: true, code: true, nameTh: true, nameEn: true };

// Active branches this user can work in
// Admin: every active branch. Others: only branches link in UserBranch
export async function getAccessibleBranches(user) {
  return prisma.branch.findMany({
    where: {
      isActive: true,
      ...(user.role === "ADMIN"
        ? {}
        : { userAccess: { some: { userId: user.id } } }),
    },
    select: BRANCH_SELECT,
    orderBy: { code: "ASC" },
  });
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    // 1.Check if there's email and password inside request body
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter email and password" });
    }

    // 2. Find the user and check the password
    const user = await prisma.user.findUnique({ where: { email } });
    const passwordOK =
      user && (await bcrypt.compare(password, user.passwordHash));
    if (!passwordOK) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Only staff & admin role can use the staff portal
    //    Same message as a wrong password, so nobody can find out
    //    which accounts exist or what role they have.
    if (!STAFF_ROLES.includes(user.role)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 4. Block inactive account
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "This account has been disabled." });
    }

    // Branches this user can work in (may be empty)
    const branches = await getAccessibleBranches(user);

    // 6. Create a token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    // 7. Send back the token, user info, branches list
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullNameTh: user.fullNameTh,
        fullNameEn: user.fullNameEn,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        branches,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
}

// POST /api/auth/change-password  (must be logged in)
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Both fields are required
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ code: "MISSING_FIELDS", message: "Please fill in all fields" });
    }

    // 2. Password rule (set to at least 8 cheracters)
    if (newPassword.length < 8) {
      return res.status(400).json({
        code: "WEAK_PASSWORD",
        message: "Password must be at least 8 characters",
      });
    }

    // 3. New password must differ from the current one
    if (newPassword === currentPassword) {
      return res.status(400).json({
        code: "SAME_PASSWORD",
        message: "New password must be different from current password",
      });
    }

    // 4. New password must not be the shared default password
    if (
      process.env.DEFAULT_RESET_PASSWORD &&
      newPassword === process.env.DEFAULT_RESET_PASSWORD
    ) {
      return res.status(400).json({
        code: "DEFAULT_PASSWORD",
        message: "Please choose a different password",
      });
    }

    // 5. Find the user from the token (req.user.id), not from the request body
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Authentication is required" });
    }

    // 6. Check the current password
    const currentOK = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentOK) {
      return res.status(400).json({
        code: "WRONG_CURRENT_PASSWORD",
        message: "Current password is incorrect",
      });
    }

    // 7. Save the new hash
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false, updatedById: user.id },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
}
