import { Router } from "express";

import {
  getCompensation,
  getCompensationById,
} from "../controllers/compensation.controller.js";

const router = Router();

router.get("/", getCompensation);

router.get("/:id", getCompensationById);

export default router;