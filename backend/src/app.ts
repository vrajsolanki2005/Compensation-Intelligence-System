import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middleware/error.middleware";
import compensationRoutes from "./routes/compensation.routes";
import companyRoutes from "./routes/company.routes";
import roleRoutes from "./routes/role.routes";
import levelRoutes from "./routes/level.routes";
import locationRoutes from "./routes/location.routes";
import { swaggerSpec } from "./lib/swagger";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Compensation Intelligence API is running",
  });
});

// Swagger UI — available at http://localhost:5000/api/docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "COMPINT API Docs",
}));
// Raw OpenAPI JSON spec
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

app.use("/api/compensation", compensationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/locations", locationRoutes);

app.use(errorHandler)

export default app;