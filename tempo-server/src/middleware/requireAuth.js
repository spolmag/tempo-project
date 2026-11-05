import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { isStaffRole } from "../lib/roles.js";

function authRequired(res) {
  return res
    .status(401)
    .json({ code: "AUTH_REQUIRED", message: "Authentication required" });
}

// Shared logic. allowMustChange = true lets a user with
// mustChangePassword through (only for the change-password route).
async function authenticate(req, res, next, allowMustChange) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return authRequired(res);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    // Token is invalid or expires
    return res
      .status(401)
      .json({ code: "TOKEN_INVALID", message: "Invalid or expired token" });
  }

  // Token must carry a user id
  if (!payload?.userId) {
    return authRequired(res);
  }

  try {
    // Read the current data from the database, not from the token,
    // so deactivation and role changes take effect immediately
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
      },
    });

    // Missing, disabled, or no longer a staff role -> treat as logged out
    if (!user || !user.isActive || !isStaffRole(user.role)) {
      return authRequired(res);
    }

    if (user.mustChangePassword && !allowMustChange) {
      return res.status(403).json({
        code: "PASSWORD_CHANGE_REQUIRED",
        message: "You must change your password first",
      });
    }

    req.user = {
      id: user.id,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };
    next();
  } catch (error) {
    console.error("requireAuth error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
}

// Normal protect routes
export function requireAuth(req, res, next) {
  return authenticate(req, res, next, false);
}

// Only for POST /change-password
export function requireAuthForPasswordChange(req, res, next) {
  return authenticate(req, res, next, true);
}

// Use after requireAuth: requireRole("ADMIN", "MANAGER")
export function requireRole(...allowRoles) {
  return (req, res, next) => {
    if (!req.user || !allowRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ code: "FORBIDDEN", message: "Permission denied" });
    }
    next();
  };
}
