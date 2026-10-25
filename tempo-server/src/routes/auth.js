import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { login, changePassword } from "../controllers/authController.js";

const router = Router();

router.post("/login", login);
router.post("/change-password", requireAuth, changePassword);

export default router;
