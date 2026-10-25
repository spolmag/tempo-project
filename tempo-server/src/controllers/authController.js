import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

// Role allowed to sign in through the staff portal
const STAFF_ROLES = ["ADMIN", "MANAGER", "STAFF", "TEACHER"];

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

    // 2. Find the user
    const user = await prisma.user.findUnique({ where: { email } });

    // Check password
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

    // 5. Block inactive account
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "This account has been disabled." });
    }

    // 6. Create a token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    // Send back the token and user info (with no passwordHash)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullNameTh: user.fullNameTh,
        fullNameEn: user.fullNameEn,
        role: user.role,
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

    // 4. Find the user from the token (req.user.id), not from the request body
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Authentication is required" });
    }

    // 5. Check the current password
    const currentOK = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentOK) {
      return res.status(400).json({
        code: "WRONG_CURRENT_PASSWORD",
        message: "Current password is incorrect",
      });
    }

    // 6. Save the new hash
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, updatedById: user.id },
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
}
