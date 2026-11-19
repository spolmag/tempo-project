import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import {
  getCourseFormOptions,
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  setCourseStatus,
} from "../controllers/adminCourseController.js";

const router = Router();
// Every routes here required a logged-in ADMIN
router.use(requireAuth, requireRole("ADMIN"));

router.get("/options", getCourseFormOptions);
router.get("/", listCourses);
router.get("/:id", getCourse);
router.post("/", createCourse);
router.patch("/:id", updateCourse);
router.patch("/:id/status", setCourseStatus);

export default router;
