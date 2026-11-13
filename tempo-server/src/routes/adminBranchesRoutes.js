import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import {
  listBranches,
  getBranch,
  createBranch,
  updateBranch,
  setBranchActive,
} from "../controllers/adminBranchController.js";

const router = Router();

// Every route in this file is ADMIN only
router.use(requireAuth, requireRole("ADMIN"));

router.get("/", listBranches);
router.post("/", createBranch);

router.get("/:id", getBranch);
router.patch("/:id", updateBranch);
router.patch("/:id", setBranchActive);

export default router;
