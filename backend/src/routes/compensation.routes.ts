import { Router } from "express";

import {
  getCompensation,
  getCompensationById,
  createCompensationRecord,
} from "../controllers/compensation.controller";

const router = Router();

router.get("/", getCompensation);
router.get("/:id", getCompensationById);
router.post("/", createCompensationRecord);

export default router;