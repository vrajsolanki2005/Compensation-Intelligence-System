import { Router } from "express";
import { getCompanies } from "../controllers/company.controller";

const router = Router();

router.get("/", getCompanies);

export default router;