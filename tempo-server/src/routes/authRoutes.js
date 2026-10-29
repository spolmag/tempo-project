import { Router } from "express";
import { requireAuthForPasswordChange } from "../middleware/requireAuth.js";
import { login, changePassword } from "../controllers/authController.js";

const router = Router();

router.post("/login", login);
router.post("/change-password", requireAuthForPasswordChange, changePassword);

export default router;
