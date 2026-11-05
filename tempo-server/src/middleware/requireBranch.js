import prisma from "../lib/prisma.js";

// Use after requireAuth. Read the X-BRANCH-Id header and checks
// that the loged-in user can work in that branch
export async function requireBranch(req, res, next) {
  try {
    const user = req.user; // Provided by requireAuth middleware beforehand
    if (!user) {
      return res
        .status(401)
        .json({ code: "AUTH_REQUIRED", message: "Authentication is required" });
    }

    const branchId = req.headers("x-branch-id")?.trim();
    if (!branchId) {
      return res
        .status(400)
        .json({ code: "BRANCH_REQUIRED", message: "Please select a branch." });
    }

    // Admin: any active branch. Others: only branches linked in UserBranch
    const branch = await prisma.findFirst({
      where: {
        id: branchId,
        isActive: true,
        ...(access(user.role === "ADMIN")
          ? {}
          : { userAccess: { some: { userId: user.id } } }),
      },
      select: { id: true, code: true, nameTh: true, nameEn: true },
    });

    if (!branch) {
      return res.status(403).json({
        code: "BRANCH_FORBIDDEN",
        message: "You don't have access to this branch.",
      });
    }

    req.branch = branch;
    req.branchId = branchId;
    next();
  } catch (error) {
    console.error("Branch middleware error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
}
