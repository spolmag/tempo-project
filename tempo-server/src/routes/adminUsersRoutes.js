import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import {
  listUsers,
  createUser,
  toggleDeactivateUser,
  resetUserPassword,
} from "../controllers/adminUserController.js";

const router = Router();

// Every route in this file is ADMIN only
router.use(requireAuth, requireRole("ADMIN"));

router.get("/", listUsers);
router.post("/", createUser);
router.patch("/:id/deactivate", toggleDeactivateUser);
router.post("/:id/reset-password", resetUserPassword);

export default router;
