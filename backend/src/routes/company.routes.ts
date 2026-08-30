import { Router } from "express";

import {
  getCompanies,
  getCompanyById,
  getCompanyCompensationSummary,
} from "../controllers/company.controller";

const router = Router();

router.get("/", getCompanies);

// Bug 5 fix: must be registered BEFORE /:id to avoid Express matching
// "compensation-summary" as the :id param.
router.get("/:id/compensation-summary", getCompanyCompensationSummary);

router.get("/:id", getCompanyById);

export default router;