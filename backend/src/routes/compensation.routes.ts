import { Router } from "express";
import {
  getCompensation,
} from "../controllers/compensation.controller";

const router = Router();

router.get("/", getCompensation);

export default router;