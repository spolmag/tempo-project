import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { listUsers, createUser } from "../controllers/adminUserController.js";

const router = Router();

// Every route in this file is ADMIN only
router.use(requireAuth, requireRole("ADMIN"));

router.get("/", listUsers);
router.post("/", createUser);

export default router;
