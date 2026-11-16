import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import {
  getZone,
  updateZone,
  setZoneActive,
} from "../controllers/adminZoneController.js";

const router = Router();

// Every routes here requires a logged-in ADMIN
router.use(requireAuth, requireRole("ADMIN"));

router.get("/:id", getZone);
router.patch("/:id", updateZone);
router.patch("/:id/status", setZoneActive);

export default router;
