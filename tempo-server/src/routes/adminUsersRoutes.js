import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import {
  getUserFormOptions,
  listUsers,
  getUser,
  createUser,
  updateUser,
  setUserActive,
  resetUserPassword,
} from "../controllers/adminUserController.js";

const router = Router();

// Every route in this file is ADMIN only
router.use(requireAuth, requireRole("ADMIN"));

router.get("/", listUsers);
router.post("/", createUser);

// Must be above "/:id", otherwise "options" is treated as a user id
router.get("/options", getUserFormOptions);

router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.patch("/:id/status", setUserActive);
router.post("/:id/reset-password", resetUserPassword);

export default router;
