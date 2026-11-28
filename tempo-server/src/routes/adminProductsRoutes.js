import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import {
  getProductFormOptions,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  setProductStatus,
} from "../controllers/adminProductController.js";

const router = Router();
// Every route here requires a loged-in ADMIN
router.use(requireAuth, requireRole("ADMIN"));

router.get("/options", getProductFormOptions);
router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.patch("/:id/status", setProductStatus);

export default router;
