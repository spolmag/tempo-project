import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import {
  listBranches,
  getBranch,
  createBranch,
  updateBranch,
  setBranchActive,
} from "../controllers/adminBranchController.js";
import {
  listBranchZones,
  createZone,
} from "../controllers/adminZoneController.js";

const router = Router();

// Every route in this file is ADMIN only
router.use(requireAuth, requireRole("ADMIN"));

router.get("/", listBranches);
router.get("/:id", getBranch);
router.post("/", createBranch);
router.patch("/:id", updateBranch);
router.patch("/:id/status", setBranchActive);

// Branch zones
router.get("/:branchId/zones", listBranchZones);
router.post("/:branchId/zones", createZone);

export default router;
