import { Router } from "express";

import {
  getCompensation,
  getCompensationById,
  createCompensationRecord,
  compareCompensation,
} from "../controllers/compensation.controller";

const router = Router();

router.get("/", getCompensation);
router.get("/compare", compareCompensation);
router.get("/:id", getCompensationById);
router.post("/", createCompensationRecord);

export default router;