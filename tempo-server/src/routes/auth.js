import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    // 1. Check that both fields were sent inside request body
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter email and password" });
    }

    // 2. Find the user
    const user = await prisma.user.findUnique({ where: { email } });

    // 3. Check password
    const passwordOK =
      user && (await bcrypt.compare(password, user.passwordHash));
    if (!passwordOK) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Block disabled (isActive = false) accounts
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "This accound has been disabled" });
    }

    // 5. Create a token
    const token = jwt.sign(
      { userId: user.id, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    // 6. Send back the token and user info (with no passwordHash)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullNameTh: user.fullNameTh,
        fullNameEn: user.fullNameEn,
        role: user.Role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
});

export default router;
