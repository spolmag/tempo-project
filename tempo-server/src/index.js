import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminUserRoutes from "./routes/adminUsersRoutes.js";
import adminBranchesRoutes from "./routes/adminBranchesRoutes.js";
import adminZonesRoutes from "./routes/adminZonesRoutes.js";
import adminCoursesRoutes from "./routes/adminCoursesRoutes.js";
import adminProductsRoutes from "./routes/adminProductsRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Branch-Id"],
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🟢 Tempo API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/branches", adminBranchesRoutes);
app.use("/api/admin/zones", adminZonesRoutes);
app.use("/api/admin/courses", adminCoursesRoutes);
app.use("/api/admin/products", adminProductsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Server running at http://localhost:${PORT}`);
});
