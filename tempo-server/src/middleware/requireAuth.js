import jwt from "jsonwebtoken";

// Check the token and put user's id and role on req.user
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (error) {
    // Token is invalid or expired
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Use after requireAuth: requireRole("ADMIN", "MANAGER")
export function requireRole(...allowRoles) {
  return (req, res, next) => {
    if (!req.user || !allowRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
}
