import express from "express";
import cors from "cors";

import compensationRoutes from "./routes/compensation.routes";
import companyRoutes from "./routes/company.routes";
import roleRoutes from "./routes/role.routes";
import levelRoutes from "./routes/level.routes";
import locationRoutes from "./routes/location.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Compensation Intelligence API is running",
  });
});

app.use("/api/compensation", compensationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/locations", locationRoutes);

export default app;